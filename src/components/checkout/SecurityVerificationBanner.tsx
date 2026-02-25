/**
 * Security Verification Banner
 * Prominent banner shown when order requires verification
 */

import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FRAUD_PREVENTION_COPY } from "@/config/fraudPrevention";

interface SecurityVerificationBannerProps {
  /** Callback when verify button is clicked */
  onVerify: () => void;
  /** Whether verification is in progress */
  isVerifying?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Compact variant for tight spaces */
  variant?: "default" | "compact";
}

export function SecurityVerificationBanner({
  onVerify,
  isVerifying = false,
  className,
  variant = "default",
}: SecurityVerificationBannerProps) {
  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-xl",
        "bg-amber-500/10 border border-amber-500/30",
        className
      )}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-sm text-amber-600 dark:text-amber-400">
            {FRAUD_PREVENTION_COPY.highRiskVerification}
          </span>
        </div>
        <Button
          size="sm"
          onClick={onVerify}
          disabled={isVerifying}
          className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isVerifying ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "Verify"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-200",
      "bg-amber-500/10 border-amber-500/30",
      className
    )}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
              Verification Required
            </h3>
            <p className="text-sm text-foreground mb-2">
              {FRAUD_PREVENTION_COPY.highRiskVerification}
            </p>
            <p className="text-xs text-muted-foreground">
              This helps protect your account and ensure a secure transaction. 
              Verification typically takes less than a minute.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={onVerify}
            disabled={isVerifying}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2 rounded-xl touch-manipulation active:scale-[0.98] min-h-[44px] transition-all duration-200 shadow-md shadow-amber-500/20"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SecurityVerificationBanner;
