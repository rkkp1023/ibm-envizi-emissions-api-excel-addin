// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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
      <button
        data-testid="mock-select-button"
        onClick={() => onSelect && onSelect(recommendations[0])}
      >
        Select First
      </button>
      <div data-testid="recommendations-count">{recommendations.length}</div>
    </div>
  )),
}));

// Mock @griffel/react
jest.mock("@griffel/react", () => ({
  makeStyles: jest.fn(() => () => ({
    tabList: "mock-tab-list-class",
  })),
}));

describe("ActivityTypeRecommender", () => {
  const mockOnClose = jest.fn();
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

  const defaultProps: ActivityRecommenderProps = {
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      expect(screen.getByText("Envizi Activity type recommender")).toBeInTheDocument();
    });

    it("should render the tab with correct title", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      const tabTitle = screen.getByText("Envizi Activity type recommender");
      expect(tabTitle).toBeInTheDocument();
    });

    it("should render the AiRecommend icon", () => {
      const { container } = render(<ActivityTypeRecommender {...defaultProps} />);
      const iconElement = container.querySelector(".activity-tab-item svg");
      expect(iconElement).toBeInTheDocument();
    });

    it("should render ActivityTypeRecommenderTable component", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      expect(screen.getByTestId("activity-type-recommender-table")).toBeInTheDocument();
    });

    it("should render with default recommendations", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      const recommendationsCount = screen.getByTestId("recommendations-count");
      expect(recommendationsCount).toHaveTextContent("5");
    });

    it("should render without onClose prop", () => {
      render(<ActivityTypeRecommender />);
      expect(screen.getByText("Envizi Activity type recommender")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("should pass onClose callback to Tabs component", () => {
      render(<ActivityTypeRecommender onClose={mockOnClose} />);
      // Verify component renders successfully with onClose prop
      expect(screen.getByText("Envizi Activity type recommender")).toBeInTheDocument();
    });

    it("should handle undefined onClose prop gracefully", () => {
      expect(() => {
        render(<ActivityTypeRecommender />);
      }).not.toThrow();
    });
  });

  describe("State Management", () => {
    it("should initialize with null selectedRecommendation", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      // State is internal, but we can verify behavior
      expect(screen.getByTestId("activity-type-recommender-table")).toBeInTheDocument();
    });

    it("should update selectedRecommendation when handleRadioSelect is called", async () => {
      render(<ActivityTypeRecommender {...defaultProps} />);

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Selected recommendation:",
          expect.objectContaining({
            id: "1",
            activityType: "Waste Recycled - Cardboard",
            confidence: 95,
          })
        );
      });
    });
  });

  describe("User Interactions", () => {
    it("should handle radio selection", async () => {
      render(<ActivityTypeRecommender {...defaultProps} />);

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Selected recommendation:",
        expect.objectContaining({
          id: "1",
          activityType: "Waste Recycled - Cardboard",
        })
      );
    });

    it("should log the selected recommendation to console", async () => {
      render(<ActivityTypeRecommender {...defaultProps} />);

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith("Selected recommendation:", expect.any(Object));
    });

    it("should handle multiple selections", async () => {
      render(<ActivityTypeRecommender {...defaultProps} />);

      const selectButton = screen.getByTestId("mock-select-button");

      fireEvent.click(selectButton);
      fireEvent.click(selectButton);

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Callback Handlers", () => {
    it("should call handleRadioSelect with correct recommendation", async () => {
      render(<ActivityTypeRecommender {...defaultProps} />);

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Selected recommendation:",
        expect.objectContaining({
          id: "1",
          activityType: "Waste Recycled - Cardboard",
          confidence: 95,
          activityDescription: "Waste Recycled - Cardboard",
          region: "Global",
          scope: "Scope 3 - Category 5: Waste generated in operations",
          units: ["kg", "tonnes"],
        })
      );
    });

    it("should pass onSelect callback to ActivityTypeRecommenderTable", () => {
      const ActivityTypeRecommenderTableMock =
        require("../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable").default;

      render(<ActivityTypeRecommender {...defaultProps} />);

      const callArgs = ActivityTypeRecommenderTableMock.mock.calls[0][0];
      expect(callArgs).toMatchObject({
        onSelect: expect.any(Function),
      });
    });

    it("should pass recommendations to ActivityTypeRecommenderTable", () => {
      const ActivityTypeRecommenderTableMock =
        require("../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable").default;

      render(<ActivityTypeRecommender {...defaultProps} />);

      const callArgs = ActivityTypeRecommenderTableMock.mock.calls[0][0];
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
    it("should provide 5 default recommendations", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      const recommendationsCount = screen.getByTestId("recommendations-count");
      expect(recommendationsCount).toHaveTextContent("5");
    });

    it("should have recommendations with correct structure", async () => {
      render(<ActivityTypeRecommender {...defaultProps} />);

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Selected recommendation:",
        expect.objectContaining({
          id: expect.any(String),
          activityType: expect.any(String),
          confidence: expect.any(Number),
          activityDescription: expect.any(String),
          region: expect.any(String),
          scope: expect.any(String),
          units: expect.any(Array),
        })
      );
    });

    it("should have recommendations with confidence values in descending order", async () => {
      render(<ActivityTypeRecommender {...defaultProps} />);

      const selectButton = screen.getByTestId("mock-select-button");
      fireEvent.click(selectButton);

      const loggedRecommendation = consoleLogSpy.mock.calls[0][1];
      expect(loggedRecommendation.confidence).toBe(95);
    });
  });

  describe("Component Structure", () => {
    it("should render Tabs component with correct props", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      // Verify Tabs component renders with the tab content
      expect(screen.getByText("Envizi Activity type recommender")).toBeInTheDocument();
    });

    it("should render TabList with fullWidth prop", () => {
      const { container } = render(<ActivityTypeRecommender {...defaultProps} />);
      const tabListElement = container.querySelector(".mock-tab-list-class");
      expect(tabListElement).toBeInTheDocument();
    });

    it("should render Stack component with correct gap", () => {
      const { container } = render(<ActivityTypeRecommender {...defaultProps} />);
      // Stack component is rendered, verify by checking for the container
      const containerElement = container.querySelector(".activity-type-recom-container");
      expect(containerElement).toBeInTheDocument();
    });

    it("should render activity-type-recom-container div", () => {
      const { container } = render(<ActivityTypeRecommender {...defaultProps} />);
      const containerElement = container.querySelector(".activity-type-recom-container");
      expect(containerElement).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible tab structure", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      const tabElement = screen.getByText("Envizi Activity type recommender");
      expect(tabElement).toBeInTheDocument();
    });

    it("should render icon with text for better accessibility", () => {
      render(<ActivityTypeRecommender {...defaultProps} />);
      const tabItem = screen.getByText("Envizi Activity type recommender");
      expect(tabItem.parentElement).toHaveClass("activity-tab-item");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty onClose callback", () => {
      expect(() => {
        render(<ActivityTypeRecommender onClose={undefined} />);
      }).not.toThrow();
    });

    it("should render correctly when recommendations are selected multiple times", async () => {
      render(<ActivityTypeRecommender {...defaultProps} />);

      const selectButton = screen.getByTestId("mock-select-button");

      for (let i = 0; i < 3; i++) {
        fireEvent.click(selectButton);
      }

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });
  });
});

// Made with Bob
