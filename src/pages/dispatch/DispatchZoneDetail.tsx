/**
 * Dispatch Zone Detail Page
 * View and manage a specific zone
 */

import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRegions } from "@/hooks/useRegions";
import { useZoneStats, useZoneDrivers, useZoneRestaurants, useZonePendingOrders } from "@/hooks/useZoneStats";
import { useSurgeRules } from "@/hooks/useZoneSurge";
import {
  ArrowLeft,
  Users,
  Package,
  Zap,
  Clock,
  MapPin,
  Store,
  Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const DispatchZoneDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: regions } = useRegions();
  const { data: stats, isLoading: statsLoading } = useZoneStats(id || null);
  const { data: drivers, isLoading: driversLoading } = useZoneDrivers(id || null);
  const { data: restaurants } = useZoneRestaurants(id || null);
  const { data: pendingOrders } = useZonePendingOrders(id || null);
  const { data: surgeRules } = useSurgeRules(id || null);

  const zone = regions?.find((r) => r.id === id);

  if (!zone) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Zone not found</p>
      </div>
    );
  }

  const isSurging = (stats?.surge_multiplier || 1) > 1.0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dispatch/zones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{zone.name}</h1>
            <p className="text-muted-foreground">
              {zone.city}, {zone.state}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={zone.is_active ? "default" : "secondary"}>
            {zone.is_active ? "Active" : "Inactive"}
          </Badge>
          {isSurging && (
            <Badge className="bg-amber-500">
              <Zap className="h-3 w-3 mr-1" />
              {stats?.surge_multiplier.toFixed(1)}x Surge
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : stats?.online_drivers || 0}
                </p>
                <p className="text-sm text-muted-foreground">Online Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : stats?.pending_orders || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  isSurging ? "bg-amber-500/10" : "bg-muted"
                )}
              >
                <Zap
                  className={cn(
                    "h-5 w-5",
                    isSurging ? "text-amber-500" : "text-muted-foreground"
                  )}
                />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : `${(stats?.surge_multiplier || 1).toFixed(1)}x`}
                </p>
                <p className="text-sm text-muted-foreground">Surge Multiplier</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : `${stats?.avg_wait_minutes || 0}m`}
                </p>
                <p className="text-sm text-muted-foreground">Avg Wait Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="drivers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drivers">
            Drivers ({drivers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="merchants">
            Merchants ({restaurants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="orders">
            Pending Orders ({pendingOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="surge">
            Surge Rules ({surgeRules?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drivers in Zone</CardTitle>
            </CardHeader>
            <CardContent>
              {driversLoading ? (
                <p className="text-muted-foreground py-4">Loading...</p>
              ) : !drivers?.length ? (
                <p className="text-muted-foreground py-4">
                  No drivers assigned to this zone
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Trips</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={driver.avatar_url || undefined} />
                              <AvatarFallback>
                                {driver.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{driver.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {driver.vehicle_type}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={driver.is_online ? "default" : "secondary"}
                            className={cn(driver.is_online && "bg-green-500")}
                          >
                            {driver.is_online ? "Online" : "Offline"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {driver.rating?.toFixed(1) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{driver.total_trips || 0}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {driver.last_active_at
                            ? formatDistanceToNow(new Date(driver.last_active_at), {
                                addSuffix: true,
                              })
                            : "Never"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchants">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Merchants in Zone</CardTitle>
            </CardHeader>
            <CardContent>
              {!restaurants?.length ? (
                <p className="text-muted-foreground py-4">
                  No merchants assigned to this zone
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              <Store className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{restaurant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {restaurant.address}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={restaurant.is_open ? "default" : "secondary"}
                            className={cn(restaurant.is_open && "bg-green-500")}
                          >
                            {restaurant.is_open ? "Open" : "Closed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {restaurant.rating?.toFixed(1) || "N/A"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {!pendingOrders?.length ? (
                <p className="text-muted-foreground py-4">
                  No pending orders in this zone
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          {(order.restaurants as any)?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          ${((order.delivery_fee_cents || 0) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(order.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surge">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Surge Rules</CardTitle>
              <Link to="/dispatch/surge">
                <Button variant="outline" size="sm">
                  Manage All Rules
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!surgeRules?.length ? (
                <p className="text-muted-foreground py-4">
                  No surge rules configured for this zone
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surgeRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Orders ≥ {rule.min_pending_orders}, Drivers ≤{" "}
                          {rule.max_online_drivers}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500">
                            {rule.surge_multiplier}x
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={rule.is_active ? "default" : "secondary"}
                          >
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatchZoneDetail;
