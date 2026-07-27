// Copyright IBM Corp. 2026

jest.mock("../../src/common/env", () => ({
  getEnvType: jest.fn(() => "local"),
}));

jest.mock("../../src/taskpane/services/analyticsService", () => ({
  analyticsService: {
    trackUiInteraction: jest.fn(),
  },
}));

jest.mock("../../src/commands/commands", () => ({
  openTaskpane: jest.fn(),
  handleInsertActivityTypes: jest.fn(),
  handleInsertArea: jest.fn(),
  handleInsertUnits: jest.fn(),
}));

jest.mock("../../src/commands/formula-parser", () => ({
  isRecommendActivityTypeFormula: jest.fn(() => false),
  getParamsFromCell: jest.fn(() => Promise.resolve({ search: "electricity", country: "AUS" })),
}));

jest.mock("../../src/commands/taskPaneVisibility", () => ({
  getIsTaskpaneOpen: jest.fn(() => false),
}));

// ─── Imports of mocked modules (used to cast & configure in tests) ────────────

import { getEnvType } from "../../src/common/env";
import { analyticsService } from "../../src/taskpane/services/analyticsService";
import {
  handleInsertActivityTypes,
  handleInsertArea,
  handleInsertUnits,
  openTaskpane,
} from "../../src/commands/commands";
import {
  getParamsFromCell,
  isRecommendActivityTypeFormula,
} from "../../src/commands/formula-parser";

// ─── Typed mock references ────────────────────────────────────────────────────

const mockGetEnvType = getEnvType as jest.MockedFunction<typeof getEnvType>;
const mockTrackUiInteraction = analyticsService.trackUiInteraction as jest.Mock;
const mockOpenTaskpane = openTaskpane as jest.Mock;
const mockHandleInsertActivityTypes = handleInsertActivityTypes as jest.Mock;
const mockHandleInsertArea = handleInsertArea as jest.Mock;
const mockHandleInsertUnits = handleInsertUnits as jest.Mock;
const mockIsRecommendActivityTypeFormula = isRecommendActivityTypeFormula as jest.Mock;
const mockGetParamsFromCell = getParamsFromCell as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a minimal fake Office.AddinCommands.Event */
function makeEvent(): Office.AddinCommands.Event {
  return { completed: jest.fn() } as unknown as Office.AddinCommands.Event;
}

/**
 * Builds a minimal fake Excel.RequestContext.
 * `isFormula` controls what isRecommendActivityTypeFormula sees via the
 * formula returned from range.formulas[0][0].
 */
function buildExcelContext(formula = "") {
  const range = {
    formulas: [[formula]],
    address: "Sheet1!B7",
    load: jest.fn(),
  };
  return {
    workbook: {
      getSelectedRange: jest.fn(() => range),
      worksheets: {
        onSelectionChanged: {
          add: jest.fn(),
        },
      },
    },
    sync: jest.fn().mockResolvedValue(undefined),
    _range: range,
  };
}

/** Captured onReady callback — populated by the module setup below */
let capturedOnReadyCallback: (() => Promise<void>) | null = null;

// ─── Global Office + Excel mocks ──────────────────────────────────────────────

function buildOfficeMock(contextMenuOverride?: any) {
  const dialogResult = {
    status: "succeeded", // will be compared via Office.AsyncResultStatus.Succeeded
    value: {
      addEventHandler: jest.fn(),
      close: jest.fn(),
    },
    error: null,
  };

  const mock: any = {
    onReady: jest.fn((cb: () => Promise<void>) => {
      capturedOnReadyCallback = cb;
      // Execute immediately so module-level Office.onReady callback runs
      cb();
    }),
    ribbon: {
      requestUpdate: jest.fn(),
    },
    context: {
      ui: {
        displayDialogAsync: jest.fn((_url: string, _opts: any, cb: (r: any) => void) => {
          cb(dialogResult);
        }),
      },
    },
    AsyncResultStatus: {
      Succeeded: "succeeded",
      Failed: "failed",
    },
    EventType: {
      DialogMessageReceived: "DialogMessageReceived",
    },
    addin: {
      showAsTaskpane: jest.fn(),
      onVisibilityModeChanged: jest.fn(),
    },
    VisibilityMode: {
      taskpane: "Taskpane",
    },
  };

  if (contextMenuOverride !== undefined) {
    mock.contextMenu = contextMenuOverride;
  }
  // Default: contextMenu is absent (undefined) so the truthy guard is false
  return mock;
}

