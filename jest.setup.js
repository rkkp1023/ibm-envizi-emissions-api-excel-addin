/**
 * Global Jest setup file
 * This file runs once before all tests
 */

/**
 * Mock ResizeObserver for Fluent UI components
 *
 * ResizeObserver is not available in jsdom (Jest's test environment) by default.
 * Fluent UI components like MessageBar, Button, and other components use ResizeObserver
 * internally for responsive layouts. Without this mock, tests fail with:
 * "TypeError: win.ResizeObserver is not a constructor"
 *
 * This mock provides a no-op implementation that satisfies Fluent UI's requirements
 * while allowing us to focus on testing component behavior rather than browser APIs.
 */
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
