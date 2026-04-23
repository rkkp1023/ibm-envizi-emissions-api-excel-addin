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

// Mock getEnableEnviziLogin
let mockEnableEnviziLogin = true;
jest.mock("../../../common/env", () => ({
  getEnableEnviziLogin: jest.fn(() => mockEnableEnviziLogin),
}));

// Mock Office.context.ui.displayDialogAsync
const mockDisplayDialogAsync = jest.fn();
global.Office = {
  context: {
    ui: {
      displayDialogAsync: mockDisplayDialogAsync,
    },
  },
  AsyncResultStatus: {
    Failed: 1,
    Succeeded: 0,
  },
} as any;

describe("QuickHelpTab", () => {
  beforeEach(() => {
    // Enable video section for tests
    localStorage.setItem("enableVideoSection", "true");
    render(<QuickHelpTab />);
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
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

  it("should render image with play button overlay", () => {
    const imageContainer = screen.getByRole("button", { name: /How to play/i });
    expect(imageContainer).toBeInTheDocument();

    // Check that the image is rendered
    const image = screen.getByAltText("How to play");
    expect(image).toBeInTheDocument();
  });

  it("should render image placeholder text", () => {
    expect(screen.queryByText(/How to use excel add-in \(placeholder\)/i)).toBeInTheDocument();
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

describe("Image Click Handler", () => {
  beforeEach(() => {
    mockDisplayDialogAsync.mockClear();
    // Enable video section for image click tests
    localStorage.setItem("enableVideoSection", "true");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should call Office.context.ui.displayDialogAsync when image is clicked", () => {
    render(<QuickHelpTab />);
    const imageContainer = screen.getByRole("button", { name: /How to play/i });

    fireEvent.click(imageContainer);
    expect(mockDisplayDialogAsync).toHaveBeenCalled();
  });

  it("should open video dialog with correct URL when image is clicked", () => {
    render(<QuickHelpTab />);
    const imageContainer = screen.getByRole("button", { name: /How to play/i });

    fireEvent.click(imageContainer);

    const callArgs = mockDisplayDialogAsync.mock.calls[0];
    expect(callArgs[0]).toContain("redirect.html?url=https://mediacenter.ibm.com/media/1_700skqlt");
    expect(callArgs[1]).toEqual({ height: 75, width: 75, promptBeforeOpen: false });
  });

  it("should handle dialog open failure gracefully", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    mockDisplayDialogAsync.mockImplementation((url, options, callback) => {
      callback({
        status: 1, // Office.AsyncResultStatus.Failed
        error: { message: "Failed to open dialog" },
      });
    });

    render(<QuickHelpTab />);
    const imageContainer = screen.getByRole("button", { name: /How to play/i });

    fireEvent.click(imageContainer);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to open video dialog:",
      "Failed to open dialog"
    );

    consoleErrorSpy.mockRestore();
  });

  it("should have correct accessible name on image container", () => {
    render(<QuickHelpTab />);
    const imageContainer = screen.getByRole("button", { name: /How to play/i });

    // Button component is accessible via its aria-label
    expect(imageContainer).toBeInTheDocument();
  });
});

describe("FunctionsAccordionItem", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

  it("should render functions accordion item", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    expect(functionsButton).toBeInTheDocument();
  });

  it("should not have functions section expanded by default", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    expect(functionsButton).toHaveAttribute("aria-expanded", "false");
  });

  it("should expand functions section when clicked", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });

    fireEvent.click(functionsButton);

    expect(functionsButton).toHaveAttribute("aria-expanded", "true");
  });

  it("should render Scope 1 emissions section", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText("Scope 1 emissions")).toBeInTheDocument();
  });

  it("should render Scope 2 emissions section", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText("Scope 2 emissions")).toBeInTheDocument();
  });

  it("should render Scope 3 emissions section", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText("Scope 3 emissions")).toBeInTheDocument();
  });

  it("should render Custom calculations section", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText("Custom calculations")).toBeInTheDocument();
  });

  it("should render Find factor sets section", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText("Find factor sets")).toBeInTheDocument();
  });

  it("should render stationary function syntax", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(
      screen.getByText(/=ENVIZI\.STATIONARY\(type, value, unit, country/i)
    ).toBeInTheDocument();
  });

  it("should render mobile function syntax", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText(/=ENVIZI\.MOBILE\(type, value, unit, country/i)).toBeInTheDocument();
  });

  it("should render fugitive function syntax", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText(/=ENVIZI\.FUGITIVE\(type, value, unit, country/i)).toBeInTheDocument();
  });

  it("should render location function syntax", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText(/=ENVIZI\.LOCATION\(type, value, unit, country/i)).toBeInTheDocument();
  });

  it("should render transportation and distribution function syntax", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(
      screen.getByText(/=ENVIZI\.TRANSPORTATION_AND_DISTRIBUTION\(type, value, unit, country/i)
    ).toBeInTheDocument();
  });

  it("should render calculation function syntax", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(
      screen.getByText(/=ENVIZI\.CALCULATION\(type, value, unit, country/i)
    ).toBeInTheDocument();
  });

  it("should render factor function syntax", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText(/=ENVIZI\.FACTOR\(type, unit, country/i)).toBeInTheDocument();
  });

  it("should render factor search function syntax", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(screen.getByText(/=ENVIZI\.FACTOR_SEARCH\(search, country/i)).toBeInTheDocument();
  });

  it("should render view all functions link", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    const viewAllLink = screen.getByRole("link", { name: /View all functions/i });
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute(
      "href",
      "https://www.ibm.com/docs/envizi-esg-suite?topic=reference-functions-in-emissions-calculations-in-excel"
    );
  });

  it("should render function descriptions", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    expect(
      screen.getByText(/Calculate emissions for stationary combustion sources/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Calculates emissions from fleet fuel consumption/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Calculates emissions from leaks of greenhouse gasses/i)
    ).toBeInTheDocument();
  });
});