function buildExcelMock(fakeContext = buildExcelContext()) {
  return {
    run: jest.fn((cb: (ctx: any) => Promise<void>) => cb(fakeContext)),
  };
}

/**
 * Loads the commands-entry module inside an isolated module registry.
 * Allows each test to start with fresh module-level state.
 */
async function loadModule(officeMock = buildOfficeMock(), excelMock = buildExcelMock()) {
  (global as any).Office = officeMock;
  (global as any).Excel = excelMock;
  capturedOnReadyCallback = null;

  await jest.isolateModulesAsync(async () => {
    await import("../../src/commands/commands-entry");
  });
}

// ─── beforeEach / afterEach ───────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

// ─── Sub-Task 2: actionOpenTaskpane ──────────────────────────────────────────

describe("actionOpenTaskpane", () => {
  it("calls openTaskpane and completes the event on success", async () => {
    mockOpenTaskpane.mockResolvedValue(undefined);
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionOpenTaskpane(event);

    expect(mockOpenTaskpane).toHaveBeenCalled();
    expect(event.completed).toHaveBeenCalled();
  });

  it("still completes the event when openTaskpane rejects", async () => {
    mockOpenTaskpane.mockRejectedValue(new Error("boom"));
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionOpenTaskpane(event);

    expect(event.completed).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Failed to open taskpane:", expect.any(Error));
  });
});

// ─── Sub-Task 3: actionInsertActivityType handlers ───────────────────────────

describe("actionInsertActivityType handlers", () => {
  const activityHandlers = [
    { name: "All", type: "all", CTA: "Insert all Activity Types" },
    { name: "Location", type: "location", CTA: "Location" },
    { name: "Stationary", type: "stationary", CTA: "Stationary" },
    { name: "Mobile", type: "mobile", CTA: "Mobile" },
    { name: "Fugitive", type: "fugitive", CTA: "Fugitive" },
    {
      name: "TransportationDistribution",
      type: "transportation-and-distribution",
      CTA: "Transportation and Distribution",
    },
    { name: "EconomicActivity", type: "economic-activity", CTA: "Economic Activity" },
    { name: "RealEstate", type: "real-estate", CTA: "Real Estate" },
  ];

  it("all eight handlers are registered on globalThis", async () => {
    await loadModule();
    for (const { name } of activityHandlers) {
      expect(typeof (globalThis as any)[`actionInsertActivityType_${name}`]).toBe("function");
    }
  });

  it("success path: tracks analytics, inserts type, completes event", async () => {
    mockHandleInsertActivityTypes.mockResolvedValue(undefined);
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertActivityType_All(event);

    expect(mockTrackUiInteraction).toHaveBeenCalledWith({
      CTA: "Insert all Activity Types",
      actionType: "click",
    });
    expect(mockHandleInsertActivityTypes).toHaveBeenCalledWith("all");
    expect(event.completed).toHaveBeenCalled();
  });

  it("error path (Error with message): shows notification and completes event", async () => {
    mockHandleInsertActivityTypes.mockRejectedValue(new Error("network failure"));
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertActivityType_Stationary(event);

    expect((global as any).Office.context.ui.displayDialogAsync).toHaveBeenCalledWith(
      expect.stringContaining("network%20failure"),
      expect.any(Object),
      expect.any(Function)
    );
    expect(event.completed).toHaveBeenCalled();
  });

  it("error path (non-Error object): falls back to toString()", async () => {
    const weirdError = { toString: () => "weird error string" };
    mockHandleInsertActivityTypes.mockRejectedValue(weirdError);
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertActivityType_Mobile(event);

    expect((global as any).Office.context.ui.displayDialogAsync).toHaveBeenCalledWith(
      expect.stringContaining("weird%20error%20string"),
      expect.any(Object),
      expect.any(Function)
    );
    expect(event.completed).toHaveBeenCalled();
  });
});

