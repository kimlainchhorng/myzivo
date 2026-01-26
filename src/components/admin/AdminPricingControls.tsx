import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Car,
  DollarSign,
  Percent,
  Edit,
  Save,
  X,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { usePricing, useUpdatePricing, useApplyGlobalSurge, Pricing } from "@/hooks/usePricing";

const vehicleIcons: Record<string, string> = {
  economy: "🚗",
  comfort: "🚙",
  premium: "🏎️",
  xl: "🚐",
};

const vehicleDescriptions: Record<string, string> = {
  economy: "Affordable everyday rides",
  comfort: "More space and comfort",
  premium: "Luxury vehicles for special occasions",
  xl: "Large vehicles for groups",
};

const AdminPricingControls = () => {
  const { data: pricingData, isLoading, error } = usePricing();
  const updatePricing = useUpdatePricing();
  const applyGlobalSurge = useApplyGlobalSurge();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Pricing | null>(null);
  const [surgeDialogOpen, setSurgeDialogOpen] = useState(false);
  const [globalSurge, setGlobalSurge] = useState(1.0);

  const handleEdit = (pricing: Pricing) => {
    setEditingId(pricing.id);
    setEditForm({ ...pricing });
  };

  const handleSave = () => {
    if (editForm) {
      updatePricing.mutate({
        id: editForm.id,
        base_fare: editForm.base_fare,
        per_km_rate: editForm.per_km_rate,
        per_minute_rate: editForm.per_minute_rate,
        minimum_fare: editForm.minimum_fare,
        surge_multiplier: editForm.surge_multiplier,
      });
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleToggleActive = (pricing: Pricing) => {
    updatePricing.mutate({ id: pricing.id, is_active: !pricing.is_active });
  };

  const handleApplyGlobalSurge = () => {
    applyGlobalSurge.mutate(globalSurge);
    setSurgeDialogOpen(false);
  };

  const calculateEstimatedFare = (pricing: Pricing, km: number, minutes: number) => {
    const fare = pricing.base_fare + (pricing.per_km_rate * km) + (pricing.per_minute_rate * minutes);
    const surgedFare = fare * pricing.surge_multiplier;
    return Math.max(surgedFare, pricing.minimum_fare);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pricing Controls</h1>
          <p className="text-muted-foreground">Manage fare rates and surge pricing</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load pricing</p>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pricing Controls</h1>
          <p className="text-muted-foreground">Manage fare rates and surge pricing</p>
        </div>
        <Dialog open={surgeDialogOpen} onOpenChange={setSurgeDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Percent className="h-4 w-4" />
              Set Global Surge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Global Surge Multiplier</DialogTitle>
              <DialogDescription>
                Apply a surge multiplier to all vehicle types at once
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="surge" className="w-32">Surge Multiplier</Label>
                <Input
                  id="surge"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={globalSurge}
                  onChange={(e) => setGlobalSurge(parseFloat(e.target.value) || 1)}
                  className="w-24"
                />
                <span className="text-muted-foreground">x</span>
              </div>
              {globalSurge > 1 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">Surge pricing will increase all fares by {((globalSurge - 1) * 100).toFixed(0)}%</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSurgeDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleApplyGlobalSurge} disabled={applyGlobalSurge.isPending}>
                Apply to All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-20" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pricingData?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium">No pricing tiers found</p>
            <p className="text-muted-foreground">Pricing tiers are automatically created when the database is set up.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pricingData?.map((pricing) => (
            <Card key={pricing.id} className={!pricing.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{vehicleIcons[pricing.vehicle_type] || "🚗"}</span>
                    <div>
                      <CardTitle className="capitalize">{pricing.vehicle_type}</CardTitle>
                      <CardDescription>{vehicleDescriptions[pricing.vehicle_type] || "Vehicle type"}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pricing.surge_multiplier > 1 && (
                      <Badge className="bg-orange-500/10 text-orange-600">
                        {pricing.surge_multiplier}x Surge
                      </Badge>
                    )}
                    <Switch
                      checked={pricing.is_active ?? true}
                      onCheckedChange={() => handleToggleActive(pricing)}
                      disabled={updatePricing.isPending}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === pricing.id && editForm ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="baseFare">Base Fare ($)</Label>
                        <Input
                          id="baseFare"
                          type="number"
                          step="0.10"
                          value={editForm.base_fare}
                          onChange={(e) => setEditForm({ ...editForm, base_fare: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="perKmRate">Per KM Rate ($)</Label>
                        <Input
                          id="perKmRate"
                          type="number"
                          step="0.10"
                          value={editForm.per_km_rate}
                          onChange={(e) => setEditForm({ ...editForm, per_km_rate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="perMinuteRate">Per Minute Rate ($)</Label>
                        <Input
                          id="perMinuteRate"
                          type="number"
                          step="0.05"
                          value={editForm.per_minute_rate}
                          onChange={(e) => setEditForm({ ...editForm, per_minute_rate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="minimumFare">Minimum Fare ($)</Label>
                        <Input
                          id="minimumFare"
                          type="number"
                          step="0.50"
                          value={editForm.minimum_fare}
                          onChange={(e) => setEditForm({ ...editForm, minimum_fare: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="surgeMultiplier">Surge Multiplier</Label>
                        <Input
                          id="surgeMultiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={editForm.surge_multiplier}
                          onChange={(e) => setEditForm({ ...editForm, surge_multiplier: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={updatePricing.isPending}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs">Base Fare</span>
                        </div>
                        <p className="text-lg font-semibold">${pricing.base_fare.toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Car className="h-4 w-4" />
                          <span className="text-xs">Per KM</span>
                        </div>
                        <p className="text-lg font-semibold">${pricing.per_km_rate.toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <span className="text-xs">⏱️ Per Minute</span>
                        </div>
                        <p className="text-lg font-semibold">${pricing.per_minute_rate.toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <span className="text-xs">📍 Minimum</span>
                        </div>
                        <p className="text-lg font-semibold">${pricing.minimum_fare.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Estimated fare for 10km, 20min trip</p>
                      <p className="text-xl font-bold text-primary">
                        ${calculateEstimatedFare(pricing, 10, 20).toFixed(2)}
                      </p>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEdit(pricing)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Pricing
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pricing Formula Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Formula</CardTitle>
          <CardDescription>How fares are calculated for each trip</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm">
            <p className="mb-2">
              <span className="text-primary font-semibold">Total Fare</span> = (Base Fare + (Distance × Per KM Rate) + (Duration × Per Minute Rate)) × Surge Multiplier
            </p>
            <p className="text-muted-foreground">
              * If calculated fare is less than Minimum Fare, the Minimum Fare is applied
            </p>
          </div>
          {pricingData && pricingData.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  ${Math.min(...pricingData.map(p => p.base_fare)).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Lowest Base Fare</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  ${Math.max(...pricingData.map(p => p.base_fare)).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Highest Base Fare</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {pricingData.filter(p => p.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Vehicle Types</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {Math.max(...pricingData.map(p => p.surge_multiplier))}x
                </p>
                <p className="text-sm text-muted-foreground">Current Max Surge</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPricingControls;
