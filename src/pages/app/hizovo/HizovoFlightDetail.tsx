/**
 * Hizovo Travel App - Flight Detail Screen
 * Shows itinerary, fare rules, and handoff to partner checkout
 */
import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { 
  Plane, Clock, Calendar, Briefcase, ArrowRight, Shield,
  Check, Info, AlertCircle, Wifi, Coffee, Tv, ChevronDown
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getSearchSessionId } from "@/config/trackingParams";

// Demo flight data
const defaultFlight = {
  id: "1",
  airline: "Delta Air Lines",
  airlineCode: "DL",
  flightNumber: "DL 401",
  from: "JFK",
  fromCity: "New York",
  to: "LAX",
  toCity: "Los Angeles",
  price: 199,
  duration: "5h 30m",
  durationMin: 330,
  stops: 0,
  departTime: "08:00",
  departDate: "Feb 15, 2026",
  arriveTime: "11:30",
  arriveDate: "Feb 15, 2026",
  cabinClass: "Economy",
  aircraft: "Boeing 737-800",
  baggageIncluded: "1 carry-on",
  isRefundable: false,
  conditions: {
    changeBeforeDeparture: true,
    refundBeforeDeparture: false,
  }
};

const amenities = [
  { icon: Wifi, label: "WiFi Available", included: true },
  { icon: Coffee, label: "Beverages", included: true },
  { icon: Tv, label: "In-seat Entertainment", included: true },
  { icon: Briefcase, label: "Carry-on Bag", included: true },
];

const HizovoFlightDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flightId } = useParams();
  
  // Get flight from navigation state or use default
  const flight = location.state?.flight || defaultFlight;
  const searchParams = location.state?.searchParams || {};
  
  const [showFareRules, setShowFareRules] = useState(false);

  const handleContinue = () => {
    // Navigate to traveler info collection
    navigate('/app/flights/traveler-info', { 
      state: { 
        flight, 
        searchParams,
        sessionId: getSearchSessionId()
      } 
    });
  };

  return (
    <HizovoAppLayout title="Flight Details" showBack>
      <div className="pb-32">
        {/* Flight Header Card */}
        <div className="p-4">
          <Card className="overflow-hidden">
            <div className="bg-flights/10 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Plane className="w-6 h-6 text-flights" />
                </div>
                <div>
                  <p className="font-bold">{flight.airline}</p>
                  <p className="text-sm text-muted-foreground">{flight.flightNumber} • {flight.aircraft || "Boeing 737"}</p>
                </div>
              </div>
              
              {/* Route */}
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-2xl font-bold">{flight.departTime}</p>
                  <p className="text-sm font-medium">{flight.fromCity || flight.from}</p>
                  <p className="text-xs text-muted-foreground">{flight.from} • {flight.departDate}</p>
                </div>
                <div className="px-4 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground mb-1">{flight.duration}</p>
                  <div className="w-24 h-0.5 bg-flights/30 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-flights rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}
                  </p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-2xl font-bold">{flight.arriveTime}</p>
                  <p className="text-sm font-medium">{flight.toCity || flight.to}</p>
                  <p className="text-xs text-muted-foreground">{flight.to} • {flight.arriveDate || flight.departDate}</p>
                </div>
              </div>
            </div>

            {/* Cabin Info */}
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{flight.cabinClass}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{flight.baggageIncluded || "1 carry-on"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Amenities */}
        <div className="px-4">
          <h3 className="font-semibold mb-3">Included Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {amenities.map((amenity, idx) => (
              <div 
                key={idx}
                className={cn(
                  "p-3 rounded-xl border flex items-center gap-3",
                  amenity.included ? "bg-flights/5 border-flights/20" : "bg-muted/50 border-border"
                )}
              >
                <amenity.icon className={cn(
                  "w-5 h-5",
                  amenity.included ? "text-flights" : "text-muted-foreground"
                )} />
                <span className="text-sm font-medium">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Fare Rules */}
        <div className="px-4">
          <Sheet open={showFareRules} onOpenChange={setShowFareRules}>
            <SheetTrigger asChild>
              <button className="w-full p-4 rounded-xl bg-muted border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Fare Rules & Policies</span>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Fare Rules</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {flight.conditions?.changeBeforeDeparture ? (
                    <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">Flight Changes</p>
                    <p className="text-sm text-muted-foreground">
                      {flight.conditions?.changeBeforeDeparture 
                        ? "Changes allowed before departure (fees may apply)"
                        : "Changes not permitted"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {flight.conditions?.refundBeforeDeparture || flight.isRefundable ? (
                    <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">Cancellations & Refunds</p>
                    <p className="text-sm text-muted-foreground">
                      {flight.conditions?.refundBeforeDeparture || flight.isRefundable
                        ? "Refundable before departure"
                        : "Non-refundable ticket"}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Full terms and conditions will be displayed on the partner's checkout page.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Booking Summary Card */}
        <div className="px-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">{flight.from} → {flight.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{flight.departDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passengers</span>
                  <span className="font-medium">{searchParams.passengers || 1} traveler(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cabin</span>
                  <span className="font-medium">{flight.cabinClass}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="font-bold text-flights">${flight.price * (searchParams.passengers || 1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Disclosure */}
        <div className="px-4 mt-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Secure Partner Checkout</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll complete your booking securely on Hizovo with our licensed travel partner.
                  Hizovo does not issue tickets. Payment and booking fulfillment are handled by licensed travel partners.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <p className="text-2xl font-bold text-flights">${flight.price}</p>
                <p className="text-xs text-muted-foreground">per person</p>
              </div>
              <Button 
                className="flex-1 h-14 rounded-xl font-bold text-lg gap-2 bg-flights hover:bg-flights/90"
                onClick={handleContinue}
              >
                Continue to secure booking <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              Powered by licensed travel partners · Final price confirmed before payment
            </p>
          </div>
        </div>
      </div>
    </HizovoAppLayout>
  );
};

export default HizovoFlightDetail;
