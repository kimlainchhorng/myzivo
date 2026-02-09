/**
 * System Status Banner
 * Customer-facing reliability banner for active incidents
 */
import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "zivo-system-status-dismissed";

interface SystemStatusBannerProps {
  className?: string;
}

export default function SystemStatusBanner({ className }: SystemStatusBannerProps) {
  const { hasActiveIncident, incidentMessage, isLoading } = useSystemStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      try {
        const parsedDismissed = JSON.parse(dismissed);
        // Check if dismissed within the last hour (session-like behavior)
        const dismissedAt = new Date(parsedDismissed.dismissedAt).getTime();
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        if (dismissedAt > oneHourAgo) {
          setIsDismissed(true);
        } else {
          // Clear old dismissal
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Invalid JSON, ignore
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dismissedAt: new Date().toISOString(),
      })
    );
  };

  // Don't render if loading, no incident, or dismissed
  if (isLoading || !hasActiveIncident || isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative border-b",
        "bg-amber-50 dark:bg-amber-950/30",
        "border-amber-200 dark:border-amber-800",
        "py-2.5 px-4 text-center text-sm",
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="text-amber-700 dark:text-amber-300 font-medium">
          {incidentMessage}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-amber-600/80 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400/80 dark:hover:text-amber-300 dark:hover:bg-amber-900/30"
        onClick={handleDismiss}
        aria-label="Dismiss system status message"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
