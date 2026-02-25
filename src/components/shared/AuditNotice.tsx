/**
 * Audit Notice - Visible notice about activity logging for compliance
 */

import { Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuditNoticeProps {
  variant?: "inline" | "card" | "minimal";
  className?: string;
}

export function AuditNotice({ variant = "inline", className }: AuditNoticeProps) {
  const content = "Activity logs are maintained for security and compliance purposes. This includes login events, booking actions, and payment transactions.";
  
  if (variant === "minimal") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground cursor-help", className)}>
              <Shield className="w-3 h-3" />
              <span>Activity logged</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "p-4 rounded-xl border bg-muted/30",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm mb-1">Security & Compliance Logging</p>
            <p className="text-xs text-muted-foreground">
              {content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // inline variant (default)
  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-xl bg-muted/50 border",
      className
    )}>
      <Info className="w-4 h-4 text-muted-foreground shrink-0" />
      <p className="text-xs text-muted-foreground">
        {content}
      </p>
    </div>
  );
}

export default AuditNotice;
