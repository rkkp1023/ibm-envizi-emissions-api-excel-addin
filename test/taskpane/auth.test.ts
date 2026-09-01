// Copyright IBM Corp. 2026

/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://localhost:3000/excel-addin/taskpane.html"}
 */

import { displayLoginDialog } from "../../src/taskpane/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Minimal dialog object returned inside asyncResult.value */
function buildDialogMock() {
  return {
    close: jest.fn(),
    addEventHandler: jest.fn(),
  };
}

/**
 * Builds a minimal Office mock.
 * `displayDialogAsync` immediately invokes its callback with the given dialog.
 */
function buildOfficeMock(dialog = buildDialogMock()) {
  return {
    context: {
      ui: {
        displayDialogAsync: jest.fn(
          (_url: string, _opts: any, cb: (result: any) => void) => {
            cb({ value: dialog });
          }
        ),
      },
    },
    EventType: {
      DialogMessageReceived: "DialogMessageReceived",
      DialogEventReceived: "DialogEventReceived",
    },
  };
}

// ─── beforeEach ───────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).Office = buildOfficeMock();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("displayLoginDialog", () => {
  // window.location is set to https://localhost:3000/excel-addin/taskpane.html
  // by the @jest-environment-options docblock above.

  describe("login URL construction", () => {
    it("should call displayDialogAsync once", () => {
      const officeMock = buildOfficeMock();
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      expect(officeMock.context.ui.displayDialogAsync).toHaveBeenCalledTimes(1);
    });

    it("should build the URL from window.location.origin and pathname", () => {
      const officeMock = buildOfficeMock();
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      // Construct the expected URL the same way the module does, so this test
      // is correct regardless of the jsdom testURL setting.
      const currentPath = window.location.pathname;
      const rootPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
      const expectedUrl = `${window.location.origin}${rootPath}/login.html`;

      const [calledUrl] = (officeMock.context.ui.displayDialogAsync as jest.Mock).mock
        .calls[0];
      expect(calledUrl).toBe(expectedUrl);
    });

    it("should always end the URL with /login.html", () => {
      const officeMock = buildOfficeMock();
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      const [calledUrl] = (officeMock.context.ui.displayDialogAsync as jest.Mock).mock
        .calls[0];
      expect(calledUrl).toMatch(/\/login\.html$/);
    });

    it("should use the correct origin in the URL", () => {
      const officeMock = buildOfficeMock();
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      const [calledUrl] = (officeMock.context.ui.displayDialogAsync as jest.Mock).mock
        .calls[0];
      expect(calledUrl).toContain(window.location.origin);
    });

    it("should strip the filename segment from pathname and append login.html", () => {
      const officeMock = buildOfficeMock();
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      // The module does: rootPath = pathname.substring(0, pathname.lastIndexOf("/"))
      // then appends /login.html. The final URL must end with /login.html and
      // must be rooted at the correct origin.
      const [calledUrl] = (officeMock.context.ui.displayDialogAsync as jest.Mock).mock
        .calls[0];
      expect(calledUrl).toMatch(/\/login\.html$/);
      expect(calledUrl).toContain(window.location.origin);
    });
  });

  describe("displayDialogAsync options", () => {
    it("should open the dialog with height 75", () => {
      const officeMock = buildOfficeMock();
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      const [, options] = (officeMock.context.ui.displayDialogAsync as jest.Mock).mock
        .calls[0];
      expect(options.height).toBe(75);
    });

    it("should open the dialog with width 75", () => {
      const officeMock = buildOfficeMock();
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      const [, options] = (officeMock.context.ui.displayDialogAsync as jest.Mock).mock
        .calls[0];
      expect(options.width).toBe(75);
    });

    it("should set promptBeforeOpen to false", () => {
      const officeMock = buildOfficeMock();
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      const [, options] = (officeMock.context.ui.displayDialogAsync as jest.Mock).mock
        .calls[0];
      expect(options.promptBeforeOpen).toBe(false);
    });
  });

  describe("event handler registration", () => {
    it("should register a DialogMessageReceived handler on the dialog", () => {
      const dialog = buildDialogMock();
      const officeMock = buildOfficeMock(dialog);
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      const registeredEvents = dialog.addEventHandler.mock.calls.map(
        ([eventType]: [string]) => eventType
      );
      expect(registeredEvents).toContain("DialogMessageReceived");
    });

    it("should register a DialogEventReceived handler on the dialog", () => {
      const dialog = buildDialogMock();
      const officeMock = buildOfficeMock(dialog);
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      const registeredEvents = dialog.addEventHandler.mock.calls.map(
        ([eventType]: [string]) => eventType
      );
      expect(registeredEvents).toContain("DialogEventReceived");
    });

    it("should register exactly two event handlers total", () => {
      const dialog = buildDialogMock();
      const officeMock = buildOfficeMock(dialog);
      (global as any).Office = officeMock;

      displayLoginDialog(jest.fn(), jest.fn());

      expect(dialog.addEventHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe("DialogMessageReceived handler", () => {
    /** Returns the callback registered for DialogMessageReceived */
    function getMessageHandler(dialog: ReturnType<typeof buildDialogMock>) {
      const call = dialog.addEventHandler.mock.calls.find(
        ([event]: [string]) => event === "DialogMessageReceived"
      );
      return call?.[1] as (args: { message: string }) => void;
    }

    it("should close the dialog when a message is received", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);

      displayLoginDialog(jest.fn(), jest.fn());

      getMessageHandler(dialog)({
        message: JSON.stringify({ token: "t", refreshToken: "r", coreToken: "c" }),
      });

      expect(dialog.close).toHaveBeenCalledTimes(1);
    });

    it("should call onConfirm with the parsed credentials", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onConfirm = jest.fn();
      const payload = { token: "tok-1", refreshToken: "ref-1", coreToken: "cor-1" };

      displayLoginDialog(onConfirm, jest.fn());

      getMessageHandler(dialog)({ message: JSON.stringify(payload) });

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith(payload);
    });

    it("should pass all three token fields — token, refreshToken, coreToken", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onConfirm = jest.fn();

      displayLoginDialog(onConfirm, jest.fn());

      getMessageHandler(dialog)({
        message: JSON.stringify({
          token: "access-token",
          refreshToken: "refresh-token",
          coreToken: "core-token",
        }),
      });

      expect(onConfirm.mock.calls[0][0]).toEqual({
        token: "access-token",
        refreshToken: "refresh-token",
        coreToken: "core-token",
      });
    });

    it("should close the dialog and call onConfirm on the same received message", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onConfirm = jest.fn();

      displayLoginDialog(onConfirm, jest.fn());

      getMessageHandler(dialog)({
        message: JSON.stringify({ token: "t", refreshToken: "r", coreToken: "c" }),
      });

      expect(dialog.close).toHaveBeenCalled();
      expect(onConfirm).toHaveBeenCalled();
    });

    it("should not call onClose when a message is received", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onClose = jest.fn();

      displayLoginDialog(jest.fn(), onClose);

      getMessageHandler(dialog)({
        message: JSON.stringify({ token: "t", refreshToken: "r", coreToken: "c" }),
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("DialogEventReceived handler", () => {
    /** Returns the callback registered for DialogEventReceived */
    function getEventHandler(dialog: ReturnType<typeof buildDialogMock>) {
      const call = dialog.addEventHandler.mock.calls.find(
        ([event]: [string]) => event === "DialogEventReceived"
      );
      return call?.[1] as (args: { error: number }) => void;
    }

    it("should call onClose when error code is 12006 (user closed the dialog)", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onClose = jest.fn();

      displayLoginDialog(jest.fn(), onClose);

      getEventHandler(dialog)({ error: 12006 });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose for error code 12001", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onClose = jest.fn();

      displayLoginDialog(jest.fn(), onClose);

      getEventHandler(dialog)({ error: 12001 });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not call onClose for error code 12002", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onClose = jest.fn();

      displayLoginDialog(jest.fn(), onClose);

      getEventHandler(dialog)({ error: 12002 });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not call onClose when error code is 0", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onClose = jest.fn();

      displayLoginDialog(jest.fn(), onClose);

      getEventHandler(dialog)({ error: 0 });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not call onConfirm when a dialog event is received", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);
      const onConfirm = jest.fn();

      displayLoginDialog(onConfirm, jest.fn());

      getEventHandler(dialog)({ error: 12006 });

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("should not close the dialog when a dialog event is received", () => {
      const dialog = buildDialogMock();
      (global as any).Office = buildOfficeMock(dialog);

      displayLoginDialog(jest.fn(), jest.fn());

      getEventHandler(dialog)({ error: 12006 });

      expect(dialog.close).not.toHaveBeenCalled();
    });
  });
});
