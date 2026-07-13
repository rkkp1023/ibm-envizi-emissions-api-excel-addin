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

// Mock the Modify Search panel so tests don't pull in real metadata/Excel services
const mockModifySearchProps: Record<string, unknown> = {};
jest.mock(
  "../ActivityTypeRecommenderModifySearch/ActivityTypeRecommenderModifySearch",
  () => ({
    __esModule: true,
    default: jest.fn((props) => {
      Object.assign(mockModifySearchProps, props);
      return (
        <div data-testid="modify-search-panel">
          <button
            data-testid="modify-search-submit"
            onClick={() => props.onSearch?.({ activityName: "test", country: { id: "AU", text: "Australia" }, state: null, unit: null, scope: null })}
          >
            Search
          </button>
          <button data-testid="modify-search-cancel" onClick={() => props.onCancel?.()}>
            Cancel
          </button>
        </div>
      );
    }),
  })
);

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
    Object.keys(mockModifySearchProps).forEach((k) => delete mockModifySearchProps[k]);
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

    it("should render country tag when provided", () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      expect(screen.getByText("USA")).toBeInTheDocument();
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

  describe("Modify Search manual navigation", () => {
    it("should open the Modify Search panel when Modify Search button is clicked", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByText(/Modify Search/i)).toBeInTheDocument()
      );
      fireEvent.click(screen.getByText(/Modify Search/i));
      expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument();
    });

    it("should pass showNoResultsNotification=false when opening manually with results", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() => expect(screen.getByText(/Modify Search/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText(/Modify Search/i));
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );
      expect(mockModifySearchProps.showNoResultsNotification).toBe(false);
    });

    it("should pass disableBack=false when opening manually with results", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() => expect(screen.getByText(/Modify Search/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText(/Modify Search/i));
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );
      expect(mockModifySearchProps.disableBack).toBe(false);
    });
  });

  describe("Auto-open Modify Search on empty results", () => {
    beforeEach(() => {
      mockRecommendActivityType.mockResolvedValue([]);
    });

    it("should auto-open the Modify Search panel when the API returns no results", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );
    });

    it("should pass showNoResultsNotification=true to Modify Search on empty initial load", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );
      expect(mockModifySearchProps.showNoResultsNotification).toBe(true);
    });

    it("should pass disableBack=true to Modify Search on empty initial load", async () => {
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );
      expect(mockModifySearchProps.disableBack).toBe(true);
    });

    it("should auto-open the Modify Search panel when the API returns an error", async () => {
      mockRecommendActivityType.mockRejectedValue(new Error("API error"));
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );
      expect(mockModifySearchProps.showNoResultsNotification).toBe(true);
    });
  });

  describe("Modify search re-submit flow", () => {
    it("should close the Modify Search panel when re-submit returns results", async () => {
      // Initial load returns empty → panel auto-opens
      mockRecommendActivityType.mockResolvedValue([]);
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );

      // Next fetch returns results
      mockRecommendActivityType.mockResolvedValue(mockRecommendations);
      fireEvent.click(screen.getByTestId("modify-search-submit"));

      await waitFor(() =>
        expect(screen.queryByTestId("modify-search-panel")).not.toBeInTheDocument()
      );
    });

    it("should keep the Modify Search panel open when re-submit returns empty results", async () => {
      // Initial load returns empty → panel auto-opens
      mockRecommendActivityType.mockResolvedValue([]);
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );

      // Next fetch also returns empty
      fireEvent.click(screen.getByTestId("modify-search-submit"));

      await waitFor(() => {
        // Panel remains open
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument();
        // Notification stays true
        expect(mockModifySearchProps.showNoResultsNotification).toBe(true);
      });
    });

    it("should clear showNoResultsNotification when re-submit returns results", async () => {
      mockRecommendActivityType.mockResolvedValue([]);
      renderWithQueryClient(<ActivityTypeRecommenderContent {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByTestId("modify-search-panel")).toBeInTheDocument()
      );

      mockRecommendActivityType.mockResolvedValue(mockRecommendations);
      fireEvent.click(screen.getByTestId("modify-search-submit"));

      // Panel closes and table view returns with results
      await waitFor(() =>
        expect(screen.getByTestId("activity-type-recommender-table")).toBeInTheDocument()
      );
    });
  });
});
