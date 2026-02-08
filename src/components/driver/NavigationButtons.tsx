/**
 * NavigationButtons Component
 * 
 * Shows contextual navigation buttons for drivers based on trip/order status.
 * Opens native maps app with turn-by-turn directions.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';
import { openNativeNavigation, isNativePlatform } from '@/utils/nativeNavigation';
import { cn } from '@/lib/utils';

interface NavigationButtonsProps {
  pickupLat?: number | null;
  pickupLng?: number | null;
  pickupAddress?: string;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  dropoffAddress?: string;
  status?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  pickupLat,
  pickupLng,
  pickupAddress,
  dropoffLat,
  dropoffLng,
  dropoffAddress,
  status,
  className,
  variant = 'default',
}) => {
  // Determine which button to show based on status
  const showPickupNav = status && [
    'accepted', 
    'arriving', 
    'assigned',
    'en_route_to_pickup',
  ].includes(status);
  
  const showDropoffNav = status && [
    'in_progress', 
    'picked_up',
    'en_route_to_dropoff',
    'in_transit',
  ].includes(status);

  const handleNavigateToPickup = () => {
    if (pickupLat && pickupLng) {
      openNativeNavigation(pickupLat, pickupLng, pickupAddress);
    }
  };

  const handleNavigateToDropoff = () => {
    if (dropoffLat && dropoffLng) {
      openNativeNavigation(dropoffLat, dropoffLng, dropoffAddress);
    }
  };

  const hasPickupCoords = pickupLat != null && pickupLng != null;
  const hasDropoffCoords = dropoffLat != null && dropoffLng != null;

  // Compact variant for inline use
  if (variant === 'compact') {
    return (
      <div className={cn('flex gap-2', className)}>
        {showPickupNav && hasPickupCoords && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNavigateToPickup}
            className="gap-1.5"
          >
            <Navigation className="h-3.5 w-3.5" />
            Pickup
          </Button>
        )}
        {showDropoffNav && hasDropoffCoords && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNavigateToDropoff}
            className="gap-1.5"
          >
            <MapPin className="h-3.5 w-3.5" />
            Dropoff
          </Button>
        )}
      </div>
    );
  }

  // Default variant with full details
  return (
    <div className={cn('space-y-3', className)}>
      {showPickupNav && hasPickupCoords && (
        <Button
          variant="default"
          size="lg"
          onClick={handleNavigateToPickup}
          className="w-full gap-2 bg-primary hover:bg-primary/90"
        >
          <Navigation className="h-5 w-5" />
          <span className="flex-1 text-left">Navigate to Pickup</span>
          {!isNativePlatform() && <ExternalLink className="h-4 w-4 opacity-50" />}
        </Button>
      )}
      
      {showDropoffNav && hasDropoffCoords && (
        <Button
          variant="default"
          size="lg"
          onClick={handleNavigateToDropoff}
          className="w-full gap-2 bg-primary hover:bg-primary/90"
        >
          <MapPin className="h-5 w-5" />
          <span className="flex-1 text-left">Navigate to Dropoff</span>
          {!isNativePlatform() && <ExternalLink className="h-4 w-4 opacity-50" />}
        </Button>
      )}

      {/* Show both buttons when no specific status or for manual navigation */}
      {!status && (
        <>
          {hasPickupCoords && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleNavigateToPickup}
              className="w-full gap-2"
            >
              <Navigation className="h-5 w-5" />
              <span className="flex-1 text-left truncate">
                {pickupAddress || 'Navigate to Pickup'}
              </span>
              {!isNativePlatform() && <ExternalLink className="h-4 w-4 opacity-50" />}
            </Button>
          )}
          
          {hasDropoffCoords && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleNavigateToDropoff}
              className="w-full gap-2"
            >
              <MapPin className="h-5 w-5" />
              <span className="flex-1 text-left truncate">
                {dropoffAddress || 'Navigate to Dropoff'}
              </span>
              {!isNativePlatform() && <ExternalLink className="h-4 w-4 opacity-50" />}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default NavigationButtons;
