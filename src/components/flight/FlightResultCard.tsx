import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plane, Clock, Wifi, Coffee, Tv, Luggage, Star, 
  ChevronDown, ChevronUp, Crown, Leaf, Zap, Shield,
  ArrowRight, Users, Check, Plus, Info, Sparkles,
  ThumbsUp, AlertCircle, BarChart3
} from 'lucide-react';
import { getAirlineLogo } from '@/data/airlines';
import type { GeneratedFlight } from '@/data/flightGenerator';
import { FLIGHT_CTA_TEXT } from '@/config/flightCompliance';

interface FlightResultCardProps {
  flight: GeneratedFlight;
  onSelect: (flight: GeneratedFlight) => void;
  onBook?: (flight: GeneratedFlight) => void;
  onCompare?: (flight: GeneratedFlight, selected: boolean) => void;
  isComparing?: boolean;
  isSelected?: boolean;
  showDetails?: boolean;
  variant?: 'default' | 'compact';
  origin?: string;
  destination?: string;
  passengers?: number;
  cabinClass?: string;
}

const categoryConfig = {
  premium: { 
    label: '5-Star Airline', 
    color: 'bg-gradient-to-r from-amber-500 to-yellow-400', 
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Crown 
  },
  'full-service': { 
    label: 'Full Service', 
    color: 'bg-sky-500', 
    textColor: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    icon: Star 
  },
  'low-cost': { 
    label: 'Budget', 
    color: 'bg-emerald-500', 
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: Zap 
  },
};

