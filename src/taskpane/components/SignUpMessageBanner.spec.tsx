/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { SignUpMessageBanner } from "./SignUpMessageBanner";

describe("SignUpMessageBanner", () => {
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    windowOpenSpy = jest.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  describe("Rendering", () => {
    it("should render the message banner", () => {
      render(<SignUpMessageBanner />);
      const messageBar = document.querySelector('[role="group"]');
      expect(messageBar).toBeInTheDocument();
    });

    it("should render the title", () => {
      render(<SignUpMessageBanner />);
      expect(screen.getByText("Great news! This add-in is now live.")).toBeInTheDocument();
    });

    it("should render the description text", () => {
      render(<SignUpMessageBanner />);
      expect(
        screen.getByText(
          "To continue, either extend your trial or buy now to access more features."
        )
      ).toBeInTheDocument();
    });

    it("should render Extend your trial button", () => {
      render(<SignUpMessageBanner />);
      expect(screen.getByRole("button", { name: /Extend your trial/i })).toBeInTheDocument();
    });

    it("should render Buy now button", () => {
      render(<SignUpMessageBanner />);
      expect(screen.getByRole("button", { name: /Buy now/i })).toBeInTheDocument();
    });
  });

  describe("Button Appearance", () => {
    it("should render Extend your trial button with outline appearance", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("button", { name: /Extend your trial/i });
      expect(extendTrialButton).toHaveClass("fui-Button");
    });

    it("should render Buy now button with outline appearance", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("button", { name: /Buy now/i });
      expect(buyNowButton).toHaveClass("fui-Button");
    });

    it("should render both buttons with medium size", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("button", { name: /Extend your trial/i });
      const buyNowButton = screen.getByRole("button", { name: /Buy now/i });

      expect(extendTrialButton).toBeInTheDocument();
      expect(buyNowButton).toBeInTheDocument();
    });
  });

  describe("Extend Trial Button Interaction", () => {
    it("should call window.open when Extend your trial button is clicked", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("button", { name: /Extend your trial/i });

      fireEvent.click(extendTrialButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    });

    it("should open correct URL when Extend your trial button is clicked", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("button", { name: /Extend your trial/i });

      fireEvent.click(extendTrialButton);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313",
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("should open link in new tab with security attributes", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("button", { name: /Extend your trial/i });

      fireEvent.click(extendTrialButton);

      const [, target, features] = windowOpenSpy.mock.calls[0];
      expect(target).toBe("_blank");
      expect(features).toBe("noopener,noreferrer");
    });
  });

  describe("Buy Now Button Interaction", () => {
    it("should call window.open when Buy now button is clicked", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("button", { name: /Buy now/i });

      fireEvent.click(buyNowButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    });

    it("should open correct URL when Buy now button is clicked", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("button", { name: /Buy now/i });

      fireEvent.click(buyNowButton);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://www.ibm.com/products/envizi/emissions-calculations",
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("should open link in new tab with security attributes", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("button", { name: /Buy now/i });

      fireEvent.click(buyNowButton);

      const [, target, features] = windowOpenSpy.mock.calls[0];
      expect(target).toBe("_blank");
      expect(features).toBe("noopener,noreferrer");
    });
  });

  describe("Multiple Button Clicks", () => {
    it("should handle multiple clicks on Extend your trial button", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("button", { name: /Extend your trial/i });

      fireEvent.click(extendTrialButton);
      fireEvent.click(extendTrialButton);
      fireEvent.click(extendTrialButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(3);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313",
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("should handle multiple clicks on Buy now button", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("button", { name: /Buy now/i });

      fireEvent.click(buyNowButton);
      fireEvent.click(buyNowButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(2);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://www.ibm.com/products/envizi/emissions-calculations",
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("should handle clicks on both buttons independently", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("button", { name: /Extend your trial/i });
      const buyNowButton = screen.getByRole("button", { name: /Buy now/i });

      fireEvent.click(extendTrialButton);
      fireEvent.click(buyNowButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(2);
      expect(windowOpenSpy).toHaveBeenNthCalledWith(
        1,
        "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313",
        "_blank",
        "noopener,noreferrer"
      );
      expect(windowOpenSpy).toHaveBeenNthCalledWith(
        2,
        "https://www.ibm.com/products/envizi/emissions-calculations",
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  describe("Component Structure", () => {
    it("should render MessageBar component", () => {
      render(<SignUpMessageBanner />);
      const messageBar = document.querySelector('[role="group"]');
      expect(messageBar).toBeInTheDocument();
    });

    it("should render MessageBarBody with title and description", () => {
      render(<SignUpMessageBanner />);
      expect(screen.getByText("Great news! This add-in is now live.")).toBeInTheDocument();
      expect(
        screen.getByText(
          "To continue, either extend your trial or buy now to access more features."
        )
      ).toBeInTheDocument();
    });

    it("should render MessageBarActions with two buttons", () => {
      render(<SignUpMessageBanner />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("should render buttons in correct order", () => {
      render(<SignUpMessageBanner />);
      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveTextContent("Extend your trial");
      expect(buttons[1]).toHaveTextContent("Buy now");
    });
  });
});
