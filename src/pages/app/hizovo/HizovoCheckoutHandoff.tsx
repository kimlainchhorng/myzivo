/**
 * Hizovo Travel App - Checkout Handoff Screen
 * Redirects user to partner checkout (same-tab for mobile safety)
 * 
 * LOCKED COMPLIANCE: Uses flightCompliance.ts for all text
 */
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ExternalLink, Shield, Loader2, CheckCircle, 
  ArrowRight, AlertCircle, RefreshCw, Lock, Plane
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { Button } from "@/components/ui/button";
import { getSearchSessionId, HIZOVO_TRACKING_PARAMS } from "@/config/trackingParams";
import { 
  FLIGHT_DISCLAIMERS, 
  FLIGHT_CTA_TEXT, 
  FLIGHT_TRACKING_PARAMS 
} from "@/config/flightCompliance";
import HeroTrustBar from "@/components/home/HeroTrustBar";

const HizovoCheckoutHandoff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { flight, travelerInfo, sessionId } = location.state || {};
  const [status, setStatus] = useState<'preparing' | 'ready' | 'redirected' | 'error'>('preparing');
  const [countdown, setCountdown] = useState(3);
  
  // Build partner checkout URL with Duffel-compliant tracking
  const buildPartnerUrl = () => {
    const baseUrl = "https://book.duffel.com/checkout";
    const params = new URLSearchParams({
      utm_source: FLIGHT_TRACKING_PARAMS.utm_source,
      utm_medium: FLIGHT_TRACKING_PARAMS.utm_medium,
      utm_campaign: FLIGHT_TRACKING_PARAMS.utm_campaign,
      subid: sessionId || getSearchSessionId(),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  useEffect(() => {
    // Simulate preparation
    const prepTimer = setTimeout(() => {
      setStatus('ready');
    }, 1500);

    return () => clearTimeout(prepTimer);
  }, []);

  useEffect(() => {
    if (status === 'ready') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status]);

  const handleRedirect = () => {
    setStatus('redirected');
    const url = buildPartnerUrl();
    
    // SAME-TAB redirect for mobile safety (required by Duffel)
    // This ensures better UX on mobile browsers
    window.location.href = url;
  };

  const handleManualRedirect = () => {
    handleRedirect();
  };

  const handleReturnFromPartner = () => {
    navigate('/app/trips', { 
      state: { 
        newBooking: {
          flight,
          travelerInfo,
          sessionId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
      }
    });
  };

  return (
    <HizovoAppLayout hideNav hideHeader>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        {/* Status Icon */}
        <div className="relative mb-8">
          {status === 'preparing' && (
            <div className="w-24 h-24 bg-flights/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-flights animate-spin" />
            </div>
          )}
          {status === 'ready' && (
            <div className="w-24 h-24 bg-flights/10 rounded-full flex items-center justify-center relative">
              <Shield className="w-12 h-12 text-flights" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-flights text-white text-sm font-bold rounded-full">
                {countdown}
              </div>
            </div>
          )}
          {status === 'redirected' && (
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="space-y-2 mb-8">
          {status === 'preparing' && (
            <>
              <h2 className="text-xl font-bold">Preparing Checkout</h2>
              <p className="text-muted-foreground">
                Connecting you to our secure travel partner...
              </p>
            </>
          )}
          {status === 'ready' && (
            <>
              <h2 className="text-xl font-bold">Opening Partner Checkout</h2>
              <p className="text-muted-foreground">
                Redirecting in {countdown} seconds...
              </p>
            </>
          )}
          {status === 'redirected' && (
            <>
              <h2 className="text-xl font-bold">Checkout Opened</h2>
              <p className="text-muted-foreground">
                Complete your booking in the partner window.
              </p>
            </>
          )}
        </div>

        {/* Flight Summary */}
        {flight && (
          <div className="w-full max-w-sm p-4 rounded-2xl bg-muted/50 border border-border mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">{flight.from} → {flight.to}</span>
              <span className="font-bold text-flights">${flight.price}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {flight.airline} • {flight.departTime}
            </div>
            {travelerInfo && (
              <div className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border">
                {travelerInfo.firstName} {travelerInfo.lastName}
              </div>
            )}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="w-full max-w-sm mb-4">
          <HeroTrustBar variant="compact" />
        </div>

        {/* Partner Disclosure - LOCKED TEXT */}
        <div className="w-full max-w-sm p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-6">
          <div className="flex items-start gap-2 text-sm">
            <Plane className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-muted-foreground">
              {FLIGHT_DISCLAIMERS.ticketing}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          {status === 'ready' && (
            <Button 
              className="w-full h-14 rounded-xl font-bold text-lg gap-2"
              onClick={handleManualRedirect}
            >
              <Lock className="w-5 h-5" />
              {FLIGHT_CTA_TEXT.primary}
              <ExternalLink className="w-5 h-5" />
            </Button>
          )}
          
          {status === 'redirected' && (
            <>
              <Button 
                variant="outline"
                className="w-full h-14 rounded-xl font-bold gap-2"
                onClick={handleManualRedirect}
              >
                <RefreshCw className="w-5 h-5" />
                Reopen Checkout
              </Button>
              <Button 
                className="w-full h-14 rounded-xl font-bold text-lg gap-2"
                onClick={handleReturnFromPartner}
              >
                Done Booking <ArrowRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground mt-8 max-w-sm">
          If the checkout doesn't open automatically, please allow pop-ups for this site.
        </p>
      </div>
    </HizovoAppLayout>
  );
};

export default HizovoCheckoutHandoff;