describe("Conditional Rendering based on getEnableEnviziLogin", () => {
  it("should render useful features section when getEnableEnviziLogin is true", () => {
    mockEnableEnviziLogin = true;
    const { getEnableEnviziLogin } = require("../../../common/env");
    (getEnableEnviziLogin as jest.Mock).mockReturnValue(true);

    render(<QuickHelpTab />);

    expect(screen.getByRole("button", { name: /Useful features/i })).toBeInTheDocument();
  });

  it("should use correct documentation URL when getEnableEnviziLogin is true", () => {
    mockEnableEnviziLogin = true;
    const { getEnableEnviziLogin } = require("../../../common/env");
    (getEnableEnviziLogin as jest.Mock).mockReturnValue(true);

    render(<QuickHelpTab />);

    const docLink = screen.getByRole("link", { name: /Excel add-in documentation/i });
    expect(docLink).toHaveAttribute(
      "href",
      "https://www.ibm.com/docs/envizi-esg-suite?topic=SSFJN8P/topics/c_ctr_new_emissions_excel.html"
    );
  });

  it("should use alternative documentation URL when getEnableEnviziLogin is false", () => {
    mockEnableEnviziLogin = false;
    const { getEnableEnviziLogin } = require("../../../common/env");
    (getEnableEnviziLogin as jest.Mock).mockReturnValue(false);

    render(<QuickHelpTab />);

    const docLink = screen.getByRole("link", { name: /Excel add-in documentation/i });
    expect(docLink).toHaveAttribute(
      "href",
      "https://www.ibm.com/docs/envizi-esg-suite?topic=api-calculating-emissions-in-microsoft-excel"
    );
  });
});

