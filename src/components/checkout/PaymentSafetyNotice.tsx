/**
 * Payment Safety Notice
 * PCI compliance and chargeback prevention messaging
 */

import { cn } from "@/lib/utils";
import { Shield, Lock, CreditCard, MessageCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface PaymentSafetyNoticeProps {
  className?: string;
  variant?: "full" | "compact";
}

const PaymentSafetyNotice = ({ 
  className, 
  variant = "full" 
}: PaymentSafetyNoticeProps) => {
  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20",
        className
      )}>
        <Lock className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Secure Payment
          </p>
          <p className="text-xs text-muted-foreground">
            PCI-DSS compliant • Card data not stored
          </p>
        </div>
        <Shield className="w-5 h-5 text-emerald-500/50" />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border border-border/50 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-4 bg-emerald-500/5 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="font-bold text-emerald-600 dark:text-emerald-400">
            Secure Payment
          </h3>
        </div>
      </div>

      {/* Features */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            PCI-DSS compliant payment processing
          </p>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Card data encrypted, not stored by ZIVO
          </p>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Protected by industry-standard security
          </p>
        </div>
      </div>

      {/* Chargeback Prevention Notice */}
      <div className="p-4 bg-muted/30 border-t border-border/50">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Need Help with a Charge?</p>
            <p className="text-xs text-muted-foreground mb-2">
              In case of disputes, please contact ZIVO support before disputing with your bank. 
              We're here to help resolve issues quickly.
            </p>
            <Link 
              to="/help" 
              className="text-xs text-primary hover:underline font-medium"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>

      {/* Fine Print */}
      <div className="px-4 py-3 bg-muted/50 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground text-center">
          All payments are processed by PCI-compliant providers. 
          In case of disputes, documentation is shared with payment providers and partners.
        </p>
      </div>
    </div>
  );
};

export default PaymentSafetyNotice;
