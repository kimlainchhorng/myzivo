import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MapPin, 
  Navigation, 
  Phone, 
  Camera,
  CheckCircle,
  Scale
} from 'lucide-react';
import { openNativeNavigation } from '@/utils/nativeNavigation';
import { ProofOfDelivery, ProofOfDeliveryData } from './ProofOfDelivery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export type MoveDeliveryStatus = 
  | 'accepted' 
  | 'at_pickup' 
  | 'picked_up' 
  | 'at_dropoff' 
  | 'delivered';

interface PackageDelivery {
  id: string;
  customerName: string;
  customerPhone?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  packageSize: string;
  packageWeight?: number;
  packageContents?: string;
  estimatedPayout: number;
  deliverySpeed: string;
  notes?: string;
}

interface MoveDeliveryPanelProps {
  delivery: PackageDelivery;
  status: MoveDeliveryStatus;
  onStatusChange: (status: MoveDeliveryStatus) => void;
}

const statusConfig: Record<MoveDeliveryStatus, { label: string; color: string; nextAction?: string }> = {
  accepted: {
    label: 'Heading to Pickup',
    color: 'bg-blue-500',
    nextAction: 'Arrived at Pickup',
  },
  at_pickup: {
    label: 'At Pickup Location',
    color: 'bg-orange-500',
    nextAction: 'Package Picked Up',
  },
  picked_up: {
    label: 'En Route to Dropoff',
    color: 'bg-purple-500',
    nextAction: 'Arrived at Dropoff',
  },
  at_dropoff: {
    label: 'At Dropoff Location',
    color: 'bg-green-500',
    nextAction: 'Complete Delivery',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-600',
  },
};

const packageSizeLabels: Record<string, string> = {
  small: 'Small (fits in hand)',
  medium: 'Medium (fits in bag)',
  large: 'Large (requires 2 hands)',
  extra_large: 'Extra Large (heavy/bulky)',
};

const deliverySpeedLabels: Record<string, { label: string; color: string }> = {
  standard: { label: 'Standard', color: 'bg-gray-500' },
  express: { label: 'Express', color: 'bg-blue-500' },
  priority: { label: 'Priority', color: 'bg-red-500' },
};

