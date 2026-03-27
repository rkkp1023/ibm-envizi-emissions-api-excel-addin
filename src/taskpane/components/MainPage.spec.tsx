/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { MainPage } from "./MainPage";

// Mock child components
jest.mock("./HomePage", () => ({
  HomePage: () => <div data-testid="home-page">Home Page Content</div>,
}));

jest.mock("./AccountPage", () => ({
  AccountPage: () => <div data-testid="account-page">Account Page Content</div>,
}));

jest.mock("./tabs/ResourcesTab", () => ({
  ResourcesTab: () => <div data-testid="resources-tab">Resources Tab Content</div>,
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

    it("should render tab list with Home, Resources, and Account tabs", () => {
      renderMainPage();
      expect(screen.getByRole("tab", { name: /Home/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Resources/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Account/i })).toBeInTheDocument();
    });

    it("should render Home tab as selected by default", () => {
      renderMainPage();
      const homeTab = screen.getByRole("tab", { name: /Home/i });
      expect(homeTab).toHaveAttribute("aria-selected", "true");
    });

    it("should render HomePage component by default", () => {
      renderMainPage();
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
      expect(screen.queryByTestId("account-page")).not.toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("should switch to Account tab when clicked", () => {
      renderMainPage();
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      fireEvent.click(accountTab);

      expect(accountTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByTestId("account-page")).toBeInTheDocument();
      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
      expect(screen.queryByTestId("resources-tab")).not.toBeInTheDocument();
    });

    it("should switch to Resources tab when clicked", () => {
      renderMainPage();
      const resourcesTab = screen.getByRole("tab", { name: /Resources/i });

      fireEvent.click(resourcesTab);

      expect(resourcesTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByTestId("resources-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
      expect(screen.queryByTestId("account-page")).not.toBeInTheDocument();
    });

    it("should switch back to Home tab when clicked", () => {
      renderMainPage();
      const homeTab = screen.getByRole("tab", { name: /Home/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      // Switch to Account
      fireEvent.click(accountTab);
      expect(screen.getByTestId("account-page")).toBeInTheDocument();

      // Switch back to Home
      fireEvent.click(homeTab);
      expect(homeTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
      expect(screen.queryByTestId("account-page")).not.toBeInTheDocument();
    });

    it("should maintain tab selection state", () => {
      renderMainPage();
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      fireEvent.click(accountTab);

      expect(accountTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: /Home/i })).toHaveAttribute("aria-selected", "false");
      expect(screen.getByRole("tab", { name: /Resources/i })).toHaveAttribute(
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

      // Initially Home is shown
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
      expect(screen.queryByTestId("resources-tab")).not.toBeInTheDocument();
      expect(screen.queryByTestId("account-page")).not.toBeInTheDocument();

      // Switch to Resources
      fireEvent.click(screen.getByRole("tab", { name: /Resources/i }));
      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
      expect(screen.getByTestId("resources-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("account-page")).not.toBeInTheDocument();

      // Switch to Account
      fireEvent.click(screen.getByRole("tab", { name: /Account/i }));
      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
      expect(screen.queryByTestId("resources-tab")).not.toBeInTheDocument();
      expect(screen.getByTestId("account-page")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA roles for tabs", () => {
      renderMainPage();
      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(3);
    });

    it("should have proper aria-selected attributes", () => {
      renderMainPage();
      const homeTab = screen.getByRole("tab", { name: /Home/i });
      const resourcesTab = screen.getByRole("tab", { name: /Resources/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      expect(homeTab).toHaveAttribute("aria-selected", "true");
      expect(resourcesTab).toHaveAttribute("aria-selected", "false");
      expect(accountTab).toHaveAttribute("aria-selected", "false");
    });

    it("should update aria-selected when switching tabs", () => {
      renderMainPage();
      const homeTab = screen.getByRole("tab", { name: /Home/i });
      const resourcesTab = screen.getByRole("tab", { name: /Resources/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      fireEvent.click(accountTab);

      expect(homeTab).toHaveAttribute("aria-selected", "false");
      expect(resourcesTab).toHaveAttribute("aria-selected", "false");
      expect(accountTab).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("State Management", () => {
    it("should initialize with home tab selected", () => {
      renderMainPage();
      expect(screen.getByRole("tab", { name: /Home/i })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("should handle multiple tab switches correctly", () => {
      renderMainPage();
      const homeTab = screen.getByRole("tab", { name: /Home/i });
      const resourcesTab = screen.getByRole("tab", { name: /Resources/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      // Switch to Resources
      fireEvent.click(resourcesTab);
      expect(screen.getByTestId("resources-tab")).toBeInTheDocument();

      // Switch to Account
      fireEvent.click(accountTab);
      expect(screen.getByTestId("account-page")).toBeInTheDocument();

      // Switch to Home
      fireEvent.click(homeTab);
      expect(screen.getByTestId("home-page")).toBeInTheDocument();

      // Switch to Resources again
      fireEvent.click(resourcesTab);
      expect(screen.getByTestId("resources-tab")).toBeInTheDocument();
    });
  });
});
