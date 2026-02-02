/**
 * Hizovo Travel App - Checkout Handoff Screen
 * Redirects user to partner checkout (in-app browser or external)
 */
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ExternalLink, Shield, Loader2, CheckCircle, 
  ArrowRight, AlertCircle, RefreshCw
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { Button } from "@/components/ui/button";
import { getSearchSessionId, HIZOVO_TRACKING_PARAMS } from "@/config/trackingParams";

const HizovoCheckoutHandoff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { flight, travelerInfo, sessionId } = location.state || {};
  const [status, setStatus] = useState<'preparing' | 'ready' | 'redirected' | 'error'>('preparing');
  const [countdown, setCountdown] = useState(3);
  
  // Build partner checkout URL
  const buildPartnerUrl = () => {
    const baseUrl = "https://book.duffel.com/checkout";
    const params = new URLSearchParams({
      utm_source: HIZOVO_TRACKING_PARAMS.utm_source,
      utm_medium: HIZOVO_TRACKING_PARAMS.utm_medium,
      utm_campaign: HIZOVO_TRACKING_PARAMS.utm_campaign,
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
    
    // In a real app, this would open an in-app browser or external browser
    // For demo, we'll simulate the redirect
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // After "redirect", show booking return option
    setTimeout(() => {
      // Navigate to trips or show return flow
    }, 1000);
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

        {/* Partner Disclosure */}
        <div className="w-full max-w-sm p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Booking completed with our licensed travel partner
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
              Open Checkout Now <ExternalLink className="w-5 h-5" />
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
