/**
 * Flight Consent Gate Component
 * 
 * REQUIRED before ANY partner checkout redirect for flights
 * Uses locked compliance text from flightCompliance.ts
 * 
 * Features:
 * - Modal-style consent gate
 * - Required checkbox before proceeding
 * - Partner disclosure
 * - Same-tab redirect (mobile safe)
 */

import { useState } from "react";
import { ExternalLink, Shield, Lock, CheckCircle, Plane, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { FLIGHT_CONSENT, FLIGHT_DISCLAIMERS, FLIGHT_CTA_TEXT, FLIGHT_TRACKING_PARAMS } from "@/config/flightCompliance";
import { trackPartnerCheckoutInitiated } from "@/lib/conversionTracking";
import { cn } from "@/lib/utils";

interface FlightConsentGateProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string;
  flightInfo?: {
    airline: string;
    origin: string;
    destination: string;
    price: number;
    departDate: string;
  };
  searchSessionId?: string;
}

export default function FlightConsentGate({
  isOpen,
  onClose,
  checkoutUrl,
  flightInfo,
  searchSessionId,
}: FlightConsentGateProps) {
  const [hasConsented, setHasConsented] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Build final checkout URL with tracking params
  const buildFinalUrl = () => {
    const url = new URL(checkoutUrl);
    url.searchParams.set('utm_source', FLIGHT_TRACKING_PARAMS.utm_source);
    url.searchParams.set('utm_medium', FLIGHT_TRACKING_PARAMS.utm_medium);
    url.searchParams.set('utm_campaign', FLIGHT_TRACKING_PARAMS.utm_campaign);
    if (searchSessionId) {
      url.searchParams.set('subid', searchSessionId);
    }
    return url.toString();
  };

  const handleProceed = () => {
    if (!hasConsented) return;
    
    setIsRedirecting(true);
    
    // Track conversion event
    trackPartnerCheckoutInitiated({
      service: 'flights',
      eventData: {
        airline: flightInfo?.airline || 'unknown',
        origin: flightInfo?.origin || '',
        destination: flightInfo?.destination || '',
        price: flightInfo?.price || 0,
        sessionId: searchSessionId || '',
      }
    });
    
    // Same-tab redirect (mobile safe)
    const finalUrl = buildFinalUrl();
    
    // Small delay to ensure tracking fires
    setTimeout(() => {
      window.location.href = finalUrl;
    }, 300);
  };

  const handleClose = () => {
    setHasConsented(false);
    setIsRedirecting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-sky-500" />
            </div>
            Partner Checkout
          </DialogTitle>
          <DialogDescription className="text-left">
            You're being redirected to complete your booking with our airline partner.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Flight Summary */}
          {flightInfo && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{flightInfo.airline}</span>
                <Badge variant="secondary" className="text-sky-500">
                  ${flightInfo.price}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{flightInfo.origin}</span>
                <span>→</span>
                <span>{flightInfo.destination}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{flightInfo.departDate}</span>
              </div>
            </div>
          )}

          {/* Partner Disclosure */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">
                  Important Notice
                </p>
                <p className="text-muted-foreground">
                  {FLIGHT_DISCLAIMERS.ticketing}
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox - REQUIRED */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
            <Checkbox
              id="consent"
              checked={hasConsented}
              onCheckedChange={(checked) => setHasConsented(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1.5">
              <Label 
                htmlFor="consent" 
                className="text-sm font-medium cursor-pointer leading-tight"
              >
                {FLIGHT_CONSENT.checkboxLabel}
              </Label>
              <p className="text-xs text-muted-foreground">
                {FLIGHT_CONSENT.description}{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                ·{" "}
                <Link to="/partner-disclosure" className="text-primary hover:underline">
                  Partner Disclosure
                </Link>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{FLIGHT_CONSENT.privacy}</span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!hasConsented || isRedirecting}
            className={cn(
              "w-full sm:w-auto gap-2",
              "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
              "text-white shadow-lg shadow-sky-500/30"
            )}
          >
            {isRedirecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {FLIGHT_CTA_TEXT.primary}
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
