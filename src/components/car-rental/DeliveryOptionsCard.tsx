/**
 * Delivery Options Card
 * Let renters choose delivery/pickup at checkout
 */

import { useState, useEffect } from "react";
import { MapPin, Truck, Clock, AlertCircle, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { VehicleDeliverySettings, DeliveryFeeCalculation } from "@/hooks/useVehicleDelivery";
import { calculateDeliveryFees } from "@/hooks/useVehicleDelivery";

export type DeliveryOption = "self_pickup" | "delivery" | "delivery_and_pickup";

interface DeliveryOptionsCardProps {
  vehicleSettings: VehicleDeliverySettings;
  vehicleAddress: string;
  onOptionChange: (option: DeliveryOption, address: string | null, fees: DeliveryFeeCalculation | null) => void;
  className?: string;
}

export default function DeliveryOptionsCard({
  vehicleSettings,
  vehicleAddress,
  onOptionChange,
  className,
}: DeliveryOptionsCardProps) {
  const [selectedOption, setSelectedOption] = useState<DeliveryOption>("self_pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [estimatedDistance, setEstimatedDistance] = useState(5); // Default 5 miles
  const [fees, setFees] = useState<DeliveryFeeCalculation | null>(null);

  const deliveryAvailable = vehicleSettings.delivery_enabled;
  const pickupAvailable = vehicleSettings.pickup_enabled;

  // Calculate fees when option or distance changes
  useEffect(() => {
    if (selectedOption === "self_pickup") {
      setFees(null);
      onOptionChange("self_pickup", null, null);
    } else {
      const option = selectedOption === "delivery" ? "delivery" : "both";
      const calculated = calculateDeliveryFees(vehicleSettings, estimatedDistance, option);
      setFees(calculated);
      onOptionChange(selectedOption, deliveryAddress || null, calculated);
    }
  }, [selectedOption, estimatedDistance, vehicleSettings, deliveryAddress]);

  const handleOptionChange = (value: DeliveryOption) => {
    setSelectedOption(value);
  };

  if (!deliveryAvailable && !pickupAvailable) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="font-medium">Self Pickup Only</p>
              <p className="text-sm">Pick up and return at owner's location</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="w-5 h-5 text-primary" />
          Delivery Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedOption} onValueChange={handleOptionChange as (v: string) => void}>
          {/* Self Pickup */}
          <div className={cn(
            "flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
            selectedOption === "self_pickup" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
          )}>
            <RadioGroupItem value="self_pickup" id="self_pickup" className="mt-1" />
            <Label htmlFor="self_pickup" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="font-medium">Self Pickup</span>
                <Badge variant="secondary">Free</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Pick up and return at: {vehicleAddress}
              </p>
            </Label>
          </div>

          {/* Delivery Only */}
          {deliveryAvailable && (
            <div className={cn(
              "flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
              selectedOption === "delivery" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            )}>
              <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
              <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Vehicle Delivery</span>
                  {selectedOption === "delivery" && fees && (
                    <Badge className="bg-emerald-100 text-emerald-700">+${fees.deliveryFee.toFixed(2)}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  We deliver the vehicle to your location. Return at owner's location.
                </p>
              </Label>
            </div>
          )}

          {/* Delivery & Pickup */}
          {deliveryAvailable && pickupAvailable && (
            <div className={cn(
              "flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
              selectedOption === "delivery_and_pickup" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            )}>
              <RadioGroupItem value="delivery_and_pickup" id="delivery_and_pickup" className="mt-1" />
              <Label htmlFor="delivery_and_pickup" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Full Service (Delivery & Pickup)</span>
                  {selectedOption === "delivery_and_pickup" && fees && (
                    <Badge className="bg-emerald-100 text-emerald-700">+${fees.totalDeliveryFee.toFixed(2)}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  We deliver and pick up the vehicle at your location.
                </p>
              </Label>
            </div>
          )}
        </RadioGroup>

        {/* Delivery Address Input */}
        {selectedOption !== "self_pickup" && (
          <div className="space-y-3 pt-2 border-t">
            <Label htmlFor="delivery-address">Delivery Address</Label>
            <Input
              id="delivery-address"
              placeholder="Enter your address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />

            {/* Distance estimate (simplified - would integrate with Maps API) */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Estimated distance: ~{estimatedDistance} miles
              </span>
            </div>

            {fees && !fees.isWithinRange && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This address is outside the delivery range ({vehicleSettings.max_delivery_distance_miles} miles max).
                </AlertDescription>
              </Alert>
            )}

            {/* Delivery hours */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                Delivery available: {vehicleSettings.delivery_hours_start} – {vehicleSettings.delivery_hours_end}
              </span>
            </div>
          </div>
        )}

        {/* Fee breakdown */}
        {fees && selectedOption !== "self_pickup" && (
          <div className="p-3 bg-muted/50 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span>${fees.deliveryFee.toFixed(2)}</span>
            </div>
            {selectedOption === "delivery_and_pickup" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pickup fee</span>
                <span>${fees.pickupFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Total delivery fees</span>
              <span className="text-primary">${fees.totalDeliveryFee.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Legal disclosure */}
        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Vehicle delivery and pickup are facilitated by ZIVO Driver partners.
            ZIVO coordinates logistics and payments as part of the rental service.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