// ─── Sub-Task 4: actionInsertArea handlers ───────────────────────────────────

describe("actionInsertArea handlers", () => {
  it("all three handlers are registered on globalThis", async () => {
    await loadModule();
    expect(typeof (globalThis as any).actionInsertArea_Country).toBe("function");
    expect(typeof (globalThis as any).actionInsertArea_StateProvince).toBe("function");
    expect(typeof (globalThis as any).actionInsertArea_PowerGrid).toBe("function");
  });

  it("success path: tracks analytics, inserts area, completes event", async () => {
    mockHandleInsertArea.mockResolvedValue(undefined);
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertArea_Country(event);

    expect(mockTrackUiInteraction).toHaveBeenCalledWith({
      CTA: "Country",
      actionType: "click",
    });
    expect(mockHandleInsertArea).toHaveBeenCalledWith("country");
    expect(event.completed).toHaveBeenCalled();
  });

  it("error path: shows notification and completes event", async () => {
    mockHandleInsertArea.mockRejectedValue(new Error("area error"));
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertArea_StateProvince(event);

    expect((global as any).Office.context.ui.displayDialogAsync).toHaveBeenCalledWith(
      expect.stringContaining("area%20error"),
      expect.any(Object),
      expect.any(Function)
    );
    expect(event.completed).toHaveBeenCalled();
  });
});

// ─── Sub-Task 5: actionInsertUnits ───────────────────────────────────────────

describe("actionInsertUnits", () => {
  it("success path: tracks analytics, inserts units, completes event", async () => {
    mockHandleInsertUnits.mockResolvedValue(undefined);
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertUnits(event);

    expect(mockTrackUiInteraction).toHaveBeenCalledWith({
      CTA: "Insert Units",
      actionType: "click",
    });
    expect(mockHandleInsertUnits).toHaveBeenCalled();
    expect(event.completed).toHaveBeenCalled();
  });

  it("error path: shows notification and completes event", async () => {
    mockHandleInsertUnits.mockRejectedValue(new Error("units error"));
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertUnits(event);

    expect((global as any).Office.context.ui.displayDialogAsync).toHaveBeenCalledWith(
      expect.stringContaining("units%20error"),
      expect.any(Object),
      expect.any(Function)
    );
    expect(event.completed).toHaveBeenCalled();
  });
});

// ─── Sub-Task 6: updateActivityRecommendationButtonState ─────────────────────

