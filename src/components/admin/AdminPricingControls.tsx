import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

// Mock pricing data
const initialPricingData = [
  {
    id: "1",
    vehicleType: "economy",
    baseFare: 2.50,
    perKmRate: 1.20,
    perMinuteRate: 0.20,
    minimumFare: 5.00,
    surgeMultiplier: 1.0,
    isActive: true,
    description: "Affordable everyday rides",
    icon: "🚗",
  },
  {
    id: "2",
    vehicleType: "comfort",
    baseFare: 3.50,
    perKmRate: 1.80,
    perMinuteRate: 0.30,
    minimumFare: 8.00,
    surgeMultiplier: 1.0,
    isActive: true,
    description: "More space and comfort",
    icon: "🚙",
  },
  {
    id: "3",
    vehicleType: "premium",
    baseFare: 5.00,
    perKmRate: 2.50,
    perMinuteRate: 0.45,
    minimumFare: 12.00,
    surgeMultiplier: 1.0,
    isActive: true,
    description: "Luxury vehicles for special occasions",
    icon: "🏎️",
  },
  {
    id: "4",
    vehicleType: "xl",
    baseFare: 4.00,
    perKmRate: 2.00,
    perMinuteRate: 0.35,
    minimumFare: 10.00,
    surgeMultiplier: 1.0,
    isActive: true,
    description: "Large vehicles for groups",
    icon: "🚐",
  },
];

const AdminPricingControls = () => {
  const [pricingData, setPricingData] = useState(initialPricingData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof initialPricingData[0] | null>(null);
  const [surgeDialogOpen, setSurgeDialogOpen] = useState(false);
  const [globalSurge, setGlobalSurge] = useState(1.0);

  const handleEdit = (pricing: typeof initialPricingData[0]) => {
    setEditingId(pricing.id);
    setEditForm({ ...pricing });
  };

  const handleSave = () => {
    if (editForm) {
      setPricingData(prev => 
        prev.map(p => p.id === editForm.id ? editForm : p)
      );
      setEditingId(null);
      setEditForm(null);
      toast.success("Pricing updated successfully");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleToggleActive = (id: string) => {
    setPricingData(prev =>
      prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p)
    );
    toast.success("Vehicle type status updated");
  };

  const handleApplyGlobalSurge = () => {
    setPricingData(prev =>
      prev.map(p => ({ ...p, surgeMultiplier: globalSurge }))
    );
    setSurgeDialogOpen(false);
    toast.success(`Global surge of ${globalSurge}x applied to all vehicle types`);
  };

  const calculateEstimatedFare = (pricing: typeof initialPricingData[0], km: number, minutes: number) => {
    const fare = pricing.baseFare + (pricing.perKmRate * km) + (pricing.perMinuteRate * minutes);
    const surgedFare = fare * pricing.surgeMultiplier;
    return Math.max(surgedFare, pricing.minimumFare);
  };

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
              <Button onClick={handleApplyGlobalSurge}>Apply to All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pricingData.map((pricing) => (
          <Card key={pricing.id} className={!pricing.isActive ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pricing.icon}</span>
                  <div>
                    <CardTitle className="capitalize">{pricing.vehicleType}</CardTitle>
                    <CardDescription>{pricing.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pricing.surgeMultiplier > 1 && (
                    <Badge className="bg-orange-500/10 text-orange-600">
                      {pricing.surgeMultiplier}x Surge
                    </Badge>
                  )}
                  <Switch
                    checked={pricing.isActive}
                    onCheckedChange={() => handleToggleActive(pricing.id)}
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
                        value={editForm.baseFare}
                        onChange={(e) => setEditForm({ ...editForm, baseFare: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="perKmRate">Per KM Rate ($)</Label>
                      <Input
                        id="perKmRate"
                        type="number"
                        step="0.10"
                        value={editForm.perKmRate}
                        onChange={(e) => setEditForm({ ...editForm, perKmRate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="perMinuteRate">Per Minute Rate ($)</Label>
                      <Input
                        id="perMinuteRate"
                        type="number"
                        step="0.05"
                        value={editForm.perMinuteRate}
                        onChange={(e) => setEditForm({ ...editForm, perMinuteRate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minimumFare">Minimum Fare ($)</Label>
                      <Input
                        id="minimumFare"
                        type="number"
                        step="0.50"
                        value={editForm.minimumFare}
                        onChange={(e) => setEditForm({ ...editForm, minimumFare: parseFloat(e.target.value) || 0 })}
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
                        value={editForm.surgeMultiplier}
                        onChange={(e) => setEditForm({ ...editForm, surgeMultiplier: parseFloat(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
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
                      <p className="text-lg font-semibold">${pricing.baseFare.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Car className="h-4 w-4" />
                        <span className="text-xs">Per KM</span>
                      </div>
                      <p className="text-lg font-semibold">${pricing.perKmRate.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <span className="text-xs">⏱️ Per Minute</span>
                      </div>
                      <p className="text-lg font-semibold">${pricing.perMinuteRate.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <span className="text-xs">📍 Minimum</span>
                      </div>
                      <p className="text-lg font-semibold">${pricing.minimumFare.toFixed(2)}</p>
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                ${pricingData.reduce((min, p) => Math.min(min, p.baseFare), Infinity).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Lowest Base Fare</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                ${pricingData.reduce((max, p) => Math.max(max, p.baseFare), 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Highest Base Fare</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {pricingData.filter(p => p.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Vehicle Types</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {Math.max(...pricingData.map(p => p.surgeMultiplier))}x
              </p>
              <p className="text-sm text-muted-foreground">Current Max Surge</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPricingControls;