export const MoveDeliveryPanel = ({ delivery, status, onStatusChange }: MoveDeliveryPanelProps) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showProofOfDelivery, setShowProofOfDelivery] = useState(false);
  const [showPickupPhoto, setShowPickupPhoto] = useState(false);

  const currentConfig = statusConfig[status];
  const speedConfig = deliverySpeedLabels[delivery.deliverySpeed] || deliverySpeedLabels.standard;

  // Get navigation destination based on status
  const getNavigationDestination = useCallback(() => {
    if (status === 'accepted' || status === 'at_pickup') {
      return {
        lat: delivery.pickupLat,
        lng: delivery.pickupLng,
        label: delivery.pickupAddress,
      };
    }
    return {
      lat: delivery.dropoffLat,
      lng: delivery.dropoffLng,
      label: delivery.dropoffAddress,
    };
  }, [status, delivery]);

  const handleNavigate = () => {
    const dest = getNavigationDestination();
    openNativeNavigation(dest.lat, dest.lng, dest.label);
  };

  const handleCallCustomer = () => {
    if (delivery.customerPhone) {
      window.open(`tel:${delivery.customerPhone}`, '_system');
    }
  };

  const handleStatusUpdate = async (newStatus: MoveDeliveryStatus) => {
    // If picking up, need pickup photo
    if (newStatus === 'picked_up') {
      setShowPickupPhoto(true);
      return;
    }

    // If delivering, need delivery proof
    if (newStatus === 'delivered') {
      setShowProofOfDelivery(true);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('package_deliveries')
        .update({ status: newStatus })
        .eq('id', delivery.id);

      if (error) throw error;

      onStatusChange(newStatus);
      toast.success(`Status updated: ${statusConfig[newStatus].label}`);
      queryClient.invalidateQueries({ queryKey: ['driver-active-trip'] });
    } catch (error: any) {
      toast.error('Failed to update status', { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePickupPhotoSubmit = async (data: ProofOfDeliveryData) => {
    setIsUpdating(true);
    try {
      const updateData: Record<string, any> = {
        status: 'picked_up',
        picked_up_at: new Date().toISOString(),
      };

      if (data.photoBase64) {
        updateData.pickup_photo_url = data.photoBase64;
      }

      const { error } = await supabase
        .from('package_deliveries')
        .update(updateData)
        .eq('id', delivery.id);

      if (error) throw error;

      setShowPickupPhoto(false);
      onStatusChange('picked_up');
      toast.success('Package picked up!');
      queryClient.invalidateQueries({ queryKey: ['driver-active-trip'] });
    } catch (error: any) {
      toast.error('Failed to confirm pickup', { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeliveryProofSubmit = async (data: ProofOfDeliveryData) => {
    setIsUpdating(true);
    try {
      const updateData: Record<string, any> = {
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        actual_payout: delivery.estimatedPayout,
      };

      if (data.photoBase64) {
        updateData.delivery_photo_url = data.photoBase64;
      }

      if (data.signatureBase64) {
        updateData.signature_url = data.signatureBase64;
      }

      const { error } = await supabase
        .from('package_deliveries')
        .update(updateData)
        .eq('id', delivery.id);

      if (error) throw error;

      setShowProofOfDelivery(false);
      onStatusChange('delivered');
      toast.success('Delivery completed! 🎉');
      queryClient.invalidateQueries({ queryKey: ['driver-active-trip'] });
      queryClient.invalidateQueries({ queryKey: ['driver-earnings'] });
    } catch (error: any) {
      toast.error('Failed to complete delivery', { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const getNextStatus = (): MoveDeliveryStatus | null => {
    switch (status) {
      case 'accepted': return 'at_pickup';
      case 'at_pickup': return 'picked_up';
      case 'picked_up': return 'at_dropoff';
      case 'at_dropoff': return 'delivered';
      default: return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <>
      <Card className="border-purple-200 dark:border-purple-900/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Move Delivery</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge className={speedConfig.color}>
                {speedConfig.label}
              </Badge>
              <Badge className={currentConfig.color}>
                {currentConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pickup Info (show when heading to pickup) */}
          {(status === 'accepted' || status === 'at_pickup') && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase">Pickup Location</p>
                <p className="font-medium">{delivery.pickupAddress}</p>
              </div>
            </div>
          )}

          {/* Dropoff Info (show when en route to dropoff) */}
          {(status === 'picked_up' || status === 'at_dropoff') && (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Navigation className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase">Dropoff Location</p>
                <p className="font-medium">{delivery.dropoffAddress}</p>
                <p className="text-sm text-muted-foreground">{delivery.customerName}</p>
              </div>
              {delivery.customerPhone && (
                <Button variant="ghost" size="icon" onClick={handleCallCustomer}>
                  <Phone className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Package Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{packageSizeLabels[delivery.packageSize] || delivery.packageSize}</p>
              </div>
            </div>
            {delivery.packageWeight && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Weight</p>
                  <p className="font-medium">{delivery.packageWeight} lbs</p>
                </div>
              </div>
            )}
          </div>

          {/* Package Contents */}
          {delivery.packageContents && (
            <div className="text-sm">
              <p className="text-muted-foreground">Contents</p>
              <p className="font-medium">{delivery.packageContents}</p>
            </div>
          )}

          {/* Notes */}
          {delivery.notes && (
            <div className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">{delivery.notes}</p>
            </div>
          )}

          {/* Earnings */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Estimated Payout</span>
            <span className="font-bold text-green-600">${delivery.estimatedPayout.toFixed(2)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleNavigate}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Navigate
            </Button>
            
            {nextStatus && (
              <Button
                className="flex-1"
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  'Updating...'
                ) : nextStatus === 'picked_up' || nextStatus === 'delivered' ? (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    {currentConfig.nextAction}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {currentConfig.nextAction}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pickup Photo Dialog */}
      <ProofOfDelivery
        isOpen={showPickupPhoto}
        onClose={() => setShowPickupPhoto(false)}
        onSubmit={handlePickupPhotoSubmit}
        type="move"
        requireSignature={false}
      />

      {/* Delivery Proof Dialog */}
      <ProofOfDelivery
        isOpen={showProofOfDelivery}
        onClose={() => setShowProofOfDelivery(false)}
        onSubmit={handleDeliveryProofSubmit}
        type="move"
        requireSignature={true}
      />
    </>
  );
};
