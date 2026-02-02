/**
 * Flight Booking Sidebar
 * Price breakdown, consent checkbox, CTA, and trust signals
 */

import { useState } from "react";
import { 
  Lock, 
  ExternalLink, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Briefcase,
  Package,
  Luggage,
  RefreshCw,
  CreditCard,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import FlightConsentCheckbox from "@/components/flight/FlightConsentCheckbox";
import { FLIGHT_CTA_TEXT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { toast } from "@/hooks/use-toast";

interface BaggageInfo {
  personalItem: boolean;
  carryOn: boolean;
  checkedBag: boolean;
  checkedBagWeight?: string;
}

interface FareRules {
  changeable: boolean;
  changeableFee?: string;
  refundable: boolean;
  refundableFee?: string;
}

interface FlightBookingSidebarProps {
  basePrice: number;
  passengers: number;
  cabinClass: string;
  currency?: string;
  baggage?: BaggageInfo;
  fareRules?: FareRules;
  onContinue: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function FlightBookingSidebar({
  basePrice,
  passengers,
  cabinClass,
  currency = "USD",
  baggage = { personalItem: true, carryOn: true, checkedBag: false },
  fareRules = { changeable: true, refundable: false },
  onContinue,
  isLoading = false,
  className,
}: FlightBookingSidebarProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  const totalBase = basePrice * passengers;
  const taxes = totalBase * 0.12;
  const grandTotal = totalBase + taxes;
  const currencySymbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  const cabinLabel = 
    cabinClass === "first" ? "First Class" :
    cabinClass === "business" ? "Business Class" :
    cabinClass === "premium" || cabinClass === "premium_economy" ? "Premium Economy" : "Economy";

  const handleContinue = () => {
    if (!consentChecked) {
      toast({
        title: "Consent Required",
        description: "Please agree to share your information with the booking partner before continuing.",
        variant: "destructive",
      });
      return;
    }
    onContinue();
  };

  return (
    <Card className={cn("sticky top-36 overflow-hidden shadow-xl", className)}>
      {/* Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />

      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Price Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Base fare × {passengers} ({cabinLabel})
            </span>
            <span className="font-medium">{currencySymbol}{totalBase.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxes & fees</span>
            <span className="font-medium">{currencySymbol}{taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-emerald-600">
            <span>ZIVO service fee</span>
            <span>Free</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-bold text-lg">Total</span>
            <span className="text-2xl font-bold text-sky-500">
              {currencySymbol}{grandTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {currencySymbol}{(grandTotal / passengers).toFixed(2)} per person
          </p>
          {/* Trust micro-copy */}
          <p className="text-xs text-emerald-600 text-center font-medium">
            Final price confirmed by airline partner
          </p>
        </div>

        <Separator />

        {/* Baggage Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Baggage Included</h4>
          <div className="grid gap-2">
            <div className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-lg",
              baggage.personalItem ? "bg-emerald-500/10" : "bg-muted/50"
            )}>
              <Briefcase className={cn("w-4 h-4", baggage.personalItem ? "text-emerald-500" : "text-muted-foreground")} />
              <span>Personal item</span>
              {baggage.personalItem ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground ml-auto" />
              )}
            </div>
            <div className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-lg",
              baggage.carryOn ? "bg-emerald-500/10" : "bg-muted/50"
            )}>
              <Package className={cn("w-4 h-4", baggage.carryOn ? "text-emerald-500" : "text-muted-foreground")} />
              <span>Carry-on bag</span>
              {baggage.carryOn ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground ml-auto" />
              )}
            </div>
            <div className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-lg",
              baggage.checkedBag ? "bg-emerald-500/10" : "bg-muted/50"
            )}>
              <Luggage className={cn("w-4 h-4", baggage.checkedBag ? "text-emerald-500" : "text-muted-foreground")} />
              <span>Checked bag {baggage.checkedBagWeight && `(${baggage.checkedBagWeight})`}</span>
              {baggage.checkedBag ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
              ) : (
                <Badge variant="outline" className="ml-auto text-xs">Extra fee</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Fare Rules Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Fare Rules</h4>
          <div className="grid gap-2">
            <div className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-lg",
              fareRules.changeable ? "bg-sky-500/10" : "bg-muted/50"
            )}>
              <RefreshCw className={cn("w-4 h-4", fareRules.changeable ? "text-sky-500" : "text-muted-foreground")} />
              <span>Changeable</span>
              {fareRules.changeable ? (
                <Badge className="ml-auto bg-sky-500/20 text-sky-600 text-xs">
                  {fareRules.changeableFee || "Fee applies"}
                </Badge>
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground ml-auto" />
              )}
            </div>
            <div className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-lg",
              fareRules.refundable ? "bg-emerald-500/10" : "bg-amber-500/10"
            )}>
              <CreditCard className={cn("w-4 h-4", fareRules.refundable ? "text-emerald-500" : "text-amber-500")} />
              <span>Refundable</span>
              {fareRules.refundable ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
              ) : (
                <Badge className="ml-auto bg-amber-500/20 text-amber-600 text-xs">Non-refundable</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Consent Checkbox - REQUIRED */}
        <FlightConsentCheckbox
          checked={consentChecked}
          onCheckedChange={setConsentChecked}
          variant="compact"
        />

        {/* CTA Button */}
        <Button
          onClick={handleContinue}
          disabled={isLoading}
          size="lg"
          className={cn(
            "w-full min-h-[56px] text-base font-bold gap-2 transition-all",
            "bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600",
            "text-white shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40",
            "active:scale-[0.98]"
          )}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              {FLIGHT_CTA_TEXT.primary}
              <ExternalLink className="w-5 h-5" />
            </>
          )}
        </Button>

        {/* Under CTA micro-copy */}
        <p className="text-xs text-center text-muted-foreground">
          You'll complete booking securely with our airline partner.
        </p>

        {/* Trust Icons */}
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <Shield className="w-3 h-3 text-emerald-500" /> Secure partner checkout
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> No hidden fees from ZIVO
          </Badge>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {FLIGHT_DISCLAIMERS.ticketing}
            </p>
          </div>
        </div>

        {/* Support Notice */}
        <div className="p-3 bg-muted/30 rounded-xl">
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {FLIGHT_DISCLAIMERS.support}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
