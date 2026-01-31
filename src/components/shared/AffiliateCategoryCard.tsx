/**
 * Affiliate Category Card
 * 
 * Used for car categories, hotel types, activity categories
 * Redirects to partner with category-specific search
 */

import { ExternalLink, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { 
  buildCarDeepLink,
  buildHotelDeepLink,
  buildActivityDeepLink,
  getPrimaryPartner,
  AFFILIATE_LINKS,
} from "@/config/affiliateLinks";

type ServiceType = 'cars' | 'hotels' | 'activities';

interface AffiliateCategoryCardProps {
  id: string;
  serviceType: ServiceType;
  category: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  priceFrom?: number;
  badge?: string;
  features?: string[];
  source: string;
  // Search context
  location?: string;
  pickupDate?: string;
  returnDate?: string;
  checkIn?: string;
  checkOut?: string;
  date?: string;
  className?: string;
}

const serviceColors = {
  cars: {
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    text: 'text-violet-500',
    border: 'hover:border-violet-500/50',
  },
  hotels: {
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'hover:border-amber-500/50',
  },
  activities: {
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'hover:border-emerald-500/50',
  },
};

export default function AffiliateCategoryCard({
  id,
  serviceType,
  category,
  title,
  description,
  image,
  icon,
  priceFrom,
  badge,
  features = [],
  source,
  location,
  pickupDate,
  returnDate,
  checkIn,
  checkOut,
  date,
  className,
}: AffiliateCategoryCardProps) {
  const colors = serviceColors[serviceType];
  const partner = getPrimaryPartner(serviceType);

  const handleClick = () => {
    let url: string;
    
    switch (serviceType) {
      case 'cars':
        if (location && pickupDate && returnDate) {
          url = buildCarDeepLink({
            pickupLocation: location,
            pickupDate,
            returnDate,
            vehicleType: category.toLowerCase() as any,
          });
        } else {
          url = AFFILIATE_LINKS.cars.url;
        }
        break;
      case 'hotels':
        if (location && checkIn && checkOut) {
          url = buildHotelDeepLink({
            destination: location,
            checkIn,
            checkOut,
            guests: 2,
            rooms: 1,
          });
        } else {
          url = AFFILIATE_LINKS.hotels.url;
        }
        break;
      case 'activities':
        url = buildActivityDeepLink({
          destination: location || '',
          date,
          category,
        });
        break;
    }
    
    // Track click
    trackAffiliateClick({
      flightId: id,
      airline: partner?.name || 'Partner',
      airlineCode: category.toUpperCase(),
      origin: 'ZIVO',
      destination: location || category,
      price: priceFrom || 0,
      passengers: 1,
      cabinClass: 'standard',
      affiliatePartner: partner?.id || serviceType,
      referralUrl: url,
      source,
      ctaType: 'result_card',
      serviceType: serviceType === 'cars' ? 'car_rental' : serviceType,
    });
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer group transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        colors.border,
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Image or Icon header */}
        {image ? (
          <div className="h-32 relative overflow-hidden">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {badge && (
              <Badge className={cn("absolute top-3 left-3 text-[10px]", colors.bg, colors.text)}>
                {badge}
              </Badge>
            )}
          </div>
        ) : (
          <div className={cn("h-24 flex items-center justify-center", colors.bg)}>
            {icon && <span className="text-5xl">{icon}</span>}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className={cn(
                "font-bold text-base transition-colors",
                `group-hover:${colors.text}`
              )}>
                {title}
              </h3>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            <ArrowRight className={cn(
              "w-4 h-4 text-muted-foreground transition-all",
              "group-hover:translate-x-1",
              `group-hover:${colors.text}`
            )} />
          </div>
          
          {/* Features */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {features.slice(0, 3).map((feature, idx) => (
                <Badge key={idx} variant="secondary" className="text-[10px] py-0">
                  {feature}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Price */}
          {priceFrom !== undefined && (
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">From</span>
              <div className="flex items-center gap-1">
                <span className={cn("font-bold", colors.text)}>${priceFrom}</span>
                <span className="text-xs text-muted-foreground">*</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
