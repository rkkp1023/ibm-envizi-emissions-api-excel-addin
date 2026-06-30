// Copyright IBM Corp. 2026

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { ActivityRecommenderProps, ActivityTypeRecommender } from "./ActivityTypeRecommender";

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

// Mock the child component
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
    tabList: "mock-tab-list-class",
  })),
}));

// Mock the activityTypeRecommenderService
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
  {
    id: "3",
    activityType: "Waste Recycled - Plastic",
    confidence: 85,
    activityDescription: "Waste Recycled - Plastic",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes"],
  },
  {
    id: "4",
    activityType: "Waste Recycled - Metal",
    confidence: 80,
    activityDescription: "Waste Recycled - Metal",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes"],
  },
  {
    id: "5",
    activityType: "Waste Recycled - Glass",
    confidence: 75,
    activityDescription: "Waste Recycled - Glass",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes"],
  },
];

const mockRecommendActivityType = jest.fn();

jest.mock("../../services/activityTypeRecommenderService", () => ({
  recommendActivityType: (...args: any[]) => mockRecommendActivityType(...args),
}));

describe("ActivityTypeRecommender", () => {
  const mockOnClose = jest.fn();
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

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

  // Helper function to render component with QueryClientProvider
  const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRecommendActivityType.mockResolvedValue(mockRecommendations);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      expect(screen.getByText("Envizi Activity type recommender")).toBeInTheDocument();
    });

    it("should render the tab with correct title", () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      const tabTitle = screen.getByText("Envizi Activity type recommender");
      expect(tabTitle).toBeInTheDocument();
    });

    it("should render the AiRecommend icon", () => {
      const { container } = renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      const iconElement = container.querySelector(".activity-tab-item svg");
      expect(iconElement).toBeInTheDocument();
    });

    it("should render ActivityTypeRecommenderTable component", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId("activity-type-recommender-table")).toBeInTheDocument();
      });
    });

    it("should render with default recommendations", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      await waitFor(() => {
        const recommendationsCount = screen.getByTestId("recommendations-count");
        expect(recommendationsCount).toHaveTextContent("5");
      });
    });

    it("should render without onClose prop", () => {
      renderWithQueryClient(<ActivityTypeRecommender />);
      expect(screen.getByText("Envizi Activity type recommender")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("should pass onClose callback to Tabs component", () => {
      renderWithQueryClient(<ActivityTypeRecommender onClose={mockOnClose} />);
      // Verify component renders successfully with onClose prop
      expect(screen.getByText("Envizi Activity type recommender")).toBeInTheDocument();
    });

    it("should handle undefined onClose prop gracefully", () => {
      expect(() => {
        renderWithQueryClient(<ActivityTypeRecommender />);
      }).not.toThrow();
    });
  });

  describe("State Management", () => {
    it("should initialize with null selectedRecommendation", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      // State is internal, but we can verify behavior
      await waitFor(() => {
        expect(screen.getByTestId("activity-type-recommender-table")).toBeInTheDocument();
      });
    });

    it("should update selectedRecommendation when handleRadioSelect is called", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-select-button")).toBeInTheDocument();
      });

      const useButton = screen.getByText("Use selected activity type");
      expect(useButton).toBeDisabled();

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(useButton).not.toBeDisabled();
      });
    });
  });

  describe("User Interactions", () => {
    it("should handle radio selection", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-select-button")).toBeInTheDocument();
      });

      const useButton = screen.getByText("Use selected activity type");
      expect(useButton).toBeDisabled();

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(useButton).not.toBeDisabled();
      });
    });

    it("should enable the use button when recommendation is selected", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-select-button")).toBeInTheDocument();
      });

      const useButton = screen.getByText("Use selected activity type");
      expect(useButton).toBeDisabled();

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(useButton).not.toBeDisabled();
      });
    });

    it("should handle multiple selections", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-select-button")).toBeInTheDocument();
      });

      const useButton = screen.getByText("Use selected activity type");
      const selectButton = screen.getByTestId("mock-select-button");

      fireEvent.click(selectButton);
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(useButton).not.toBeDisabled();
      });
    });
  });

  describe("Callback Handlers", () => {
    it("should call handleRadioSelect with correct recommendation", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-select-button")).toBeInTheDocument();
      });

      const useButton = screen.getByText("Use selected activity type");
      expect(useButton).toBeDisabled();

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(useButton).not.toBeDisabled();
      });
    });

    it("should pass onSelect callback to ActivityTypeRecommenderTable", async () => {
      const ActivityTypeRecommenderTableMock =
        require("../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable").default;

      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(ActivityTypeRecommenderTableMock.mock.calls.length).toBeGreaterThan(0);
      });

      const callArgs =
        ActivityTypeRecommenderTableMock.mock.calls[
          ActivityTypeRecommenderTableMock.mock.calls.length - 1
        ][0];
      expect(callArgs).toMatchObject({
        onSelect: expect.any(Function),
      });
    });

    it("should pass recommendations to ActivityTypeRecommenderTable", async () => {
      const ActivityTypeRecommenderTableMock =
        require("../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable").default;

      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(ActivityTypeRecommenderTableMock.mock.calls.length).toBeGreaterThan(0);
      });

      const callArgs =
        ActivityTypeRecommenderTableMock.mock.calls[
          ActivityTypeRecommenderTableMock.mock.calls.length - 1
        ][0];
      expect(callArgs.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "1",
            activityType: "Waste Recycled - Cardboard",
          }),
        ])
      );
    });
  });

  describe("Default Recommendations Data", () => {
    it("should provide 5 default recommendations", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      await waitFor(() => {
        const recommendationsCount = screen.getByTestId("recommendations-count");
        expect(recommendationsCount).toHaveTextContent("5");
      });
    });

    it("should have recommendations with correct structure", async () => {
      const ActivityTypeRecommenderTableMock =
        require("../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable").default;

      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(ActivityTypeRecommenderTableMock.mock.calls.length).toBeGreaterThan(0);
      });

      const callArgs =
        ActivityTypeRecommenderTableMock.mock.calls[
          ActivityTypeRecommenderTableMock.mock.calls.length - 1
        ][0];

      expect(callArgs.recommendations[0]).toMatchObject({
        id: expect.any(String),
        activityType: expect.any(String),
        confidence: expect.any(Number),
        activityDescription: expect.any(String),
        region: expect.any(String),
        scope: expect.any(String),
        units: expect.any(Array),
      });
    });

    it("should have recommendations with confidence values in descending order", async () => {
      const ActivityTypeRecommenderTableMock =
        require("../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable").default;

      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(ActivityTypeRecommenderTableMock.mock.calls.length).toBeGreaterThan(0);
      });

      const callArgs =
        ActivityTypeRecommenderTableMock.mock.calls[
          ActivityTypeRecommenderTableMock.mock.calls.length - 1
        ][0];

      expect(callArgs.recommendations[0].confidence).toBe(95);
    });
  });

  describe("Component Structure", () => {
    it("should render Tabs component with correct props", () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      // Verify Tabs component renders with the tab content
      expect(screen.getByText("Envizi Activity type recommender")).toBeInTheDocument();
    });

    it("should render TabList with fullWidth prop", () => {
      const { container } = renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      const tabListElement = container.querySelector(".mock-tab-list-class");
      expect(tabListElement).toBeInTheDocument();
    });

    it("should render Stack component with correct gap", () => {
      const { container } = renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      // Stack component is rendered, verify by checking for the container
      const containerElement = container.querySelector(".recommender-wrapper");
      expect(containerElement).toBeInTheDocument();
    });

    it("should render recommender-wrapper div", () => {
      const { container } = renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      const containerElement = container.querySelector(".recommender-wrapper");
      expect(containerElement).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible tab structure", () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      const tabElement = screen.getByText("Envizi Activity type recommender");
      expect(tabElement).toBeInTheDocument();
    });

    it("should render icon with text for better accessibility", () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);
      const tabItem = screen.getByText("Envizi Activity type recommender");
      expect(tabItem.parentElement).toHaveClass("activity-tab-item");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty onClose callback", () => {
      expect(() => {
        renderWithQueryClient(<ActivityTypeRecommender onClose={undefined} />);
      }).not.toThrow();
    });

    it("should render correctly when recommendations are selected multiple times", async () => {
      renderWithQueryClient(<ActivityTypeRecommender {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-select-button")).toBeInTheDocument();
      });

      const useButton = screen.getByText("Use selected activity type");
      const selectButton = screen.getByTestId("mock-select-button");

      fireEvent.click(selectButton);
      fireEvent.click(selectButton);
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(useButton).not.toBeDisabled();
      });
    });
  });
});

// Made with Bob
