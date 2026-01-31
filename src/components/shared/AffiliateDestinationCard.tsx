/**
 * Affiliate Destination Card
 * 
 * Used for popular destinations, trending deals, and explore sections
 * Each card redirects to partner with dynamic deep link
 */

import { ExternalLink, TrendingUp, MapPin, Plane, Hotel, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { 
  buildFlightDeepLink, 
  buildHotelDeepLink, 
  buildCarDeepLink,
  getPrimaryPartner,
  AFFILIATE_LINKS,
} from "@/config/affiliateLinks";

type ServiceType = 'flights' | 'hotels' | 'cars';

interface AffiliateDestinationCardProps {
  id: string;
  serviceType: ServiceType;
  destination: string;
  destinationCode?: string;
  country?: string;
  image: string;
  price: number;
  priceLabel?: string;
  badge?: string;
  isTrending?: boolean;
  searchCount?: string;
  source: string;
  // For flights
  origin?: string;
  originCode?: string;
  departDate?: string;
  returnDate?: string;
  // For hotels
  checkIn?: string;
  checkOut?: string;
  // For cars
  pickupDate?: string;
  dropoffDate?: string;
  className?: string;
}

const serviceIcons = {
  flights: Plane,
  hotels: Hotel,
  cars: Car,
};

const serviceColors = {
  flights: {
    gradient: 'from-sky-500 to-blue-600',
    text: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  hotels: {
    gradient: 'from-amber-500 to-orange-600',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  cars: {
    gradient: 'from-violet-500 to-purple-600',
    text: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
};

export default function AffiliateDestinationCard({
  id,
  serviceType,
  destination,
  destinationCode,
  country,
  image,
  price,
  priceLabel = 'from',
  badge,
  isTrending = false,
  searchCount,
  source,
  origin,
  originCode,
  departDate,
  returnDate,
  checkIn,
  checkOut,
  pickupDate,
  dropoffDate,
  className,
}: AffiliateDestinationCardProps) {
  const colors = serviceColors[serviceType];
  const ServiceIcon = serviceIcons[serviceType];
  const partner = getPrimaryPartner(serviceType);

  const handleClick = () => {
    let url: string;
    
    // Build deep link based on service type with available params
    switch (serviceType) {
      case 'flights':
        if (originCode && destinationCode && departDate) {
          url = buildFlightDeepLink({
            origin: originCode,
            destination: destinationCode,
            departDate,
            returnDate,
            passengers: 1,
            cabinClass: 'economy',
            tripType: returnDate ? 'roundtrip' : 'oneway',
          });
        } else {
          url = AFFILIATE_LINKS.flights.url;
        }
        break;
      case 'hotels':
        if (checkIn && checkOut) {
          url = buildHotelDeepLink({
            destination,
            checkIn,
            checkOut,
            guests: 2,
            rooms: 1,
          });
        } else {
          url = AFFILIATE_LINKS.hotels.url;
        }
        break;
      case 'cars':
        if (pickupDate && dropoffDate) {
          url = buildCarDeepLink({
            pickupLocation: destination,
            pickupDate,
            returnDate: dropoffDate,
          });
        } else {
          url = AFFILIATE_LINKS.cars.url;
        }
        break;
    }
    
    // Track click
    trackAffiliateClick({
      flightId: id,
      airline: partner?.name || 'Partner',
      airlineCode: destinationCode || serviceType.toUpperCase(),
      origin: origin || 'ZIVO',
      destination,
      price,
      passengers: 1,
      cabinClass: 'economy',
      affiliatePartner: partner?.id || serviceType,
      referralUrl: url,
      source,
      ctaType: 'popular_route',
      serviceType: serviceType === 'cars' ? 'car_rental' : serviceType,
    });
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer group transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        "touch-manipulation active:scale-[0.98]",
        className
      )}
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={destination}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isTrending && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] gap-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </Badge>
          )}
          {badge && (
            <Badge className={cn("text-[10px]", colors.badge)}>
              {badge}
            </Badge>
          )}
        </div>
        
        {/* Service icon */}
        <div className="absolute top-3 right-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-black/50 backdrop-blur-sm"
          )}>
            <ServiceIcon className={cn("w-4 h-4", colors.text)} />
          </div>
        </div>
        
        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-bold text-lg text-white mb-0.5">{destination}</h3>
              {country && (
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <MapPin className="w-3 h-3" />
                  {country}
                </div>
              )}
              {searchCount && (
                <p className="text-white/50 text-[10px] mt-1">{searchCount} searches</p>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-white/70 text-[10px]">{priceLabel}</p>
              <div className="flex items-center gap-1">
                <span className={cn("text-xl font-bold", colors.text)}>${price}</span>
                <span className="text-white/70 text-xs">*</span>
              </div>
              <ExternalLink className="w-3 h-3 text-white/50 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
