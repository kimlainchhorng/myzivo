/**
 * PaymentVaultCheckout - Bank-level secure checkout with Stripe Elements
 * Two-column layout: Payment vault (left) + Digital ledger summary (right)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import VaultSecurityBadges from "./VaultSecurityBadges";
import DigitalLedgerSummary from "./DigitalLedgerSummary";

interface PaymentVaultCheckoutProps {
  flightId?: string;
  holdExpiresAt?: Date;
  route: string;
  lineItems: {
    label: string;
    amount: number;
    type?: "normal" | "discount" | "tax";
  }[];
  total: number;
  currency?: string;
  onPaymentSubmit?: () => Promise<void>;
  isProcessing?: boolean;
  children?: React.ReactNode; // Slot for Stripe Elements
  className?: string;
}

// Stripe appearance configuration for night mode
export const stripeNightAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "hsl(221, 83%, 53%)",
    colorBackground: "hsl(240, 10%, 8%)",
    colorText: "hsl(0, 0%, 100%)",
    colorDanger: "hsl(0, 84%, 60%)",
    borderRadius: "12px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  rules: {
    ".Input": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    ".Input:focus": {
      borderColor: "hsl(221, 83%, 53%)",
      boxShadow: "0 0 0 2px hsla(221, 83%, 53%, 0.2)",
    },
    ".Input::placeholder": {
      color: "rgba(255, 255, 255, 0.4)",
    },
    ".Label": {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "14px",
      fontWeight: "500",
    },
  },
};

export default function PaymentVaultCheckout({
  flightId,
  holdExpiresAt,
  route,
  lineItems,
  total,
  currency = "USD",
  onPaymentSubmit,
  isProcessing = false,
  children,
  className,
}: PaymentVaultCheckoutProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!onPaymentSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onPaymentSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const processing = isProcessing || isSubmitting;

  return (
    <div className={cn("vault-checkout min-h-screen bg-background", className)}>
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - The Vault */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="vault-glass rounded-2xl overflow-hidden">
              {/* Vault Header */}
              <div className="p-6 border-b border-border/50 bg-muted/30 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      Secure Checkout
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Complete your booking securely
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Form Section */}
              <div className="p-6">
                {/* Stripe Elements slot */}
                <div className="mb-6 p-4 rounded-xl bg-muted/30 dark:bg-white/5 border border-border/50">
                  {children || (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm font-medium">Payment Details</span>
                      </div>
                      {/* Placeholder for Stripe PaymentElement */}
                      <div className="h-32 rounded-lg bg-muted/50 dark:bg-white/5 border border-dashed border-border flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                          Stripe PaymentElement will render here
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={processing}
                  className={cn(
                    "w-full h-14 text-base font-bold rounded-2xl gap-2 touch-manipulation min-h-[56px]",
                    "bg-emerald-600 hover:bg-emerald-700 text-white",
                    "shadow-lg shadow-emerald-600/25"
                  )}
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay Securely {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency,
                      }).format(total)}
                    </>
                  )}
                </Button>

                {/* Security badges */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <VaultSecurityBadges variant="horizontal" />
                </div>

                {/* TLS notice */}
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Payments processed by Stripe. Data encrypted via TLS 1.3.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Digital Ledger */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <DigitalLedgerSummary
              flightId={flightId}
              holdExpiresAt={holdExpiresAt}
              route={route}
              lineItems={lineItems}
              total={total}
              currency={currency}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}