import { useEffect, useRef } from "react";
import { toast } from "sonner";

function errorToMessage(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value ?? "unknown");
  }
}

export default function RuntimeSecurityGuard() {
  const lastNoticeAtRef = useRef(0);
  const reloadedChunkRef = useRef(false);

  useEffect(() => {
    const canNotify = () => {
      const now = Date.now();
      if (now - lastNoticeAtRef.current < 5000) return false;
      lastNoticeAtRef.current = now;
      return true;
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = errorToMessage(event.reason).toLowerCase();

      if (msg.includes("loading chunk") || msg.includes("failed to fetch dynamically imported module")) {
        if (!reloadedChunkRef.current) {
          reloadedChunkRef.current = true;
          toast.warning("A module failed to load. Refreshing app...");
          window.location.reload();
        }
        return;
      }

      if (canNotify()) {
        toast.error("Unexpected runtime error detected. Please retry your action.");
      }
      console.error("[RuntimeSecurityGuard] Unhandled rejection:", event.reason);
    };

    const onWindowError = (event: ErrorEvent) => {
      const msg = (event.message || "").toLowerCase();

      if (msg.includes("resizeobserver loop limit exceeded")) {
        return;
      }

      if (canNotify()) {
        toast.error("A runtime issue occurred. The app prevented a hard crash.");
      }
      console.error("[RuntimeSecurityGuard] Window error:", event.error || event.message);
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onWindowError);
    };
  }, []);

  return null;
}
