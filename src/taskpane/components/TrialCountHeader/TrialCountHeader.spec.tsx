// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { DateTime } from "luxon";

import { TrialCountHeader } from "./TrialCountHeader";

jest.mock("@carbon-labs/react-ui-shell", () => ({
  TrialCountdown: ({ count, text }: any) => (
    <div data-testid="trial-count">
      {count} - {text}
    </div>
  ),
}));

jest.mock("luxon", () => {
  const actual = jest.requireActual("luxon");

  return {
    ...actual,
    DateTime: {
      ...actual.DateTime,
      now: () => actual.DateTime.fromISO("2026-01-01T00:00:00Z"),
      fromISO: (date: string) => actual.DateTime.fromISO(date, { zone: "utc" }),
    },
  };
});

jest.mock("../../../common/env", () => ({
  getEnviziApiHomeUrl: () => "http://mock-url",
}));

jest.mock("@fluentui/react-components", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

describe("TrialCountHeader", () => {
  const renderTrialCountHeader = (isLoading: boolean, isError: boolean, data: any) => {
    return render(<TrialCountHeader isLoading={isLoading} isError={isError} data={data} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(DateTime, "now").mockReturnValue(DateTime.fromISO("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders spinner when loading", () => {
    renderTrialCountHeader(true, false, {});
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders nothing when error", () => {
    const { container } = renderTrialCountHeader(false, true, {});
    expect(container.firstChild).toBeNull();
  });

  it("renders correct trial days remaining", () => {
    const now = new Date();

    const futureDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    renderTrialCountHeader(false, false, {
      ssmExpirationDate: futureDate.toISOString(),
    });

    expect(screen.getByTestId("trial-count")).toHaveTextContent("5");
  });

  it("renders 0 when trial expired", () => {
    const pastDate = new Date("2025-12-25");

    renderTrialCountHeader(false, false, {
      ssmExpirationDate: pastDate.toISOString(),
    });

    expect(screen.getByTestId("trial-count")).toHaveTextContent("0");
  });

  it("shows singular text when 1 day left", () => {
    const now = new Date();

    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    renderTrialCountHeader(false, false, {
      ssmExpirationDate: futureDate.toISOString(),
    });

    expect(screen.getByTestId("trial-count")).toHaveTextContent("1 - Trial day left");
  });

  it("renders Upgrade button", () => {
    const futureDate = new Date("2026-01-04");

    renderTrialCountHeader(false, false, {
      ssmExpirationDate: futureDate.toISOString(),
    });

    expect(screen.getByText("Upgrade")).toBeInTheDocument();
  });
});
