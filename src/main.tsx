import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandlers } from "@/lib/security/errorReporting";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

// Initialize global error tracking
setupGlobalErrorHandlers();

if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
	// Allow web view to extend behind the status bar so env(safe-area-inset-top) works correctly
	void StatusBar.setOverlaysWebView({ overlay: true });
	void StatusBar.setStyle({ style: Style.Dark });
}

createRoot(document.getElementById("root")!).render(<App />);
