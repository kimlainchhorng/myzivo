/**
 * DigitalLedgerSummary - Right-side receipt summary for checkout
 * Displays booking details, line items, and total in a "ledger" style
 */

import { Clock, Plane, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LineItem {
  label: string;
  amount: number;
  type?: "normal" | "discount" | "tax";
}

interface DigitalLedgerSummaryProps {
  flightId?: string;
  holdExpiresAt?: Date;
  route: string;
  lineItems: LineItem[];
  total: number;
  currency?: string;
  className?: string;
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function DigitalLedgerSummary({
  flightId,
  holdExpiresAt,
  route,
  lineItems,
  total,
  currency = "USD",
  className,
}: DigitalLedgerSummaryProps) {
  return (
    <div className={cn(
      "vault-glass rounded-2xl p-6 sticky top-6",
      className
    )}>
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        Booking Summary
      </h3>

      {/* Flight ID & Hold Timer */}
      {(flightId || holdExpiresAt) && (
        <div className="p-4 rounded-xl bg-muted/50 dark:bg-white/5 border border-border/50 mb-6">
          <div className="flex items-center justify-between">
            {flightId && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Flight ID
                </p>
                <p className="text-sm font-mono font-bold text-foreground">
                  {flightId}
                </p>
              </div>
            )}
            {holdExpiresAt && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Hold Expires
                </p>
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono font-bold text-sm">
                    {formatTimeRemaining(holdExpiresAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route & Line Items */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start justify-between py-2">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{route}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-border/50 pt-3 space-y-2">
          {lineItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className={cn(
                item.type === "discount" && "text-success",
                item.type === "tax" && "text-muted-foreground",
                !item.type && "text-foreground"
              )}>
                {item.label}
              </span>
              <span className={cn(
                "font-medium",
                item.type === "discount" && "text-success"
              )}>
                {item.type === "discount" && "-"}
                {formatCurrency(Math.abs(item.amount), currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="border-t-2 border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground">Total Due</span>
          <span className="text-2xl font-black text-foreground tracking-tight">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>

      {/* Price lock notice */}
      <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Price locked for 15 minutes. Complete payment to secure this rate.
          </p>
        </div>
      </div>
    </div>
  );
}