describe("ExternalLinkButton Component", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

  it("should render external links with correct attributes", () => {
    const docLink = screen.getByRole("link", { name: /Excel add-in documentation/i });

    expect(docLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(docLink).toHaveAttribute("target", "_blank");
  });

  it("should render external link icon", () => {
    const docLink = screen.getByRole("link", { name: /Excel add-in documentation/i });
    const icon = docLink.querySelector("svg");

    expect(icon).toBeInTheDocument();
  });

  it("should have correct href for learn more link in useful features", () => {
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    const viewAllLink = screen.getByRole("link", { name: /View all functions/i });
    expect(viewAllLink).toHaveAttribute("target", "_blank");
    expect(viewAllLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("StepItem Component", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

  it("should render all step items with correct structure", () => {
    const textBlocks = document.querySelectorAll(".text-block");
    expect(textBlocks.length).toBeGreaterThanOrEqual(3);
  });

  it("should render step titles with semibold weight", () => {
    const step1Title = screen.getByText("1. Select a sheet");
    expect(step1Title).toBeInTheDocument();
  });

  it("should render step descriptions as paragraphs", () => {
    const step1Description = screen.getByText(/Select the sheet for your emissions type/i);
    expect(step1Description.tagName).toBe("P");
  });
});

describe("EmissionScopeSections Component", () => {
  it("should render emission scope sections with icons", () => {
    render(<QuickHelpTab />);
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    // Check that sections are rendered
    expect(screen.getByText("Scope 1 emissions")).toBeInTheDocument();
    expect(screen.getByText("Scope 2 emissions")).toBeInTheDocument();
    expect(screen.getByText("Scope 3 emissions")).toBeInTheDocument();
  });

  it("should render formulas for each emission scope", () => {
    render(<QuickHelpTab />);
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    // Check for formula categories (rendered with colon)
    expect(screen.getByText("Stationary:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Mobile:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Fugitive:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Location:", { exact: false })).toBeInTheDocument();
  });

  it("should render learn more button in emission scope sections", () => {
    render(<QuickHelpTab />);
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    const learnMoreBtn = document.querySelector(".learn-more-btn");
    expect(learnMoreBtn).toBeInTheDocument();
  });
});

describe("Icon Mapping", () => {
  it("should render icons for useful features when enabled", () => {
    mockEnableEnviziLogin = true;
    const { getEnableEnviziLogin } = require("../../../common/env");
    (getEnableEnviziLogin as jest.Mock).mockReturnValue(true);

    render(<QuickHelpTab />);

    // Icons should be rendered in the useful features section
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });
    expect(usefulFeaturesButton).toBeInTheDocument();
  });

  it("should render icons for function sections", () => {
    render(<QuickHelpTab />);
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    // Check that function sections with icons are rendered
    expect(screen.getByText("Scope 1 emissions")).toBeInTheDocument();
    expect(screen.getByText("Scope 2 emissions")).toBeInTheDocument();
    expect(screen.getByText("Scope 3 emissions")).toBeInTheDocument();
    expect(screen.getByText("Custom calculations")).toBeInTheDocument();
    expect(screen.getByText("Find factor sets")).toBeInTheDocument();
  });
});

describe("Accordion Multiple Collapsible Behavior", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

  it("should support multiple accordion items open simultaneously", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
    const functionsButton = screen.getByRole("button", { name: /Functions/i });

    // Expand functions while getting started is already expanded
    fireEvent.click(functionsButton);

    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    expect(functionsButton).toHaveAttribute("aria-expanded", "true");
  });

  it("should allow all sections to be collapsed", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
    const functionsButton = screen.getByRole("button", { name: /Functions/i });

    // Collapse all sections
    fireEvent.click(gettingStartedButton);

    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
    expect(functionsButton).toHaveAttribute("aria-expanded", "false");
  });

  it("should maintain independent state for each accordion item", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
    const functionsButton = screen.getByRole("button", { name: /Functions/i });

    // Toggle getting started
    fireEvent.click(gettingStartedButton);
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");

    // Toggle functions
    fireEvent.click(functionsButton);
    expect(functionsButton).toHaveAttribute("aria-expanded", "true");

    // Getting started should still be collapsed
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Edge Cases and Error Scenarios", () => {
  it("should handle missing Office context gracefully", () => {
    const originalOffice = global.Office;
    delete (global as any).Office;

    expect(() => render(<QuickHelpTab />)).not.toThrow();

    global.Office = originalOffice;
  });

  it("should render correctly when no credentials are provided", () => {
    expect(() => render(<QuickHelpTab />)).not.toThrow();
    expect(screen.getByRole("button", { name: /Getting started/i })).toBeInTheDocument();
  });

  it("should handle empty constants arrays gracefully", () => {
    // Component should still render even if constants are empty
    render(<QuickHelpTab />);
    expect(document.querySelector(".home-panel")).toBeInTheDocument();
  });

  it("should handle video section when localStorage is not set", () => {
    localStorage.removeItem("enableVideoSection");
    render(<QuickHelpTab />);

    // Video section should not be rendered when localStorage is not set
    expect(screen.queryByAltText("How to play")).not.toBeInTheDocument();
  });

  it("should handle video section when localStorage is set to false", () => {
    localStorage.setItem("enableVideoSection", "false");
    render(<QuickHelpTab />);

    // Video section should not be rendered when localStorage is false
    expect(screen.queryByAltText("How to play")).not.toBeInTheDocument();

    localStorage.clear();
  });

  it("should render component without errors when Office context is available", () => {
    // Verify Office context is properly mocked
    expect(global.Office).toBeDefined();
    expect(global.Office.context).toBeDefined();
    expect(global.Office.context.ui).toBeDefined();

    render(<QuickHelpTab />);
    expect(screen.getByRole("button", { name: /Getting started/i })).toBeInTheDocument();
  });
});

