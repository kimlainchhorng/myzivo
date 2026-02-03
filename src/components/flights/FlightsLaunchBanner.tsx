/**
 * Flights Launch Banner
 * Shows launch announcement and phase indicator
 */

import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Plane, 
  Megaphone, 
  X,
  Sparkles,
} from "lucide-react";
import { useFlightsCanBook, useFlightsLaunchSettings } from "@/hooks/useFlightsLaunchStatus";
import { LAUNCH_PHASE_CONFIG } from "@/types/flightsLaunch";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const ANNOUNCEMENT_DISMISSED_KEY = "zivo-flights-announcement-dismissed";

interface FlightsLaunchBannerProps {
  className?: string;
  showPhaseIndicator?: boolean;
}

export function FlightsLaunchBanner({ 
  className, 
  showPhaseIndicator = true 
}: FlightsLaunchBannerProps) {
  const { isPaused, pauseReason, phase, reason, canBook } = useFlightsCanBook();
  const { data: settings } = useFlightsLaunchSettings();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Check if announcement was dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY);
    if (dismissed === settings?.launch_announcement_text) {
      setAnnouncementDismissed(true);
    }
  }, [settings?.launch_announcement_text]);

  const dismissAnnouncement = () => {
    if (settings?.launch_announcement_text) {
      localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, settings.launch_announcement_text);
    }
    setAnnouncementDismissed(true);
  };

  // Show pause alert if paused
  if (isPaused) {
    return (
      <Alert className={cn("border-destructive/50 bg-destructive/10", className)}>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Flight bookings are temporarily paused.</strong>{" "}
          {pauseReason || "Please check back later."}
        </AlertDescription>
      </Alert>
    );
  }

  // Show beta/restricted access message
  if (!canBook && reason) {
    return (
      <Alert className={cn("border-amber-500/50 bg-amber-500/10", className)}>
        <Sparkles className="w-4 h-4 text-amber-500" />
        <AlertDescription className="flex items-center justify-between">
          <span>{reason}</span>
          {phase === 'private_beta' && (
            <Button variant="outline" size="sm" asChild className="ml-4">
              <Link to="/flights/beta">Request Access</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const phaseConfig = LAUNCH_PHASE_CONFIG[phase];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Launch Announcement */}
      {settings?.launch_announcement_enabled && 
       settings?.launch_announcement_text && 
       !announcementDismissed && (
        <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-2.5 px-4 rounded-lg">
          <div className="flex items-center justify-center gap-2 pr-8">
            <Megaphone className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{settings.launch_announcement_text}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={dismissAnnouncement}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Phase Indicator Badge */}
      {showPhaseIndicator && phase === 'private_beta' && (
        <Badge 
          variant="outline" 
          className={cn("gap-1", phaseConfig.color)}
        >
          {phaseConfig.icon} Private Beta
        </Badge>
      )}
    </div>
  );
}

/**
 * Compact beta badge for headers
 */
export function FlightsBetaBadge({ className }: { className?: string }) {
  const { phase } = useFlightsCanBook();
  
  if (phase !== 'private_beta') return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-violet-500/10 text-violet-600 border-violet-500/30 text-xs font-medium gap-1",
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      Beta
    </Badge>
  );
}