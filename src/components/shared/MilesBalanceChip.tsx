/**
 * MilesBalanceChip Component
 * Displays user's ZIVO Miles balance in header/nav
 */

import { Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MilesBalanceChipProps {
  className?: string;
  variant?: "default" | "compact" | "badge";
}

export function MilesBalanceChip({ className, variant = "default" }: MilesBalanceChipProps) {
  const { user } = useAuth();

  const { data: milesBalance } = useQuery({
    queryKey: ["miles-balance", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      // Sum all available credits (not expired, not fully used)
      const { data } = await supabase
        .from("zivo_credits")
        .select("amount, used_amount")
        .eq("user_id", user.id)
        .eq("is_expired", false);

      if (!data || data.length === 0) return 0;
      
      // Calculate remaining balance and convert to miles (1 dollar = 100 miles)
      const totalCredits = data.reduce((sum, credit) => {
        const remaining = (credit.amount || 0) - (credit.used_amount || 0);
        return sum + Math.max(0, remaining);
      }, 0);
      
      return Math.round(totalCredits * 100);
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  if (!user) return null;

  const displayBalance = milesBalance?.toLocaleString() || "0";

  if (variant === "badge") {
    return (
      <Link
        to="/app/dashboard?tab=miles"
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
          "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          "text-xs font-medium hover:bg-amber-500/20 transition-all duration-200",
          className
        )}
      >
        <Coins className="w-3 h-3" />
        <span>{displayBalance}</span>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to="/app/dashboard?tab=miles"
        className={cn(
          "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200",
          className
        )}
      >
        <Coins className="w-4 h-4 text-amber-500" />
        <span className="font-medium">{displayBalance}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/app/dashboard?tab=miles"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
        "border border-amber-500/20 hover:border-amber-500/40",
        "transition-all hover:scale-105",
        className
      )}
    >
      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <Coins className="w-3.5 h-3.5 text-amber-500" />
      </div>
      <div className="text-left">
        <p className="text-xs text-muted-foreground leading-none">ZIVO Miles</p>
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          {displayBalance}
        </p>
      </div>
    </Link>
  );
}
