// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { QuickHelpTab } from "./QuickHelpTab";

const mockApiCredentials = {
  apiKey: "test-api-key",
  tenantId: "test-tenant-id",
  orgId: "test-org-id",
};

const mockUseAuthReturn = {
  state: {
    credentials: mockApiCredentials,
    isInitialized: true,
    isAuthenticated: true,
    isLoggedOut: false,
  },
};

jest.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuthReturn,
}));

jest.mock("../../hooks/useAccountSubscription", () => ({
  useAccountSubscription: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
}));

describe("QuickHelpTab", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

  describe("Rendering", () => {
    it("should render the home panel container", () => {
      const homePanel = document.querySelector(".home-panel");
      expect(homePanel).toBeInTheDocument();
    });

    it("should render accordion component", () => {
      expect(screen.getByRole("button", { name: /Getting started/i })).toBeInTheDocument();
    });

    it("should have getting started accordion item expanded by default", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Getting Started Section", () => {
    it("should render getting started header", () => {
      expect(screen.getByRole("button", { name: /Getting started/i })).toBeInTheDocument();
    });

    it("should render getting started description", () => {
      expect(
        screen.getByText(/Get started with the Emissions API Excel add-in/i)
      ).toBeInTheDocument();
    });

    it("should render all three getting started steps", () => {
      expect(screen.getByText("1. Choose a template (optional)")).toBeInTheDocument();
      expect(screen.getByText("2. Enter your activity data")).toBeInTheDocument();
      expect(screen.getByText("3. Calculate emissions")).toBeInTheDocument();
    });

    it("should render step 1 description", () => {
      expect(
        screen.getByText(
          /In the Excel template, select the appropriate tab for your emissions type/i
        )
      ).toBeInTheDocument();
    });

    it("should render step 2 description", () => {
      expect(
        screen.getByText(/In the input table, add data like fuel use and type/i)
      ).toBeInTheDocument();
    });

    it("should render step 3 description", () => {
      expect(
        screen.getByText(/Once you've inputted your data, you can use the add-in functions/i)
      ).toBeInTheDocument();
    });

    it("should collapse getting started section when clicked", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

      fireEvent.click(gettingStartedButton);

      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
    });

    it("should expand getting started section when clicked again", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

      // Collapse
      fireEvent.click(gettingStartedButton);
      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");

      // Expand
      fireEvent.click(gettingStartedButton);
      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Component Structure", () => {
    it("should have correct CSS classes", () => {
      const homePanel = document.querySelector(".home-panel");
      expect(homePanel).toHaveClass("home-panel");
    });

    it("should render accordion content section", () => {
      const accordionContent = document.querySelectorAll(".accordion-content");
      expect(accordionContent).toHaveLength(1);
    });

    it("should render text blocks for steps", () => {
      const textBlocks = document.querySelectorAll(".text-block");
      expect(textBlocks).toHaveLength(3);
    });
  });

  describe("Accordion Behavior", () => {
    it("should have getting started section expanded by default", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    });

    it("should allow collapsing the getting started section", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

      fireEvent.click(gettingStartedButton);

      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
    });

    it("should allow expanding the getting started section after collapsing", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

      fireEvent.click(gettingStartedButton);
      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(gettingStartedButton);
      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Content Validation", () => {
    it("should render step items with headers and descriptions", () => {
      const textHeaders = document.querySelectorAll(".text-header");
      expect(textHeaders).toHaveLength(3);
    });
  });
});
