// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import { AccountTab } from "../AccountTab/AccountTab";

// Mock the useAuth hook
const mockLogout = jest.fn();
const mockApiCredentials = {
  apiKey: "test-api-key-12345",
  tenantId: "test-tenant-id",
  orgId: "test-org-id",
};

const mockUserCredentials = {
  token: "test-token",
  refreshToken: "test-refresh-token",
  coreToken: "test-core-token",
};

let mockUseAuthReturn = {
  state: {
    credentials: mockApiCredentials as any,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
  login: jest.fn(),
  logout: mockLogout,
  clearError: jest.fn(),
};

jest.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuthReturn,
}));

// Mock useUserInfo hook
let mockUserInfoReturn = {
  isLoading: false,
  isError: false,
  data: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    orgName: "Test Organization",
    orgId: "123",
    languageCode: "en",
    timeZoneId: "America/New_York",
  },
};

jest.mock("../../hooks/useUserInfo", () => ({
  useUserInfo: () => mockUserInfoReturn,
}));

// Mock useAccountSubscription hook
let mockAccountSubscriptionReturn = {
  isLoading: false,
  isError: false,
  data: {
    subscriptionType: "premium",
    organizationId: "123",
    totalApiCalls: 1000,
    billingCycleMonths: 12,
    partNumber: "D09SJZX",
    ssmCreationDate: "2024-01-01",
    ssmExpirationDate: "2025-01-01",
    edition: "",
  },
};

jest.mock("../../hooks/useAccountSubscription", () => ({
  useAccountSubscription: () => mockAccountSubscriptionReturn,
}));

// Mock the env module
jest.mock("../../../common/env", () => ({
  getEnvType: jest.fn(() => "np"),
  getOverviewDashboardUrl: jest.fn(
    () => "https://www-dev.app.ibm.com/envizi/emissions-api-home/overview"
  ),
  getAccountUsageUrl: jest.fn(() => "https://us006t.envizi.com/emissions/account-usage"),
  getEnableEnviziLogin: jest.fn(() => true),
}));

// Mock window.open
const mockWindowOpen = jest.fn();
global.window.open = mockWindowOpen;

