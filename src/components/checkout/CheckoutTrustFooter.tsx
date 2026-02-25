/**
 * Checkout Trust Footer Component
 * Support contact and trust signals for checkout pages
 */

import { Lock, Users, DollarSign, Shield, Mail, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECKOUT_FOOTER } from "@/config/checkoutCompliance";

interface CheckoutTrustFooterProps {
  className?: string;
  showFinalNote?: boolean;
  compact?: boolean;
}

const trustIcons = {
  "Secure payments": Lock,
  "Trusted partners": Users,
  "Transparent pricing": DollarSign,
};

export default function CheckoutTrustFooter({
  className,
  showFinalNote = true,
  compact = false,
}: CheckoutTrustFooterProps) {
  if (compact) {
    return (
      <div className={cn("text-center text-xs text-muted-foreground", className)}>
        <div className="flex items-center justify-center gap-3 flex-wrap mb-2">
          {CHECKOUT_FOOTER.trust.map((item, i) => {
            const Icon = trustIcons[item as keyof typeof trustIcons] || Shield;
            return (
              <span key={i} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {item}
              </span>
            );
          })}
        </div>
        <p>
          {CHECKOUT_FOOTER.help}{" "}
          <a 
            href={`mailto:${CHECKOUT_FOOTER.supportEmail}`}
            className="text-primary hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Trust Signals */}
      <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap py-4 border-t border-b border-border/50 rounded-xl">
        {CHECKOUT_FOOTER.trust.map((item, i) => {
          const Icon = trustIcons[item as keyof typeof trustIcons] || Shield;
          return (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-emerald-500" />
              <span>{item}</span>
            </div>
          );
        })}
      </div>

      {/* Support Section */}
      <div className="text-center">
        <p className="font-medium text-sm mb-1 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          {CHECKOUT_FOOTER.help}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          {CHECKOUT_FOOTER.contact}
        </p>
        <a 
          href={`mailto:${CHECKOUT_FOOTER.supportEmail}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Mail className="w-4 h-4" />
          {CHECKOUT_FOOTER.supportEmail}
        </a>
      </div>

      {/* Final Disclaimer */}
      {showFinalNote && (
        <p className="text-xs text-center text-muted-foreground/70 pt-2">
          {CHECKOUT_FOOTER.final}
        </p>
      )}
    </div>
  );
}
