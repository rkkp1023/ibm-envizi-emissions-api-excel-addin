// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { ActivityRecommender } from "./ActivityRecommender";

describe("ActivitySuggestionTab", () => {
  it("renders without crashing", async () => {
    render(<ActivityRecommender />);
    expect(screen.getByText("Activity Recommender Loaded")).toBeInTheDocument();
  });
});
