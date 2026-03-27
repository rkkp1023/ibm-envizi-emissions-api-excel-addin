/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

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
      expect(screen.getByRole("button", { name: /Resources/i })).toBeInTheDocument();
    });

    it("should have both accordion items expanded by default", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
      const resourcesButton = screen.getByRole("button", { name: /Resources/i });

      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
      expect(resourcesButton).toHaveAttribute("aria-expanded", "true");
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

  describe("Resources Section", () => {
    it("should render resources header", () => {
      expect(screen.getByText(/Resources/i)).toBeInTheDocument();
    });

    it("should render resources description", () => {
      expect(
        screen.getByText(/Everything you need to get started, build, and succeed/i)
      ).toBeInTheDocument();
    });

    it("should render Documentation section header", () => {
      expect(screen.getByText("Documentation")).toBeInTheDocument();
    });

    it("should render Community section header", () => {
      expect(screen.getByText("Community")).toBeInTheDocument();
    });

    it("should render Support section header", () => {
      expect(screen.getByText("Support")).toBeInTheDocument();
    });

    it("should collapse resources section when clicked", () => {
      const resourcesButton = screen.getByRole("button", { name: /Resources/i });

      fireEvent.click(resourcesButton);

      expect(resourcesButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Documentation Links", () => {
    it("should render IBM product documentation link", () => {
      const link = screen.getByRole("link", { name: /IBM product documentation/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://www.ibm.com/docs/en/envizi-esg-suite?topic=modules-trial-user-only-envizi-ghg-emissions-api"
      );
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("should render Excel add-in documentation link", () => {
      const link = screen.getByRole("link", { name: /Excel add-in documentation/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://ibm.github.io/ibm-envizi-emissions-api-excel-addin"
      );
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Community Links", () => {
    it("should render IBM Envizi Community link", () => {
      const link = screen.getByRole("link", { name: /IBM Envizi Community/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://community.ibm.com/community/user/communities/community-home?CommunityKey=6853271a-0a5c-45f9-a9a2-0186706f68ec"
      );
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("should render IBM Envizi blog link", () => {
      const link = screen.getByRole("link", { name: /IBM Envizi blog/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://www.ibm.com/think/author/envizi");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Support Links", () => {
    it("should render Provide feedback link", () => {
      const link = screen.getByRole("link", { name: /Provide feedback/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://your.feedback.ibm.com/jfe/form/SV_7Vh96izZeRghY34"
      );
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("should render Contact IBM link", () => {
      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "mailto:enviziemissionsapi@ibm.com");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Component Structure", () => {
    it("should have correct CSS classes", () => {
      const homePanel = document.querySelector(".home-panel");
      expect(homePanel).toHaveClass("home-panel");
    });

    it("should render accordion content sections", () => {
      const accordionContent = document.querySelectorAll(".accordion-content");
      expect(accordionContent).toHaveLength(2);
    });

    it("should render text blocks for steps", () => {
      const textBlocks = document.querySelectorAll(".text-block");
      expect(textBlocks).toHaveLength(3);
    });

    it("should render block headers for resource sections", () => {
      const blockHeaders = document.querySelectorAll(".block-header");
      expect(blockHeaders).toHaveLength(3);
    });
  });

  describe("Accordion Behavior", () => {
    it("should allow multiple accordion items to be open simultaneously", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
      const resourcesButton = screen.getByRole("button", { name: /Resources/i });

      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
      expect(resourcesButton).toHaveAttribute("aria-expanded", "true");
    });

    it("should allow collapsing one section while keeping other open", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
      const resourcesButton = screen.getByRole("button", { name: /Resources/i });

      fireEvent.click(gettingStartedButton);

      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
      expect(resourcesButton).toHaveAttribute("aria-expanded", "true");
    });

    it("should allow collapsing both sections", () => {
      const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
      const resourcesButton = screen.getByRole("button", { name: /Resources/i });

      fireEvent.click(gettingStartedButton);
      fireEvent.click(resourcesButton);

      expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
      expect(resourcesButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Content Validation", () => {
    it("should render all 6 external links", () => {
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(6);
    });

    it("should have correct number of resource sections", () => {
      expect(screen.getByText("Documentation")).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
      expect(screen.getByText("Support")).toBeInTheDocument();
    });

    it("should render step items with headers and descriptions", () => {
      const textHeaders = document.querySelectorAll(".text-header");
      expect(textHeaders).toHaveLength(3);
    });
  });
});
