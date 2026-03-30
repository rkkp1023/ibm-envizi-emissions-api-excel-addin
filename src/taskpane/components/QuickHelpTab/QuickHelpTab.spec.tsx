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
      screen.getByText(/Get started with the Emissions API Excel add-in/i)
    ).toBeInTheDocument();
  });

  it("should render all three getting started steps", () => {
    expect(screen.getByText("1. Choose a template (optional)")).toBeInTheDocument();
    expect(screen.getByText("2. Enter your activity data")).toBeInTheDocument();
    expect(screen.getByText("3. Calculate emissions")).toBeInTheDocument();
  });

  it("should collapse and expand getting started section when clicked", () => {
    const gettingStartedButton = screen.getByRole("button", { name: /Getting started/i });

    // Collapse
    fireEvent.click(gettingStartedButton);
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "false");

    // Expand
    fireEvent.click(gettingStartedButton);
    expect(gettingStartedButton).toHaveAttribute("aria-expanded", "true");
  });
});
