/**
 * Announcement Banner
 * Site-wide banner for launch announcements
 */

import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLaunchSettings } from "@/hooks/useLaunchSettings";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "zivo-announcement-dismissed";

interface AnnouncementBannerProps {
  className?: string;
}

export default function AnnouncementBanner({ className }: AnnouncementBannerProps) {
  const { data: settings, isLoading } = useLaunchSettings();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      // Check if it was dismissed for the current announcement text
      const parsedDismissed = JSON.parse(dismissed);
      if (parsedDismissed.text === settings?.announcement_text) {
        setIsDismissed(true);
      }
    }
  }, [settings?.announcement_text]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        text: settings?.announcement_text,
        dismissedAt: new Date().toISOString(),
      })
    );
  };

  // Don't render if loading, not enabled, no text, or dismissed
  if (isLoading || !settings?.announcement_enabled || !settings?.announcement_text || isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground",
        "py-2.5 px-4 text-center text-sm font-medium",
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Megaphone className="w-4 h-4 shrink-0" />
        <span>{settings.announcement_text}</span>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
