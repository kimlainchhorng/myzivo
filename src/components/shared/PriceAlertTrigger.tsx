/**
 * PriceAlertTrigger Component
 * Quick button to set price alerts on search results
 */

import { useState } from "react";
import { Bell, BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PriceAlertTriggerProps {
  productId: string;
  productType: "flight" | "hotel" | "car";
  currentPrice: number;
  route?: string; // e.g., "NYC → LAX"
  variant?: "icon" | "button" | "compact";
  className?: string;
}

export function PriceAlertTrigger({
  productId,
  productType,
  currentPrice,
  route,
  variant = "icon",
  className,
}: PriceAlertTriggerProps) {
  const { user } = useAuth();
  const [isAlertSet, setIsAlertSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetAlert = async () => {
    if (!user) {
      toast.error("Please sign in to set price alerts");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - in production this would save to database
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setIsAlertSet(true);
    setIsLoading(false);
    
    toast.success(
      `Price alert set! We'll notify you when prices drop${route ? ` for ${route}` : ""}.`
    );
  };

  if (variant === "button") {
    return (
      <Button
        variant={isAlertSet ? "secondary" : "outline"}
        size="sm"
        onClick={handleSetAlert}
        disabled={isLoading || isAlertSet}
        className={cn("gap-2", className)}
      >
        {isAlertSet ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            Alert Set
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            Set Price Alert
          </>
        )}
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleSetAlert}
        disabled={isLoading || isAlertSet}
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors",
          isAlertSet && "text-emerald-500",
          className
        )}
      >
        {isAlertSet ? (
          <>
            <BellRing className="w-3.5 h-3.5" />
            <span>Alert active</span>
          </>
        ) : (
          <>
            <Bell className="w-3.5 h-3.5" />
            <span>Alert me</span>
          </>
        )}
      </button>
    );
  }

  // Icon variant (default)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleSetAlert}
          disabled={isLoading || isAlertSet}
          className={cn(
            "p-2 rounded-lg transition-all",
            isAlertSet
              ? "bg-emerald-500/10 text-emerald-500"
              : "hover:bg-muted text-muted-foreground hover:text-primary",
            className
          )}
        >
          {isAlertSet ? (
            <BellRing className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {isAlertSet ? (
          <p className="text-xs">Price alert is active</p>
        ) : (
          <p className="text-xs">Get notified when price drops</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
