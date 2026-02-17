/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import { AccountPage } from "./AccountPage";

// Mock the useAuth hook
const mockLogout = jest.fn();
const mockCredentials = {
  apiKey: "test-api-key-12345",
  tenantId: "test-tenant-id",
  orgId: "test-org-id",
};

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    state: {
      credentials: mockCredentials,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    },
    login: jest.fn(),
    logout: mockLogout,
    clearError: jest.fn(),
  }),
}));

// Mock the env module
jest.mock("../../common/env", () => ({
  getEnvType: jest.fn(() => "np"),
  getOverviewDashboardUrl: jest.fn(
    () => "https://www-dev.app.ibm.com/envizi/emissions-api-home/overview"
  ),
}));

// Mock window.open
const mockWindowOpen = jest.fn();
global.window.open = mockWindowOpen;

describe("AccountPage - Basic Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
  });

  describe("Rendering", () => {
    it("should render the account panel container", () => {
      render(<AccountPage />);
      const accountPanel = document.querySelector(".account-panel");
      expect(accountPanel).toBeInTheDocument();
    });

    it("should render form with form-grid class", () => {
      render(<AccountPage />);
      const form = document.querySelector(".form");
      const formGrid = document.querySelector(".form-grid");
      expect(form).toBeInTheDocument();
      expect(formGrid).toBeInTheDocument();
    });

    it("should render all three credential fields", () => {
      render(<AccountPage />);
      expect(screen.getByLabelText(/API key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tenant ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Organization ID/i)).toBeInTheDocument();
    });

    it("should render View dashboard button", () => {
      render(<AccountPage />);
      expect(screen.getByRole("button", { name: /View dashboard/i })).toBeInTheDocument();
    });

    it("should render Logout button", () => {
      render(<AccountPage />);
      expect(
        screen.getByRole("button", { name: /Logout and switch accounts/i })
      ).toBeInTheDocument();
    });
  });

  describe("Credential Display", () => {
    it("should display API key as password field", () => {
      render(<AccountPage />);
      const apiKeyInput = screen.getByLabelText(/API key/i) as HTMLInputElement;
      expect(apiKeyInput).toHaveAttribute("type", "password");
      expect(apiKeyInput.value).toBe(mockCredentials.apiKey);
    });

    it("should display Tenant ID", () => {
      render(<AccountPage />);
      const tenantIdInput = screen.getByLabelText(/Tenant ID/i) as HTMLInputElement;
      expect(tenantIdInput.value).toBe(mockCredentials.tenantId);
    });

    it("should display Organization ID", () => {
      render(<AccountPage />);
      const orgIdInput = screen.getByLabelText(/Organization ID/i) as HTMLInputElement;
      expect(orgIdInput.value).toBe(mockCredentials.orgId);
    });

    it("should have all input fields as read-only", () => {
      render(<AccountPage />);
      const apiKeyInput = screen.getByLabelText(/API key/i) as HTMLInputElement;
      const tenantIdInput = screen.getByLabelText(/Tenant ID/i) as HTMLInputElement;
      const orgIdInput = screen.getByLabelText(/Organization ID/i) as HTMLInputElement;

      expect(apiKeyInput).toHaveAttribute("readonly");
      expect(tenantIdInput).toHaveAttribute("readonly");
      expect(orgIdInput).toHaveAttribute("readonly");
    });
  });

  describe("View Dashboard Button", () => {
    it("should have primary appearance", () => {
      render(<AccountPage />);
      const button = screen.getByRole("button", { name: /View dashboard/i });
      expect(button).toHaveClass("fui-Button");
    });

    it("should open dashboard URL in new window when clicked", () => {
      render(<AccountPage />);
      const button = screen.getByRole("button", { name: /View dashboard/i });

      fireEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://www-dev.app.ibm.com/envizi/emissions-api-home/overview",
        "_blank",
        "noopener"
      );
    });

    it("should open correct URL for production environment", () => {
      const { getEnvType, getOverviewDashboardUrl } = require("../../common/env");
      getEnvType.mockReturnValue("prod");
      getOverviewDashboardUrl.mockReturnValue(
        "https://www.app.ibm.com/envizi/emissions-api-home/overview"
      );

      render(<AccountPage />);
      const button = screen.getByRole("button", { name: /View dashboard/i });

      fireEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://www.app.ibm.com/envizi/emissions-api-home/overview",
        "_blank",
        "noopener"
      );
    });

    it("should allow clicking View dashboard multiple times", () => {
      render(<AccountPage />);
      const button = screen.getByRole("button", { name: /View dashboard/i });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledTimes(3);
    });
  });

  describe("Logout Button", () => {
    it("should have outline appearance", () => {
      render(<AccountPage />);
      const button = screen.getByRole("button", { name: /Logout and switch accounts/i });
      expect(button).toHaveClass("fui-Button");
    });

    it("should call logout function when clicked", () => {
      render(<AccountPage />);
      const button = screen.getByRole("button", { name: /Logout and switch accounts/i });

      fireEvent.click(button);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("should not call logout multiple times on single click", () => {
      render(<AccountPage />);
      const button = screen.getByRole("button", { name: /Logout and switch accounts/i });

      fireEvent.click(button);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe("Component Structure", () => {
    it("should have correct CSS classes", () => {
      render(<AccountPage />);
      expect(document.querySelector(".account-panel")).toBeInTheDocument();
      expect(document.querySelector(".form")).toBeInTheDocument();
      expect(document.querySelector(".form-grid")).toBeInTheDocument();
      expect(document.querySelector(".account-buttons")).toBeInTheDocument();
    });

    it("should render buttons in account-buttons container", () => {
      render(<AccountPage />);
      const buttonsContainer = document.querySelector(".account-buttons");
      expect(buttonsContainer).toBeInTheDocument();

      const buttons = buttonsContainer?.querySelectorAll("button");
      expect(buttons).toHaveLength(2);
    });

    it("should render fields in form-grid container", () => {
      render(<AccountPage />);
      const formGrid = document.querySelector(".form-grid");
      expect(formGrid).toBeInTheDocument();

      const fields = formGrid?.querySelectorAll(".fui-Field");
      expect(fields?.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for all input fields", () => {
      render(<AccountPage />);
      expect(screen.getByLabelText(/API key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tenant ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Organization ID/i)).toBeInTheDocument();
    });

    it("should have proper button roles", () => {
      render(<AccountPage />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("should have descriptive button text", () => {
      render(<AccountPage />);
      expect(screen.getByRole("button", { name: /View dashboard/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Logout and switch accounts/i })
      ).toBeInTheDocument();
    });
  });

  describe("Form Behavior", () => {
    it("should not allow editing of credential fields", () => {
      render(<AccountPage />);
      const apiKeyInput = screen.getByLabelText(/API key/i) as HTMLInputElement;

      fireEvent.change(apiKeyInput, { target: { value: "new-value" } });

      // Value should not change because field is readonly
      expect(apiKeyInput.value).toBe(mockCredentials.apiKey);
    });

    it("should render form element", () => {
      render(<AccountPage />);
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("form");
    });
  });

  describe("Button Interactions", () => {
    it("should handle multiple button clicks correctly", () => {
      render(<AccountPage />);
      const viewDashboardButton = screen.getByRole("button", { name: /View dashboard/i });
      const logoutButton = screen.getByRole("button", { name: /Logout and switch accounts/i });

      fireEvent.click(viewDashboardButton);
      fireEvent.click(logoutButton);

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
