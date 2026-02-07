/**
 * DriversHubPage - Admin drivers list with online status and earnings summary
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Users, Search, RefreshCw, Circle, ExternalLink, DollarSign, Car, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDrivers } from "@/hooks/useDrivers";
import { useAllDriverBalances } from "@/hooks/useDriverPayouts";
import { cn } from "@/lib/utils";

const DriversHubPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: drivers, isLoading, refetch } = useDrivers();
  const { data: balances } = useAllDriverBalances();

  // Filter drivers by search
  const filteredDrivers = drivers?.filter((driver) =>
    driver.full_name.toLowerCase().includes(search.toLowerCase()) ||
    driver.phone.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Get balance for a driver
  const getDriverBalance = (driverId: string) => {
    return balances?.find((b) => b.driverId === driverId);
  };

  // Calculate summary stats
  const onlineCount = filteredDrivers.filter((d) => d.is_online).length;
  const verifiedCount = filteredDrivers.filter((d) => d.status === "verified").length;
  const totalEarnings = balances?.reduce((sum, b) => sum + b.driverShare, 0) || 0;
  const totalPending = balances?.reduce((sum, b) => sum + b.balance, 0) || 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Drivers Management
            </h1>
            <p className="text-muted-foreground text-sm">
              View driver status, earnings, and manage payouts
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                <span className="text-2xl font-bold">{onlineCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Online Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{verifiedCount}</div>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">
                ${totalEarnings.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Earnings (85%)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-500">
                ${totalPending.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Pending Payout</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Drivers Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No drivers found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                      <TableHead className="hidden lg:table-cell">Rating</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead className="hidden md:table-cell">Last Active</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map((driver) => {
                      const balance = getDriverBalance(driver.id);
                      return (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Circle
                                className={cn(
                                  "w-2.5 h-2.5",
                                  driver.is_online
                                    ? "fill-green-500 text-green-500"
                                    : "fill-muted text-muted"
                                )}
                              />
                              <Badge
                                variant={driver.status === "verified" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {driver.status || "pending"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{driver.full_name}</p>
                              <p className="text-xs text-muted-foreground">{driver.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {driver.vehicle_model || "N/A"}
                              </span>
                            </div>
                            {driver.vehicle_plate && (
                              <p className="text-xs text-muted-foreground">{driver.vehicle_plate}</p>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{driver.rating?.toFixed(1) || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-1 text-green-600">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span className="font-medium">
                                  {balance?.driverShare.toFixed(0) || "0"}
                                </span>
                              </div>
                              {balance && balance.balance > 0 && (
                                <p className="text-xs text-amber-500">
                                  ${balance.balance.toFixed(0)} pending
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {driver.updated_at
                              ? formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/drivers/${driver.id}`)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriversHubPage;
