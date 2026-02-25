/**
 * Admin Regions Module
 * Manage operational regions with settings and bonuses
 */
import { useState } from "react";
import { format } from "date-fns";
import {
  Globe, Plus, MapPin, Settings, Users, Car, UtensilsCrossed, Package,
  Power, PowerOff, RefreshCw, Loader2, ChevronRight, DollarSign,
  Clock, TrendingUp, Percent, AlertTriangle, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDisableRegion,
  useEnableRegion,
  useUpdateRegionSettings,
  useRegionStats,
} from "@/hooks/useRegions";
import { cn } from "@/lib/utils";
import type { RegionWithSettings, RegionSettings } from "@/types/region";

const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
];

export default function AdminRegionsModule() {
  const { data: regions, isLoading, refetch } = useRegions();
  const createRegion = useCreateRegion();
  const updateRegion = useUpdateRegion();
  const disableRegion = useDisableRegion();
  const enableRegion = useEnableRegion();
  const updateSettings = useUpdateRegionSettings();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionWithSettings | null>(null);
  const [disableReason, setDisableReason] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState<string | null>(null);

  // New region form state
  const [newRegion, setNewRegion] = useState({
    name: "",
    city: "",
    state: "",
    timezone: "America/New_York",
  });

  const activeRegions = regions?.filter(r => r.is_active) || [];
  const disabledRegions = regions?.filter(r => !r.is_active) || [];

  const handleCreateRegion = () => {
    if (!newRegion.name || !newRegion.city || !newRegion.state) return;
    createRegion.mutate(newRegion, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewRegion({ name: "", city: "", state: "", timezone: "America/New_York" });
      },
    });
  };

  const handleDisable = (regionId: string) => {
    disableRegion.mutate({ regionId, reason: disableReason }, {
      onSuccess: () => {
        setShowDisableConfirm(null);
        setDisableReason("");
      },
    });
  };

  const handleEnable = (regionId: string) => {
    enableRegion.mutate(regionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Regions
          </h1>
          <p className="text-muted-foreground">Manage operational regions and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Region
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{regions?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total Regions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-500">{activeRegions.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-500">{disabledRegions.length}</p>
            <p className="text-xs text-muted-foreground">Disabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-500">
              {regions?.reduce((sum, r) => sum + (r.region_settings?.[0]?.rides_enabled ? 1 : 0), 0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">Rides Enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Region Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : regions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No regions configured yet</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Region
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions?.map(region => (
            <RegionCard
              key={region.id}
              region={region}
              onClick={() => setSelectedRegion(region)}
              onEnable={() => handleEnable(region.id)}
              onDisable={() => setShowDisableConfirm(region.id)}
            />
          ))}
        </div>
      )}

      {/* Add Region Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Region</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Region Name</Label>
              <Input
                placeholder="e.g., Miami Metro"
                value={newRegion.name}
                onChange={e => setNewRegion(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  placeholder="e.g., Miami"
                  value={newRegion.city}
                  onChange={e => setNewRegion(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  placeholder="e.g., FL"
                  value={newRegion.state}
                  onChange={e => setNewRegion(prev => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
                  maxLength={2}
                />
              </div>
            </div>
            <div>
              <Label>Timezone</Label>
              <Select
                value={newRegion.timezone}
                onValueChange={v => setNewRegion(prev => ({ ...prev, timezone: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {US_TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleCreateRegion} disabled={createRegion.isPending}>
              {createRegion.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Region
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation */}
      <Dialog open={!!showDisableConfirm} onOpenChange={() => setShowDisableConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              Disable Region?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Disabling a region will immediately force all drivers offline and stop new dispatches.
          </p>
          <div>
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="e.g., Temporary maintenance, Weather conditions..."
              value={disableReason}
              onChange={e => setDisableReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => showDisableConfirm && handleDisable(showDisableConfirm)}
              disabled={disableRegion.isPending}
            >
              {disableRegion.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Disable Region
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Region Detail Sheet */}
      <RegionDetailSheet
        region={selectedRegion}
        onClose={() => setSelectedRegion(null)}
        onUpdateSettings={(updates) => {
          if (selectedRegion) {
            updateSettings.mutate({ regionId: selectedRegion.id, updates });
          }
        }}
      />
    </div>
  );
}

// Region Card Component
function RegionCard({
  region,
  onClick,
  onEnable,
  onDisable,
}: {
  region: RegionWithSettings;
  onClick: () => void;
  onEnable: () => void;
  onDisable: () => void;
}) {
  const settings = region.region_settings?.[0];

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-primary/30",
        !region.is_active && "opacity-60 border-dashed"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className={cn("w-4 h-4", region.is_active ? "text-emerald-500" : "text-gray-400")} />
              {region.city}, {region.state}
            </CardTitle>
            <CardDescription>{region.name}</CardDescription>
          </div>
          <Badge variant={region.is_active ? "default" : "secondary"}>
            {region.is_active ? "Active" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Service Badges */}
        <div className="flex gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              settings?.rides_enabled ? "text-blue-500 border-blue-500/30" : "text-gray-400"
            )}
          >
            <Car className="w-3 h-3 mr-1" />
            Rides
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              settings?.eats_enabled ? "text-orange-500 border-orange-500/30" : "text-gray-400"
            )}
          >
            <UtensilsCrossed className="w-3 h-3 mr-1" />
            Eats
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              settings?.move_enabled ? "text-purple-500 border-purple-500/30" : "text-gray-400"
            )}
          >
            <Package className="w-3 h-3 mr-1" />
            Move
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {settings?.default_commission_pct || 20}% comm
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {settings?.dispatch_mode || "auto"}
          </span>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </Button>
          {region.is_active ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-amber-500 hover:text-amber-600"
              onClick={(e) => {
                e.stopPropagation();
                onDisable();
              }}
            >
              <PowerOff className="w-3 h-3 mr-1" />
              Disable
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-emerald-500 hover:text-emerald-600"
              onClick={(e) => {
                e.stopPropagation();
                onEnable();
              }}
            >
              <Power className="w-3 h-3 mr-1" />
              Enable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Region Detail Sheet
function RegionDetailSheet({
  region,
  onClose,
  onUpdateSettings,
}: {
  region: RegionWithSettings | null;
  onClose: () => void;
  onUpdateSettings: (updates: Partial<RegionSettings>) => void;
}) {
  const { data: stats } = useRegionStats(region?.id || null);
  const settings = region?.region_settings?.[0];

  if (!region) return null;

  return (
    <Sheet open={!!region} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {region.city}, {region.state}
          </SheetTitle>
          <SheetDescription>{region.name}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="settings" className="mt-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-4">
            {/* Services */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Services</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Rides</span>
                  </div>
                  <Switch
                    checked={settings?.rides_enabled ?? true}
                    onCheckedChange={(checked) => onUpdateSettings({ rides_enabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Eats</span>
                  </div>
                  <Switch
                    checked={settings?.eats_enabled ?? true}
                    onCheckedChange={(checked) => onUpdateSettings({ eats_enabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Move</span>
                  </div>
                  <Switch
                    checked={settings?.move_enabled ?? true}
                    onCheckedChange={(checked) => onUpdateSettings({ move_enabled: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Commission */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Commission Rates</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Rides</Label>
                  <Input
                    type="number"
                    value={settings?.default_commission_pct || 20}
                    onChange={(e) => onUpdateSettings({ default_commission_pct: parseFloat(e.target.value) })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Eats</Label>
                  <Input
                    type="number"
                    value={settings?.eats_commission_pct || 25}
                    onChange={(e) => onUpdateSettings({ eats_commission_pct: parseFloat(e.target.value) })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Move</Label>
                  <Input
                    type="number"
                    value={settings?.move_commission_pct || 18}
                    onChange={(e) => onUpdateSettings({ move_commission_pct: parseFloat(e.target.value) })}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Dispatch */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Dispatch Settings</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Mode</Label>
                  <Select
                    value={settings?.dispatch_mode || "auto"}
                    onValueChange={(v) => onUpdateSettings({ dispatch_mode: v as 'auto' | 'broadcast' | 'manual' })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Nearest Driver)</SelectItem>
                      <SelectItem value="broadcast">Broadcast (All Nearby)</SelectItem>
                      <SelectItem value="manual">Manual Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Max Radius (km)</Label>
                    <Input
                      type="number"
                      value={settings?.max_dispatch_radius_km || 10}
                      onChange={(e) => onUpdateSettings({ max_dispatch_radius_km: parseFloat(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Timeout (sec)</Label>
                    <Input
                      type="number"
                      value={settings?.broadcast_timeout_seconds || 30}
                      onChange={(e) => onUpdateSettings({ broadcast_timeout_seconds: parseInt(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Surge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Surge Pricing</Label>
                <Switch
                  checked={settings?.surge_enabled ?? true}
                  onCheckedChange={(checked) => onUpdateSettings({ surge_enabled: checked })}
                />
              </div>
              {settings?.surge_enabled && (
                <div>
                  <Label className="text-xs text-muted-foreground">Max Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings?.max_surge_multiplier || 3}
                    onChange={(e) => onUpdateSettings({ max_surge_multiplier: parseFloat(e.target.value) })}
                    className="h-8"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Payout */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Payout Settings</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Schedule</Label>
                  <Select
                    value={settings?.payout_schedule || "weekly"}
                    onValueChange={(v) => onUpdateSettings({ payout_schedule: v as 'weekly' | 'biweekly' | 'instant' })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="instant">Instant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Min Payout ($)</Label>
                  <Input
                    type="number"
                    value={settings?.minimum_payout_amount || 25}
                    onChange={(e) => onUpdateSettings({ minimum_payout_amount: parseFloat(e.target.value) })}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{stats?.totalDrivers || 0}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> Drivers
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{stats?.completedTrips || 0}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Car className="w-3 h-3" /> Trips
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{stats?.deliveredOrders || 0}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <UtensilsCrossed className="w-3 h-3" /> Orders
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-emerald-500">
                    ${((stats?.tripRevenue || 0) + (stats?.orderRevenue || 0)).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Revenue
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Region Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timezone</span>
                  <span>{region.timezone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span>{region.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(region.created_at), "MMM d, yyyy")}</span>
                </div>
                {region.disabled_at && (
                  <div className="flex justify-between text-amber-500">
                    <span>Disabled</span>
                    <span>{format(new Date(region.disabled_at), "MMM d, yyyy")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
