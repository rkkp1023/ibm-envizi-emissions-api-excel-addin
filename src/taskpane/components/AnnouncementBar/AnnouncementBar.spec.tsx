// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { AnnouncementBar, AnnouncementBarProps } from "./AnnouncementBar";

const defaultProps: AnnouncementBarProps = {
  title: "Great news! This add-in is now live.",
  body: "To continue, either extend your trial or buy now to access more features.",
  intent: "success",
  actions: [
    { label: "Extend your trial", href: "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313" },
    { label: "Buy now", href: "https://www.ibm.com/store/en/us/products/EIDSBEJC" },
  ],
};

describe("AnnouncementBar", () => {
  it("should render the title", () => {
    render(<AnnouncementBar {...defaultProps} />);

    expect(screen.getByText("Great news! This add-in is now live.")).toBeInTheDocument();
  });

  it("should render the body text", () => {
    render(<AnnouncementBar {...defaultProps} />);

    expect(
      screen.getByText(
        "To continue, either extend your trial or buy now to access more features."
      )
    ).toBeInTheDocument();
  });

  it("should render a link for each action", () => {
    render(<AnnouncementBar {...defaultProps} />);

    const extendLink = screen.getByRole("link", { name: /Extend your trial/i });
    const buyLink = screen.getByRole("link", { name: /Buy now/i });

    expect(extendLink).toBeInTheDocument();
    expect(buyLink).toBeInTheDocument();
  });

  it("should apply the correct href to each action button", () => {
    render(<AnnouncementBar {...defaultProps} />);

    const extendLink = screen.getByRole("link", { name: /Extend your trial/i });
    const buyLink = screen.getByRole("link", { name: /Buy now/i });

    expect(extendLink).toHaveAttribute(
      "href",
      "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313"
    );
    expect(buyLink).toHaveAttribute("href", "https://www.ibm.com/store/en/us/products/EIDSBEJC");
  });

  it("should open action links in a new tab", () => {
    render(<AnnouncementBar {...defaultProps} />);

    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("should render a single action when only one is provided", () => {
    render(
      <AnnouncementBar
        {...defaultProps}
        actions={[{ label: "Buy now", href: "https://example.com" }]}
      />
    );

    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Buy now/i })).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });

  it("should render no action buttons when actions array is empty", () => {
    render(<AnnouncementBar {...defaultProps} actions={[]} />);

    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("should use the provided size on each action button", () => {
    render(
      <AnnouncementBar
        {...defaultProps}
        actions={[{ label: "Small action", href: "https://example.com", size: "small" }]}
      />
    );

    const link = screen.getByRole("link", { name: /Small action/i });
    expect(link).toBeInTheDocument();
  });
});
