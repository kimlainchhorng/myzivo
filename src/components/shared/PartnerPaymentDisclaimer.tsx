import { ExternalLink, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface PartnerPaymentDisclaimerProps {
  variant?: 'card' | 'inline' | 'banner';
  className?: string;
}

export default function PartnerPaymentDisclaimer({
  variant = 'card',
  className,
}: PartnerPaymentDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        All bookings, payments, refunds, and changes are handled directly by our travel partners. 
        ZIVO does not collect or process any payments.
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <Alert className={cn("border-sky-500/30 bg-sky-500/5", className)}>
        <ShieldCheck className="h-4 w-4 text-sky-500" />
        <AlertDescription className="text-sm">
          <strong>Payment Information:</strong> ZIVO is a search and comparison platform. 
          All payments are processed securely by our trusted travel partners.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn(
      "p-4 rounded-xl bg-muted/50 border border-border space-y-3",
      className
    )}>
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-sky-500" />
        How Booking Works
      </h4>
      
      <div className="space-y-2">
        {[
          {
            icon: ExternalLink,
            title: "Partner Booking",
            desc: "You will be redirected to our trusted travel partner to complete your booking.",
          },
          {
            icon: CreditCard,
            title: "Secure Payment",
            desc: "All payments are processed directly and securely by our travel partners.",
          },
          {
            icon: RefreshCw,
            title: "Changes & Refunds",
            desc: "For any modifications, cancellations, or refunds, please contact the booking partner directly.",
          },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/50">
        ZIVO does not collect, store, or process any payment information. We may earn a commission 
        when you book through our partner links at no extra cost to you.
      </p>
    </div>
  );
}
