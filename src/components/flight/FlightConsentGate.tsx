/**
 * Flight Consent Gate Component
 * 
 * OTA Mode: This component is DEPRECATED for flights.
 * 
 * With ZIVO as the OTA (Merchant of Record):
 * - Users book and pay directly on ZIVO
 * - No external redirect needed
 * - Consent is handled on ZIVO checkout page
 * 
 * This component remains for backward compatibility but should
 * not be used in the OTA booking flow. Consider removing in
 * future cleanup.
 * 
 * @deprecated Use direct checkout flow instead
 */

import { useState } from "react";
import { ArrowRight, Shield, Lock, CheckCircle, Plane, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FlightConsentGateProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  flightInfo?: {
    airline: string;
    origin: string;
    destination: string;
    price: number;
    departDate: string;
  };
}

/**
 * @deprecated This component is for legacy affiliate flow.
 * OTA mode uses direct checkout on ZIVO.
 */
export default function FlightConsentGate({
  isOpen,
  onClose,
  onProceed,
  flightInfo,
}: FlightConsentGateProps) {
  const [hasConsented, setHasConsented] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceed = () => {
    if (!hasConsented) return;
    
    setIsProcessing(true);
    
    // Small delay for UX
    setTimeout(() => {
      onProceed();
      setIsProcessing(false);
    }, 300);
  };

  const handleClose = () => {
    setHasConsented(false);
    setIsProcessing(false);
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
            Confirm Booking
          </DialogTitle>
          <DialogDescription className="text-left">
            Review and confirm your flight selection before proceeding to checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Flight Summary */}
          {flightInfo && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200">
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

          {/* OTA Notice */}
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-sky-700 dark:text-sky-400 mb-1">
                  Secure ZIVO Checkout
                </p>
                <p className="text-muted-foreground">
                  Payment is completed securely on ZIVO. Tickets are issued by licensed ticketing partners under airline rules.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
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
                I confirm my booking details are correct
              </Label>
              <p className="text-xs text-muted-foreground">
                By proceeding, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your payment is protected with bank-grade encryption</span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!hasConsented || isProcessing}
            className={cn(
              "w-full sm:w-auto gap-2",
              "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
              "text-white shadow-lg shadow-sky-500/30"
            )}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Continue to Checkout
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
