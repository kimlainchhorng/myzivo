/**
 * EatsOrderCard Component
 * Driver view of an assigned Eats delivery order with actions
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Package, 
  Clock, 
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Store,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MaskedCallButton } from "@/components/eats/MaskedCallButton";
import type { DriverEatsOrder } from "@/hooks/useDriverEatsOrders";

interface EatsOrderCardProps {
  order: DriverEatsOrder;
  onPickedUp: (orderId: string) => void;
  onDelivered: (orderId: string) => void;
  onUnassign: (orderId: string) => void;
  isLoading?: boolean;
}

export function EatsOrderCard({
  order,
  onPickedUp,
  onDelivered,
  onUnassign,
  isLoading = false,
}: EatsOrderCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [confirmUnassign, setConfirmUnassign] = useState(false);

  const payout = order.driver_payout_cents ? (order.driver_payout_cents / 100).toFixed(2) : null;
  const isPickedUp = order.picked_up_at != null || order.status === "in_progress";
  
  // Open navigation to address
  const handleNavigate = (address: string | null, lat?: number | null, lng?: number | null) => {
    if (!address && !lat) return;
    
    let url: string;
    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || "")}`;
    }
    window.open(url, "_blank");
  };

  const getStatusColor = () => {
    if (isPickedUp) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  };

  const getStatusText = () => {
    if (isPickedUp) return "En Route to Customer";
    return "Head to Restaurant";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className="bg-zinc-900 border-white/10 overflow-hidden">
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-white">{order.restaurant?.name || "Restaurant"}</p>
                <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
                  {getStatusText()}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {payout && (
                <div className="text-right">
                  <p className="text-green-400 font-bold">${payout}</p>
                  <p className="text-xs text-zinc-500">Payout</p>
                </div>
              )}
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-500" />
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <CardContent className="p-4 pt-0 space-y-4">
              {/* ETA */}
              {order.eta_minutes && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400">ETA:</span>
                  <span className="text-white font-medium">{order.eta_minutes} min</span>
                </div>
              )}

              {/* Pickup Location */}
              {!isPickedUp && (
                <div className="bg-zinc-800/50 rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <Store className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Pickup</p>
                      <p className="text-white font-medium">{order.restaurant?.name}</p>
                      <p className="text-sm text-zinc-400">{order.restaurant?.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-zinc-700"
                      onClick={() => handleNavigate(
                        order.restaurant?.address,
                        order.restaurant?.lat,
                        order.restaurant?.lng
                      )}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Navigate
                    </Button>
                    <MaskedCallButton
                      orderId={order.id}
                      myRole="driver"
                      targetRole="merchant"
                      variant="icon"
                      size="sm"
                    />
                  </div>
                </div>
              )}

              {/* Delivery Location */}
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Delivery</p>
                    <p className="text-sm text-zinc-400">{order.delivery_address || "No address"}</p>
                    {order.customer?.full_name && (
                      <p className="text-white font-medium mt-1">{order.customer.full_name}</p>
                    )}
                  </div>
                </div>
                {isPickedUp && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-zinc-700"
                      onClick={() => handleNavigate(
                        order.delivery_address,
                        order.delivery_lat,
                        order.delivery_lng
                      )}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Navigate
                    </Button>
                    <MaskedCallButton
                      orderId={order.id}
                      myRole="driver"
                      targetRole="customer"
                      variant="icon"
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {!isPickedUp ? (
                  <>
                    <Button
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => onPickedUp(order.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Picked Up
                    </Button>
                    <Button
                      variant="outline"
                      className="border-zinc-700"
                      onClick={() => navigate(`/driver/orders/${order.id}/chat`)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => setConfirmUnassign(true)}
                      disabled={isLoading}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => onDelivered(order.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Delivered
                    </Button>
                    <Button
                      variant="outline"
                      className="border-zinc-700"
                      onClick={() => navigate(`/driver/orders/${order.id}/chat`)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Confirm Unassign Dialog */}
      <AlertDialog open={confirmUnassign} onOpenChange={setConfirmUnassign}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Cancel this delivery?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This order will be reassigned to another driver. Are you sure you can't complete it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white">
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => onUnassign(order.id)}
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