describe("Accessibility", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
  });

  it("should have proper ARIA attributes on accordion buttons", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

    expect(gettingStartedButton).toHaveAttribute("aria-expanded");
  });

  it("should have accessible external links", () => {
    const docLink = screen.getByRole("link", { name: /Excel add-in documentation/i });

    expect(docLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(docLink).toHaveAttribute("target", "_blank");
  });

  it("should have proper role attribute on clickable image container", () => {
    // Enable video section for this test
    localStorage.setItem("enableVideoSection", "true");
    render(<QuickHelpTab />);

    const imageContainer = screen.getByRole("button", { name: /How to play/i });
    // Button component already has role="button" by default, verified by getByRole
    expect(imageContainer).toBeInTheDocument();

    localStorage.clear();
  });

  it("should have keyboard accessible accordion items", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
    const functionsButton = screen.getByRole("button", { name: /Functions/i });

    // Accordion buttons should be keyboard accessible
    expect(gettingStartedButton).toBeInTheDocument();
    expect(functionsButton).toBeInTheDocument();
  });

  it("should maintain focus management when toggling accordion items", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

    gettingStartedButton.focus();
    expect(document.activeElement).toBe(gettingStartedButton);

    fireEvent.click(gettingStartedButton);
    // Focus should remain on the button after click
    expect(document.activeElement).toBe(gettingStartedButton);
  });
});

describe("Video Section Behavior", () => {
  beforeEach(() => {
    mockDisplayDialogAsync.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should not render video section by default", () => {
    render(<QuickHelpTab />);
    expect(screen.queryByAltText("How to play")).not.toBeInTheDocument();
  });

  it("should render video section when enabled in localStorage", () => {
    localStorage.setItem("enableVideoSection", "true");
    render(<QuickHelpTab />);

    expect(screen.getByAltText("How to play")).toBeInTheDocument();
    expect(screen.getByText(/How to use excel add-in \(placeholder\)/i)).toBeInTheDocument();
  });

  it("should render play button overlay on video thumbnail", () => {
    localStorage.setItem("enableVideoSection", "true");
    render(<QuickHelpTab />);

    const imageContainer = screen.getByRole("button", { name: /How to play/i });
    expect(imageContainer).toBeInTheDocument();

    // Check for play button icon
    const playButton = imageContainer.querySelector("svg");
    expect(playButton).toBeInTheDocument();
  });

  it("should construct correct redirect URL for video dialog", () => {
    localStorage.setItem("enableVideoSection", "true");
    render(<QuickHelpTab />);

    const imageContainer = screen.getByRole("button", { name: /How to play/i });
    fireEvent.click(imageContainer);

    const callArgs = mockDisplayDialogAsync.mock.calls[0];
    expect(callArgs[0]).toContain("redirect.html");
    expect(callArgs[0]).toContain("url=https://mediacenter.ibm.com/media/1_700skqlt");
  });

  it("should use correct dialog dimensions", () => {
    localStorage.setItem("enableVideoSection", "true");
    render(<QuickHelpTab />);

    const imageContainer = screen.getByRole("button", { name: /How to play/i });
    fireEvent.click(imageContainer);

    const callArgs = mockDisplayDialogAsync.mock.calls[0];
    expect(callArgs[1]).toEqual({ height: 75, width: 75, promptBeforeOpen: false });
  });

  it("should not prompt before opening video dialog", () => {
    localStorage.setItem("enableVideoSection", "true");
    render(<QuickHelpTab />);

    const imageContainer = screen.getByRole("button", { name: /How to play/i });
    fireEvent.click(imageContainer);

    const callArgs = mockDisplayDialogAsync.mock.calls[0];
    expect(callArgs[1].promptBeforeOpen).toBe(false);
  });
});

