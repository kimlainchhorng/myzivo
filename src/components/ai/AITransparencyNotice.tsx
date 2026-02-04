/**
 * AI Transparency Notice
 * Required disclaimer for AI-powered features
 */

import { Info, Sparkles, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AI_DISCLAIMERS } from "@/config/aiPersonalization";
import { cn } from "@/lib/utils";

type NoticeType = "general" | "priceConfidence" | "recommendations" | "predictions";

interface AITransparencyNoticeProps {
  type?: NoticeType;
  variant?: "inline" | "alert" | "tooltip";
  className?: string;
}

export function AITransparencyNotice({
  type = "general",
  variant = "inline",
  className,
}: AITransparencyNoticeProps) {
  const message = AI_DISCLAIMERS[type];

  if (variant === "alert") {
    return (
      <Alert className={cn("border-violet-500/20 bg-violet-500/5", className)}>
        <Sparkles className="w-4 h-4 text-violet-500" />
        <AlertDescription className="text-sm text-muted-foreground ml-2">
          {message}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === "tooltip") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className={cn("inline-flex items-center gap-1 text-muted-foreground hover:text-foreground", className)}>
              <Info className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3 h-3 text-violet-500 shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Inline variant (default)
  return (
    <div
      className={cn(
        "flex items-start gap-2 text-xs text-muted-foreground",
        className
      )}
    >
      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <p>{message}</p>
    </div>
  );
}

// Footer-style disclaimer
export function AIFooterDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "py-4 px-4 border-t border-border/50 bg-muted/20 text-center",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        <p>{AI_DISCLAIMERS.general}</p>
      </div>
    </div>
  );
}

// Compact badge-style notice
export function AIBadgeNotice({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-xs cursor-help",
              className
            )}
          >
            <Sparkles className="w-3 h-3" />
            AI-Powered
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">{AI_DISCLAIMERS.general}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default AITransparencyNotice;
