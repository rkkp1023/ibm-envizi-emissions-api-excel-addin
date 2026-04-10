// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
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
      expect(screen.getByRole("link", { name: /Extend your trial/i })).toBeInTheDocument();
    });

    it("should render Buy now button", () => {
      render(<SignUpMessageBanner />);
      expect(screen.getByRole("link", { name: /Buy now/i })).toBeInTheDocument();
    });
  });

  describe("Button Appearance", () => {
    it("should render Extend your trial button with outline appearance", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("link", { name: /Extend your trial/i });
      expect(extendTrialButton).toHaveClass("fui-Button");
    });

    it("should render Buy now button with outline appearance", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("link", { name: /Buy now/i });
      expect(buyNowButton).toHaveClass("fui-Button");
    });

    it("should render both buttons with medium size", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("link", { name: /Extend your trial/i });
      const buyNowButton = screen.getByRole("link", { name: /Buy now/i });

      expect(extendTrialButton).toBeInTheDocument();
      expect(buyNowButton).toBeInTheDocument();
    });
  });

  describe("Extend Trial Button Interaction", () => {
    it("should have correct href attribute", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("link", { name: /Extend your trial/i });

      expect(extendTrialButton).toHaveAttribute(
        "href",
        "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313"
      );
    });

    it("should open link in new tab", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("link", { name: /Extend your trial/i });

      expect(extendTrialButton).toHaveAttribute("target", "_blank");
    });

    it("should have security attributes", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("link", { name: /Extend your trial/i });

      expect(extendTrialButton).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Buy Now Button Interaction", () => {
    it("should have correct href attribute", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("link", { name: /Buy now/i });

      expect(buyNowButton).toHaveAttribute(
        "href",
        "https://www.ibm.com/store/en/us/products/EIDSBEJC"
      );
    });

    it("should open link in new tab", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("link", { name: /Buy now/i });

      expect(buyNowButton).toHaveAttribute("target", "_blank");
    });

    it("should have security attributes", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("link", { name: /Buy now/i });

      expect(buyNowButton).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Link Attributes", () => {
    it("should have correct attributes on Extend your trial link", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("link", { name: /Extend your trial/i });

      expect(extendTrialButton).toHaveAttribute(
        "href",
        "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313"
      );
      expect(extendTrialButton).toHaveAttribute("target", "_blank");
      expect(extendTrialButton).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should have correct attributes on Buy now link", () => {
      render(<SignUpMessageBanner />);
      const buyNowButton = screen.getByRole("link", { name: /Buy now/i });

      expect(buyNowButton).toHaveAttribute(
        "href",
        "https://www.ibm.com/store/en/us/products/EIDSBEJC"
      );
      expect(buyNowButton).toHaveAttribute("target", "_blank");
      expect(buyNowButton).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should render both links with correct attributes", () => {
      render(<SignUpMessageBanner />);
      const extendTrialButton = screen.getByRole("link", { name: /Extend your trial/i });
      const buyNowButton = screen.getByRole("link", { name: /Buy now/i });

      expect(extendTrialButton).toHaveAttribute("target", "_blank");
      expect(buyNowButton).toHaveAttribute("target", "_blank");
      expect(extendTrialButton).toHaveAttribute("rel", "noopener noreferrer");
      expect(buyNowButton).toHaveAttribute("rel", "noopener noreferrer");
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

    it("should render MessageBarActions with two links", () => {
      render(<SignUpMessageBanner />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);
    });

    it("should render links in correct order", () => {
      render(<SignUpMessageBanner />);
      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent("Extend your trial");
      expect(links[1]).toHaveTextContent("Buy now");
    });
  });
});
