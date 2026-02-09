/**
 * Maintenance Banner for Eats
 * Shows when ZIVO Eats is under maintenance but still allows browsing
 */
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaintenanceBannerProps {
  className?: string;
}

export function MaintenanceBanner({ className }: MaintenanceBannerProps) {
  return (
    <div
      className={cn(
        "bg-primary/10 border border-primary/30 rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-primary">
            Ordering is temporarily paused
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You can browse menus, but new orders are not available right now.
          </p>
        </div>
      </div>
    </div>
  );
}
