// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import { DismissibleTab } from "./DismissibleTab";

jest.mock("@fluentui/react-components", () => ({
  Tab: ({ children }: any) => <div role="tab">{children}</div>,
}));

jest.mock("@carbon/icons-react", () => ({
  Close: () => <svg data-testid="close-icon" />,
}));

describe("DismissibleTab", () => {
  const defaultProps = {
    value: "tab-1",
    label: "My Tab",
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the tab label", () => {
      render(<DismissibleTab {...defaultProps} />);

      expect(screen.getByText("My Tab")).toBeInTheDocument();
    });

    it("should render the close button with aria-label", () => {
      render(<DismissibleTab {...defaultProps} />);

      expect(screen.getByLabelText("Close tab")).toBeInTheDocument();
    });

    it("should render the close icon inside the dismiss button", () => {
      render(<DismissibleTab {...defaultProps} />);

      expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    });

    it("should render an icon when provided", () => {
      render(
        <DismissibleTab
          {...defaultProps}
          icon={<svg data-testid="custom-icon" />}
        />
      );

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("should not render an icon when not provided", () => {
      render(<DismissibleTab {...defaultProps} />);

      expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    });

    it("should apply the correct CSS classes", () => {
      render(<DismissibleTab {...defaultProps} />);

      expect(document.querySelector(".dismissible-tab-content")).toBeInTheDocument();
      expect(document.querySelector(".dismissible-tab-label")).toBeInTheDocument();
      expect(document.querySelector(".dismissible-tab-close")).toBeInTheDocument();
    });

    it("should set tabIndex={0} on the dismiss button", () => {
      render(<DismissibleTab {...defaultProps} />);

      const closeButton = screen.getByLabelText("Close tab");
      expect(closeButton).toHaveAttribute("tabindex", "0");
    });
  });

  describe("Dismiss interactions", () => {
    it("should call onDismiss when the close button is clicked", () => {
      const onDismiss = jest.fn();
      render(<DismissibleTab {...defaultProps} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByLabelText("Close tab"));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("should call onDismiss when Enter is pressed on the close button", () => {
      const onDismiss = jest.fn();
      render(<DismissibleTab {...defaultProps} onDismiss={onDismiss} />);

      fireEvent.keyDown(screen.getByLabelText("Close tab"), { key: "Enter" });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("should call onDismiss when Space is pressed on the close button", () => {
      const onDismiss = jest.fn();
      render(<DismissibleTab {...defaultProps} onDismiss={onDismiss} />);

      fireEvent.keyDown(screen.getByLabelText("Close tab"), { key: " " });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("should not call onDismiss when an unrelated key is pressed on the close button", () => {
      const onDismiss = jest.fn();
      render(<DismissibleTab {...defaultProps} onDismiss={onDismiss} />);

      fireEvent.keyDown(screen.getByLabelText("Close tab"), { key: "Tab" });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("should stop click event propagation to prevent unintended tab activation", () => {
      const onDismiss = jest.fn();
      const parentClickHandler = jest.fn();

      render(
        <div onClick={parentClickHandler}>
          <DismissibleTab {...defaultProps} onDismiss={onDismiss} />
        </div>
      );

      fireEvent.click(screen.getByLabelText("Close tab"));

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });
});
