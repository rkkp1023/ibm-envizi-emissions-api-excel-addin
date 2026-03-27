/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { MainPage } from "./MainPage";

// Mock child components
jest.mock("./tabs/QuickHelpTab", () => ({
  QuickHelpTab: () => <div data-testid="quick-help-tab">Quick Help Content</div>,
}));

jest.mock("./tabs/AccountTab", () => ({
  AccountTab: () => <div data-testid="account-tab">Account Tab Content</div>,
}));

describe("MainPage", () => {
  const renderMainPage = () => {
    return render(<MainPage />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the main page container", () => {
      renderMainPage();
      const mainPage = screen.getByRole("tablist").closest(".page.main-page");
      expect(mainPage).toBeInTheDocument();
    });

    it("should render tab list with Quick help and Account tabs", () => {
      renderMainPage();
      expect(screen.getByRole("tab", { name: /Quick help/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Account/i })).toBeInTheDocument();
    });

    it("should render Quick help tab as selected by default", () => {
      renderMainPage();
      const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });
      expect(quickHelpTab).toHaveAttribute("aria-selected", "true");
    });

    it("should render QuickHelpTab component by default", () => {
      renderMainPage();
      expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("account-tab")).not.toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("should switch to Account tab when clicked", () => {
      renderMainPage();
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      fireEvent.click(accountTab);

      expect(accountTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByTestId("account-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("quick-help-tab")).not.toBeInTheDocument();
    });

    it("should switch back to Quick help tab when clicked", () => {
      renderMainPage();
      const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      // Switch to Account
      fireEvent.click(accountTab);
      expect(screen.getByTestId("account-tab")).toBeInTheDocument();

      // Switch back to Quick help
      fireEvent.click(quickHelpTab);
      expect(quickHelpTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("account-tab")).not.toBeInTheDocument();
    });

    it("should maintain tab selection state", () => {
      renderMainPage();
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      fireEvent.click(accountTab);

      expect(accountTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: /Quick help/i })).toHaveAttribute(
        "aria-selected",
        "false"
      );
    });
  });

  describe("Tab Content", () => {
    it("should render tab content container", () => {
      renderMainPage();
      const tabContent = document.querySelector(".tab-content");
      expect(tabContent).toBeInTheDocument();
    });

    it("should only render one tab content at a time", () => {
      renderMainPage();

      // Initially Quick help is shown
      expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("account-tab")).not.toBeInTheDocument();

      // Switch to Account
      fireEvent.click(screen.getByRole("tab", { name: /Account/i }));
      expect(screen.queryByTestId("quick-help-tab")).not.toBeInTheDocument();
      expect(screen.getByTestId("account-tab")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA roles for tabs", () => {
      renderMainPage();
      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    it("should have proper aria-selected attributes", () => {
      renderMainPage();
      const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      expect(quickHelpTab).toHaveAttribute("aria-selected", "true");
      expect(accountTab).toHaveAttribute("aria-selected", "false");
    });

    it("should update aria-selected when switching tabs", () => {
      renderMainPage();
      const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      fireEvent.click(accountTab);

      expect(quickHelpTab).toHaveAttribute("aria-selected", "false");
      expect(accountTab).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("State Management", () => {
    it("should initialize with quick help tab selected", () => {
      renderMainPage();
      expect(screen.getByRole("tab", { name: /Quick help/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
      expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();
    });

    it("should handle multiple tab switches correctly", () => {
      renderMainPage();
      const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      // Switch to Account
      fireEvent.click(accountTab);
      expect(screen.getByTestId("account-tab")).toBeInTheDocument();

      // Switch to Quick help
      fireEvent.click(quickHelpTab);
      expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();

      // Switch to Account again
      fireEvent.click(accountTab);
      expect(screen.getByTestId("account-tab")).toBeInTheDocument();
    });
  });
});
