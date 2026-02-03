/**
 * Owner Delivery Settings
 * Configure delivery/pickup options for a vehicle
 */

import { useState, useEffect } from "react";
import { Truck, MapPin, DollarSign, Clock, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useVehicleDeliverySettings,
  useUpdateVehicleDeliverySettings,
  type VehicleDeliverySettings,
} from "@/hooks/useVehicleDelivery";

interface OwnerDeliverySettingsProps {
  vehicleId: string;
  className?: string;
}

export default function OwnerDeliverySettings({ vehicleId, className }: OwnerDeliverySettingsProps) {
  const { data: settings, isLoading } = useVehicleDeliverySettings(vehicleId);
  const updateSettings = useUpdateVehicleDeliverySettings();

  const [form, setForm] = useState<VehicleDeliverySettings>({
    delivery_enabled: false,
    max_delivery_distance_miles: 25,
    delivery_fee_type: "flat",
    delivery_base_fee: 25,
    delivery_per_mile_fee: 1.5,
    delivery_hours_start: "08:00",
    delivery_hours_end: "20:00",
    pickup_enabled: false,
    pickup_fee_type: "flat",
    pickup_base_fee: 25,
    pickup_per_mile_fee: 1.5,
  });

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({ vehicleId, settings: form });
  };

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="w-5 h-5 text-primary" />
          Delivery & Pickup Settings
        </CardTitle>
        <CardDescription>
          Offer vehicle delivery and pickup to renters for additional income
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Delivery</Label>
              <p className="text-sm text-muted-foreground">
                Deliver the vehicle to the renter's location
              </p>
            </div>
            <Switch
              checked={form.delivery_enabled}
              onCheckedChange={(checked) => setForm({ ...form, delivery_enabled: checked })}
            />
          </div>

          {form.delivery_enabled && (
            <div className="pl-4 border-l-2 border-primary/20 space-y-4">
              {/* Max Distance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-distance">Max Distance (miles)</Label>
                  <Input
                    id="max-distance"
                    type="number"
                    value={form.max_delivery_distance_miles}
                    onChange={(e) =>
                      setForm({ ...form, max_delivery_distance_miles: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fee Type</Label>
                  <Select
                    value={form.delivery_fee_type}
                    onValueChange={(value: "flat" | "per_mile") =>
                      setForm({ ...form, delivery_fee_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Fee</SelectItem>
                      <SelectItem value="per_mile">Per Mile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fee Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-base-fee">
                    {form.delivery_fee_type === "flat" ? "Flat Fee ($)" : "Base Fee ($)"}
                  </Label>
                  <Input
                    id="delivery-base-fee"
                    type="number"
                    step="0.01"
                    value={form.delivery_base_fee}
                    onChange={(e) =>
                      setForm({ ...form, delivery_base_fee: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                {form.delivery_fee_type === "per_mile" && (
                  <div className="space-y-2">
                    <Label htmlFor="delivery-per-mile">Per Mile ($)</Label>
                    <Input
                      id="delivery-per-mile"
                      type="number"
                      step="0.01"
                      value={form.delivery_per_mile_fee}
                      onChange={(e) =>
                        setForm({ ...form, delivery_per_mile_fee: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-start">Available From</Label>
                  <Input
                    id="delivery-start"
                    type="time"
                    value={form.delivery_hours_start}
                    onChange={(e) => setForm({ ...form, delivery_hours_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-end">Available Until</Label>
                  <Input
                    id="delivery-end"
                    type="time"
                    value={form.delivery_hours_end}
                    onChange={(e) => setForm({ ...form, delivery_hours_end: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Pickup Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Pickup</Label>
              <p className="text-sm text-muted-foreground">
                Pick up the vehicle from the renter's location after rental
              </p>
            </div>
            <Switch
              checked={form.pickup_enabled}
              onCheckedChange={(checked) => setForm({ ...form, pickup_enabled: checked })}
            />
          </div>

          {form.pickup_enabled && (
            <div className="pl-4 border-l-2 border-primary/20 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fee Type</Label>
                  <Select
                    value={form.pickup_fee_type}
                    onValueChange={(value: "flat" | "per_mile") =>
                      setForm({ ...form, pickup_fee_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Fee</SelectItem>
                      <SelectItem value="per_mile">Per Mile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-base-fee">
                    {form.pickup_fee_type === "flat" ? "Flat Fee ($)" : "Base Fee ($)"}
                  </Label>
                  <Input
                    id="pickup-base-fee"
                    type="number"
                    step="0.01"
                    value={form.pickup_base_fee}
                    onChange={(e) =>
                      setForm({ ...form, pickup_base_fee: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              {form.pickup_fee_type === "per_mile" && (
                <div className="space-y-2 max-w-[50%]">
                  <Label htmlFor="pickup-per-mile">Per Mile ($)</Label>
                  <Input
                    id="pickup-per-mile"
                    type="number"
                    step="0.01"
                    value={form.pickup_per_mile_fee}
                    onChange={(e) =>
                      setForm({ ...form, pickup_per_mile_fee: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Earnings Estimate */}
        {(form.delivery_enabled || form.pickup_enabled) && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              💰 Potential extra earnings per booking:
            </p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              ${(
                (form.delivery_enabled ? form.delivery_base_fee : 0) +
                (form.pickup_enabled ? form.pickup_base_fee : 0)
              ).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              After ZIVO service fee (driver payout included)
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="w-full gap-2"
        >
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Delivery Settings
        </Button>
      </CardContent>
    </Card>
  );
}
