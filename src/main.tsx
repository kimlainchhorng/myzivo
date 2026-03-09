import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandlers } from "@/lib/security/errorReporting";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

// Initialize global error tracking
setupGlobalErrorHandlers();

if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
	// Ensure native iOS status bar does not overlap web content.
	void StatusBar.setOverlaysWebView({ overlay: false });
	void StatusBar.setStyle({ style: Style.Dark });
}

createRoot(document.getElementById("root")!).render(<App />);
