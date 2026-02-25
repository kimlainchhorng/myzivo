/** Error reporting stub */
export function setupGlobalErrorHandlers(): void {
  window.addEventListener("unhandledrejection", (event) => {
    console.error("[Unhandled Rejection]", event.reason);
  });
}
