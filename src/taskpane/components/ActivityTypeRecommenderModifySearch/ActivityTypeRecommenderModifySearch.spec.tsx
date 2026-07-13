// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ActivityTypeRecommenderModifySearch from "./ActivityTypeRecommenderModifySearch";
import type { ActivityTypeRecomenderContext } from "../MainPage/MainPage";

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
  makeStyles: jest.fn(() => () => ({})),
}));

// Mock metadata dependencies
jest.mock("../../../commands/metadata-sheet-manager", () => ({
  readMetadataFromSheet: jest.fn(),
}));

jest.mock("../../../commands/metadata-service", () => ({
  fetchAreaMetadata: jest.fn(),
  fetchUnitMetadata: jest.fn(),
}));

import { readMetadataFromSheet } from "../../../commands/metadata-sheet-manager";
import { fetchAreaMetadata, fetchUnitMetadata } from "../../../commands/metadata-service";

const mockReadMetadataFromSheet = readMetadataFromSheet as jest.Mock;
const mockFetchAreaMetadata = fetchAreaMetadata as jest.Mock;
const mockFetchUnitMetadata = fetchUnitMetadata as jest.Mock;

const sheetMetadata = {
  countries: ["Australia", "United States"],
  stateProvinces: ["New South Wales", "California"],
  units: ["kg", "tonnes"],
};

const apiAreaMetadata = {
  countries: ["Canada", "Germany"],
  stateProvinces: ["Ontario", "Bavaria"],
};

const apiUnitMetadata = {
  units: ["MWh", "GJ"],
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: sheet metadata available
  mockReadMetadataFromSheet.mockResolvedValue(sheetMetadata);
});

