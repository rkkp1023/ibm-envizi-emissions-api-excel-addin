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

  it("should render accordion component with both sections", () => {
    expect(screen.getByRole("button", { name: /Getting started/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Useful features/i })).toBeInTheDocument();
  });

  it("should have both accordion items expanded by default", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });

    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");
  });

  it("should render getting started description", () => {
    expect(
      screen.getByText(/Calculate greenhouse gas \(GHG\) emissions directly in your spreadsheet/i)
    ).toBeInTheDocument();
  });

  it("should render 'Using the Envizi template' heading", () => {
    expect(screen.getByText("Using the Envizi template")).toBeInTheDocument();
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
      "https://www.ibm.com/docs/envizi-esg-suite?topic=SSFJN8P/topics/c_ctr_new_emissions_excel.html"
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

describe("Useful Features Section", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

  it("should render useful features accordion item", () => {
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });
    expect(usefulFeaturesButton).toBeInTheDocument();
  });

  it("should have useful features section expanded by default", () => {
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");
  });

  it("should render useful features description", () => {
    expect(
      screen.getByText(
        /Get AI help to select a data type, ensure that you enter valid activity data/i
      )
    ).toBeInTheDocument();
  });

  it("should render all three useful features", () => {
    expect(screen.getByText("Get a recommended data type")).toBeInTheDocument();
    expect(screen.getByText("Ensure values are valid")).toBeInTheDocument();
    expect(screen.getByText("Match column titles to the template")).toBeInTheDocument();
  });

  it("should render AI recommendation feature description", () => {
    const description = screen.getByText(/You then review the recommended data type/i);
    expect(description).toBeInTheDocument();
    expect(description.textContent).toContain("Get AI to help select a data type");
    expect(description.textContent).toContain("decide whether it is appropriate to your activity");
  });

  it("should render AI recommendation formula syntax", () => {
    expect(
      screen.getByText(
        /=ENVIZI\.RECOMMEND\(search,country,\[stateProvince\],\[data\],\[page\],\[size\]\)/i
      )
    ).toBeInTheDocument();
  });

  it("should render valid values feature description", () => {
    expect(screen.getByText(/Ensure that you select valid input values/i)).toBeInTheDocument();
  });

  it("should render column titles feature description", () => {
    expect(
      screen.getByText(
        /If you use your own template, you can add the input and output column titles/i
      )
    ).toBeInTheDocument();
  });

  it("should render headers formula syntax", () => {
    expect(
      screen.getByText(/=ENVIZI\.HEADERS\(\(function Name\),\[input\]\)/i)
    ).toBeInTheDocument();
  });

  it("should render learn more about features link", () => {
    const learnMoreLink = screen.getByRole("link", { name: /Learn more about features/i });
    expect(learnMoreLink).toBeInTheDocument();
    expect(learnMoreLink).toHaveAttribute(
      "href",
      "https://www.ibm.com/docs/envizi-esg-suite?topic=SSFJN8P/topics/c_ctr_new_emissions_excel.html"
    );
  });

  it("should collapse useful features section when clicked", () => {
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });

    fireEvent.click(usefulFeaturesButton);

    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "false");
  });

  it("should expand useful features section when clicked again", () => {
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });

    // Collapse
    fireEvent.click(usefulFeaturesButton);
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "false");

    // Expand
    fireEvent.click(usefulFeaturesButton);
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");
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

  it("should render accordion content sections for both accordion items", () => {
    const accordionContent = document.querySelectorAll(".accordion-content");
    expect(accordionContent).toHaveLength(2);
  });

  it("should render text blocks for getting started steps", () => {
    const textBlocks = document.querySelectorAll(".text-block");
    expect(textBlocks).toHaveLength(3);
  });

  it("should render learn more button container", () => {
    const learnMoreBtn = document.querySelector(".learn-more-btn");
    expect(learnMoreBtn).toBeInTheDocument();
  });
});

describe("Accordion Behavior", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

  it("should have both sections expanded by default", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });

    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");
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

  it("should allow independent accordion behavior for both sections", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });

    // Collapse getting started
    fireEvent.click(gettingStartedButton);
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");

    // Collapse useful features
    fireEvent.click(usefulFeaturesButton);
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "false");

    // Expand both
    fireEvent.click(gettingStartedButton);
    fireEvent.click(usefulFeaturesButton);
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");
  });
});