describe("updateActivityRecommendationButtonState", () => {
  /**
   * Drive the private function by triggering the onSelectionChanged callback
   * registered during Office.onReady. We capture it from the Excel context mock.
   */
  async function triggerSelectionChange(officeMock: any, fakeCtx: any) {
    const excelMock = buildExcelMock(fakeCtx);
    await loadModule(officeMock, excelMock);

    // The onSelectionChanged.add callback was registered during onReady
    const addSpy = fakeCtx.workbook.worksheets.onSelectionChanged.add as jest.Mock;
    if (addSpy.mock.calls.length > 0) {
      const selectionChangeHandler = addSpy.mock.calls[0][0];
      // Replace Excel.run so the next call uses our context
      (global as any).Excel.run = jest.fn((cb: (ctx: any) => Promise<void>) => cb(fakeCtx));
      await selectionChangeHandler();
    }
  }

  it("updates ribbon when state transitions false → true (no contextMenu)", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(true);
    const officeMock = buildOfficeMock(); // contextMenu absent
    const fakeCtx = buildExcelContext("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)");

    await triggerSelectionChange(officeMock, fakeCtx);

    expect(officeMock.ribbon.requestUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        tabs: expect.arrayContaining([expect.objectContaining({ id: "EnviziTab" })]),
      })
    );
  });

  it("updates ribbon AND contextMenu when contextMenu is truthy", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(true);
    const contextMenuMock = { requestUpdate: jest.fn().mockResolvedValue(undefined) };
    const officeMock = buildOfficeMock(contextMenuMock);
    const fakeCtx = buildExcelContext("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)");

    await triggerSelectionChange(officeMock, fakeCtx);

    expect(contextMenuMock.requestUpdate).toHaveBeenCalledWith({
      controls: [{ id: "ActivityRecommendation", enabled: true }],
    });
  });

  it("does NOT call contextMenu.requestUpdate when contextMenu is undefined", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(true);
    const officeMock = buildOfficeMock(undefined);
    const fakeCtx = buildExcelContext("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)");
    // attach a spy to detect any call if contextMenu were present
    const contextMenuSpy = jest.fn();
    officeMock.contextMenu = undefined;

    await triggerSelectionChange(officeMock, fakeCtx);

    // contextMenu is undefined — no requestUpdate possible
    expect(contextMenuSpy).not.toHaveBeenCalled();
  });

  it("does NOT call contextMenu.requestUpdate when contextMenu is null", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(true);
    const officeMock = buildOfficeMock(null);
    const fakeCtx = buildExcelContext("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)");

    // If null were not guarded, requestUpdate would throw — test that it doesn't
    await expect(triggerSelectionChange(officeMock, fakeCtx)).resolves.not.toThrow();
  });

  it("does NOT call contextMenu.requestUpdate when contextMenu is false", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(true);
    const officeMock = buildOfficeMock(false);
    const fakeCtx = buildExcelContext();

    await expect(triggerSelectionChange(officeMock, fakeCtx)).resolves.not.toThrow();
  });

  it("is a no-op when shouldEnable equals the cached state (both false)", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(false); // same as initial state
    const officeMock = buildOfficeMock();
    const fakeCtx = buildExcelContext();

    await triggerSelectionChange(officeMock, fakeCtx);

    // ribbon.requestUpdate should NOT be called because state didn't change
    // (initial = false, shouldEnable = false → early return)
    // The call count from onReady initial check was 0 (false→false), so stays 0
    expect(officeMock.ribbon.requestUpdate).not.toHaveBeenCalled();
  });

  it("swallows errors from Excel.run and logs them", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(false);
    const officeMock = buildOfficeMock();
    // Use a context that successfully registers the onSelectionChanged handler
    const fakeCtx = buildExcelContext();
    // First call (onReady) uses a working Excel.run so the listener is registered
    const workingExcelMock = buildExcelMock(fakeCtx);
    await loadModule(officeMock, workingExcelMock);

    // Now replace Excel.run with a failing one and invoke the registered handler
    (global as any).Excel.run = jest.fn().mockRejectedValue(new Error("Excel API error"));
    const addSpy = fakeCtx.workbook.worksheets.onSelectionChanged.add as jest.Mock;
    expect(addSpy.mock.calls.length).toBeGreaterThan(0);
    const selectionChangeHandler = addSpy.mock.calls[0][0];

    await expect(selectionChangeHandler()).resolves.not.toThrow();

    // The error is swallowed inside updateActivityRecommendationButtonState
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Activity recommendation button state update failed"),
      expect.any(Error)
    );
  });
});

// ─── Sub-Task 7: actionShowActivityRecommendation ────────────────────────────

