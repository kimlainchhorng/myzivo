/**
 * Announcement Banner
 * Site-wide banner for launch announcements
 * 
 * Soft Launch Text: "ZIVO is live. Compare prices from trusted travel partners."
 */

import { useState, useEffect } from "react";
import { X, Megaphone, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLaunchSettings } from "@/hooks/useLaunchSettings";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "zivo-announcement-dismissed";

// Default soft launch announcement
const SOFT_LAUNCH_TEXT = "ZIVO is live. Compare prices from trusted travel partners.";

type BannerVariant = "default" | "launch" | "celebration";

interface AnnouncementBannerProps {
  className?: string;
  /** Override announcement text (used for testing/preview) */
  overrideText?: string;
  /** Banner style variant */
  variant?: BannerVariant;
  /** Force show even if settings are disabled (for admin preview) */
  forceShow?: boolean;
}

const variantStyles: Record<BannerVariant, string> = {
  default: "bg-gradient-to-r from-primary via-primary/90 to-primary",
  launch: "bg-gradient-to-r from-emerald-500 via-teal-500 to-primary",
  celebration: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500",
};

const variantIcons: Record<BannerVariant, React.ReactNode> = {
  default: <Megaphone className="w-4 h-4 shrink-0" />,
  launch: <Rocket className="w-4 h-4 shrink-0" />,
  celebration: <Megaphone className="w-4 h-4 shrink-0" />,
};

export default function AnnouncementBanner({ 
  className, 
  overrideText,
  variant = "default",
  forceShow = false,
}: AnnouncementBannerProps) {
  const { data: settings, isLoading } = useLaunchSettings();
  const [isDismissed, setIsDismissed] = useState(false);

  // Determine the announcement text to display
  const announcementText = overrideText || settings?.announcement_text || SOFT_LAUNCH_TEXT;
  const isEnabled = forceShow || settings?.announcement_enabled;

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed && !forceShow) {
      // Check if it was dismissed for the current announcement text
      try {
        const parsedDismissed = JSON.parse(dismissed);
        if (parsedDismissed.text === announcementText) {
          setIsDismissed(true);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [announcementText, forceShow]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        text: announcementText,
        dismissedAt: new Date().toISOString(),
      })
    );
  };

  // Don't render if loading, not enabled, no text, or dismissed
  if (isLoading || !isEnabled || !announcementText || isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative text-primary-foreground",
        "py-2.5 px-4 text-center text-sm font-medium",
        variantStyles[variant],
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        {variantIcons[variant]}
        <span>{announcementText}</span>
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

// Export the default soft launch text for use in admin
export { SOFT_LAUNCH_TEXT };
