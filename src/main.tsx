import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/toastErrorFilter";

// Surface boot-time crashes on screen instead of failing silently into a white
// webview — without this, any sync throw in App's import chain is invisible
// because global error handlers don't load until requestIdleCallback fires.
function paintBootError(err: unknown) {
  const root = document.getElementById("root");
  const msg = err instanceof Error ? `${err.name}: ${err.message}\n\n${err.stack ?? ""}` : String(err);
  const html = `<div style="padding:16px;font:13px/1.4 -apple-system,monospace;color:#fff;background:#0D0D0F;min-height:100vh;white-space:pre-wrap;word-break:break-word;overflow:auto"><b style="color:#ff6b6b">App failed to start</b>\n\n${msg.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]!))}</div>`;
  if (root) root.innerHTML = html; else document.body.innerHTML = html;
}
window.addEventListener("error", e => paintBootError(e.error ?? e.message));
window.addEventListener("unhandledrejection", e => paintBootError(e.reason));

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (err) {
  paintBootError(err);
}

// Notify Capgo OTA updater that this version loaded successfully.
// Must be called after render; if omitted Capgo rolls back to the previous bundle.
import("@capacitor/core").then(({ Capacitor }) => {
  if (!Capacitor.isNativePlatform()) return;
  import("@capgo/capacitor-updater").then(({ CapacitorUpdater }) => {
    CapacitorUpdater.notifyAppReady();
  });
});

// Defer non-critical setup to after first paint
const idle = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 200));
idle(() => {
  import("@/lib/security/errorReporting").then(m => m.setupGlobalErrorHandlers());
  
  import("@capacitor/core").then(({ Capacitor }) => {
    if (!Capacitor.isNativePlatform()) return;
    const isNativeIOS = Capacitor.getPlatform() === "ios";
    if (!isNativeIOS) return;
    
    import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      const getStyle = () => {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches || document.documentElement.classList.contains("dark");
        // Use Light icons over the cover photo (dark scrim) regardless of theme
        // so the clock/battery stay legible like Facebook on iOS.
        return Style.Light;
      };
      // Edge-to-edge: webview crosses behind the status bar so cover photos /
      // gradients reach the very top of the screen. Interactive controls use
      // env(safe-area-inset-top) to stay clear of the notch / Dynamic Island.
      void StatusBar.setOverlaysWebView({ overlay: true });
      void StatusBar.setStyle({ style: getStyle() });
      
      const update = () => void StatusBar.setStyle({ style: getStyle() });
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", update);
      new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    });
  });
});
