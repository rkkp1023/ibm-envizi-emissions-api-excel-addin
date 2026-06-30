// Copyright IBM Corp. 2026

import { act, renderHook } from "@testing-library/react";
import React from "react";

import {
  ActivityRecommenderContext,
  ActivityRecommenderProvider,
  useActivityRecommender,
} from "./ActivityRecommenderContext";

describe("ActivityRecommenderContext", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ActivityRecommenderProvider>{children}</ActivityRecommenderProvider>
  );

  describe("Initialization", () => {
    it("should initialize with activityRecommenderState: undefined", () => {
      const { result } = renderHook(() => React.useContext(ActivityRecommenderContext), {
        wrapper,
      });

      expect(result.current?.activityRecommenderState).toBeUndefined();
    });

    it("should initialize with recommendedParams: undefined", () => {
      const { result } = renderHook(() => React.useContext(ActivityRecommenderContext), {
        wrapper,
      });

      expect(result.current?.recommendedParams).toBeUndefined();
    });
  });

  describe("State Updates", () => {
    it("should update activityRecommenderState when setActivityRecommenderState is called", () => {
      const { result } = renderHook(() => React.useContext(ActivityRecommenderContext), {
        wrapper,
      });

      expect(result.current?.activityRecommenderState).toBeUndefined();

      act(() => {
        result.current?.setActivityRecommenderState("dismissable");
      });

      expect(result.current?.activityRecommenderState).toBe("dismissable");

      act(() => {
        result.current?.setActivityRecommenderState("standalone");
      });

      expect(result.current?.activityRecommenderState).toBe("standalone");

      act(() => {
        result.current?.setActivityRecommenderState("undefined");
      });

      expect(result.current?.activityRecommenderState).toBe("undefined");

      act(() => {
        result.current?.setActivityRecommenderState(undefined);
      });

      expect(result.current?.activityRecommenderState).toBeUndefined();
    });

    it("should update recommendedParams when setRecommendedParams is called", () => {
      const { result } = renderHook(() => React.useContext(ActivityRecommenderContext), {
        wrapper,
      });

      expect(result.current?.recommendedParams).toBeUndefined();

      const mockParams = {
        activityType: "transportation",
        location: "US",
        year: 2024,
      };

      act(() => {
        result.current?.setRecommendedParams(mockParams);
      });

      expect(result.current?.recommendedParams).toEqual(mockParams);

      act(() => {
        result.current?.setRecommendedParams(undefined);
      });

      expect(result.current?.recommendedParams).toBeUndefined();
    });

    it("should update both state and params together", () => {
      const { result } = renderHook(() => React.useContext(ActivityRecommenderContext), {
        wrapper,
      });

      const mockParams = {
        activityType: "stationary",
        fuel: "natural gas",
      };

      act(() => {
        result.current?.setActivityRecommenderState("dismissable");
        result.current?.setRecommendedParams(mockParams);
      });

      expect(result.current?.activityRecommenderState).toBe("dismissable");
      expect(result.current?.recommendedParams).toEqual(mockParams);

      act(() => {
        result.current?.setActivityRecommenderState("standalone");
      });

      expect(result.current?.activityRecommenderState).toBe("standalone");
      expect(result.current?.recommendedParams).toEqual(mockParams);

      act(() => {
        result.current?.setActivityRecommenderState(undefined);
        result.current?.setRecommendedParams(undefined);
      });

      expect(result.current?.activityRecommenderState).toBeUndefined();
      expect(result.current?.recommendedParams).toBeUndefined();
    });
  });

  describe("useActivityRecommender Hook", () => {
    it("should throw an error when used outside ActivityRecommenderProvider", () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useActivityRecommender());
      }).toThrow("useActivityRecommender must be used within an ActivityRecommenderProvider");

      consoleErrorSpy.mockRestore();
    });

    it("should return the correct context value when used inside ActivityRecommenderProvider", () => {
      const { result } = renderHook(() => useActivityRecommender(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.activityRecommenderState).toBeUndefined();
      expect(result.current.recommendedParams).toBeUndefined();
      expect(typeof result.current.setActivityRecommenderState).toBe("function");
      expect(typeof result.current.setRecommendedParams).toBe("function");
    });

    it("should allow state updates through the hook", () => {
      const { result } = renderHook(() => useActivityRecommender(), { wrapper });

      const mockParams = { test: "value" };

      act(() => {
        result.current.setActivityRecommenderState("dismissable");
        result.current.setRecommendedParams(mockParams);
      });

      expect(result.current.activityRecommenderState).toBe("dismissable");
      expect(result.current.recommendedParams).toEqual(mockParams);
    });
  });

  describe("Context Usage", () => {
    it("should provide ActivityRecommender context to children", () => {
      const { result } = renderHook(() => React.useContext(ActivityRecommenderContext), {
        wrapper,
      });

      expect(result.current).toBeDefined();
      expect(result.current?.setActivityRecommenderState).toBeDefined();
      expect(result.current?.setRecommendedParams).toBeDefined();
      // State values can be undefined initially
      expect(result.current).toHaveProperty("activityRecommenderState");
      expect(result.current).toHaveProperty("recommendedParams");
    });
  });
});

// Made with Bob