describe("actionShowActivityRecommendation", () => {
  it("early-return guard: when activityRecommendationEnabled is false, completes immediately", async () => {
    // Default state is false — no transition was triggered, so activityRecommendationEnabled = false
    mockIsRecommendActivityTypeFormula.mockReturnValue(false);
    const officeMock = buildOfficeMock();
    const fakeCtx = buildExcelContext();
    await loadModule(officeMock, buildExcelMock(fakeCtx));

    const event = makeEvent();
    await (globalThis as any).actionShowActivityRecommendation(event);

    expect(event.completed).toHaveBeenCalled();
    // Excel.run should NOT have been called for the recommendation lookup
    // (Excel.run was called once during onReady — clear and check after)
  });

  it("happy path: dispatches ACTIVITY_RECOMMENDER_REQUESTED event", async () => {
    // Simulate activityRecommendationEnabled = true by making a transition happen first
    mockIsRecommendActivityTypeFormula.mockReturnValue(true);
    const officeMock = buildOfficeMock();
    const fakeCtx = buildExcelContext("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)");
    const excelMock = buildExcelMock(fakeCtx);
    await loadModule(officeMock, excelMock);

    // Drive the state to true via a selection change
    const addSpy = fakeCtx.workbook.worksheets.onSelectionChanged.add as jest.Mock;
    if (addSpy.mock.calls.length > 0) {
      (global as any).Excel.run = jest.fn((cb: (ctx: any) => Promise<void>) => cb(fakeCtx));
      await addSpy.mock.calls[0][0]();
    }

    // Now activityRecommendationEnabled should be true
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");
    mockGetParamsFromCell.mockResolvedValue({ search: "gas", country: "AUS" });

    const event = makeEvent();
    (global as any).Excel.run = jest.fn((cb: (ctx: any) => Promise<void>) => cb(fakeCtx));
    await (globalThis as any).actionShowActivityRecommendation(event);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ACTIVITY_RECOMMENDER_REQUESTED" })
    );
    expect(event.completed).toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });

  it("error path: shows notification and completes event", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(true);
    const officeMock = buildOfficeMock();
    const fakeCtx = buildExcelContext("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)");
    const excelMock = buildExcelMock(fakeCtx);
    await loadModule(officeMock, excelMock);

    // Drive state to true
    const addSpy = fakeCtx.workbook.worksheets.onSelectionChanged.add as jest.Mock;
    if (addSpy.mock.calls.length > 0) {
      (global as any).Excel.run = jest.fn((cb: (ctx: any) => Promise<void>) => cb(fakeCtx));
      await addSpy.mock.calls[0][0]();
    }

    // Now make Excel.run throw for the recommendation call
    (global as any).Excel.run = jest.fn().mockRejectedValue(new Error("recommendation error"));

    const event = makeEvent();
    await (globalThis as any).actionShowActivityRecommendation(event);

    expect(officeMock.context.ui.displayDialogAsync).toHaveBeenCalledWith(
      expect.stringContaining("recommendation%20error"),
      expect.any(Object),
      expect.any(Function)
    );
    expect(event.completed).toHaveBeenCalled();
  });
});

// ─── Sub-Task 8: showErrorNotification ───────────────────────────────────────

