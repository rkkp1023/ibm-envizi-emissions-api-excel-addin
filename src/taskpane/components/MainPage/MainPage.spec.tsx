// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { act, fireEvent, render, screen } from "@testing-library/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityRecommenderProvider } from "../../context/ActivityRecommenderContext";
import { useAccountSubscription, useCarbonTheme, useTaskPane } from "../../hooks";
import { MainPage } from "./MainPage";

jest.mock("../../hooks", () => ({
  useAccountSubscription: jest.fn(),
  useCarbonTheme: jest.fn(),
  useTaskPane: jest.fn(),
}));

jest.mock("../QuickHelpTab/QuickHelpTab", () => ({
  QuickHelpTab: () => <div data-testid="quick-help-tab">Quick Help Content</div>,
}));

jest.mock("../AccountTab/AccountTab", () => ({
  AccountTab: () => <div data-testid="account-tab">Account Tab Content</div>,
}));

jest.mock("../ResourcesTab/ResourcesTab", () => ({
  ResourcesTab: () => <div data-testid="resources-tab">Resources Tab Content</div>,
}));

jest.mock("../TrialCountHeader/TrialCountHeader", () => ({
  TrialCountHeader: jest.fn(() => <div data-testid="trial-count-header">Trial count header</div>),
}));

jest.mock("../ActivityTypeRecommender/ActivityTypeRecommender", () => ({
  ActivityTypeRecommender: () => (
    <div data-testid="activity-type-recommender">Activity Type Recommender loaded</div>
  ),
}));

const mockedUseAccountSubscription = jest.mocked(useAccountSubscription);
const mockedUseCarbonTheme = jest.mocked(useCarbonTheme);
const mockedUseTaskPane = jest.mocked(useTaskPane);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("MainPage", () => {
  const renderMainPage = () => {
    const testQueryClient = createTestQueryClient();

    return render(
      <QueryClientProvider client={testQueryClient}>
        <ActivityRecommenderProvider>
          <MainPage />
        </ActivityRecommenderProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseCarbonTheme.mockReturnValue({
      theme: "g100",
    } as ReturnType<typeof useCarbonTheme>);
    mockedUseAccountSubscription.mockReturnValue({
      data: {
        subscriptionType: "paid",
      },
    } as unknown as ReturnType<typeof useAccountSubscription>);
    mockedUseTaskPane.mockReturnValue({
      isTaskPaneOpen: false,
    } as ReturnType<typeof useTaskPane>);
    delete (window as any).recommendedParams;
  });

  describe("Component Rendering", () => {
    it("should render the main page container with all tabs", () => {
      renderMainPage();

      const mainPage = screen.getByRole("tablist").closest(".page.main-page");

      expect(mainPage).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Quick help/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Resources/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Account/i })).toBeInTheDocument();
    });

    it("should initialize with Quick help tab selected", () => {
      renderMainPage();

      const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });

      expect(quickHelpTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("resources-tab")).not.toBeInTheDocument();
      expect(screen.queryByTestId("account-tab")).not.toBeInTheDocument();
    });

    it("should have proper ARIA roles", () => {
      renderMainPage();

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(3);
    });
  });

  describe("User Interactions and State Management", () => {
    it("should switch tabs and update aria-selected attributes", () => {
      renderMainPage();

      const quickHelpTab = screen.getByRole("tab", { name: /Quick help/i });
      const resourcesTab = screen.getByRole("tab", { name: /Resources/i });
      const accountTab = screen.getByRole("tab", { name: /Account/i });

      fireEvent.click(resourcesTab);
      expect(resourcesTab).toHaveAttribute("aria-selected", "true");
      expect(quickHelpTab).toHaveAttribute("aria-selected", "false");
      expect(screen.getByTestId("resources-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("quick-help-tab")).not.toBeInTheDocument();

      fireEvent.click(accountTab);
      expect(accountTab).toHaveAttribute("aria-selected", "true");
      expect(resourcesTab).toHaveAttribute("aria-selected", "false");
      expect(screen.getByTestId("account-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("resources-tab")).not.toBeInTheDocument();

      fireEvent.click(quickHelpTab);
      expect(quickHelpTab).toHaveAttribute("aria-selected", "true");
      expect(accountTab).toHaveAttribute("aria-selected", "false");
      expect(screen.getByTestId("quick-help-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("account-tab")).not.toBeInTheDocument();
    });
  });

  describe("Props Handling and Child Components", () => {
    it("should render the trial count header and apply with-header class for trial subscriptions", () => {
      mockedUseAccountSubscription.mockReturnValue({
        data: {
          subscriptionType: "trial",
        },
      } as unknown as ReturnType<typeof useAccountSubscription>);

      renderMainPage();

      expect(screen.getByTestId("trial-count-header")).toBeInTheDocument();
      expect(screen.getByRole("tablist").closest(".page.main-page")).toHaveClass("with-header");
    });

    it("should not render the trial count header for non-trial subscriptions", () => {
      renderMainPage();

      expect(screen.queryByTestId("trial-count-header")).not.toBeInTheDocument();
      expect(screen.getByRole("tablist").closest(".page.main-page")).not.toHaveClass("with-header");
    });
  });

  describe("Event Handlers and Callbacks", () => {
    it("should render ActivityTypeRecommender when ACTIVITY_RECOMMENDER_REQUESTED event contains recommendedParams", () => {
      renderMainPage();

      act(() => {
        window.dispatchEvent(
          new CustomEvent("ACTIVITY_RECOMMENDER_REQUESTED", {
            detail: {
              recommendedParams: {
                foo: "bar",
              },
            },
          })
        );
      });

      expect(screen.getByTestId("activity-type-recommender")).toBeInTheDocument();
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });

    it("should ignore ACTIVITY_RECOMMENDER_REQUESTED event when detail is missing", () => {
      renderMainPage();

      act(() => {
        window.dispatchEvent(new CustomEvent("ACTIVITY_RECOMMENDER_REQUESTED"));
      });

      expect(screen.queryByTestId("activity-type-recommender")).not.toBeInTheDocument();
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should ignore ACTIVITY_RECOMMENDER_REQUESTED event when recommendedParams is missing", () => {
      renderMainPage();

      act(() => {
        window.dispatchEvent(
          new CustomEvent("ACTIVITY_RECOMMENDER_REQUESTED", {
            detail: {},
          })
        );
      });

      expect(screen.queryByTestId("activity-type-recommender")).not.toBeInTheDocument();
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should render ActivityTypeRecommender when window.recommendedParams contains recommendedParams", () => {
      (window as any).recommendedParams = {
        recommendedParams: {
          activityType: "test",
        },
      };

      renderMainPage();

      expect(screen.getByTestId("activity-type-recommender")).toBeInTheDocument();
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });
  });
});
