/**
 * Admin Zone Pricing Rates Page
 * Manage ride pricing rates by geographic zone
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Plus, Pencil, Trash2, Loader2, Calculator, DollarSign, TrendingUp, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import {
  useAllZones,
  useZoneRates,
  useUpdateZoneRate,
  useCreateZoneRate,
  useDeleteZoneRate,
  calculateFarePreview,
  ZonePricingRate,
  CreateZonePricingRate,
} from "@/hooks/useZonePricingAdmin";

const DEFAULT_RATE: Omit<ZonePricingRate, "id" | "zone_id" | "created_at" | "updated_at"> = {
  ride_type: "",
  base_fare: 3.50,
  per_mile: 1.75,
  per_minute: 0.35,
  booking_fee: 2.50,
  minimum_fare: 7.00,
  multiplier: 1.0,
};

const ZonePricingRatesPage = () => {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<ZonePricingRate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteRateId, setDeleteRateId] = useState<string | null>(null);
  const [newRate, setNewRate] = useState(DEFAULT_RATE);

  // Data hooks
  const { data: zones, isLoading: zonesLoading } = useAllZones();
  const { data: rates, isLoading: ratesLoading } = useZoneRates(selectedZoneId);
  const updateMutation = useUpdateZoneRate();
  const createMutation = useCreateZoneRate();
  const deleteMutation = useDeleteZoneRate();

  // Set default zone when zones load
  if (zones && zones.length > 0 && !selectedZoneId) {
    setSelectedZoneId(zones[0].id);
  }

  const selectedZone = zones?.find((z) => z.id === selectedZoneId);

  // Stats calculations
  const totalZones = zones?.length ?? 0;
  const ratesInZone = rates?.length ?? 0;
  const lowestBase = rates?.length ? Math.min(...rates.map((r) => r.base_fare)) : 0;
  const highestMulti = rates?.length ? Math.max(...rates.map((r) => r.multiplier)) : 0;

  const handleEditSave = () => {
    if (!editingRate) return;
    updateMutation.mutate({
      id: editingRate.id,
      base_fare: editingRate.base_fare,
      per_mile: editingRate.per_mile,
      per_minute: editingRate.per_minute,
      booking_fee: editingRate.booking_fee,
      minimum_fare: editingRate.minimum_fare,
      multiplier: editingRate.multiplier,
    });
    setIsEditDialogOpen(false);
    setEditingRate(null);
  };

  const handleAddSave = () => {
    if (!selectedZoneId || !newRate.ride_type.trim()) return;
    createMutation.mutate({
      zone_id: selectedZoneId,
      ride_type: newRate.ride_type.toLowerCase().replace(/\s+/g, "_"),
      base_fare: newRate.base_fare,
      per_mile: newRate.per_mile,
      per_minute: newRate.per_minute,
      booking_fee: newRate.booking_fee,
      minimum_fare: newRate.minimum_fare,
      multiplier: newRate.multiplier,
    });
    setIsAddDialogOpen(false);
    setNewRate(DEFAULT_RATE);
  };

  const handleDelete = () => {
    if (!deleteRateId) return;
    deleteMutation.mutate(deleteRateId);
    setDeleteRateId(null);
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <AdminProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Zone Pricing Rates</h1>
              <p className="text-muted-foreground">Manage ride pricing by geographic zone</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedZoneId ?? ""} onValueChange={setSelectedZoneId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select zone..." />
              </SelectTrigger>
              <SelectContent>
                {zones?.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsAddDialogOpen(true)} disabled={!selectedZoneId}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rate
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Layers className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Zones</p>
                  <p className="text-2xl font-bold">{totalZones}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rates in Zone</p>
                  <p className="text-2xl font-bold">{ratesInZone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Calculator className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lowest Base</p>
                  <p className="text-2xl font-bold">{formatCurrency(lowestBase)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Highest Multiplier</p>
                  <p className="text-2xl font-bold">{highestMulti.toFixed(2)}×</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedZone?.name ?? "Select a Zone"}
              {selectedZone?.is_active && <Badge variant="secondary">Active</Badge>}
            </CardTitle>
            <CardDescription>
              {selectedZone
                ? `${selectedZone.state}, ${selectedZone.country} • ${ratesInZone} rate(s) configured`
                : "Choose a zone from the dropdown above"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {zonesLoading || ratesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !selectedZoneId ? (
              <div className="text-center py-12 text-muted-foreground">
                Select a zone to view and manage its pricing rates
              </div>
            ) : rates?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No rates configured for this zone</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Rate
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ride Type</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">/Mile</TableHead>
                    <TableHead className="text-right">/Min</TableHead>
                    <TableHead className="text-right">Booking</TableHead>
                    <TableHead className="text-right">Min Fare</TableHead>
                    <TableHead className="text-right">Multi</TableHead>
                    <TableHead className="text-right">Preview</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates?.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium capitalize">
                        {rate.ride_type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(rate.base_fare)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rate.per_mile)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rate.per_minute)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rate.booking_fee)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rate.minimum_fare)}</TableCell>
                      <TableCell className="text-right">{rate.multiplier.toFixed(2)}×</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(calculateFarePreview(rate))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingRate(rate);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteRateId(rate.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Rate: {editingRate?.ride_type.replace(/_/g, " ")}</DialogTitle>
              <DialogDescription>
                Update pricing for this ride type in {selectedZone?.name}
              </DialogDescription>
            </DialogHeader>
            {editingRate && (
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Base Fare ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={editingRate.base_fare}
                      onChange={(e) =>
                        setEditingRate({ ...editingRate, base_fare: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Per Mile ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="50"
                      value={editingRate.per_mile}
                      onChange={(e) =>
                        setEditingRate({ ...editingRate, per_mile: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Per Minute ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={editingRate.per_minute}
                      onChange={(e) =>
                        setEditingRate({ ...editingRate, per_minute: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Booking Fee ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="25"
                      value={editingRate.booking_fee}
                      onChange={(e) =>
                        setEditingRate({ ...editingRate, booking_fee: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Fare ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="200"
                      value={editingRate.minimum_fare}
                      onChange={(e) =>
                        setEditingRate({ ...editingRate, minimum_fare: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Multiplier</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="10"
                      value={editingRate.multiplier}
                      onChange={(e) =>
                        setEditingRate({ ...editingRate, multiplier: parseFloat(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">Preview (10mi / 25min)</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(calculateFarePreview(editingRate))}
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Rate</DialogTitle>
              <DialogDescription>
                Create a new ride type rate for {selectedZone?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ride Type ID</Label>
                <Input
                  placeholder="e.g., economy, black, lux"
                  value={newRate.ride_type}
                  onChange={(e) => setNewRate({ ...newRate, ride_type: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase, no spaces (underscores allowed)
                </p>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Base Fare ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newRate.base_fare}
                    onChange={(e) =>
                      setNewRate({ ...newRate, base_fare: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Per Mile ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={newRate.per_mile}
                    onChange={(e) =>
                      setNewRate({ ...newRate, per_mile: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Per Minute ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={newRate.per_minute}
                    onChange={(e) =>
                      setNewRate({ ...newRate, per_minute: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Booking Fee ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="25"
                    value={newRate.booking_fee}
                    onChange={(e) =>
                      setNewRate({ ...newRate, booking_fee: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Fare ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="200"
                    value={newRate.minimum_fare}
                    onChange={(e) =>
                      setNewRate({ ...newRate, minimum_fare: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Multiplier</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="10"
                    value={newRate.multiplier}
                    onChange={(e) =>
                      setNewRate({ ...newRate, multiplier: parseFloat(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm text-muted-foreground">Preview (10mi / 25min)</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(calculateFarePreview(newRate))}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSave}
                disabled={createMutation.isPending || !newRate.ride_type.trim()}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Rate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteRateId} onOpenChange={() => setDeleteRateId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Rate?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this rate from {selectedZone?.name}. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminProtectedRoute>
  );
};

export default ZonePricingRatesPage;