describe("ActivityTypeRecommenderModifySearch", () => {
  describe("rendering", () => {
    it("renders the Modify search heading", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      expect(screen.getByText("Modify search")).toBeInTheDocument();
    });

    it("renders Activity name, Country, State/province, Unit and Scope fields", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      expect(screen.getByLabelText(/Activity name/i)).toBeInTheDocument();
      expect(screen.getByText("Country (Required)")).toBeInTheDocument();
      expect(screen.getByText("State/province")).toBeInTheDocument();
      expect(screen.getByText("Unit")).toBeInTheDocument();
      expect(screen.getByText("Scope")).toBeInTheDocument();
    });

    it("renders Search and Cancel buttons", () => {
      render(<ActivityTypeRecommenderModifySearch />);
      expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("renders the back button", () => {
      render(<ActivityTypeRecommenderModifySearch />);
      expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe("initial values from context", () => {
    it("pre-populates activityName from context.search", () => {
      const ctx: ActivityTypeRecomenderContext = {
        search: "Recycled waste",
        country: "Australia",
      };
      render(<ActivityTypeRecommenderModifySearch context={ctx} />);
      expect(screen.getByLabelText(/Activity name/i)).toHaveValue("Recycled waste");
    });

    it("defaults activityName to empty string when context is absent", () => {
      render(<ActivityTypeRecommenderModifySearch />);
      expect(screen.getByLabelText(/Activity name/i)).toHaveValue("");
    });

    it("defaults activityName to empty string when context.search is empty", () => {
      render(<ActivityTypeRecommenderModifySearch context={{ search: "", country: "Australia" }} />);
      expect(screen.getByLabelText(/Activity name/i)).toHaveValue("");
    });
  });

  describe("metadata loading — sheet path", () => {
    it("loads countries from sheet metadata", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() => expect(mockReadMetadataFromSheet).toHaveBeenCalledTimes(1));
      expect(mockFetchAreaMetadata).not.toHaveBeenCalled();
    });

    it("does not show a metadata error when sheet metadata loads successfully", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() => expect(mockReadMetadataFromSheet).toHaveBeenCalledTimes(1));
      expect(screen.queryByText(/Failed to load metadata/i)).not.toBeInTheDocument();
    });
  });

  describe("metadata loading — API fallback", () => {
    beforeEach(() => {
      mockReadMetadataFromSheet.mockResolvedValue(null);
      mockFetchAreaMetadata.mockResolvedValue(apiAreaMetadata);
      mockFetchUnitMetadata.mockResolvedValue(apiUnitMetadata);
    });

    it("falls back to API when sheet metadata is null", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() => expect(mockFetchAreaMetadata).toHaveBeenCalledTimes(1));
      expect(mockFetchUnitMetadata).toHaveBeenCalledTimes(1);
    });

    it("does not show a metadata error after successful API fallback", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() => expect(mockFetchAreaMetadata).toHaveBeenCalledTimes(1));
      expect(screen.queryByText(/Failed to load metadata/i)).not.toBeInTheDocument();
    });
  });

  describe("metadata loading — error", () => {
    it("shows an error message when metadata loading fails", async () => {
      mockReadMetadataFromSheet.mockRejectedValue(new Error("network error"));
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() =>
        expect(screen.getByText(/Failed to load metadata/i)).toBeInTheDocument()
      );
    });
  });

  describe("form validation", () => {
    it("shows an error when submitting with an empty activity name", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() => expect(mockReadMetadataFromSheet).toHaveBeenCalled());
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form")!);
      expect(screen.getByText("Activity name is required")).toBeInTheDocument();
    });

    it("shows an error when submitting without a country", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() => expect(mockReadMetadataFromSheet).toHaveBeenCalled());
      fireEvent.change(screen.getByLabelText(/Activity name/i), {
        target: { value: "Waste" },
      });
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form")!);
      expect(screen.getByText("Country is required")).toBeInTheDocument();
    });

    it("clears the activity name error as the user types", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() => expect(mockReadMetadataFromSheet).toHaveBeenCalled());
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form")!);
      expect(screen.getByText("Activity name is required")).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText(/Activity name/i), {
        target: { value: "W" },
      });
      expect(screen.queryByText("Activity name is required")).not.toBeInTheDocument();
    });
  });

  describe("callbacks", () => {
    it("calls onBack when the back button is clicked", () => {
      const onBack = jest.fn();
      render(<ActivityTypeRecommenderModifySearch onBack={onBack} />);
      fireEvent.click(screen.getByRole("button", { name: /go back/i }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when the Cancel button is clicked", () => {
      const onCancel = jest.fn();
      render(<ActivityTypeRecommenderModifySearch onCancel={onCancel} />);
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("resets validation state when Cancel is clicked", async () => {
      render(<ActivityTypeRecommenderModifySearch />);
      await waitFor(() => expect(mockReadMetadataFromSheet).toHaveBeenCalled());
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form")!);
      expect(screen.getByText("Activity name is required")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(screen.queryByText("Activity name is required")).not.toBeInTheDocument();
    });

    it("calls onSearch with correct params on valid submit", async () => {
      const onSearch = jest.fn();
      const ctx: ActivityTypeRecomenderContext = {
        search: "Fuel combustion",
        country: "Australia",
      };
      render(<ActivityTypeRecommenderModifySearch context={ctx} onSearch={onSearch} />);
      await waitFor(() => expect(mockReadMetadataFromSheet).toHaveBeenCalled());
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form")!);
      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          activityName: "Fuel combustion",
          country: { id: "Australia", text: "Australia" },
          state: null,
          unit: null,
          scope: null,
        })
      );
    });

    it("does not call onSearch when the form is invalid", async () => {
      const onSearch = jest.fn();
      render(<ActivityTypeRecommenderModifySearch onSearch={onSearch} />);
      await waitFor(() => expect(mockReadMetadataFromSheet).toHaveBeenCalled());
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form")!);
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  describe("showNoResultsNotification prop", () => {
    it("renders the inline notification when showNoResultsNotification is true", () => {
      render(<ActivityTypeRecommenderModifySearch showNoResultsNotification={true} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("renders the notification title 'No results' when showNoResultsNotification is true", () => {
      render(<ActivityTypeRecommenderModifySearch showNoResultsNotification={true} />);
      expect(screen.getByText(/No results/i)).toBeInTheDocument();
    });

    it("renders the notification subtitle when showNoResultsNotification is true", () => {
      render(<ActivityTypeRecommenderModifySearch showNoResultsNotification={true} />);
      expect(
        screen.getByText(/No recommendations are available for the provided input/i)
      ).toBeInTheDocument();
    });

    it("does not render the inline notification when showNoResultsNotification is false", () => {
      render(<ActivityTypeRecommenderModifySearch showNoResultsNotification={false} />);
      expect(screen.queryByText(/No results/i)).not.toBeInTheDocument();
    });

    it("does not render the inline notification when showNoResultsNotification is omitted", () => {
      render(<ActivityTypeRecommenderModifySearch />);
      expect(screen.queryByText(/No results/i)).not.toBeInTheDocument();
    });
  });

  describe("disableBack prop", () => {
    it("disables the back button when disableBack is true", () => {
      render(<ActivityTypeRecommenderModifySearch disableBack={true} />);
      expect(screen.getByRole("button", { name: /go back/i })).toBeDisabled();
    });

    it("enables the back button when disableBack is false", () => {
      render(<ActivityTypeRecommenderModifySearch disableBack={false} />);
      expect(screen.getByRole("button", { name: /go back/i })).not.toBeDisabled();
    });

    it("enables the back button when disableBack is omitted (default)", () => {
      render(<ActivityTypeRecommenderModifySearch />);
      expect(screen.getByRole("button", { name: /go back/i })).not.toBeDisabled();
    });

    it("does not call onBack when the back button is disabled and clicked", () => {
      const onBack = jest.fn();
      render(<ActivityTypeRecommenderModifySearch onBack={onBack} disableBack={true} />);
      fireEvent.click(screen.getByRole("button", { name: /go back/i }));
      expect(onBack).not.toHaveBeenCalled();
    });
  });
});
