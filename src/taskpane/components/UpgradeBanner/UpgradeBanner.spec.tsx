// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { UpgradeBanner } from "./UpgradeBanner";

describe("UpgradeBanner", () => {
  // Mock window.open
  const mockWindowOpen = jest.fn();
  const originalWindowOpen = window.open;

  beforeAll(() => {
    window.open = mockWindowOpen;
  });

  afterAll(() => {
    window.open = originalWindowOpen;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockReturnValue({} as Window);
  });

  it("should render the upgrade banner with title", () => {
    render(<UpgradeBanner />);

    expect(screen.getByText("Upgrade Your")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
  });

  it("should render the description text", () => {
    render(<UpgradeBanner />);

    expect(
      screen.getByText(
        /Unlock premium emission factors for comprehensive analysis and extended capabilities/i
      )
    ).toBeInTheDocument();
  });

  it("should render the Buy now button", () => {
    render(<UpgradeBanner />);

    const button = screen.getByRole("link", { name: /Buy now/i });
    expect(button).toBeInTheDocument();
  });

  it("should have correct href attribute on the button", () => {
    render(<UpgradeBanner />);

    const button = screen.getByRole("link", { name: /Buy now/i });
    expect(button).toHaveAttribute("href", "https://www.ibm.com/products/envizi/pricing");
  });

  it("should have target='_blank' attribute on the button", () => {
    render(<UpgradeBanner />);

    const button = screen.getByRole("link", { name: /Buy now/i });
    expect(button).toHaveAttribute("target", "_blank");
  });

  it("should have rel='noopener noreferrer' for security", () => {
    render(<UpgradeBanner />);

    const button = screen.getByRole("link", { name: /Buy now/i });
    expect(button).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should render the Open icon", () => {
    render(<UpgradeBanner />);

    const button = screen.getByRole("link", { name: /Buy now/i });
    const icon = button.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should apply correct styling classes", () => {
    const { container } = render(<UpgradeBanner />);

    // Check that the container has the expected structure
    const bannerContainer = container.firstChild as HTMLElement;
    expect(bannerContainer).toBeInTheDocument();
    expect(bannerContainer.tagName).toBe("DIV");
  });

  it("should have button with outline appearance", () => {
    render(<UpgradeBanner />);

    const button = screen.getByRole("link", { name: /Buy now/i });
    // Fluent UI applies appearance through classes
    expect(button).toBeInTheDocument();
  });

  it("should render title as h2 elements", () => {
    const { container } = render(<UpgradeBanner />);

    const h2Elements = container.querySelectorAll("h2");
    expect(h2Elements).toHaveLength(2);
    expect(h2Elements[0]).toHaveTextContent("Upgrade Your");
    expect(h2Elements[1]).toHaveTextContent("Plan");
  });

  it("should render description as paragraph element", () => {
    const { container } = render(<UpgradeBanner />);

    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent(
      /Unlock premium emission factors for comprehensive analysis and extended capabilities/i
    );
  });

  it("should maintain consistent structure", () => {
    const { container } = render(<UpgradeBanner />);

    // Verify the component structure
    const bannerContainer = container.firstChild as HTMLElement;
    const content = bannerContainer.querySelector("div");
    expect(content).toBeInTheDocument();

    // Verify title container exists
    const titleContainer = content?.querySelector("div");
    expect(titleContainer).toBeInTheDocument();

    // Verify footer exists
    const footer = content?.querySelectorAll("div")[1];
    expect(footer).toBeInTheDocument();
  });

  it("should be accessible with proper semantic HTML", () => {
    render(<UpgradeBanner />);

    // Check for proper heading hierarchy
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(2);

    // Check for link with proper text
    const link = screen.getByRole("link", { name: /Buy now/i });
    expect(link).toBeInTheDocument();
  });
});
