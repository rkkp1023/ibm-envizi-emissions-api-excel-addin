// Copyright IBM Corp. 2026

let isTaskpaneOpen = false;

/**
 * Captures the initial taskpane visibility state once Office is ready,
 * then keeps it up to date on every subsequent visibility change.
 */
if (typeof Office !== "undefined") {
  Office.onReady(() => {
    Office.addin.onVisibilityModeChanged((args) => {
      isTaskpaneOpen = args.visibilityMode === Office.VisibilityMode.taskpane;
    });
  });
}

/**
 * Returns the current taskpane open state as captured on Office.onReady.
 */
export function getIsTaskpaneOpen(): boolean {
  return isTaskpaneOpen;
}
