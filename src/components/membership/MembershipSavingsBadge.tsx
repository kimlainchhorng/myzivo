/**
 * MembershipSavingsBadge - Shows ZIVO+ savings in cart
 */
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipSavingsBadgeProps {
  totalSavings: number;
  className?: string;
}

export function MembershipSavingsBadge({ totalSavings, className }: MembershipSavingsBadgeProps) {
  if (totalSavings <= 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20",
      className
    )}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
        <Crown className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-400">
          ZIVO+ savings applied
        </p>
        <p className="text-xs text-amber-500/70">
          You're saving ${totalSavings.toFixed(2)} on this order
        </p>
      </div>
    </div>
  );
}

export default MembershipSavingsBadge;
