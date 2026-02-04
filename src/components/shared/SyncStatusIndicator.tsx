/**
 * SyncStatusIndicator - Cloud sync status for multi-device continuity
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudOff, Check, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SyncStatus = "synced" | "syncing" | "offline" | "error";

interface SyncStatusIndicatorProps {
  status?: SyncStatus;
  lastSyncTime?: Date;
  variant?: "icon" | "badge" | "detailed";
  className?: string;
}

export function SyncStatusIndicator({
  status = "synced",
  lastSyncTime,
  variant = "icon",
  className,
}: SyncStatusIndicatorProps) {
  const [currentStatus, setCurrentStatus] = useState<SyncStatus>(status);

  // Simulate status changes for demo
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const statusConfig: Record<SyncStatus, {
    icon: typeof Check;
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    animate?: boolean;
  }> = {
    synced: {
      icon: Check,
      label: "All synced",
      description: lastSyncTime 
        ? `Last synced ${formatTimeAgo(lastSyncTime)}` 
        : "Your data is up to date",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      animate: false,
    },
    syncing: {
      icon: Loader2,
      label: "Syncing...",
      description: "Saving your changes",
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/30",
      animate: true,
    },
    offline: {
      icon: CloudOff,
      label: "Offline",
      description: "Changes will sync when online",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      animate: false,
    },
    error: {
      icon: RefreshCw,
      label: "Sync failed",
      description: "Tap to retry",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      animate: false,
    },
  };

  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors",
                config.bgColor,
                className
              )}
            >
              <Icon className={cn(
                "w-4 h-4",
                config.color,
                config.animate && "animate-spin"
              )} />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "badge") {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bgColor,
        config.color,
        className
      )}>
        <Icon className={cn("w-3 h-3", config.animate && "animate-spin")} />
        {config.label}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bgColor)}>
        <Icon className={cn("w-5 h-5", config.color, config.animate && "animate-spin")} />
      </div>
      <div>
        <p className={cn("font-medium text-sm", config.color)}>{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 120) return "1 min ago";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 7200) return "1 hour ago";
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return "yesterday";
}

export default SyncStatusIndicator;
