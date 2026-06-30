// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import ActivityTypeRecommenderTable, {
  ActivityTypeRecommendation,
} from "./ActivityTypeRecommenderTable";

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

// Mock @griffel/react
jest.mock("@griffel/react", () => ({
  makeStyles: jest.fn(() => () => ({
    tableConatiner: "mock-table-container-class",
  })),
}));

describe("ActivityTypeRecommenderTable", () => {
  const mockRecommendations: ActivityTypeRecommendation[] = [
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
      confidence: 88,
      activityDescription: "Waste Recycled - Paper",
      region: "Global",
      scope: "Scope 3 - Category 5: Waste generated in operations",
      units: ["kg", "tonnes"],
    },
    {
      id: "3",
      activityType: "Waste Recycled - Plastic",
      confidence: 82,
      activityDescription: "Waste Recycled - Plastic",
      region: "Global",
      scope: "Scope 3 - Category 5: Waste generated in operations",
      units: ["kg", "tonnes"],
    },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should render the table container", () => {
      const { container } = render(
        <ActivityTypeRecommenderTable recommendations={mockRecommendations} />
      );
      const tableContainer = container.querySelector(".activity-type-table-container");
      expect(tableContainer).toBeInTheDocument();
    });

    it("should render without onSelect prop", () => {
      expect(() => {
        render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);
      }).not.toThrow();
    });

    it("should render with empty recommendations array", () => {
      render(<ActivityTypeRecommenderTable recommendations={[]} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  describe("Table Structure", () => {
    it("should render table headers correctly", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      expect(screen.getByText("Activity type")).toBeInTheDocument();
      expect(screen.getByText("Confidence")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should render correct number of header columns", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);
      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(3);
    });

    it("should render table body", () => {
      const { container } = render(
        <ActivityTypeRecommenderTable recommendations={mockRecommendations} />
      );
      const tableBody = container.querySelector("tbody");
      expect(tableBody).toBeInTheDocument();
    });
  });

  describe("Row Rendering", () => {
    it("should render correct number of rows for recommendations", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);
      const rows = screen.getAllByRole("row");
      // +1 for header row
      expect(rows).toHaveLength(mockRecommendations.length + 1);
    });

    it("should render activity type names correctly", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      expect(screen.getAllByText("Waste Recycled - Cardboard")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Waste Recycled - Paper")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Waste Recycled - Plastic")[0]).toBeInTheDocument();
    });

    it("should render confidence values with percentage", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByText("88%")).toBeInTheDocument();
      expect(screen.getByText("82%")).toBeInTheDocument();
    });

    it("should render activity descriptions", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      mockRecommendations.forEach((rec) => {
        const descriptions = screen.getAllByText(rec.activityDescription);
        expect(descriptions.length).toBeGreaterThan(0);
      });
    });

    it("should render scope information", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const scopeElements = screen.getAllByText(
        "Scope 3 - Category 5: Waste generated in operations"
      );
      expect(scopeElements.length).toBeGreaterThan(0);
    });

    it("should render units information", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const unitsElements = screen.getAllByText("kg, tonnes");
      expect(unitsElements.length).toBeGreaterThan(0);
    });

    it("should render Global region label", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const globalLabels = screen.getAllByText("Global");
      expect(globalLabels.length).toBeGreaterThan(0);
    });
  });

  describe("Radio Button Interactions", () => {
    it("should render radio buttons for each recommendation", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons).toHaveLength(mockRecommendations.length);
    });

    it("should have no radio button checked by default", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons[0]).not.toBeChecked();
      expect(radioButtons[1]).not.toBeChecked();
      expect(radioButtons[2]).not.toBeChecked();
    });

    it("should check radio button when clicked", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[1]);

      expect(radioButtons[0]).not.toBeChecked();
      expect(radioButtons[1]).toBeChecked();
      expect(radioButtons[2]).not.toBeChecked();
    });

    it("should update selection when different radio button is clicked", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const radioButtons = screen.getAllByRole("radio");

      fireEvent.click(radioButtons[1]);
      expect(radioButtons[1]).toBeChecked();

      fireEvent.click(radioButtons[2]);
      expect(radioButtons[1]).not.toBeChecked();
      expect(radioButtons[2]).toBeChecked();
    });

    it("should have correct radio button IDs", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const radioButtons = screen.getAllByRole("radio");
      radioButtons.forEach((radio, index) => {
        expect(radio).toHaveAttribute("id", `radio-${mockRecommendations[index].id}`);
      });
    });

    it("should have all radio buttons in the same group", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const radioButtons = screen.getAllByRole("radio");
      radioButtons.forEach((radio) => {
        expect(radio).toHaveAttribute("name", "activity-selection");
      });
    });
  });

  describe("onSelect Callback", () => {
    it("should call onSelect when radio button is clicked", () => {
      render(
        <ActivityTypeRecommenderTable
          recommendations={mockRecommendations}
          onSelect={mockOnSelect}
        />
      );

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[1]);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(mockRecommendations[1]);
    });

    it("should call onSelect with correct recommendation data", () => {
      render(
        <ActivityTypeRecommenderTable
          recommendations={mockRecommendations}
          onSelect={mockOnSelect}
        />
      );

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[1]);

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "2",
          activityType: "Waste Recycled - Paper",
          confidence: 88,
          activityDescription: "Waste Recycled - Paper",
          region: "Global",
          scope: "Scope 3 - Category 5: Waste generated in operations",
          units: ["kg", "tonnes"],
        })
      );
    });

    it("should not throw error when onSelect is not provided", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const radioButtons = screen.getAllByRole("radio");

      expect(() => {
        fireEvent.click(radioButtons[1]);
      }).not.toThrow();
    });

    it("should call onSelect multiple times for multiple selections", () => {
      render(
        <ActivityTypeRecommenderTable
          recommendations={mockRecommendations}
          onSelect={mockOnSelect}
        />
      );

      const radioButtons = screen.getAllByRole("radio");

      fireEvent.click(radioButtons[0]);
      fireEvent.click(radioButtons[1]);
      fireEvent.click(radioButtons[2]);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe("Empty/No Recommendations Scenario", () => {
    it("should render table with empty recommendations", () => {
      render(<ActivityTypeRecommenderTable recommendations={[]} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Activity type")).toBeInTheDocument();
    });

    it("should not render any rows when recommendations are empty", () => {
      render(<ActivityTypeRecommenderTable recommendations={[]} />);

      const rows = screen.getAllByRole("row");
      // Only header row should be present
      expect(rows).toHaveLength(1);
    });

    it("should not render radio buttons when recommendations are empty", () => {
      render(<ActivityTypeRecommenderTable recommendations={[]} />);

      const radioButtons = screen.queryAllByRole("radio");
      expect(radioButtons).toHaveLength(0);
    });

    it("should handle single recommendation", () => {
      const singleRecommendation = [mockRecommendations[0]];
      render(<ActivityTypeRecommenderTable recommendations={singleRecommendation} />);

      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(2); // Header + 1 data row
    });
  });

  describe("Confidence Value Display", () => {
    it("should display confidence as percentage", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      const confidenceCells = screen.getAllByText(/\d+%/);
      expect(confidenceCells.length).toBeGreaterThan(0);
    });

    it("should display correct confidence values", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByText("88%")).toBeInTheDocument();
      expect(screen.getByText("82%")).toBeInTheDocument();
    });

    it("should handle confidence value of 0", () => {
      const zeroConfidenceRec: ActivityTypeRecommendation[] = [
        {
          id: "1",
          activityType: "Test Activity",
          confidence: 0,
          activityDescription: "Test Description",
        },
      ];

      render(<ActivityTypeRecommenderTable recommendations={zeroConfidenceRec} />);
      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("should handle confidence value of 100", () => {
      const fullConfidenceRec: ActivityTypeRecommendation[] = [
        {
          id: "1",
          activityType: "Test Activity",
          confidence: 100,
          activityDescription: "Test Description",
        },
      ];

      render(<ActivityTypeRecommenderTable recommendations={fullConfidenceRec} />);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  describe("Activity Type Name Display", () => {
    it("should display all activity type names", () => {
      render(<ActivityTypeRecommenderTable recommendations={mockRecommendations} />);

      mockRecommendations.forEach((rec) => {
        expect(screen.getAllByText(rec.activityType)[0]).toBeInTheDocument();
      });
    });

    it("should handle long activity type names", () => {
      const longNameRec: ActivityTypeRecommendation[] = [
        {
          id: "1",
          activityType: "Very Long Activity Type Name That Should Still Display Correctly",
          confidence: 75,
          activityDescription: "Test Description",
        },
      ];

      render(<ActivityTypeRecommenderTable recommendations={longNameRec} />);
      expect(
        screen.getByText("Very Long Activity Type Name That Should Still Display Correctly")
      ).toBeInTheDocument();
    });

    it("should handle special characters in activity type names", () => {
      const specialCharRec: ActivityTypeRecommendation[] = [
        {
          id: "1",
          activityType: "Activity & Type - Special/Characters",
          confidence: 75,
          activityDescription: "Test Description",
        },
      ];

      render(<ActivityTypeRecommenderTable recommendations={specialCharRec} />);
      expect(screen.getByText("Activity & Type - Special/Characters")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("should render pagination component", () => {
      const manyRecommendations = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        activityType: `Activity ${i + 1}`,
        confidence: 90 - i,
        activityDescription: `Description ${i + 1}`,
      }));

      const { container } = render(
        <ActivityTypeRecommenderTable recommendations={manyRecommendations} />
      );

      const paginationContainer = container.querySelector(".activity-type-pagination-container");
      expect(paginationContainer).toBeInTheDocument();
    });

    it("should display only 10 items per page", () => {
      const manyRecommendations = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        activityType: `Activity ${i + 1}`,
        confidence: 90 - i,
        activityDescription: `Description ${i + 1}`,
      }));

      render(<ActivityTypeRecommenderTable recommendations={manyRecommendations} />);

      const rows = screen.getAllByRole("row");
      // Header + 10 data rows
      expect(rows).toHaveLength(11);
    });
  });

  describe("Row Selection Styling", () => {
    it("should apply selected class to selected row after selection", () => {
      const { container } = render(
        <ActivityTypeRecommenderTable recommendations={mockRecommendations} />
      );

      // Initially no row should be selected
      let selectedRow = container.querySelector(".activity-type-selected-row");
      expect(selectedRow).not.toBeInTheDocument();

      // Click first radio button to select it
      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[0]);

      // Now the selected row class should be applied
      selectedRow = container.querySelector(".activity-type-selected-row");
      expect(selectedRow).toBeInTheDocument();
    });

    it("should update selected row class when selection changes", () => {
      const { container } = render(
        <ActivityTypeRecommenderTable recommendations={mockRecommendations} />
      );

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[1]);

      const selectedRows = container.querySelectorAll(".activity-type-selected-row");
      expect(selectedRows).toHaveLength(1);
    });
  });

  describe("Metadata Display", () => {
    it("should render metadata section for each row", () => {
      const { container } = render(
        <ActivityTypeRecommenderTable recommendations={mockRecommendations} />
      );

      const metadataSections = container.querySelectorAll(".activity-type-table-row__metadata");
      expect(metadataSections.length).toBe(mockRecommendations.length);
    });

    it("should render region with Earth icon", () => {
      const { container } = render(
        <ActivityTypeRecommenderTable recommendations={mockRecommendations} />
      );

      const regionElements = container.querySelectorAll(".activity-type-table-row__region");
      expect(regionElements.length).toBeGreaterThan(0);
    });

    it("should render details list with scope and units", () => {
      const { container } = render(
        <ActivityTypeRecommenderTable recommendations={mockRecommendations} />
      );

      const detailsLists = container.querySelectorAll(".activity-type-table-row__details-list");
      expect(detailsLists.length).toBe(mockRecommendations.length);
    });
  });

  describe("Edge Cases", () => {
    it("should handle recommendations without optional fields", () => {
      const minimalRec: ActivityTypeRecommendation[] = [
        {
          id: "1",
          activityType: "Minimal Activity",
          confidence: 50,
          activityDescription: "Minimal Description",
        },
      ];

      expect(() => {
        render(<ActivityTypeRecommenderTable recommendations={minimalRec} />);
      }).not.toThrow();
    });

    it("should handle recommendations with undefined units", () => {
      const noUnitsRec: ActivityTypeRecommendation[] = [
        {
          id: "1",
          activityType: "No Units Activity",
          confidence: 50,
          activityDescription: "No Units Description",
          units: undefined,
        },
      ];

      render(<ActivityTypeRecommenderTable recommendations={noUnitsRec} />);
      expect(screen.getByText("No Units Activity")).toBeInTheDocument();
    });

    it("should handle recommendations with empty units array", () => {
      const emptyUnitsRec: ActivityTypeRecommendation[] = [
        {
          id: "1",
          activityType: "Empty Units Activity",
          confidence: 50,
          activityDescription: "Empty Units Description",
          units: [],
        },
      ];

      render(<ActivityTypeRecommenderTable recommendations={emptyUnitsRec} />);
      expect(screen.getByText("Empty Units Activity")).toBeInTheDocument();
    });
  });
});

// Made with Bob
