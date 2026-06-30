// Copyright IBM Corp. 2026

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { ActivityTypeRecommenderContent } from "./ActivityTypeRecommenderContent";
import { ActivityRecommenderProps } from "../ActivityTypeRecommender/ActivityTypeRecommender";

// Mock window.matchMedia for Carbon React components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the child table component
jest.mock("../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable", () => ({
  __esModule: true,
  default: jest.fn(({ recommendations, onSelect }) => (
    <div data-testid="activity-type-recommender-table">
      {recommendations && recommendations.length > 0 && (
        <>
          <button
            data-testid="mock-select-button"
            onClick={() => onSelect && onSelect(recommendations[0])}
          >
            Select First
          </button>
          <div data-testid="recommendations-count">{recommendations.length}</div>
        </>
      )}
    </div>
  )),
}));

// Mock @griffel/react
jest.mock("@griffel/react", () => ({
  makeStyles: jest.fn(() => () => ({
    loadingContainer: "mock-loading-container-class",
  })),
}));

const mockRecommendations = [
  {
    id: "1",
    activityType: "Waste Recycled - Cardboard",
    confidence: 95,
    activityDescription: "Waste Recycled - Cardboard",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes"],
  },
  {
    id: "2",
    activityType: "Waste Recycled - Paper",
    confidence: 90,
    activityDescription: "Waste Recycled - Paper",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes"],
  },
];

const mockRecommendActivityType = jest.fn();

jest.mock("../../services/activityTypeRecommenderService", () => ({
  recommendActivityType: (...args: any[]) => mockRecommendActivityType(...args),
}));

describe("ActivityTypeRecommenderContent", () => {
  const mockOnClose = jest.fn();

  const mockContext = {
    search: "electricity",
    country: "USA",
    stateProvince: "California",
    unit: "kWh",
    scope: "2",
    date: "2024-01-01",
  };

  const defaultProps: ActivityRecommenderProps = {
    context: mockContext,
    onClose: mockOnClose,
  };

  const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRecommendActivityType.mockResolvedValue(mockRecommendations);
  });

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      expect(screen.getByText(/Top 30 recommendations for/i)).toBeInTheDocument();
    });

    it("should display the search term in the header", () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      expect(screen.getByText("electricity")).toBeInTheDocument();
    });

    it("should render stateProvince tag when provided", () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      expect(screen.getByText("California")).toBeInTheDocument();
    });

    it("should render unit tag when provided", () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      expect(screen.getByText("kWh")).toBeInTheDocument();
    });

    it("should not render stateProvince tag when not provided", () => {
      const props = { ...defaultProps, context: { search: "test", country: "USA" } };
      renderWithQueryClient(<ActivityTypeRecommenderContent {...props} />);
      expect(screen.queryByText("California")).not.toBeInTheDocument();
    });

    it("should render the ActivityTypeRecommenderTable", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId("activity-type-recommender-table")).toBeInTheDocument();
      });
    });

    it("should render with default recommendations", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId("recommendations-count")).toHaveTextContent("2");
      });
    });

    it("should render without onClose prop", () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent />);
      expect(screen.getByText(/Top 30 recommendations for/i)).toBeInTheDocument();
    });
  });

  describe("State Management — Use button enable/disable", () => {
    it("should initialize with Use button disabled", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId("mock-select-button")).toBeInTheDocument();
      });
      expect(screen.getByText("Use selected activity type")).toBeDisabled();
    });

    it("should enable the Use button when a recommendation is selected", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-select-button")).toBeInTheDocument();
      });

      const useButton = screen.getByText("Use selected activity type");
      expect(useButton).toBeDisabled();

      fireEvent.click(screen.getByTestId("mock-select-button"));

      await waitFor(() => {
        expect(useButton).not.toBeDisabled();
      });
    });
  });

  describe("Cancel button", () => {
    it("should call onClose when Cancel is clicked", () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      fireEvent.click(screen.getByText("Cancel"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not throw when onClose is undefined and Cancel is clicked", () => {
      expect(() => {
        renderWithQueryClient(<ActivityTypeRecommenderContent context={mockContext} />);
        fireEvent.click(screen.getByText("Cancel"));
      }).not.toThrow();
    });
  });

  describe("Information banner", () => {
    it("should render the information banner", () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      expect(
        screen.getByText(/If you can't locate what you need in this list/i)
      ).toBeInTheDocument();
    });
  });
});
