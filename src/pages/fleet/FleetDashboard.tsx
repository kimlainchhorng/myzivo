/**
 * Fleet Owner Dashboard
 * Central hub for managing fleet operations
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Car,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Settings,
  FileText,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFleetProfile, useFleetVehicles, useFleetAnalytics, useFleetTeam } from "@/hooks/useFleetManagement";
import { cn } from "@/lib/utils";

// Quick stat card
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  icon: typeof Building2;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FleetDashboard() {
  const navigate = useNavigate();
  const { data: fleet, isLoading: loadingFleet } = useFleetProfile();
  const { data: vehicles } = useFleetVehicles(fleet?.id);
  const { data: analytics } = useFleetAnalytics(fleet?.id);
  const { data: team } = useFleetTeam(fleet?.id);

  if (loadingFleet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fleet) {
    // Show onboarding
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Become a Fleet Owner</h1>
          <p className="text-muted-foreground">
            List multiple vehicles, manage teams, and scale your rental business with ZIVO.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center py-6">
            <div>
              <p className="text-3xl font-bold text-primary">15%</p>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">Unlimited</p>
              <p className="text-sm text-muted-foreground">Vehicles</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">24hr</p>
              <p className="text-sm text-muted-foreground">Payouts</p>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate("/fleet/onboarding")}>
            <Plus className="w-5 h-5 mr-2" />
            Apply for Fleet Account
          </Button>
        </div>
      </div>
    );
  }

  // Status badge
  const statusConfig = {
    pending: { label: "Pending Approval", color: "bg-amber-100 text-amber-700", icon: Clock },
    approved: { label: "Active", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    suspended: { label: "Suspended", color: "bg-red-100 text-red-700", icon: AlertCircle },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: AlertCircle },
  };
  const status = statusConfig[fleet.status];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{fleet.business_name}</h1>
                <Badge className={cn("gap-1 mt-1", status.color)}>
                  <status.icon className="w-3 h-3" />
                  {status.label}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/fleet/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button onClick={() => navigate("/fleet/vehicles/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Pending approval notice */}
      {fleet.status === "pending" && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/30 p-4">
          <div className="container mx-auto flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Your fleet account is pending approval. You can add vehicles, but they won't be visible until approved.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Vehicles"
            value={analytics?.totalVehicles || 0}
            icon={Car}
          />
          <StatCard
            title="Total Bookings"
            value={analytics?.totalBookings || 0}
            icon={FileText}
          />
          <StatCard
            title="Revenue"
            value={`$${(analytics?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            trend="+12% vs last month"
          />
          <StatCard
            title="Team Members"
            value={(team?.length || 0) + 1}
            icon={Users}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vehicles" className="gap-2">
              <Car className="w-4 h-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing Rules
            </TabsTrigger>
          </TabsList>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Fleet Vehicles</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Import CSV
                </Button>
                <Button size="sm" onClick={() => navigate("/fleet/vehicles/new")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Vehicle
                </Button>
              </div>
            </div>

            {vehicles && vehicles.length > 0 ? (
              <div className="grid gap-4">
                {vehicles.map((vehicle: any) => (
                  <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center">
                            <Car className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.car_class} • ${vehicle.base_daily_rate}/day
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={vehicle.status === "available" ? "default" : "secondary"}
                          >
                            {vehicle.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No vehicles yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first vehicle to start accepting bookings
                  </p>
                  <Button onClick={() => navigate("/fleet/vehicles/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Vehicle</CardTitle>
                <CardDescription>Top performing vehicles in your fleet</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.revenueByVehicle && analytics.revenueByVehicle.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.revenueByVehicle.slice(0, 5).map((item: any) => (
                      <div
                        key={item.vehicleId}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.bookings} bookings
                          </p>
                        </div>
                        <p className="font-bold text-emerald-600">
                          ${item.revenue.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No revenue data yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Car Class</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.revenueByClass && analytics.revenueByClass.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {analytics.revenueByClass.map((item: any) => (
                      <div
                        key={item.carClass}
                        className="p-4 bg-muted/50 rounded-lg text-center"
                      >
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.carClass}
                        </p>
                        <p className="text-xl font-bold">${item.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.bookings} bookings
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No data yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Invite Member
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                {/* Fleet owner (always shown) */}
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{fleet.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{fleet.contact_email}</p>
                    </div>
                  </div>
                  <Badge>Owner</Badge>
                </div>

                {/* Team members */}
                {team && team.length > 0 ? (
                  team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Team Member</p>
                          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {member.role}
                        </Badge>
                        {!member.accepted_at && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    No team members yet. Invite staff to help manage your fleet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Fleet Pricing Rules</h2>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Rule
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Default Fleet Pricing</p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Daily Rate</p>
                        <p className="font-medium">${fleet.default_daily_rate || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weekly Discount</p>
                        <p className="font-medium">10%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Discount</p>
                        <p className="font-medium">20%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min Days</p>
                        <p className="font-medium">{fleet.default_min_rental_days}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legal disclosure */}
        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          Fleet owners operate independently and are responsible for their vehicles.
          ZIVO facilitates booking, payment, and logistics and earns a service commission.
        </div>
      </main>
    </div>
  );
}
