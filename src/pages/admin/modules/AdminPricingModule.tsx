/**
 * Admin Pricing Module
 * Zone-based pricing management for Rides and Eats
 */
import { useState } from "react";
import { 
  DollarSign, Car, UtensilsCrossed, Plus, Save, Edit2, Zap, 
  MapPin, Percent, Receipt, AlertCircle, Check, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRideZones, useUpdateRideZone, useEatsZones, useUpdateEatsZone, useUpdateSurgeMultiplier } from "@/hooks/useZonePricing";
import { formatCurrency, RideZone, EatsZone } from "@/lib/pricing";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminPricingModule() {
  const [activeTab, setActiveTab] = useState("rides");
  const [editingZone, setEditingZone] = useState<string | null>(null);

  // Fetch data
  const { data: rideZones, isLoading: ridesLoading } = useRideZones();
  const { data: eatsZones, isLoading: eatsLoading } = useEatsZones();
  
  // Mutations
  const updateRideZone = useUpdateRideZone();
  const updateEatsZone = useUpdateEatsZone();
  const updateSurge = useUpdateSurgeMultiplier();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Pricing Engine
          </h1>
          <p className="text-muted-foreground">Manage zone-based pricing for Rides and Eats</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="rides" className="gap-2">
            <Car className="w-4 h-4" />
            Rides Pricing
          </TabsTrigger>
          <TabsTrigger value="eats" className="gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            Eats Pricing
          </TabsTrigger>
        </TabsList>

        {/* Rides Pricing */}
        <TabsContent value="rides" className="space-y-4">
          {ridesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading zones...</div>
          ) : (
            <>
              {/* Global Surge Control */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Global Surge Control
                  </CardTitle>
                  <CardDescription>Apply surge pricing across all zones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Surge Multiplier</span>
                        <Badge variant="outline" className="font-mono">
                          {rideZones?.[0]?.surge_multiplier || 1.0}x
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">1.0x</span>
                        <Slider
                          value={[rideZones?.[0]?.surge_multiplier || 1]}
                          min={1}
                          max={3}
                          step={0.1}
                          onValueCommit={(value) => {
                            rideZones?.forEach(zone => {
                              updateSurge.mutate({ zoneCode: zone.zone_code, multiplier: value[0] });
                            });
                          }}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground">3.0x</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        rideZones?.forEach(zone => {
                          updateSurge.mutate({ zoneCode: zone.zone_code, multiplier: 1 });
                        });
                      }}
                    >
                      Reset to 1.0x
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Zone Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rideZones?.map((zone) => (
                  <RideZoneCard
                    key={zone.id}
                    zone={zone}
                    isEditing={editingZone === zone.id}
                    onEdit={() => setEditingZone(zone.id)}
                    onCancel={() => setEditingZone(null)}
                    onSave={(updates) => {
                      updateRideZone.mutate({ id: zone.id, ...updates });
                      setEditingZone(null);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Eats Pricing */}
        <TabsContent value="eats" className="space-y-4">
          {eatsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading zones...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eatsZones?.map((zone) => (
                <EatsZoneCard
                  key={zone.id}
                  zone={zone}
                  isEditing={editingZone === zone.id}
                  onEdit={() => setEditingZone(zone.id)}
                  onCancel={() => setEditingZone(null)}
                  onSave={(updates) => {
                    updateEatsZone.mutate({ id: zone.id, ...updates });
                    setEditingZone(null);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pricing Formula Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Pricing Formulas</p>
              <p className="text-muted-foreground">
                <strong>Rides:</strong> max(minimum_fare, (base + distance×per_mile + time×per_minute) × ride_type × surge) + booking_fee<br />
                <strong>Eats:</strong> subtotal + delivery_fee + (subtotal × service_fee%) + small_order_fee + (subtotal × tax_rate) + tip
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== Ride Zone Card ====================

interface RideZoneCardProps {
  zone: RideZone;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updates: Partial<RideZone>) => void;
}

function RideZoneCard({ zone, isEditing, onEdit, onCancel, onSave }: RideZoneCardProps) {
  const [formData, setFormData] = useState(zone);

  const handleSave = () => {
    onSave({
      base_fare: formData.base_fare,
      per_mile_rate: formData.per_mile_rate,
      per_minute_rate: formData.per_minute_rate,
      minimum_fare: formData.minimum_fare,
      booking_fee: formData.booking_fee,
      xl_multiplier: formData.xl_multiplier,
      premium_multiplier: formData.premium_multiplier,
    });
  };

  return (
    <Card className={cn(isEditing && "ring-2 ring-primary")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rides" />
            <CardTitle className="text-base">{zone.city_name}</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{zone.zone_code}</Badge>
        </div>
        {zone.surge_multiplier > 1 && (
          <Badge className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Zap className="w-3 h-3 mr-1" />
            {zone.surge_multiplier}x Surge Active
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Base Fare</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.base_fare}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_fare: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Per Mile</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.per_mile_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, per_mile_rate: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Per Minute</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.per_minute_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, per_minute_rate: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Minimum Fare</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minimum_fare}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_fare: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Booking Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.booking_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, booking_fee: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">XL Multiplier</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.xl_multiplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, xl_multiplier: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave} className="flex-1 gap-1">
                <Check className="w-3 h-3" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base</span>
                <span className="font-medium">{formatCurrency(zone.base_fare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Per Mile</span>
                <span className="font-medium">{formatCurrency(zone.per_mile_rate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Per Min</span>
                <span className="font-medium">{formatCurrency(zone.per_minute_rate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum</span>
                <span className="font-medium">{formatCurrency(zone.minimum_fare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking</span>
                <span className="font-medium">{formatCurrency(zone.booking_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">XL</span>
                <span className="font-medium">{zone.xl_multiplier}x</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onEdit} className="w-full gap-1 mt-2">
              <Edit2 className="w-3 h-3" /> Edit Pricing
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== Eats Zone Card ====================

interface EatsZoneCardProps {
  zone: EatsZone;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updates: Partial<EatsZone>) => void;
}

function EatsZoneCard({ zone, isEditing, onEdit, onCancel, onSave }: EatsZoneCardProps) {
  const [formData, setFormData] = useState(zone);

  const handleSave = () => {
    onSave({
      delivery_fee_base: formData.delivery_fee_base,
      delivery_fee_per_mile: formData.delivery_fee_per_mile,
      service_fee_percent: formData.service_fee_percent,
      small_order_fee: formData.small_order_fee,
      small_order_threshold: formData.small_order_threshold,
      tax_rate: formData.tax_rate,
    });
  };

  return (
    <Card className={cn(isEditing && "ring-2 ring-primary")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-eats" />
            <CardTitle className="text-base">{zone.city_name}</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{zone.zone_code}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Delivery Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.delivery_fee_base}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_fee_base: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Service Fee %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.service_fee_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_fee_percent: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Tax Rate</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Small Order Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.small_order_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, small_order_fee: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Small Order Threshold</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.small_order_threshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, small_order_threshold: parseFloat(e.target.value) }))}
                  className="h-8 mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave} className="flex-1 gap-1">
                <Check className="w-3 h-3" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{formatCurrency(zone.delivery_fee_base)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{zone.service_fee_percent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Rate</span>
                <span className="font-medium">{(zone.tax_rate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Small Fee</span>
                <span className="font-medium">{formatCurrency(zone.small_order_fee)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-muted-foreground">Min Order</span>
                <span className="font-medium">{formatCurrency(zone.small_order_threshold)}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onEdit} className="w-full gap-1 mt-2">
              <Edit2 className="w-3 h-3" /> Edit Pricing
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