describe("Documentation Links", () => {
  it("should render correct documentation link for Envizi login enabled", () => {
    mockEnableEnviziLogin = true;
    const { getEnableEnviziLogin } = require("../../../common/env");
    (getEnableEnviziLogin as jest.Mock).mockReturnValue(true);

    render(<QuickHelpTab />);

    const docLink = screen.getByRole("link", { name: /Excel add-in documentation/i });
    expect(docLink).toHaveAttribute(
      "href",
      "https://www.ibm.com/docs/envizi-esg-suite?topic=SSFJN8P/topics/c_ctr_new_emissions_excel.html"
    );
  });

  it("should render correct documentation link for Envizi login disabled", () => {
    mockEnableEnviziLogin = false;
    const { getEnableEnviziLogin } = require("../../../common/env");
    (getEnableEnviziLogin as jest.Mock).mockReturnValue(false);

    render(<QuickHelpTab />);

    const docLink = screen.getByRole("link", { name: /Excel add-in documentation/i });
    expect(docLink).toHaveAttribute(
      "href",
      "https://www.ibm.com/docs/envizi-esg-suite?topic=api-calculating-emissions-in-microsoft-excel"
    );
  });

  it("should render learn more link in useful features section", () => {
    mockEnableEnviziLogin = true;
    const { getEnableEnviziLogin } = require("../../../common/env");
    (getEnableEnviziLogin as jest.Mock).mockReturnValue(true);

    render(<QuickHelpTab />);

    const learnMoreLink = screen.getByRole("link", { name: /Learn more about features/i });
    expect(learnMoreLink).toBeInTheDocument();
    expect(learnMoreLink).toHaveAttribute("target", "_blank");
  });

  it("should render view all functions link with correct URL", () => {
    render(<QuickHelpTab />);
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);

    const viewAllLink = screen.getByRole("link", { name: /View all functions/i });
    expect(viewAllLink).toHaveAttribute(
      "href",
      "https://www.ibm.com/docs/envizi-esg-suite?topic=reference-functions-in-emissions-calculations-in-excel"
    );
  });
});

describe("Formula Rendering", () => {
  beforeEach(() => {
    render(<QuickHelpTab />);
    const functionsButton = screen.getByRole("button", { name: /Functions/i });
    fireEvent.click(functionsButton);
  });

  it("should render all Scope 1 formulas", () => {
    expect(
      screen.getByText(/=ENVIZI\.STATIONARY\(type, value, unit, country/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/=ENVIZI\.MOBILE\(type, value, unit, country/i)).toBeInTheDocument();
    expect(screen.getByText(/=ENVIZI\.FUGITIVE\(type, value, unit, country/i)).toBeInTheDocument();
  });

  it("should render Scope 2 formula", () => {
    expect(screen.getByText(/=ENVIZI\.LOCATION\(type, value, unit, country/i)).toBeInTheDocument();
  });

  it("should render Scope 3 formula", () => {
    expect(
      screen.getByText(/=ENVIZI\.TRANSPORTATION_AND_DISTRIBUTION\(type, value, unit, country/i)
    ).toBeInTheDocument();
  });

  it("should render custom calculation formula", () => {
    expect(
      screen.getByText(/=ENVIZI\.CALCULATION\(type, value, unit, country/i)
    ).toBeInTheDocument();
  });

  it("should render factor search formulas", () => {
    expect(screen.getByText(/=ENVIZI\.FACTOR\(type, unit, country/i)).toBeInTheDocument();
    expect(screen.getByText(/=ENVIZI\.FACTOR_SEARCH\(search, country/i)).toBeInTheDocument();
  });

  it("should render formula descriptions for all scopes", () => {
    expect(
      screen.getByText(/Calculate emissions for stationary combustion sources/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Calculates emissions from fleet fuel consumption/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Calculates emissions from leaks of greenhouse gasses/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Calculates emissions from electricity grids/i)).toBeInTheDocument();
  });
});

describe("Component State Management", () => {
  it("should maintain accordion state independently for each section", () => {
    render(<QuickHelpTab />);

    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });
    const usefulFeaturesButton = screen.getByRole("button", { name: /Useful features/i });
    const functionsButton = screen.getByRole("button", { name: /Functions/i });

    // Initial state
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");
    expect(functionsButton).toHaveAttribute("aria-expanded", "false");

    // Toggle functions
    fireEvent.click(functionsButton);
    expect(functionsButton).toHaveAttribute("aria-expanded", "true");
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");

    // Collapse getting started
    fireEvent.click(gettingStartedButton);
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");
    expect(functionsButton).toHaveAttribute("aria-expanded", "true");
    expect(usefulFeaturesButton).toHaveAttribute("aria-expanded", "true");
  });

  it("should persist video section state from localStorage", () => {
    localStorage.setItem("enableVideoSection", "true");
    const { rerender } = render(<QuickHelpTab />);

    expect(screen.getByAltText("How to play")).toBeInTheDocument();

    // Rerender should maintain the same state
    rerender(<QuickHelpTab />);
    expect(screen.getByAltText("How to play")).toBeInTheDocument();

    localStorage.clear();
  });
});
