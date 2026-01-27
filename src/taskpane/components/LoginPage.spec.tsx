/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as credentialsModule from "../../common/credentials";
import { AuthProvider } from "../context/AuthContext";
import LoginPage from "./LoginPage";

// Mock the credentials module
jest.mock("../../common/credentials", () => ({
  loadApiCredentialsFromStorage: jest.fn(),
  saveApiCredentialsToStorage: jest.fn(),
  removeApiCredentialsFromStorage: jest.fn(),
  setApiCredentials: jest.fn(),
}));

// Mock the env module
jest.mock("../../common/env", () => ({
  getEnvType: jest.fn(() => "np"),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (credentialsModule.loadApiCredentialsFromStorage as jest.Mock).mockResolvedValue(null);
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
    (credentialsModule.saveApiCredentialsToStorage as jest.Mock).mockResolvedValue(undefined);
    (credentialsModule.setApiCredentials as jest.Mock).mockReturnValue(undefined);

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
      expect(credentialsModule.setApiCredentials).toHaveBeenCalledWith({
        apiKey: "test-key",
        tenantId: "test-tenant",
        orgId: "test-org",
      });
    });
  });

  it("should show loading state during submission", async () => {
    (credentialsModule.saveApiCredentialsToStorage as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    (credentialsModule.setApiCredentials as jest.Mock).mockReturnValue(undefined);

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
    (credentialsModule.setApiCredentials as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid credentials");
    });

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
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
