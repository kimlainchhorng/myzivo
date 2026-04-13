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
    const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
    if (!isNativeIOS) return;
    
    import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      const getStyle = () => {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches || document.documentElement.classList.contains("dark");
        return dark ? Style.Light : Style.Dark;
      };
      void StatusBar.setOverlaysWebView({ overlay: true });
      void StatusBar.setStyle({ style: getStyle() });
      
      const update = () => void StatusBar.setStyle({ style: getStyle() });
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", update);
      new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    });
  });
});
