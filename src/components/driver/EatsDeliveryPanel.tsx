import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UtensilsCrossed, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock,
  CheckCircle,
  Camera
} from 'lucide-react';
import { openNativeNavigation } from '@/utils/nativeNavigation';
import { ProofOfDelivery, ProofOfDeliveryData } from './ProofOfDelivery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export type EatsDeliveryStatus = 
  | 'accepted' 
  | 'at_restaurant' 
  | 'picked_up' 
  | 'arrived_customer' 
  | 'delivered';

interface EatsOrder {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLat: number;
  restaurantLng: number;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  deliveryFee: number;
  totalAmount?: number;
  estimatedTime?: number;
  items?: string[];
}

interface EatsDeliveryPanelProps {
  order: EatsOrder;
  status: EatsDeliveryStatus;
  onStatusChange: (status: EatsDeliveryStatus) => void;
}

const statusConfig: Record<EatsDeliveryStatus, { label: string; color: string; nextAction?: string }> = {
  accepted: {
    label: 'Heading to Restaurant',
    color: 'bg-blue-500',
    nextAction: 'Arrived at Restaurant',
  },
  at_restaurant: {
    label: 'At Restaurant',
    color: 'bg-orange-500',
    nextAction: 'Picked Up Order',
  },
  picked_up: {
    label: 'En Route to Customer',
    color: 'bg-purple-500',
    nextAction: 'Arrived at Customer',
  },
  arrived_customer: {
    label: 'At Delivery Location',
    color: 'bg-green-500',
    nextAction: 'Complete Delivery',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-600',
  },
};

export const EatsDeliveryPanel = ({ order, status, onStatusChange }: EatsDeliveryPanelProps) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showProofOfDelivery, setShowProofOfDelivery] = useState(false);

  const currentConfig = statusConfig[status];

  // Get navigation destination based on status
  const getNavigationDestination = useCallback(() => {
    if (status === 'accepted' || status === 'at_restaurant') {
      return {
        lat: order.restaurantLat,
        lng: order.restaurantLng,
        label: order.restaurantName,
      };
    }
    return {
      lat: order.deliveryLat,
      lng: order.deliveryLng,
      label: order.deliveryAddress,
    };
  }, [status, order]);

  const handleNavigate = () => {
    const dest = getNavigationDestination();
    openNativeNavigation(dest.lat, dest.lng, dest.label);
  };

  const handleCallCustomer = () => {
    if (order.customerPhone) {
      window.open(`tel:${order.customerPhone}`, '_system');
    }
  };

  const handleStatusUpdate = async (newStatus: EatsDeliveryStatus) => {
    if (newStatus === 'delivered') {
      setShowProofOfDelivery(true);
      return;
    }

    setIsUpdating(true);
    try {
      // Map our status to food_orders status
      const dbStatus = newStatus === 'picked_up' ? 'in_progress' : 'in_progress';
      
      const { error } = await supabase
        .from('food_orders')
        .update({ status: dbStatus })
        .eq('id', order.id);

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

  const handleProofOfDeliverySubmit = async (data: ProofOfDeliveryData) => {
    setIsUpdating(true);
    try {
      const updateData: Record<string, any> = {
        status: 'completed',
        completed_at: new Date().toISOString(),
      };

      if (data.photoBase64) {
        // For now, store the base64 directly (in production, upload to storage)
        updateData.delivery_photo_url = data.photoBase64;
      }

      if (data.pin) {
        updateData.delivery_pin = data.pin;
        updateData.delivery_pin_verified = true;
      }

      const { error } = await supabase
        .from('food_orders')
        .update(updateData)
        .eq('id', order.id);

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

  const getNextStatus = (): EatsDeliveryStatus | null => {
    switch (status) {
      case 'accepted': return 'at_restaurant';
      case 'at_restaurant': return 'picked_up';
      case 'picked_up': return 'arrived_customer';
      case 'arrived_customer': return 'delivered';
      default: return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <>
      <Card className="border-orange-200 dark:border-orange-900/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Eats Delivery</CardTitle>
            </div>
            <Badge className={currentConfig.color}>
              {currentConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Restaurant Info (show when heading to restaurant) */}
          {(status === 'accepted' || status === 'at_restaurant') && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{order.restaurantName}</p>
                <p className="text-sm text-muted-foreground">{order.restaurantAddress}</p>
              </div>
            </div>
          )}

          {/* Customer Info (show when heading to customer) */}
          {(status === 'picked_up' || status === 'arrived_customer') && (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Navigation className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
              </div>
              {order.customerPhone && (
                <Button variant="ghost" size="icon" onClick={handleCallCustomer}>
                  <Phone className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Order Items:</p>
              <ul className="list-disc list-inside">
                {order.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Earnings */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Delivery Fee</span>
            <span className="font-bold text-green-600">${order.deliveryFee.toFixed(2)}</span>
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
                ) : nextStatus === 'delivered' ? (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Complete
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

      <ProofOfDelivery
        isOpen={showProofOfDelivery}
        onClose={() => setShowProofOfDelivery(false)}
        onSubmit={handleProofOfDeliverySubmit}
        type="eats"
      />
    </>
  );
};