describe("AccountTab - API Credentials Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
    mockUseAuthReturn.state.credentials = mockApiCredentials;
  });

  describe("Rendering", () => {
    it("should render the account panel container", () => {
      render(<AccountTab />);
      const accountPanel = document.querySelector(".account-panel");
      expect(accountPanel).toBeInTheDocument();
    });

    it("should render form with form-grid class", () => {
      render(<AccountTab />);
      const form = document.querySelector(".form");
      const formGrid = document.querySelector(".form-grid");
      expect(form).toBeInTheDocument();
      expect(formGrid).toBeInTheDocument();
    });

    it("should render all three credential fields", () => {
      render(<AccountTab />);
      expect(screen.getByLabelText(/API key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tenant ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Organization ID/i)).toBeInTheDocument();
    });

    it("should render View account and usage button", () => {
      render(<AccountTab />);
      expect(screen.getByRole("button", { name: /View dashboard/i })).toBeInTheDocument();
    });

    it("should render Logout button", () => {
      render(<AccountTab />);
      expect(screen.getByRole("button", { name: /^Logout$/i })).toBeInTheDocument();
    });
  });

  describe("Credential Display", () => {
    it("should display API key as password field", () => {
      render(<AccountTab />);
      const apiKeyInput = screen.getByLabelText(/API key/i) as HTMLInputElement;
      expect(apiKeyInput).toHaveAttribute("type", "password");
      expect(apiKeyInput.value).toBe(mockApiCredentials.apiKey);
    });

    it("should display Tenant ID", () => {
      render(<AccountTab />);
      const tenantIdInput = screen.getByLabelText(/Tenant ID/i) as HTMLInputElement;
      expect(tenantIdInput.value).toBe(mockApiCredentials.tenantId);
    });

    it("should display Organization ID", () => {
      render(<AccountTab />);
      const orgIdInput = screen.getByLabelText(/Organization ID/i) as HTMLInputElement;
      expect(orgIdInput.value).toBe(mockApiCredentials.orgId);
    });

    it("should have all input fields as read-only", () => {
      render(<AccountTab />);
      const apiKeyInput = screen.getByLabelText(/API key/i) as HTMLInputElement;
      const tenantIdInput = screen.getByLabelText(/Tenant ID/i) as HTMLInputElement;
      const orgIdInput = screen.getByLabelText(/Organization ID/i) as HTMLInputElement;

      expect(apiKeyInput).toHaveAttribute("readonly");
      expect(tenantIdInput).toHaveAttribute("readonly");
      expect(orgIdInput).toHaveAttribute("readonly");
    });
  });

  describe("View Account and Usage Button", () => {
    it("should have primary appearance", () => {
      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /View dashboard/i });
      expect(button).toHaveClass("fui-Button");
    });

    it("should open API key dashboard URL in new window when clicked", () => {
      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /View dashboard/i });

      fireEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://www-dev.app.ibm.com/envizi/emissions-api-home/overview",
        "_blank",
        "noopener"
      );
    });

    it("should open correct API key URL for production environment", () => {
      const { getEnvType, getOverviewDashboardUrl } = require("../../../common/env");
      getEnvType.mockReturnValue("prod");
      getOverviewDashboardUrl.mockReturnValue(
        "https://www.app.ibm.com/envizi/emissions-api-home/overview"
      );

      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /View dashboard/i });

      fireEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://www.app.ibm.com/envizi/emissions-api-home/overview",
        "_blank",
        "noopener"
      );
    });

    it("should allow clicking View account and usage multiple times", () => {
      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /View dashboard/i });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledTimes(3);
    });
  });

  describe("Logout Button", () => {
    it("should have outline appearance", () => {
      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /^Logout$/i });
      expect(button).toHaveClass("fui-Button");
    });

    it("should call logout function when clicked", () => {
      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /^Logout$/i });

      fireEvent.click(button);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("should not call logout multiple times on single click", () => {
      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /^Logout$/i });

      fireEvent.click(button);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe("Component Structure", () => {
    it("should have correct CSS classes", () => {
      render(<AccountTab />);
      expect(document.querySelector(".account-panel")).toBeInTheDocument();
      expect(document.querySelector(".form")).toBeInTheDocument();
      expect(document.querySelector(".form-grid")).toBeInTheDocument();
      expect(document.querySelector(".account-buttons")).toBeInTheDocument();
    });

    it("should render buttons in account-buttons container", () => {
      render(<AccountTab />);
      const buttonsContainer = document.querySelector(".account-buttons");
      expect(buttonsContainer).toBeInTheDocument();

      const buttons = buttonsContainer?.querySelectorAll("button");
      expect(buttons).toHaveLength(2);
    });

    it("should render fields in form-grid container", () => {
      render(<AccountTab />);
      const formGrid = document.querySelector(".form-grid");
      expect(formGrid).toBeInTheDocument();

      const fields = formGrid?.querySelectorAll(".fui-Field");
      expect(fields?.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for all input fields", () => {
      render(<AccountTab />);
      expect(screen.getByLabelText(/API key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tenant ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Organization ID/i)).toBeInTheDocument();
    });

    it("should have proper button roles", () => {
      render(<AccountTab />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("should have descriptive button text", () => {
      render(<AccountTab />);
      expect(screen.getByRole("button", { name: /View dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Logout$/i })).toBeInTheDocument();
    });
  });

  describe("Form Behavior", () => {
    it("should not allow editing of credential fields", () => {
      render(<AccountTab />);
      const apiKeyInput = screen.getByLabelText(/API key/i) as HTMLInputElement;

      fireEvent.change(apiKeyInput, { target: { value: "new-value" } });

      // Value should not change because field is readonly
      expect(apiKeyInput.value).toBe(mockApiCredentials.apiKey);
    });

    it("should render form element", () => {
      render(<AccountTab />);
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("form");
    });
  });

  describe("Button Interactions", () => {
    it("should handle multiple button clicks correctly", () => {
      render(<AccountTab />);
      const viewDashboardButton = screen.getByRole("button", { name: /View dashboard/i });
      const logoutButton = screen.getByRole("button", { name: /^Logout$/i });

      fireEvent.click(viewDashboardButton);
      fireEvent.click(logoutButton);

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});

describe("AccountTab - User Credentials Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
    mockUseAuthReturn.state.credentials = mockUserCredentials;
    mockUserInfoReturn.isLoading = false;
    mockUserInfoReturn.isError = false;
    mockAccountSubscriptionReturn.isLoading = false;
    mockAccountSubscriptionReturn.isError = false;
  });

  describe("Rendering with User Credentials", () => {
    it("should render the account panel container", () => {
      render(<AccountTab />);
      const accountPanel = document.querySelector(".account-panel");
      expect(accountPanel).toBeInTheDocument();
    });

    it("should render user information fields instead of API credentials", () => {
      render(<AccountTab />);
      expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Username$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subscription type/i)).toBeInTheDocument();
    });

    it("should not render API credential fields", () => {
      render(<AccountTab />);
      expect(screen.queryByLabelText(/API key/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Tenant ID/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Organization ID/i)).not.toBeInTheDocument();
    });
  });

  describe("User Information Display", () => {
    it("should display user's full name", () => {
      render(<AccountTab />);
      const nameInput = screen.getByLabelText(/^Name$/i) as HTMLInputElement;
      expect(nameInput.value).toBe("John Doe");
    });

    it("should display user's email as username", () => {
      render(<AccountTab />);
      const usernameInput = screen.getByLabelText(/^Username$/i) as HTMLInputElement;
      expect(usernameInput.value).toBe("john.doe@example.com");
    });

    it("should display account type", () => {
      render(<AccountTab />);
      const accountTypeInput = screen.getByLabelText(/Subscription type/i) as HTMLInputElement;
      expect(accountTypeInput.value).toBe("Premium");
    });

    it("should have all input fields as read-only", () => {
      render(<AccountTab />);
      const nameInput = screen.getByLabelText(/^Name$/i) as HTMLInputElement;
      const usernameInput = screen.getByLabelText(/^Username$/i) as HTMLInputElement;
      const accountTypeInput = screen.getByLabelText(/Subscription type/i) as HTMLInputElement;

      expect(nameInput).toHaveAttribute("readonly");
      expect(usernameInput).toHaveAttribute("readonly");
      expect(accountTypeInput).toHaveAttribute("readonly");
    });
  });

  describe("Buttons with User Credentials", () => {
    it("should render View account and usage button", () => {
      render(<AccountTab />);
      expect(screen.getByRole("button", { name: /View account and usage/i })).toBeInTheDocument();
    });

    it("should render Logout button", () => {
      render(<AccountTab />);
      expect(screen.getByRole("button", { name: /^Logout$/i })).toBeInTheDocument();
    });

    it("should call logout when Logout button is clicked", () => {
      render(<AccountTab />);
      const logoutButton = screen.getByRole("button", { name: /^Logout$/i });

      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("should open account and usage page", () => {
      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /View account and usage/i });

      fireEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://us006t.envizi.com/emissions/account-usage",
        "_blank",
        "noopener"
      );
    });

    it("should open correct Envizi URL for production environment with token auth", () => {
      const { getEnvType, getAccountUsageUrl } = require("../../../common/env");
      getEnvType.mockReturnValue("prod");
      getAccountUsageUrl.mockReturnValue("https://us006t.envizi.com/emissions/account-usage");

      render(<AccountTab />);
      const button = screen.getByRole("button", { name: /View account and usage/i });

      fireEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://us006t.envizi.com/emissions/account-usage",
        "_blank",
        "noopener"
      );
    });
  });

  describe("Loading States", () => {
    it("should show spinner when user info is loading", () => {
      mockUserInfoReturn.isLoading = true;

      render(<AccountTab />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should show spinner when subscription data is loading", () => {
      mockAccountSubscriptionReturn.isLoading = true;

      render(<AccountTab />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("Error States", () => {
    it("should not render user info when there is an error", () => {
      mockUserInfoReturn.isError = true;

      render(<AccountTab />);
      expect(screen.queryByLabelText(/^Name$/i)).not.toBeInTheDocument();
    });

    it("should not render user info when subscription data has error", () => {
      mockAccountSubscriptionReturn.isError = true;

      render(<AccountTab />);
      expect(screen.queryByLabelText(/^Name$/i)).not.toBeInTheDocument();
    });
  });
});
