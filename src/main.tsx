import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Render immediately — don't block on Capacitor or error handlers
createRoot(document.getElementById("root")!).render(<App />);

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
