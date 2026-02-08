/**
 * Masked Call Button
 * Privacy-protected call button for Eats orders
 */
import { Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderCall, CallRole } from "@/hooks/useOrderCall";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MaskedCallButtonProps {
  orderId: string;
  myRole: CallRole;
  targetRole: CallRole;
  variant?: "default" | "icon" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

const roleLabels: Record<CallRole, string> = {
  customer: "Customer",
  driver: "Driver",
  merchant: "Restaurant",
};

export function MaskedCallButton({
  orderId,
  myRole,
  targetRole,
  variant = "icon",
  size = "icon",
  className,
  showLabel = false,
}: MaskedCallButtonProps) {
  const {
    session,
    isLoading,
    startCall,
    isStartingCall,
    canCallCustomer,
    canCallDriver,
    canCallMerchant,
  } = useOrderCall({
    orderId,
    myRole,
    enabled: !!orderId,
  });

  // Check if target can be called
  const canCall =
    targetRole === "customer" ? canCallCustomer :
    targetRole === "driver" ? canCallDriver :
    canCallMerchant;

  const handleClick = () => {
    if (!canCall || isStartingCall) return;
    startCall(targetRole);
  };

  const isDisabled = isLoading || isStartingCall || !canCall;
  const label = `Call ${roleLabels[targetRole]}`;

  // If no session or loading, show placeholder
  if (isLoading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn("opacity-50", className)}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        {showLabel && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  // Icon-only variant
  if (variant === "icon" && !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleClick}
              disabled={isDisabled}
              size="icon"
              className={cn(
                "rounded-full transition-all duration-200",
                canCall
                  ? "bg-eats hover:bg-eats/90 text-white"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
                isStartingCall && "animate-pulse",
                className
              )}
            >
              {isStartingCall ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {canCall ? label : `${roleLabels[targetRole]} phone not available`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Button with label
  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant={variant === "outline" ? "outline" : "default"}
      size={size}
      className={cn(
        "gap-2 transition-all duration-200",
        variant === "default" && canCall && "bg-eats hover:bg-eats/90",
        !canCall && "opacity-50 cursor-not-allowed",
        isStartingCall && "animate-pulse",
        className
      )}
    >
      {isStartingCall ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Phone className="w-4 h-4" />
      )}
      {showLabel && <span>{label}</span>}
    </Button>
  );
}
