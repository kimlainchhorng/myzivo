/**
 * Sponsored Restaurant Card
 * Displays a restaurant with "Sponsored" badge and tracks impressions/clicks
 */

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, Bike } from "lucide-react";
import SponsoredBadge from "@/components/shared/SponsoredBadge";
import { useRecordImpression, useRecordClick } from "@/hooks/useRestaurantAds";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { SponsoredRestaurant } from "@/lib/restaurantAds";

interface SponsoredRestaurantCardProps {
  restaurant: SponsoredRestaurant;
  className?: string;
  variant?: "default" | "compact" | "carousel";
}

const SponsoredRestaurantCard = ({
  restaurant,
  className,
  variant = "default",
}: SponsoredRestaurantCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const impressionRecorded = useRef(false);
  const recordImpression = useRecordImpression();
  const recordClick = useRecordClick();

  // Record impression on mount (once)
  useEffect(() => {
    if (!impressionRecorded.current && restaurant.adId) {
      impressionRecorded.current = true;
      recordImpression.mutate({
        adId: restaurant.adId,
        userId: user?.id || null,
      });
    }
  }, [restaurant.adId, user?.id]);

  const handleClick = async () => {
    // Record click
    if (restaurant.adId) {
      const result = await recordClick.mutateAsync({
        adId: restaurant.adId,
        userId: user?.id || null,
      });

      // Store click for conversion tracking
      if (result) {
        localStorage.setItem(
          `ad_click_${restaurant.id}`,
          JSON.stringify({
            clickId: result,
            adId: restaurant.adId,
            timestamp: Date.now(),
          })
        );
      }
    }

    navigate(`/eats/restaurant/${restaurant.id}`);
  };

  const isCompact = variant === "compact";
  const isCarousel = variant === "carousel";

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02]",
        "border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5",
        isCarousel && "min-w-[280px] w-[280px] flex-shrink-0",
        className
      )}
      onClick={handleClick}
    >
      <div className="relative">
        {/* Restaurant Image */}
        <div
          className={cn(
            "bg-cover bg-center",
            isCompact ? "h-24" : "h-32"
          )}
          style={{
            backgroundImage: restaurant.image_url
              ? `url(${restaurant.image_url})`
              : "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--muted-foreground)/0.2))",
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Sponsored Badge */}
        <div className="absolute top-2 left-2">
          <SponsoredBadge variant="default" size="sm" showTooltip />
        </div>

        {/* Open/Closed Badge */}
        {restaurant.is_open === false && (
          <div className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground text-xs px-2 py-0.5 rounded">
            Closed
          </div>
        )}
      </div>

      <CardContent className={cn("p-3", isCompact && "p-2")}>
        {/* Restaurant Name */}
        <h3 className={cn(
          "font-semibold text-foreground truncate",
          isCompact ? "text-sm" : "text-base"
        )}>
          {restaurant.name}
        </h3>

        {/* Cuisine Type */}
        {restaurant.cuisine_type && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {restaurant.cuisine_type}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {/* Rating */}
          {restaurant.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Delivery Time */}
          {restaurant.delivery_time_min && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{restaurant.delivery_time_min} min</span>
            </div>
          )}

          {/* Delivery Fee */}
          {restaurant.delivery_fee !== null && restaurant.delivery_fee !== undefined && (
            <div className="flex items-center gap-1">
              <Bike className="h-3 w-3" />
              <span>
                {restaurant.delivery_fee === 0
                  ? "Free"
                  : `$${restaurant.delivery_fee.toFixed(2)}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SponsoredRestaurantCard;
