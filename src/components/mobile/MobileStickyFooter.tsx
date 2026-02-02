/**
 * Mobile Sticky Footer CTA Bar
 * Shows context-aware CTAs at bottom of screen on mobile
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileStickyFooterProps {
  children: ReactNode;
  className?: string;
  show?: boolean;
}

const MobileStickyFooter = ({ 
  children, 
  className,
  show = true 
}: MobileStickyFooterProps) => {
  if (!show) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-background/95 backdrop-blur-xl border-t border-border/50",
        "p-3 pb-safe",
        "animate-in slide-in-from-bottom-4 duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {children}
      </div>
    </div>
  );
};

export default MobileStickyFooter;
