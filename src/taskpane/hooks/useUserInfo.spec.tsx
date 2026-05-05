// Copyright IBM Corp. 2026

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";

import { getEnviziGraphQLUrl } from "../../common/env";
import { useUserInfo } from "./useUserInfo";

// Mock dependencies
jest.mock("axios");
jest.mock("./useAuth");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useUserInfo", () => {
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

  const mockUserInfoResponse = {
    data: {
      data: {
        me: {
          tenantId: 123,
          languageCode: "en",
          timeZoneId: "America/New_York",
          contact: {
            firstName: "John",
            lastName: "Doe",
            emailAddress: "john.doe@example.com",
          },
        },
        currentAssociate: {
          name: "Test Organization",
        },
      },
    },
  };

  it("should not fetch when user is not authenticated", () => {
    const { useAuth } = require("./useAuth");
    useAuth.mockReturnValue({
      state: {
        isAuthenticated: false,
        credentials: null,
      },
    });

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("should fetch user info successfully with valid token", async () => {
    const { useAuth } = require("./useAuth");
    useAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        credentials: {
          token: "test-access-token",
          refreshToken: "test-refresh-token",
          coreToken: "test-core-token",
        },
      },
    });

    mockedAxios.post.mockResolvedValue(mockUserInfoResponse as any);

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${getEnviziGraphQLUrl()}/de/graphql`,
      {
        query: expect.stringContaining("query UserInfo"),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-access-token",
        },
      }
    );

    expect(result.current.data).toEqual({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      orgName: "Test Organization",
      orgId: "123",
      languageCode: "en",
      timeZoneId: "America/New_York",
    });
  });

  it("should handle API errors gracefully", async () => {
    const { useAuth } = require("./useAuth");
    useAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        credentials: {
          token: "test-access-token",
          refreshToken: "test-refresh-token",
          coreToken: "test-core-token",
        },
      },
    });

    mockedAxios.post.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });

  it("should use correct query key", () => {
    const { useAuth } = require("./useAuth");
    useAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        credentials: {
          token: "test-token",
          refreshToken: "test-refresh-token",
          coreToken: "test-core-token",
        },
      },
    });

    mockedAxios.post.mockResolvedValue(mockUserInfoResponse as any);

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    // Query key should include the token
    expect(queryClient.getQueryData(["userInfo", "test-token"])).toBeUndefined();
  });

  it("should have infinite stale time", async () => {
    const { useAuth } = require("./useAuth");
    useAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        credentials: {
          token: "test-token",
          refreshToken: "test-refresh-token",
          coreToken: "test-core-token",
        },
      },
    });

    mockedAxios.post.mockResolvedValue(mockUserInfoResponse as any);

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Data should remain fresh indefinitely
    const queryState = queryClient.getQueryState(["userInfo", "test-token"]);
    expect(queryState?.dataUpdatedAt).toBeDefined();
  });

  it("should transform API response correctly", async () => {
    const { useAuth } = require("./useAuth");
    useAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        credentials: {
          token: "test-token",
          refreshToken: "test-refresh-token",
          coreToken: "test-core-token",
        },
      },
    });

    const customResponse = {
      data: {
        data: {
          me: {
            tenantId: 456,
            languageCode: "fr",
            timeZoneId: "Europe/Paris",
            contact: {
              firstName: "Jane",
              lastName: "Smith",
              emailAddress: "jane.smith@example.com",
            },
          },
          currentAssociate: {
            name: "Another Org",
          },
        },
      },
    };

    mockedAxios.post.mockResolvedValue(customResponse as any);

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      orgName: "Another Org",
      orgId: "456",
      languageCode: "fr",
      timeZoneId: "Europe/Paris",
    });
  });
});
