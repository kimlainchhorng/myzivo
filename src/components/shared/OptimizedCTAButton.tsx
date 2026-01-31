/**
 * ZIVO Optimized CTA Button
 * 
 * A/B tested CTA button that automatically uses the correct variant
 * for text, color, and tracks all interactions.
 */

import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCTAText, useCTAColor } from "@/hooks/useABTest";
import type { ServiceType } from "@/lib/abTesting";

interface OptimizedCTAButtonProps {
  service: ServiceType;
  onClick: () => void;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "primary" | "secondary";
  showIcon?: boolean;
  showExternalIcon?: boolean;
  disabled?: boolean;
}

export function OptimizedCTAButton({
  service,
  onClick,
  className,
  size = "lg",
  variant = "primary",
  showIcon = true,
  showExternalIcon = true,
  disabled = false,
}: OptimizedCTAButtonProps) {
  const { primaryText, secondaryText, trackClick: trackTextClick } = useCTAText(service);
  const { className: colorClassName, trackClick: trackColorClick } = useCTAColor(service);
  
  const handleClick = () => {
    // Track both A/B experiments
    trackTextClick();
    trackColorClick();
    onClick();
  };
  
  const buttonText = variant === "primary" ? primaryText : secondaryText;
  
  return (
    <Button
      size={size}
      disabled={disabled}
      className={cn(
        "gap-2 text-white shadow-lg min-h-[48px] touch-manipulation active:scale-[0.98]",
        variant === "primary" ? colorClassName : "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
        className
      )}
      onClick={handleClick}
    >
      {showIcon && <Sparkles className="w-4 h-4" />}
      {buttonText}
      {showExternalIcon && <ExternalLink className="w-4 h-4" />}
    </Button>
  );
}

// Preset buttons for each service
export function FlightCTAButton(props: Omit<OptimizedCTAButtonProps, "service">) {
  return <OptimizedCTAButton service="flights" {...props} />;
}

export function HotelCTAButton(props: Omit<OptimizedCTAButtonProps, "service">) {
  return <OptimizedCTAButton service="hotels" {...props} />;
}

export function CarCTAButton(props: Omit<OptimizedCTAButtonProps, "service">) {
  return <OptimizedCTAButton service="cars" {...props} />;
}

export function ActivityCTAButton(props: Omit<OptimizedCTAButtonProps, "service">) {
  return <OptimizedCTAButton service="activities" {...props} />;
}

export function TransferCTAButton(props: Omit<OptimizedCTAButtonProps, "service">) {
  return <OptimizedCTAButton service="transfers" {...props} />;
}

export function EsimCTAButton(props: Omit<OptimizedCTAButtonProps, "service">) {
  return <OptimizedCTAButton service="esim" {...props} />;
}
