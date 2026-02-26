/** Error reporting stub */
export function setupGlobalErrorHandlers(): void {
  window.addEventListener("unhandledrejection", (event) => {
    console.error("[Unhandled Rejection]", event.reason);
  });
  window.addEventListener("error", (event) => {
    console.error("[Uncaught Error]", event.error ?? event.message);
  });
}
