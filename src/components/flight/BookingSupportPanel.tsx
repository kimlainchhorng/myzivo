/**
 * Booking Support Panel
 * Help panel for /booking/return and /trips pages
 * Clarifies support routing for partner vs Hizivo issues
 */

import { HelpCircle, Mail, ExternalLink, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingSupportPanelProps {
  className?: string;
  partnerName?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export default function BookingSupportPanel({ 
  className, 
  partnerName = "the booking partner",
  variant = 'default' 
}: BookingSupportPanelProps) {
  if (variant === 'inline') {
    return (
      <div className={cn("text-xs text-muted-foreground space-y-1", className)}>
        <p className="flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3 text-sky-500" />
          <span>For changes, cancellations, or refunds, contact {partnerName} shown in your confirmation email.</span>
        </p>
        <p className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-emerald-500" />
          <span>For website issues, contact <a href="mailto:support@hizivo.com" className="text-primary hover:underline">support@hizivo.com</a></span>
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200",
        className
      )}>
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Changes/cancellations/refunds:</strong>{" "}
              Contact {partnerName} shown in your confirmation email.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Website issues:</strong>{" "}
              <a href="mailto:support@hizivo.com" className="text-primary hover:underline">support@hizivo.com</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-sky-500" />
          </div>
          <h3 className="font-semibold">Need help?</h3>
        </div>

        <div className="space-y-4">
          {/* Partner support */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">For booking changes, cancellations, or refunds</p>
                <p className="text-sm text-muted-foreground">
                  Contact {partnerName} directly using the details in your confirmation email. 
                  Hizivo does not process these requests as bookings are completed with our partners.
                </p>
              </div>
            </div>
          </div>

          {/* Hizivo support */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">For website or search issues</p>
                <p className="text-sm text-muted-foreground mb-3">
                  If you're having trouble with our website, search, or account, we're here to help.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:support@hizivo.com">
                    <Mail className="w-4 h-4 mr-2" />
                    support@hizivo.com
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
