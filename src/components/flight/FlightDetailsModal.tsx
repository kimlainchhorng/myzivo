import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, Clock, Calendar, MapPin, Wifi, Tv, Utensils, 
  Plug, Luggage, ArrowRight, Shield, Leaf, Timer,
  Crown, Star, AlertCircle, Check, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAirlineLogo } from '@/data/airlines';
import { trackAffiliateClick } from '@/lib/affiliateTracking';
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT } from '@/config/affiliateLinks';
import type { GeneratedFlight } from '@/data/flightGenerator';
import { useState } from 'react';

interface FlightDetailsModalProps {
  flight: GeneratedFlight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFlight?: (flight: GeneratedFlight) => void;
}

const amenityIcons: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: 'Wi-Fi' },
  entertainment: { icon: Tv, label: 'Entertainment' },
  meals: { icon: Utensils, label: 'Meals' },
  power: { icon: Plug, label: 'Power Outlets' },
  snacks: { icon: Utensils, label: 'Snacks for Purchase' }
};

export default function FlightDetailsModal({ 
  flight, 
  open, 
  onOpenChange,
  onSelectFlight 
}: FlightDetailsModalProps) {
  const [logoError, setLogoError] = useState(false);
  
  if (!flight) return null;
  
  // Get airline logo from CDN
  const airlineLogo = flight.logo || (flight.airlineCode ? getAirlineLogo(flight.airlineCode) : null);

  const isPremium = flight.category === 'premium';
  const isFullService = flight.category === 'full-service';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/90 dark:bg-muted/60 flex items-center justify-center overflow-hidden border border-border/50">
              {airlineLogo && !logoError ? (
                <img 
                  src={airlineLogo} 
                  alt={flight.airline}
                  className="w-10 h-10 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">{flight.airlineCode || '✈️'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{flight.airline}</span>
                {isPremium && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {flight.bookingLink && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Real Price
                  </Badge>
                )}
              </div>
              <p className="text-sm font-normal text-muted-foreground">
                {flight.flightNumber} • {flight.aircraft}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="flight" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="flight">Flight Details</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="fare">Fare Options</TabsTrigger>
          </TabsList>

          {/* Flight Details Tab */}
          <TabsContent value="flight" className="space-y-4 mt-4">
            {/* Route visualization */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center justify-between">
                {/* Departure */}
                <div className="text-center">
                  <p className="text-3xl font-bold">{flight.departure.time}</p>
                  <p className="text-lg font-semibold">{flight.departure.code}</p>
                  <p className="text-sm text-muted-foreground">{flight.departure.city}</p>
                  {flight.departure.terminal && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Terminal {flight.departure.terminal}
                    </Badge>
                  )}
                </div>

                {/* Flight path */}
                <div className="flex-1 px-6">
                  <div className="relative">
                    <div className="h-0.5 bg-gradient-to-r from-primary via-primary/50 to-primary w-full" />
                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary rotate-90" />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium">{flight.duration}</p>
                    <p className="text-xs text-muted-foreground">
                      {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                {/* Arrival */}
                <div className="text-center">
                  <p className="text-3xl font-bold">{flight.arrival.time}</p>
                  <p className="text-lg font-semibold">{flight.arrival.code}</p>
                  <p className="text-sm text-muted-foreground">{flight.arrival.city}</p>
                  {flight.arrival.terminal && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Terminal {flight.arrival.terminal}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stops info */}
            {flight.stops > 0 && flight.stopCities && (
              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Layover in {flight.stopCities.join(', ')}</p>
                    {flight.stopDurations && (
                      <p className="text-sm text-muted-foreground">
                        Connection time: {flight.stopDurations.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Flight stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-card rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Timer className="w-4 h-4" />
                  On-time Performance
                </div>
                <p className={cn(
                  "text-xl font-bold",
                  flight.onTimePerformance >= 85 ? "text-emerald-400" : 
                  flight.onTimePerformance >= 70 ? "text-amber-400" : "text-red-400"
                )}>
                  {flight.onTimePerformance}%
                </p>
              </div>

              <div className="p-3 bg-card rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Leaf className="w-4 h-4" />
                  Carbon Offset
                </div>
                <p className="text-xl font-bold">{flight.carbonOffset} kg</p>
              </div>

              <div className="p-3 bg-card rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Star className="w-4 h-4" />
                  Alliance
                </div>
                <p className="text-sm font-bold truncate">{flight.alliance}</p>
              </div>
            </div>

            {/* Aircraft info */}
            <div className="p-4 bg-card rounded-xl border border-border/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Aircraft Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Aircraft Type</p>
                  <p className="font-medium">{flight.aircraft}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Seat Pitch</p>
                  <p className="font-medium">{flight.legroom}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {flight.amenities.map(amenity => {
                const info = amenityIcons[amenity];
                if (!info) return null;
                const Icon = info.icon;
                
                return (
                  <div 
                    key={amenity}
                    className="p-4 bg-card rounded-xl border border-border/50 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{info.label}</p>
                      <p className="text-xs text-muted-foreground">Available on this flight</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Baggage info */}
            <div className="p-4 bg-card rounded-xl border border-border/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Luggage className="w-4 h-4" />
                Baggage Allowance
              </h4>
              <p className="text-sm">{flight.baggageIncluded}</p>
            </div>

            {/* Refund policy */}
            <div className={cn(
              "p-4 rounded-xl border",
              flight.refundable 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-muted/30 border-border/50"
            )}>
              <div className="flex items-center gap-3">
                {flight.refundable ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-medium text-emerald-400">Refundable Fare</p>
                      <p className="text-sm text-muted-foreground">Full refund available up to 24h before departure</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Non-refundable</p>
                      <p className="text-sm text-muted-foreground">Changes allowed with fee</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Fare Options Tab */}
          <TabsContent value="fare" className="space-y-3 mt-4">
            {/* Economy */}
            <div className="p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Economy</p>
                  <p className="text-sm text-muted-foreground">Standard seating • {flight.baggageIncluded}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${flight.price}</p>
                  <p className="text-xs text-muted-foreground">per person</p>
                </div>
              </div>
            </div>

            {/* Premium Economy */}
            {flight.premiumEconomyPrice && (
              <div className="p-4 bg-card rounded-xl border border-sky-500/30 hover:border-sky-500/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Premium Economy</p>
                      <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-xs">
                        Extra Legroom
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Extra legroom • Priority boarding • 2 bags</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${flight.premiumEconomyPrice}</p>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>
                </div>
              </div>
            )}

            {/* Business */}
            {flight.businessPrice && (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Business Class</p>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        Lie-flat Seats
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Lie-flat bed • Lounge access • Premium dining</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${flight.businessPrice}</p>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>
                </div>
              </div>
            )}

            {/* First Class */}
            {flight.firstPrice && (
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-500/30 hover:border-amber-500/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">First Class</p>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Suite
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Private suite • Chauffeur service • Fine dining</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${flight.firstPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {/* Affiliate disclosure */}
          <p className="text-xs text-muted-foreground text-center px-2">
            {AFFILIATE_DISCLOSURE_TEXT.short}{' '}
            <a href="/affiliate-disclosure" className="text-sky-500 hover:underline">Learn more</a>
          </p>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            
            <a 
              href={AFFILIATE_LINKS.flights.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold transition-colors"
              onClick={() => {
                trackAffiliateClick({
                  flightId: flight.flightNumber || String(flight.id),
                  airline: flight.airline,
                  airlineCode: flight.airlineCode,
                  origin: flight.departure.code,
                  destination: flight.arrival.code,
                  price: flight.price,
                  passengers: 1,
                  cabinClass: 'economy',
                  affiliatePartner: 'searadar',
                  referralUrl: AFFILIATE_LINKS.flights.url,
                  source: 'flight_modal_primary',
                });
                onSelectFlight?.(flight);
              }}
            >
              <ExternalLink className="w-4 h-4" />
              Book Flight
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
