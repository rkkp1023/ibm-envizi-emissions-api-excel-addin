// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AuthProvider } from "../context/AuthContext";
import { LoginPage } from "./LoginPage";

// Mock the credentials module
const mockLoadApiCredentialsFromStorage = jest.fn();
const mockSaveUserCredentialsToStorage = jest.fn();
jest.mock("../../common/credentials", () => ({
  loadCredentialsFromStorage: mockLoadApiCredentialsFromStorage,
  saveApiCredentialsToStorage: jest.fn(),
  saveUserCredentialsToStorage: (...args: any[]) => mockSaveUserCredentialsToStorage(...args),
  removeApiCredentialsFromStorage: jest.fn(),
  removeCredentialsFromStorage: jest.fn(),
  setApiCredentials: jest.fn(),
}));

// Mock the client module
jest.mock("../../functions/client", () => ({
  ensureClient: jest.fn().mockResolvedValue(undefined),
  resetClient: jest.fn(),
}));

// Mock the auth service
const mockPerformLogin = jest.fn();
const mockPerformLogout = jest.fn();
const mockValidateCredentials = jest.fn();

jest.mock("../services/authService", () => ({
  performLogin: (...args: any[]) => mockPerformLogin(...args),
  performLogout: (...args: any[]) => mockPerformLogout(...args),
  validateCredentials: (...args: any[]) => mockValidateCredentials(...args),
}));

// Mock the auth dialog
const mockDisplayLoginDialog = jest.fn();
jest.mock("../auth", () => ({
  displayLoginDialog: (...args: any[]) => mockDisplayLoginDialog(...args),
}));

describe("LoginPage", () => {
  beforeAll(() => {
    window.localStorage.setItem("enableEnviziLogin", "false");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadApiCredentialsFromStorage.mockResolvedValue(null);
    mockPerformLogin.mockResolvedValue(undefined);
  });

  const renderLoginPage = () => {
    return render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
  };

  it("should render the login form with all required fields", () => {
    renderLoginPage();

    expect(screen.getByText("Account credentials")).toBeInTheDocument();
    expect(screen.getByLabelText(/API key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tenant ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Save credentials/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  it("should update input fields when user types", () => {
    renderLoginPage();

    const apiKeyInput = screen.getByLabelText(/API key/i) as HTMLInputElement;
    const tenantIdInput = screen.getByLabelText(/Tenant ID/i) as HTMLInputElement;
    const orgIdInput = screen.getByLabelText(/Organization ID/i) as HTMLInputElement;

    fireEvent.change(apiKeyInput, { target: { value: "test-api-key" } });
    fireEvent.change(tenantIdInput, { target: { value: "test-tenant" } });
    fireEvent.change(orgIdInput, { target: { value: "test-org" } });

    expect(apiKeyInput.value).toBe("test-api-key");
    expect(tenantIdInput.value).toBe("test-tenant");
    expect(orgIdInput.value).toBe("test-org");
  });

  it("should have save credentials checkbox checked by default", () => {
    renderLoginPage();

    const checkbox = screen.getByLabelText(/Save credentials/i) as HTMLInputElement;
    expect(checkbox).toBeChecked();
  });

  it("should submit form with credentials", async () => {
    mockPerformLogin.mockResolvedValue(undefined);

    renderLoginPage();

    const apiKeyInput = screen.getByLabelText(/API key/i);
    const tenantIdInput = screen.getByLabelText(/Tenant ID/i);
    const orgIdInput = screen.getByLabelText(/Organization ID/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(apiKeyInput, { target: { value: "test-key" } });
    fireEvent.change(tenantIdInput, { target: { value: "test-tenant" } });
    fireEvent.change(orgIdInput, { target: { value: "test-org" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPerformLogin).toHaveBeenCalledWith(
        {
          apiKey: "test-key",
          tenantId: "test-tenant",
          orgId: "test-org",
        },
        true
      );
    });
  });

  it("should show loading state during submission", async () => {
    mockPerformLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    renderLoginPage();

    const apiKeyInput = screen.getByLabelText(/API key/i);
    const tenantIdInput = screen.getByLabelText(/Tenant ID/i);
    const orgIdInput = screen.getByLabelText(/Organization ID/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(apiKeyInput, { target: { value: "test-key" } });
    fireEvent.change(tenantIdInput, { target: { value: "test-tenant" } });
    fireEvent.change(orgIdInput, { target: { value: "test-org" } });
    fireEvent.click(submitButton);

    expect(screen.getByRole("button", { name: /Logging in.../i })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    });
  });

  it("should display error message on login failure", async () => {
    const error = new Error("Invalid credentials. Please enter your credentials and try again.");
    (error as any).status = 401;
    mockPerformLogin.mockRejectedValue(error);

    renderLoginPage();

    const apiKeyInput = screen.getByLabelText(/API key/i);
    const tenantIdInput = screen.getByLabelText(/Tenant ID/i);
    const orgIdInput = screen.getByLabelText(/Organization ID/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(apiKeyInput, { target: { value: "bad-key" } });
    fireEvent.change(tenantIdInput, { target: { value: "bad-tenant" } });
    fireEvent.change(orgIdInput, { target: { value: "bad-org" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid credentials. Please enter your credentials and try again./i)
      ).toBeInTheDocument();
    });
  });

  it("should toggle save credentials checkbox", () => {
    renderLoginPage();

    const checkbox = screen.getByLabelText(/Save credentials/i) as HTMLInputElement;
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("should submit with saveCredentials false when checkbox is unchecked", async () => {
    mockPerformLogin.mockResolvedValue(undefined);

    renderLoginPage();

    const apiKeyInput = screen.getByLabelText(/API key/i);
    const tenantIdInput = screen.getByLabelText(/Tenant ID/i);
    const orgIdInput = screen.getByLabelText(/Organization ID/i);
    const checkbox = screen.getByLabelText(/Save credentials/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(apiKeyInput, { target: { value: "test-key" } });
    fireEvent.change(tenantIdInput, { target: { value: "test-tenant" } });
    fireEvent.change(orgIdInput, { target: { value: "test-org" } });
    fireEvent.click(checkbox); // Uncheck the checkbox
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPerformLogin).toHaveBeenCalledWith(
        {
          apiKey: "test-key",
          tenantId: "test-tenant",
          orgId: "test-org",
        },
        false
      );
    });
  });

  it("should disable inputs during loading", async () => {
    mockPerformLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    renderLoginPage();

    const apiKeyInput = screen.getByLabelText(/API key/i) as HTMLInputElement;
    const tenantIdInput = screen.getByLabelText(/Tenant ID/i) as HTMLInputElement;
    const orgIdInput = screen.getByLabelText(/Organization ID/i) as HTMLInputElement;
    const checkbox = screen.getByLabelText(/Save credentials/i) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(apiKeyInput, { target: { value: "test-key" } });
    fireEvent.change(tenantIdInput, { target: { value: "test-tenant" } });
    fireEvent.change(orgIdInput, { target: { value: "test-org" } });
    fireEvent.click(submitButton);

    expect(apiKeyInput).toBeDisabled();
    expect(tenantIdInput).toBeDisabled();
    expect(orgIdInput).toBeDisabled();
    expect(checkbox).toBeDisabled();

    await waitFor(() => {
      expect(apiKeyInput).not.toBeDisabled();
    });
  });

  it("should render link to overview dashboard", () => {
    renderLoginPage();

    const link = screen.getByText(/Emissions API overview dashboard/i);
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("target", "_blank");
  });
});
