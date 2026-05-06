// Copyright IBM Corp. 2026

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React from "react";

import { getAccountSubscriptionData, useAccountSubscription } from "./useAccountSubscription";

// Mock dependencies
jest.mock("axios");
jest.mock("jwt-decode");
jest.mock("./useAuth");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe("useAccountSubscription", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("getAccountSubscriptionData", () => {
    it("should fetch subscription data successfully", async () => {
      const mockResponse = {
        data: {
          organizationId: "org-123",
          partNumber: "EMISSIONS_TRIAL",
          totalApiCalls: 1000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
          edition: "",
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse as any);

      const result = await getAccountSubscriptionData("test-token", "tenant-123", "org-123");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.ibm.com/saascore/run/rolodex-registration/na/api/v1/organizations/org-123/ghgapiallotment",
        {
          headers: {
            Authorization: "Bearer test-token",
            "X-IBM-Client-Id": "saascore-tenant-123",
          },
        }
      );

      expect(result).toEqual({
        ...mockResponse.data,
        subscriptionType: "trial",
      });
    });

    it("should map D09SJZX with standard edition to standard", async () => {
      const mockResponse = {
        data: {
          organizationId: "org-123",
          partNumber: "D09SJZX",
          edition: "standard",
          totalApiCalls: 1000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse as any);

      const result = await getAccountSubscriptionData("test-token", "tenant-123", "org-123");

      expect(result.subscriptionType).toBe("standard");
    });

    it("should map D09SJZX with premium edition to premium", async () => {
      const mockResponse = {
        data: {
          organizationId: "org-123",
          partNumber: "D09SJZX",
          edition: "premium",
          totalApiCalls: 1000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse as any);

      const result = await getAccountSubscriptionData("test-token", "tenant-123", "org-123");

      expect(result.subscriptionType).toBe("premium");
    });

    it("should map D11IQZX to essentials", async () => {
      const mockResponse = {
        data: {
          organizationId: "org-123",
          partNumber: "D11IQZX",
          totalApiCalls: 1000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
          edition: "",
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse as any);

      const result = await getAccountSubscriptionData("test-token", "tenant-123", "org-123");

      expect(result.subscriptionType).toBe("essentials");
    });
  });

  describe("useAccountSubscription hook", () => {
    it("should return null when not authenticated", () => {
      const { useAuth } = require("./useAuth");
      useAuth.mockReturnValue({
        state: {
          isAuthenticated: false,
          credentials: null,
        },
      });

      const { result } = renderHook(() => useAccountSubscription(), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it("should decode coreToken and fetch subscription data", async () => {
      const { useAuth } = require("./useAuth");
      useAuth.mockReturnValue({
        state: {
          isAuthenticated: true,
          credentials: {
            token: "access-token",
            refreshToken: "refresh-token",
            coreToken: "core-token-jwt",
          },
        },
      });

      mockedJwtDecode.mockReturnValue({
        tenantId: "tenant-123",
        organizationId: "org-123",
      });

      const mockResponse = {
        data: {
          organizationId: "org-123",
          partNumber: "EMISSIONS_TRIAL",
          totalApiCalls: 1000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
          edition: "",
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAccountSubscription(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedJwtDecode).toHaveBeenCalledWith("core-token-jwt");
      expect(result.current.data).toEqual({
        ...mockResponse.data,
        subscriptionType: "trial",
      });
    });

    it("should handle JWT decode error gracefully", () => {
      const { useAuth } = require("./useAuth");
      useAuth.mockReturnValue({
        state: {
          isAuthenticated: true,
          credentials: {
            token: "access-token",
            refreshToken: "refresh-token",
            coreToken: "invalid-jwt",
          },
        },
      });

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockedJwtDecode.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const { result } = renderHook(() => useAccountSubscription(), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to decode coreToken:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("should not fetch when token is missing", () => {
      const { useAuth } = require("./useAuth");
      useAuth.mockReturnValue({
        state: {
          isAuthenticated: true,
          credentials: {
            token: "access-token",
            refreshToken: "refresh-token",
            coreToken: null,
          },
        },
      });

      const { result } = renderHook(() => useAccountSubscription(), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
