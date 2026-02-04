/**
 * CachedResultsNotice - Shows when results are from cache
 */

import { Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CachedResultsNoticeProps {
  cachedAt?: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function CachedResultsNotice({
  cachedAt,
  onRefresh,
  isRefreshing = false,
  className,
}: CachedResultsNoticeProps) {
  const getTimeAgo = () => {
    if (!cachedAt) return "";
    const seconds = Math.floor((Date.now() - cachedAt.getTime()) / 1000);
    if (seconds < 60) return "less than a minute ago";
    if (seconds < 120) return "1 minute ago";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>
          Showing recent prices{cachedAt ? ` from ${getTimeAgo()}` : ""}.
        </span>
      </div>
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2 h-8"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      )}
    </div>
  );
}

export default CachedResultsNotice;
