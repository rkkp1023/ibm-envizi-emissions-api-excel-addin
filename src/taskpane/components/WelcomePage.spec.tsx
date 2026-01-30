/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { WelcomePage } from "./WelcomePage";

describe("WelcomePage", () => {
  const mockOnGetStarted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    render(<WelcomePage onGetStarted={mockOnGetStarted} />);
  });

  it("should render the welcome page with header", () => {
    expect(screen.getByText("Welcome to the Envizi Emissions Calculations")).toBeInTheDocument();
    expect(screen.getByAltText("IBM Envizi Emissions Calculations")).toBeInTheDocument();
  });

  it("should render the welcome message", () => {
    expect(
      screen.getByText("Seamlessly integrate emissions data into your workflows.")
    ).toBeInTheDocument();
  });

  it.each([
    "Automate data integration",
    "Access real-time emissions insights",
    "Get auto-selected emissions factors",
    "Export your results quickly & easily",
  ])("should render feature: %s", (feature) => {
    expect(screen.getByText(feature)).toBeInTheDocument();
  });

  it("should render the Get started button", () => {
    const button = screen.getByRole("button", { name: /Get started/i });
    expect(button).toBeInTheDocument();
  });

  it("should call onGetStarted when button is clicked", () => {
    const button = screen.getByRole("button", { name: /Get started/i });
    fireEvent.click(button);

    expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
  });

  it("should render the copyright notice", () => {
    expect(screen.getByText("© Copyright IBM Corp. 2025")).toBeInTheDocument();
  });

  it("should have correct image source", () => {
    const image = screen.getByAltText("IBM Envizi Emissions Calculations") as HTMLImageElement;
    expect(image.src).toContain("icon-128.png");
  });

  it("should have correct button attributes", () => {
    const button = screen.getByRole("button", { name: /Get started/i });
    expect(button).toHaveAttribute("id", "get-started-button");
    expect(button).toHaveClass("fui-Button");
  });
});
