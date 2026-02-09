/**
 * High Risk Verification Gate
 * Blocks checkout until required verification is completed
 */

import { Shield, CheckCircle, Phone, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FRAUD_PREVENTION_COPY } from "@/config/fraudPrevention";

interface HighRiskVerificationGateProps {
  /** Current risk score */
  riskScore: number;
  /** User's phone number */
  phoneNumber?: string;
  /** Whether phone is verified */
  phoneVerified?: boolean;
  /** Callback when verification is complete */
  onVerificationComplete: () => void;
  /** Callback to open phone verification */
  onVerifyPhone: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Whether verification is in progress */
  isVerifying?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function HighRiskVerificationGate({
  riskScore,
  phoneNumber,
  phoneVerified = false,
  onVerificationComplete,
  onVerifyPhone,
  onCancel,
  isVerifying = false,
  className,
}: HighRiskVerificationGateProps) {
  const isDeclined = riskScore >= 80;
  const requiresPhoneVerification = riskScore >= 60 && !phoneVerified;

  // If declined, show blocked message
  if (isDeclined) {
    return (
      <div className={cn(
        "rounded-2xl border overflow-hidden",
        "bg-red-500/10 border-red-500/30",
        className
      )}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-600 dark:text-red-400 text-lg mb-2">
                Unable to Process Order
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {FRAUD_PREVENTION_COPY.declined}
              </p>
              <Button
                variant="outline"
                onClick={onCancel}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verification gate
  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden",
      "bg-amber-500/10 border-amber-500/30",
      className
    )}>
      {/* Header */}
      <div className="p-5 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-600 dark:text-amber-400">
              Verification Required
            </h3>
            <p className="text-sm text-muted-foreground">
              {FRAUD_PREVENTION_COPY.highRiskVerification}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="p-5 space-y-4">
        {/* Phone Verification */}
        <div className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          phoneVerified 
            ? "bg-emerald-500/10 border-emerald-500/30" 
            : "bg-background/50 border-border"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              phoneVerified ? "bg-emerald-500/20" : "bg-muted"
            )}>
              {phoneVerified ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Phone className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className={cn(
                "font-medium text-sm",
                phoneVerified && "text-emerald-600 dark:text-emerald-400"
              )}>
                Phone Verification
              </p>
              <p className="text-xs text-muted-foreground">
                {phoneVerified 
                  ? "Verified" 
                  : phoneNumber 
                    ? `Verify ${phoneNumber}` 
                    : "Add and verify phone number"
                }
              </p>
            </div>
          </div>
          
          {!phoneVerified && (
            <Button
              size="sm"
              onClick={onVerifyPhone}
              disabled={isVerifying || !phoneNumber}
              className="bg-primary hover:bg-primary/90"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          )}
        </div>

        {/* Explanation */}
        <p className="text-xs text-muted-foreground text-center px-4">
          We detected unusual activity. Complete verification to proceed securely.
        </p>

        {/* Continue Button */}
        {phoneVerified && (
          <Button
            onClick={onVerificationComplete}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {FRAUD_PREVENTION_COPY.verificationComplete ? "Continue to Checkout" : "Continue"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default HighRiskVerificationGate;
