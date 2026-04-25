// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import { WelcomePage } from "./WelcomePage";

describe("WelcomePage", () => {
  const mockOnGetStarted = jest.fn();
  const renderWelcomePage = () => render(<WelcomePage onGetStarted={mockOnGetStarted} />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("Rendering", () => {
    it("should render the welcome page with header", () => {
      renderWelcomePage();

      expect(screen.getByText("Welcome to Envizi Emissions Calculations")).toBeInTheDocument();
      expect(screen.getByAltText("IBM Envizi Emissions Calculations")).toBeInTheDocument();
    });

    it("should render the welcome message", () => {
      renderWelcomePage();

      expect(
        screen.getByText("Seamlessly integrate emissions data into your workflows.")
      ).toBeInTheDocument();
    });

    it.each([
      "Apply GHG Protocol‑aligned templates",
      "Calculate Scope 1, 2, or 3 emissions",
      "Use auto-selected emissions factors",
      "Reduce manual errors and improve accuracy",
    ])("should render feature: %s", (feature) => {
      renderWelcomePage();

      expect(screen.getByText(feature)).toBeInTheDocument();
    });

    it("should render the Get started button", () => {
      renderWelcomePage();

      const button = screen.getByRole("button", { name: /Get started/i });
      expect(button).toBeInTheDocument();
    });

    it("should render the copyright notice", () => {
      renderWelcomePage();

      expect(screen.getByText("© Copyright IBM Corp. 2025, 2026")).toBeInTheDocument();
    });

    it("should have correct image source", () => {
      renderWelcomePage();

      const image = screen.getByAltText("IBM Envizi Emissions Calculations") as HTMLImageElement;
      expect(image.src).toContain("icon-128.png");
    });

    it("should have correct button attributes", () => {
      renderWelcomePage();

      const button = screen.getByRole("button", { name: /Get started/i });
      expect(button).toHaveAttribute("id", "get-started-button");
      expect(button).toHaveClass("fui-Button");
    });

    it("should render signup link with correct form ID", () => {
      renderWelcomePage();

      const link = screen.getByRole("link", { name: /complete the sign-up form/i });
      expect(link).toHaveAttribute(
        "href",
        "https://www.ibm.com/account/reg/signup?formid=urx-54313"
      );
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("should render Learn more link", () => {
      renderWelcomePage();

      const link = screen.getByRole("link", { name: /Learn more/i });
      expect(link).toHaveAttribute(
        "href",
        "https://www.ibm.com/docs/envizi-esg-suite?topic=api-calculating-emissions-in-microsoft-excel"
      );
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("User Interactions", () => {
    it("should call onGetStarted when button is clicked", () => {
      renderWelcomePage();

      const button = screen.getByRole("button", { name: /Get started/i });
      fireEvent.click(button);

      expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
    });
  });
});
