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

  it("should render getting started description", () => {
    expect(
      screen.getByText(/Calculate greenhouse gas \(GHG\) emissions directly in your spreadsheet/i)
    ).toBeInTheDocument();
  });

  it("should render all three getting started steps", () => {
    expect(screen.getByText("1. Select a sheet")).toBeInTheDocument();
    expect(screen.getByText("2. Enter your activity data")).toBeInTheDocument();
    expect(screen.getByText("3. Calculate emissions")).toBeInTheDocument();
  });

  it("should render step 1 description", () => {
    expect(
      screen.getByText(/Select the sheet for your emissions type, for example, S1. Stationary/i)
    ).toBeInTheDocument();
  });

  it("should render step 2 description", () => {
    expect(
      screen.getByText(
        /In the input table, add data like fuel use and type, location, and date range/i
      )
    ).toBeInTheDocument();
  });

  it("should render step 3 description", () => {
    expect(
      screen.getByText(
        /After you add your data, your emissions are calculated in the output table/i
      )
    ).toBeInTheDocument();
  });

  it("should not render image with play button overlay (feature disabled)", () => {
    const imageWrapper = document.querySelector(".image-wrapper");
    expect(imageWrapper).not.toBeInTheDocument();

    const playButtonOverlay = document.querySelector(".play-button-overlay");
    expect(playButtonOverlay).not.toBeInTheDocument();
  });

  it("should not render image placeholder text (feature disabled)", () => {
    expect(screen.queryByText(/How to use excel add-in \(placeholder\)/i)).not.toBeInTheDocument();
  });

  it("should render documentation link", () => {
    const docLink = screen.getByRole("link", { name: /Excel add-in documentation/i });
    expect(docLink).toBeInTheDocument();
    expect(docLink).toHaveAttribute(
      "href",
      "https://ibm.github.io/ibm-envizi-emissions-api-excel-addin"
    );
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
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

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
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

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