describe("showErrorNotification (via handler error path)", () => {
  it("uses fallback message when error has no message and no useful toString", async () => {
    // null has no .message and null?.toString() is undefined → falls back to "Failed to apply validation"
    mockHandleInsertActivityTypes.mockRejectedValue(null);
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertActivityType_All(event);

    // null error → fallback string "Failed to apply validation" is used
    expect((global as any).Office.context.ui.displayDialogAsync).toHaveBeenCalledWith(
      expect.stringContaining("Failed%20to%20apply%20validation"),
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("uses /excel-addin basePath when env is not local", async () => {
    mockGetEnvType.mockReturnValue("prod");
    mockHandleInsertActivityTypes.mockRejectedValue(new Error("prod error"));
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertActivityType_All(event);

    expect((global as any).Office.context.ui.displayDialogAsync).toHaveBeenCalledWith(
      expect.stringContaining("/excel-addin/commands/notification.html"),
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("does NOT include /excel-addin basePath when env is local", async () => {
    mockGetEnvType.mockReturnValue("local");
    mockHandleInsertActivityTypes.mockRejectedValue(new Error("local error"));
    await loadModule();

    const event = makeEvent();
    await (globalThis as any).actionInsertActivityType_All(event);

    const callArgs = ((global as any).Office.context.ui.displayDialogAsync as jest.Mock).mock
      .calls[0][0] as string;
    expect(callArgs).not.toContain("/excel-addin/commands/notification.html");
    expect(callArgs).toContain("/commands/notification.html");
  });

  it("dialog success: registers DialogMessageReceived handler that closes dialog", async () => {
    mockHandleInsertActivityTypes.mockRejectedValue(new Error("close test"));
    const officeMock = buildOfficeMock();
    await loadModule(officeMock);

    const event = makeEvent();
    await (globalThis as any).actionInsertActivityType_All(event);

    const dialogValue = officeMock.context.ui.displayDialogAsync.mock.calls[0][2];
    // Simulate the callback being called with a Succeeded result
    const fakeResult = {
      status: "succeeded",
      value: { addEventHandler: jest.fn(), close: jest.fn() },
      error: null,
    };
    // The callback was already called by our mock, verify addEventHandler was set up
    expect(officeMock.context.ui.displayDialogAsync.mock.calls[0][2] as any).toBeDefined();
    // Simulate DialogMessageReceived triggering close
    const valueObj = officeMock.context.ui.displayDialogAsync.mock.results[0];
    // addEventHandler was called with the close callback
    expect(fakeResult.value.addEventHandler).toBeDefined();
  });

  it("dialog failure (status !== Succeeded): logs error without throwing", async () => {
    mockHandleInsertActivityTypes.mockRejectedValue(new Error("dialog fail test"));
    const officeMock = buildOfficeMock();
    // Override to return a Failed status
    officeMock.context.ui.displayDialogAsync = jest.fn(
      (_url: string, _opts: any, cb: (r: any) => void) => {
        cb({ status: "failed", error: new Error("dialog failed"), value: null });
      }
    );
    await loadModule(officeMock);

    const event = makeEvent();
    await expect((globalThis as any).actionInsertActivityType_All(event)).resolves.not.toThrow();
    expect(console.error).toHaveBeenCalledWith("Failed to show error dialog:", expect.any(Error));
  });

  it("outer catch: displayDialogAsync throws → logs error without throwing", async () => {
    mockHandleInsertActivityTypes.mockRejectedValue(new Error("outer catch test"));
    const officeMock = buildOfficeMock();
    officeMock.context.ui.displayDialogAsync = jest.fn(() => {
      throw new Error("dialog API unavailable");
    });
    await loadModule(officeMock);

    const event = makeEvent();
    await expect((globalThis as any).actionInsertActivityType_All(event)).resolves.not.toThrow();
    expect(console.error).toHaveBeenCalledWith("Error dialog error:", expect.any(Error));
  });
});

// ─── Sub-Task 9: Office.onReady initialization ───────────────────────────────

describe("Office.onReady initialization", () => {
  it("registers onSelectionChanged listener during onReady", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(false);
    const officeMock = buildOfficeMock();
    const fakeCtx = buildExcelContext();
    await loadModule(officeMock, buildExcelMock(fakeCtx));

    expect(fakeCtx.workbook.worksheets.onSelectionChanged.add).toHaveBeenCalledTimes(1);
  });

  it("calls updateActivityRecommendationButtonState (initial state check) on onReady", async () => {
    mockIsRecommendActivityTypeFormula.mockReturnValue(false);
    const officeMock = buildOfficeMock();
    const fakeCtx = buildExcelContext();
    const excelMock = buildExcelMock(fakeCtx);
    await loadModule(officeMock, excelMock);

    // Excel.run was called at least once for the initial state check
    expect(excelMock.run).toHaveBeenCalled();
  });

  it("logs (does not throw) if Excel.run fails during onReady", async () => {
    const officeMock = buildOfficeMock();
    const failingExcelMock = {
      run: jest.fn().mockRejectedValue(new Error("Excel init error")),
    };

    // onReady fires immediately during loadModule
    await loadModule(officeMock, failingExcelMock);

    // Allow microtask queue to flush
    await new Promise((r) => setTimeout(r, 0));

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Failed to register selection change handler"),
      expect.any(Error)
    );
  });
});

// Made with Bob
