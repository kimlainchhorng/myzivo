/**
 * Partner Consent Modal
 * 
 * Shows disclosure and collects consent before redirecting to partner checkout
 * Required when collecting traveler email/phone
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Shield, Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSearchSessionId } from "@/config/trackingParams";
import { logPartnerRedirect } from "@/lib/partnerRedirectLog";
import { logOutboundClick } from "@/lib/outboundTracking";

export interface PartnerConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerName: string;
  partnerId: string;
  product: "flights" | "hotels" | "cars";
  destinationUrl: string;
  searchParams?: Record<string, unknown>;
  onConfirm?: () => void;
}

export default function PartnerConsentModal({
  open,
  onOpenChange,
  partnerName,
  partnerId,
  product,
  destinationUrl,
  searchParams,
  onConfirm,
}: PartnerConsentModalProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleProceed = async () => {
    if (!consentGiven) return;
    
    setIsRedirecting(true);
    
    try {
      const sessionId = getSearchSessionId();
      
      // Log partner redirect
      await logPartnerRedirect({
        partnerId,
        partnerName,
        searchType: product,
        redirectUrl: destinationUrl,
        checkoutMode: 'redirect',
        searchParams,
        metadata: {
          consentGiven: true,
          consentTimestamp: new Date().toISOString(),
        },
      });
      
      // Log outbound click
      const result = await logOutboundClick({
        partnerId,
        partnerName,
        product,
        pageSource: 'consent_modal',
        destinationUrl,
      });
      
      // Call optional callback
      onConfirm?.();
      
      // Close modal
      onOpenChange(false);
      
      // Open partner site
      window.open(result.finalUrl, '_blank', 'noopener,noreferrer');
      
    } catch (err) {
      console.error('[PartnerConsent] Error:', err);
      // Still try to open the URL
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsRedirecting(false);
    }
  };

  const productLabels = {
    flights: "flight",
    hotels: "hotel",
    cars: "car rental",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Continue to {partnerName}
          </DialogTitle>
          <DialogDescription>
            You're about to complete your {productLabels[product]} booking on our partner site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Partner Disclosure */}
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <Info className="w-4 h-4 text-amber-500" />
            <AlertDescription className="text-sm">
              <strong>Partner Booking Notice:</strong> Hizovo is not the merchant of record. 
              Your booking will be processed and fulfilled by {partnerName}. 
              Final pricing and terms are confirmed on the partner checkout.
            </AlertDescription>
          </Alert>

          {/* What happens */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What happens next:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You'll be redirected to {partnerName}'s secure checkout</li>
              <li>Complete your booking and payment there</li>
              <li>Receive confirmation directly from {partnerName}</li>
            </ul>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="consent"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I agree to share my search details with the booking partner
              </label>
              <p className="text-xs text-muted-foreground">
                Your search criteria will be passed to {partnerName} to show relevant results. 
                View our{" "}
                <a href="/privacy" target="_blank" className="underline hover:text-primary">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/partner-disclosure" target="_blank" className="underline hover:text-primary">
                  Partner Disclosure
                </a>.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRedirecting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!consentGiven || isRedirecting}
            className="w-full sm:w-auto gap-2"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Continue to {partnerName}
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