export default function FlightResultCard({
  flight,
  onSelect,
  onBook,
  onCompare,
  isComparing = false,
  isSelected = false,
  showDetails = false,
  variant = 'default',
  origin = '',
  destination = '',
  passengers = 1,
  cabinClass = 'economy',
}: FlightResultCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [isHovered, setIsHovered] = useState(false);

  const category = categoryConfig[flight.category || 'full-service'];

  // Internal navigation handler - MoR flow
  const handleSelectFlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Store flight in session for details page
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    sessionStorage.setItem('flightSearchParams', JSON.stringify({
      origin,
      destination,
      passengers,
      cabinClass,
    }));
    
    // Navigate to flight details internally
    navigate(`/flights/details/${flight.id}`);
    
    // Also call onSelect if provided
    onSelect?.(flight);
  };
  
  const CategoryIcon = category.icon;

  const amenities = [
    { key: 'wifi', icon: Wifi, label: 'WiFi', available: flight.wifi },
    { key: 'entertainment', icon: Tv, label: 'Entertainment', available: flight.entertainment },
    { key: 'meals', icon: Coffee, label: 'Meals', available: flight.meals },
    { key: 'power', icon: Zap, label: 'Power', available: flight.amenities?.includes('power') },
  ];

  const onTimeClass = cn(
    "text-sm font-medium",
    (flight.onTimePerformance || 85) >= 90 ? 'text-emerald-400' :
    (flight.onTimePerformance || 85) >= 80 ? 'text-amber-400' : 'text-red-400'
  );

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 border-border/50",
        isHovered && "shadow-lg border-sky-500/30",
        isSelected && "ring-2 ring-sky-500",
        flight.category === 'premium' && "border-amber-500/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Accent */}
      <div className={cn("h-1", category.color)} />
      
      <CardContent className={cn("p-0", variant === 'compact' && "p-3")}>
        {/* Main Content */}
        <div className={cn(
          "p-4 sm:p-5",
          variant === 'compact' && "p-3"
        )}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Compare Checkbox */}
            {onCompare && (
              <div className="absolute top-4 left-4 lg:relative lg:top-auto lg:left-auto">
                <Checkbox
                  checked={isComparing}
                  onCheckedChange={(checked) => onCompare(flight, !!checked)}
                  className="data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                />
              </div>
            )}

            {/* Airline Info */}
            <div className="flex items-center gap-3 lg:w-48">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border shadow-sm",
                "bg-white/95 dark:bg-muted/60",
                category.borderColor
              )}>
              <img 
                  src={flight.logo || getAirlineLogo(flight.airlineCode, 100)} 
                  alt={flight.airline}
                  className="w-12 h-12 object-contain"
                  onError={(e) => { 
                    e.currentTarget.style.display = 'none';
                    // Security: Validate airline code format before using in DOM
                    const safeCode = /^[A-Z0-9]{2,3}$/.test(flight.airlineCode) 
                      ? flight.airlineCode 
                      : '??';
                    const span = document.createElement('span');
                    span.className = 'text-sm font-bold text-muted-foreground';
                    span.textContent = safeCode;
                    e.currentTarget.parentElement!.appendChild(span);
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{flight.airline}</p>
                  {flight.category === 'premium' && (
                    <Crown className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                <p className="text-xs text-muted-foreground/70">{flight.aircraft}</p>
              </div>
            </div>

            {/* Flight Times */}
            <div className="flex-1 flex items-center gap-4 sm:gap-8">
              <div className="text-center min-w-[70px]">
                <p className="text-2xl sm:text-3xl font-bold">{flight.departure.time}</p>
                <p className="text-sm text-muted-foreground">{flight.departure.code}</p>
              </div>

              <div className="flex-1 flex flex-col items-center relative">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {flight.duration}
                </p>
                
                {/* Flight Path */}
                <div className="w-full relative h-0.5">
                  <div className="absolute inset-0 bg-muted" />
                  <div className={cn(
                    "absolute inset-0 origin-left transition-transform duration-500",
                    category.color,
                    isHovered ? "scale-x-100" : "scale-x-0"
                  )} />
                  
                  {/* Dots for stops */}
                  {flight.stops > 0 && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-background" />
                  )}
                  
                  {/* Plane icon */}
                  <div className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 transition-transform duration-300",
                    isHovered && "-translate-x-2"
                  )}>
                    <Plane className={cn("w-4 h-4 rotate-90", category.textColor)} />
                  </div>
                </div>

                <p className={cn(
                  "text-xs mt-2",
                  flight.stops === 0 ? 'text-emerald-400' : 'text-amber-400'
                )}>
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  {flight.stopCities && ` · ${flight.stopCities.join(', ')}`}
                </p>
              </div>

              <div className="text-center min-w-[70px]">
                <p className="text-2xl sm:text-3xl font-bold">{flight.arrival.time}</p>
                <p className="text-sm text-muted-foreground">{flight.arrival.code}</p>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex flex-col items-end gap-2 min-w-[140px]">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">From</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-sky-500">${flight.price}</span>
                  <span className="text-xs text-muted-foreground">*</span>
                </div>
                <p className="text-[10px] text-muted-foreground">per person</p>
                {flight.businessPrice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Business from ${flight.businessPrice}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1">
                {flight.seatsLeft && flight.seatsLeft < 10 && (
                  <Badge variant="outline" className="text-amber-400 border-amber-500/50 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {flight.seatsLeft} left
                  </Badge>
                )}
                <Button 
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 gap-1 shadow-lg shadow-sky-500/20 min-h-[44px] touch-manipulation active:scale-[0.98]"
                  onClick={handleSelectFlight}
                >
                  {FLIGHT_CTA_TEXT.viewDeal}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border/30">
            {/* Category Badge */}
            <Badge className={cn("border-0 gap-1", category.bgColor, category.textColor)}>
              <CategoryIcon className="w-3 h-3" />
              {category.label}
            </Badge>

            {/* Amenities */}
            <div className="flex items-center gap-2">
              {amenities.filter(a => a.available).map(amenity => (
                <div 
                  key={amenity.key}
                  className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center"
                  title={amenity.label}
                >
                  <amenity.icon className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>

            {/* On-Time Performance */}
            <div className="flex items-center gap-1.5 ml-auto">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className={onTimeClass}>{flight.onTimePerformance || 85}% on-time</span>
            </div>

            {/* Carbon */}
            {flight.carbonOffset && (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Leaf className="w-4 h-4" />
                <span className="text-sm">{flight.carbonOffset}kg CO₂</span>
              </div>
            )}

            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>Less <ChevronUp className="w-4 h-4 ml-1" /></>
              ) : (
                <>More <ChevronDown className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-border/30 bg-muted/20 animate-in slide-in-from-top-2 duration-300">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Baggage */}
              <div className="p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Luggage className="w-4 h-4" />
                  <span className="text-sm font-medium">Baggage</span>
                </div>
                <p className="text-sm">{flight.baggageIncluded || 'Personal item + carry-on'}</p>
                {!flight.baggageIncluded?.includes('checked') && (
                  <p className="text-xs text-amber-400 mt-1">Checked bag from $35</p>
                )}
              </div>

              {/* Refund Policy */}
              <div className="p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Flexibility</span>
                </div>
                {flight.refundable ? (
                  <p className="text-sm text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Refundable
                  </p>
                ) : (
                  <p className="text-sm">Non-refundable</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {flight.category === 'premium' ? 'Free changes' : 'Changes from $75'}
                </p>
              </div>

              {/* Aircraft */}
              <div className="p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Plane className="w-4 h-4" />
                  <span className="text-sm font-medium">Aircraft</span>
                </div>
                <p className="text-sm">{flight.aircraft || 'Boeing 787-9'}</p>
                <p className="text-xs text-muted-foreground mt-1">{flight.legroom || '31"'} legroom</p>
              </div>

              {/* Alliance */}
              <div className="p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Alliance</span>
                </div>
                <p className="text-sm">{flight.alliance || 'Independent'}</p>
                <p className="text-xs text-muted-foreground mt-1">Earn miles on partner flights</p>
              </div>
            </div>

            {/* Price Tiers */}
            {(flight.businessPrice || flight.firstPrice) && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge variant="outline" className="py-1.5 px-3">
                  <span className="text-muted-foreground mr-2">Economy</span>
                  <span className="font-bold">${flight.price}</span>
                </Badge>
                {flight.premiumEconomyPrice && (
                  <Badge variant="outline" className="py-1.5 px-3">
                    <span className="text-muted-foreground mr-2">Premium Economy</span>
                    <span className="font-bold">${flight.premiumEconomyPrice}</span>
                  </Badge>
                )}
                {flight.businessPrice && (
                  <Badge variant="outline" className="py-1.5 px-3 border-sky-500/50">
                    <span className="text-sky-400 mr-2">Business</span>
                    <span className="font-bold">${flight.businessPrice}</span>
                  </Badge>
                )}
                {flight.firstPrice && (
                  <Badge variant="outline" className="py-1.5 px-3 border-amber-500/50">
                    <Crown className="w-3 h-3 text-amber-400 mr-1" />
                    <span className="text-amber-400 mr-2">First</span>
                    <span className="font-bold">${flight.firstPrice}</span>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
