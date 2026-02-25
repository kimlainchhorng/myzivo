/**
 * Dispatch Zones Page
 * List and manage dispatch zones with stats
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ZoneSurgeCard } from "@/components/dispatch/ZoneSurgeCard";
import { useAllZonesWithStats } from "@/hooks/useZoneStats";
import { useCreateRegion } from "@/hooks/useRegions";
import { Plus, Search, MapPin, Zap, Users, Package } from "lucide-react";
import { toast } from "sonner";

const DispatchZones = () => {
  const navigate = useNavigate();
  const { data: zones, isLoading } = useAllZonesWithStats();
  const createRegion = useCreateRegion();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newZone, setNewZone] = useState({
    name: "",
    city: "",
    state: "",
  });

  // Filter zones by search
  const filteredZones = zones?.filter(
    (zone) =>
      zone.name.toLowerCase().includes(search.toLowerCase()) ||
      zone.city?.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const totalOnlineDrivers =
    zones?.reduce((sum, z) => sum + z.stats.online_drivers, 0) || 0;
  const totalPendingOrders =
    zones?.reduce((sum, z) => sum + z.stats.pending_orders, 0) || 0;
  const zonesWithSurge =
    zones?.filter((z) => z.stats.surge_multiplier > 1.0).length || 0;

  const handleCreateZone = async () => {
    if (!newZone.name || !newZone.city || !newZone.state) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createRegion.mutateAsync({
        name: newZone.name,
        city: newZone.city,
        state: newZone.state,
        country: "United States",
        timezone: "America/Chicago",
        currency: "USD",
      });
      setIsCreateOpen(false);
      setNewZone({ name: "", city: "", state: "" });
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dispatch Zones</h1>
          <p className="text-muted-foreground">
            Manage geographic zones for dispatch and surge pricing
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Zone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Zone Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Houston - Downtown"
                  value={newZone.name}
                  onChange={(e) =>
                    setNewZone((z) => ({ ...z, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Houston"
                    value={newZone.city}
                    onChange={(e) =>
                      setNewZone((z) => ({ ...z, city: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="TX"
                    value={newZone.state}
                    onChange={(e) =>
                      setNewZone((z) => ({ ...z, state: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateZone}
                disabled={createRegion.isPending}
                className="w-full"
              >
                {createRegion.isPending ? "Creating..." : "Create Zone"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{zones?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Zones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalOnlineDrivers}</p>
              <p className="text-sm text-muted-foreground">Online Drivers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPendingOrders}</p>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{zonesWithSurge}</p>
              <p className="text-sm text-muted-foreground">Zones Surging</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search zones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Zones Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filteredZones?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search
              ? "No zones match your search"
              : "No zones configured. Create your first zone to get started."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredZones?.map((zone) => (
            <ZoneSurgeCard
              key={zone.id}
              zoneName={zone.name}
              multiplier={zone.stats.surge_multiplier}
              onlineDrivers={zone.stats.online_drivers}
              pendingOrders={zone.stats.pending_orders}
              avgWaitMinutes={zone.stats.avg_wait_minutes}
              isActive={zone.is_active}
              onClick={() => navigate(`/dispatch/zones/${zone.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DispatchZones;
