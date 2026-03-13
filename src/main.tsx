import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandlers } from "@/lib/security/errorReporting";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

// Initialize global error tracking
setupGlobalErrorHandlers();

const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";

const getPreferredStatusBarStyle = () => {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const appDarkMode = document.documentElement.classList.contains("dark");
	return prefersDark || appDarkMode ? Style.Light : Style.Dark;
};

if (isNativeIOS) {
	// Allow web view to extend behind the status bar so env(safe-area-inset-top) works correctly
	void StatusBar.setOverlaysWebView({ overlay: true });
	void StatusBar.setStyle({ style: getPreferredStatusBarStyle() });

	const handleAppearanceChange = () => {
		void StatusBar.setStyle({ style: getPreferredStatusBarStyle() });
	};

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	if (typeof mediaQuery.addEventListener === "function") {
		mediaQuery.addEventListener("change", handleAppearanceChange);
	} else {
		mediaQuery.addListener(handleAppearanceChange);
	}

	const classObserver = new MutationObserver(handleAppearanceChange);
	classObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
}

createRoot(document.getElementById("root")!).render(<App />);
