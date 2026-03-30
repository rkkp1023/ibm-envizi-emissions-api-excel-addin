// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { MainPage } from "./MainPage";

// Mock the credentials module
jest.mock("../../common/credentials", () => ({
  loadCredentialsFromStorage: jest.fn().mockResolvedValue(null),
  saveApiCredentialsToStorage: jest.fn(),
  saveUserCredentialsToStorage: jest.fn(),
  removeApiCredentialsFromStorage: jest.fn(),
  removeCredentialsFromStorage: jest.fn(),
  setApiCredentials: jest.fn(),
}));

// Mock the client module
jest.mock("../../functions/client", () => ({
  ensureClient: jest.fn().mockResolvedValue(undefined),
  resetClient: jest.fn(),
}));

// Mock child components
jest.mock("./QuickHelpTab/QuickHelpTab", () => ({
  QuickHelpTab: () => <div data-testid="quick-help-tab">Quick Help Content</div>,
}));

jest.mock("./AccountTab/AccountTab", () => ({
  AccountTab: () => <div data-testid="account-tab">Account Tab Content</div>,
}));

jest.mock("./ResourcesTab/ResourcesTab", () => ({
  ResourcesTab: () => <div data-testid="resources-tab">Resources Tab Content</div>,
}));

describe("MainPage", () => {
  beforeAll(() => {
    window.localStorage.setItem("enableEnviziLogin", "false");
  });

  const renderMainPage = () => {
    return render(
      <AuthProvider>
        <MainPage />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the main page container with all tabs", () => {
    renderMainPage();
    const mainPage = screen.getByRole("tablist").closest(".page.main-page");
    expect(mainPage).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Quick help/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Resources/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Account/i })).toBeInTheDocument();
  });

  it("should initialize with Quick help tab selected", () => {
    renderMainPage();
    const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });
    expect(quickHelpTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();
  });

  it("should switch tabs and update aria-selected attributes", () => {
    renderMainPage();
    const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });
    const resourcesTab = screen.getByRole("tab", { name: /Resources/i });
    const accountTab = screen.getByRole("tab", { name: /Account/i });

    // Switch to Resources
    fireEvent.click(resourcesTab);
    expect(resourcesTab).toHaveAttribute("aria-selected", "true");
    expect(quickHelpTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("resources-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("quick-help-tab")).not.toBeInTheDocument();

    // Switch to Account
    fireEvent.click(accountTab);
    expect(accountTab).toHaveAttribute("aria-selected", "true");
    expect(resourcesTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("account-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("resources-tab")).not.toBeInTheDocument();

    // Switch back to Quick help
    fireEvent.click(quickHelpTab);
    expect(quickHelpTab).toHaveAttribute("aria-selected", "true");
    expect(accountTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("account-tab")).not.toBeInTheDocument();
  });

  it("should have proper ARIA roles", () => {
    renderMainPage();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });
});
