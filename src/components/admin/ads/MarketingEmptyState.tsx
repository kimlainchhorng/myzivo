/**
 * MarketingEmptyState — shared empty-state UI for Marketing & Ads surfaces.
 * Compact on mobile, spacious on desktop.
 */
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { mkBody, mkHeading, mkMeta } from "./marketing-tokens";

interface Props {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function MarketingEmptyState({ icon: Icon, title, body, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-muted/20",
        "p-4 sm:p-6 lg:p-8",
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-primary/5 mb-3 sm:mb-4">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary/60" />
      </div>
      <h3 className={cn(mkHeading, "mb-1.5")}>{title}</h3>
      {body && <p className={cn(mkBody, "text-muted-foreground max-w-xs sm:max-w-sm")}>{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
