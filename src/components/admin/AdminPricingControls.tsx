import { useState } from "react";
import { motion } from "framer-motion";
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
  AlertCircle,
  Zap,
  TrendingUp,
  Calculator,
  Truck,
  Crown
} from "lucide-react";
import { usePricing, useUpdatePricing, useApplyGlobalSurge, Pricing } from "@/hooks/usePricing";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const vehicleIconComponents: Record<string, typeof Car> = {
  economy: Car,
  comfort: Car,
  premium: Crown,
  xl: Truck,
};

const vehicleDescriptions: Record<string, string> = {
  economy: "Affordable everyday rides",
  comfort: "More space and comfort",
  premium: "Luxury vehicles for special occasions",
  xl: "Large vehicles for groups",
};

const vehicleGradients: Record<string, string> = {
  economy: "from-green-500/20 to-emerald-500/10",
  comfort: "from-blue-500/20 to-cyan-500/10",
  premium: "from-purple-500/20 to-pink-500/10",
  xl: "from-amber-500/20 to-orange-500/10",
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
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pricing Controls</h1>
              <p className="text-muted-foreground">Manage fare rates and surge pricing</p>
            </div>
          </div>
        </motion.div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load pricing</p>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10">
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pricing Controls</h1>
            <p className="text-muted-foreground">Manage fare rates and surge pricing</p>
          </div>
        </div>
        <Dialog open={surgeDialogOpen} onOpenChange={setSurgeDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-amber-500/30 hover:bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-500" />
              Set Global Surge
            </Button>
          </DialogTrigger>
          <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Set Global Surge Multiplier
              </DialogTitle>
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
                  className="w-24 bg-background/50"
                />
                <span className="text-muted-foreground">x</span>
              </div>
              {globalSurge > 1 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="text-sm text-amber-500">Surge pricing will increase all fares by {((globalSurge - 1) * 100).toFixed(0)}%</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSurgeDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleApplyGlobalSurge} disabled={applyGlobalSurge.isPending} className="gap-2">
                <Zap className="h-4 w-4" />
                Apply to All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Quick Stats */}
      {pricingData && pricingData.length > 0 && (
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lowest Base</p>
                <p className="text-lg font-semibold">${Math.min(...pricingData.map(p => p.base_fare)).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Base</p>
                <p className="text-lg font-semibold">${Math.max(...pricingData.map(p => p.base_fare)).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Car className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Types</p>
                <p className="text-lg font-semibold">{pricingData.filter(p => p.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Surge</p>
                <p className="text-lg font-semibold">{Math.max(...pricingData.map(p => p.surge_multiplier))}x</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 bg-card/50">
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
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No pricing tiers found</p>
            <p className="text-muted-foreground">Pricing tiers are automatically created when the database is set up.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pricingData?.map((pricing, index) => (
            <motion.div 
              key={pricing.id} 
              variants={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-0 bg-card/50 backdrop-blur-xl transition-opacity ${!pricing.is_active ? "opacity-60" : ""}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${vehicleGradients[pricing.vehicle_type] || "from-gray-500/20 to-gray-500/10"} opacity-30`} />
                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">{(() => { const VIcon = vehicleIconComponents[pricing.vehicle_type] || Car; return <VIcon className="w-5 h-5 text-primary" />; })()}</div>
                      <div>
                        <CardTitle className="capitalize">{pricing.vehicle_type}</CardTitle>
                        <CardDescription>{vehicleDescriptions[pricing.vehicle_type] || "Vehicle type"}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pricing.surge_multiplier > 1 && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
                          <Zap className="h-3 w-3" />
                          {pricing.surge_multiplier}x
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
                <CardContent className="relative">
                  {editingId === pricing.id && editForm ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="baseFare" className="text-xs">Base Fare ($)</Label>
                          <Input
                            id="baseFare"
                            type="number"
                            step="0.10"
                            value={editForm.base_fare}
                            onChange={(e) => setEditForm({ ...editForm, base_fare: parseFloat(e.target.value) || 0 })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="perKmRate" className="text-xs">Per Mile Rate ($)</Label>
                          <Input
                            id="perKmRate"
                            type="number"
                            step="0.10"
                            value={editForm.per_km_rate}
                            onChange={(e) => setEditForm({ ...editForm, per_km_rate: parseFloat(e.target.value) || 0 })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="perMinuteRate" className="text-xs">Per Minute Rate ($)</Label>
                          <Input
                            id="perMinuteRate"
                            type="number"
                            step="0.05"
                            value={editForm.per_minute_rate}
                            onChange={(e) => setEditForm({ ...editForm, per_minute_rate: parseFloat(e.target.value) || 0 })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minimumFare" className="text-xs">Minimum Fare ($)</Label>
                          <Input
                            id="minimumFare"
                            type="number"
                            step="0.50"
                            value={editForm.minimum_fare}
                            onChange={(e) => setEditForm({ ...editForm, minimum_fare: parseFloat(e.target.value) || 0 })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="surgeMultiplier" className="text-xs">Surge Multiplier</Label>
                          <Input
                            id="surgeMultiplier"
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={editForm.surge_multiplier}
                            onChange={(e) => setEditForm({ ...editForm, surge_multiplier: parseFloat(e.target.value) || 1 })}
                            className="bg-background/50"
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
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-xs">Base Fare</span>
                          </div>
                          <p className="text-lg font-semibold">${pricing.base_fare.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Car className="h-3 w-3" />
                            <span className="text-xs">Per Mile</span>
                          </div>
                          <p className="text-lg font-semibold">${pricing.per_km_rate.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                          <div className="text-xs text-muted-foreground mb-1">⏱️ Per Minute</div>
                          <p className="text-lg font-semibold">${pricing.per_minute_rate.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                          <div className="text-xs text-muted-foreground mb-1">📍 Minimum</div>
                          <p className="text-lg font-semibold">${pricing.minimum_fare.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Calculator className="h-3 w-3" />
                          Estimated fare for 10mi, 20min trip
                        </div>
                        <p className="text-xl font-bold text-primary">
                          ${calculateEstimatedFare(pricing, 10, 20).toFixed(2)}
                        </p>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => handleEdit(pricing)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Pricing
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pricing Formula Card */}
      <motion.div variants={item}>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Pricing Formula
            </CardTitle>
            <CardDescription>How fares are calculated for each trip</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-muted/30 font-mono text-sm border border-border/50">
              <p className="mb-2">
                <span className="text-primary font-semibold">Total Fare</span> = (Base Fare + (Distance × Per Mile Rate) + (Duration × Per Minute Rate)) × Surge Multiplier
              </p>
              <p className="text-muted-foreground text-xs">
                * If calculated fare is less than Minimum Fare, the Minimum Fare is applied
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminPricingControls;
