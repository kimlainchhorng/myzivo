/**
 * Travel Offer Summary Card
 * Displays selected travel offer details during checkout
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Hotel, CarFront, Calendar, Users, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type TravelServiceType = 'flights' | 'hotels' | 'cars';

interface OfferData {
  partnerName?: string;
  price?: number;
  currency?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  airline?: string;
  cabinClass?: string;
  passengers?: number;
  stops?: number;
  duration?: string;
  hotelName?: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  roomType?: string;
  guests?: number;
  nights?: number;
  carModel?: string;
  carType?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  days?: number;
  features?: string[];
}

interface TravelOfferSummaryProps {
  serviceType: TravelServiceType;
  offerData: OfferData;
  className?: string;
}

const serviceConfig = {
  flights: { icon: Plane, label: "Flight", color: "text-flights", bgColor: "bg-flights/10" },
  hotels: { icon: Hotel, label: "Hotel", color: "text-hotels", bgColor: "bg-hotels/10" },
  cars: { icon: CarFront, label: "Car Rental", color: "text-cars", bgColor: "bg-cars/10" },
};

export default function TravelOfferSummary({ serviceType, offerData, className }: TravelOfferSummaryProps) {
  const config = serviceConfig[serviceType];
  const Icon = config.icon;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try { return format(new Date(dateStr), "EEE, MMM d, yyyy"); } catch { return dateStr; }
  };

  const formatPrice = (price?: number, currency = "USD") => {
    if (!price) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className={cn("px-4 py-3 flex items-center gap-3", config.bgColor)}>
        <div className={cn("p-2 rounded-lg bg-background/80", config.color)}><Icon className="w-5 h-5" /></div>
        <div>
          <p className="font-semibold">{config.label} Booking</p>
          {offerData.partnerName && <p className="text-xs text-muted-foreground">via {offerData.partnerName}</p>}
        </div>
      </div>
      <CardContent className="p-4 space-y-4">
        {serviceType === "flights" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{offerData.origin} → {offerData.destination}</p>
                {offerData.airline && <p className="text-sm text-muted-foreground">{offerData.airline}</p>}
              </div>
              {offerData.stops !== undefined && (
                <Badge variant={offerData.stops === 0 ? "default" : "secondary"}>
                  {offerData.stops === 0 ? "Direct" : `${offerData.stops} stop${offerData.stops > 1 ? "s" : ""}`}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /><span>Depart: {formatDate(offerData.departureDate)}</span></div>
              {offerData.returnDate && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /><span>Return: {formatDate(offerData.returnDate)}</span></div>}
              {offerData.passengers && <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" /><span>{offerData.passengers} passenger{offerData.passengers > 1 ? "s" : ""}</span></div>}
            </div>
          </>
        )}
        {serviceType === "hotels" && (
          <>
            <div><p className="text-lg font-bold">{offerData.hotelName}</p>{offerData.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{offerData.location}</p>}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /><span>Check-in: {formatDate(offerData.checkIn)}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /><span>Check-out: {formatDate(offerData.checkOut)}</span></div>
              {offerData.nights && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /><span>{offerData.nights} night{offerData.nights > 1 ? "s" : ""}</span></div>}
            </div>
          </>
        )}
        {serviceType === "cars" && (
          <>
            <div><p className="text-lg font-bold">{offerData.carModel}</p>{offerData.carType && <Badge variant="outline" className="mt-1">{offerData.carType}</Badge>}</div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /><span>Pickup: {offerData.pickupLocation}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /><span>{formatDate(offerData.pickupDate)} - {formatDate(offerData.dropoffDate)}</span></div>
            </div>
          </>
        )}
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Price</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(offerData.price, offerData.currency)}</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">Final price may vary based on partner checkout</p>
      </CardContent>
    </Card>
  );
}
