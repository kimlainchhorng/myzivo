/**
 * Admin Ads Dashboard
 * Oversee all restaurant advertising campaigns
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  Check,
  X,
  Pause,
  Play,
  Eye,
} from "lucide-react";
import {
  useAllAds,
  useActiveAdCount,
  usePendingApprovalCount,
  useAdsRevenue,
  useAdFraudSignals,
  usePauseAd,
  useResumeAd,
  useApproveAd,
  useRejectAd,
} from "@/hooks/useRestaurantAds";
import AdRevenueChart from "@/components/admin/ads/AdRevenueChart";
import AdFraudMonitor from "@/components/admin/ads/AdFraudMonitor";
import { formatDistanceToNow } from "date-fns";

const AdminAdsPage = () => {
  const [tab, setTab] = useState("all");
  
  const { data: ads, isLoading } = useAllAds(
    tab === "pending" ? { isApproved: false } : undefined
  );
  const { data: activeCount } = useActiveAdCount();
  const { data: pendingCount } = usePendingApprovalCount();
  const { data: revenue } = useAdsRevenue();
  const { data: fraudSignals } = useAdFraudSignals();

  const pauseAd = usePauseAd();
  const resumeAd = useResumeAd();
  const approveAd = useApproveAd();
  const rejectAd = useRejectAd();

  const getStatusBadge = (status: string, isApproved: boolean) => {
    if (!isApproved) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
    }
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Paused</Badge>;
      case "exhausted":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">Exhausted</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Restaurant Ads | Admin</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Restaurant Ads</h1>
                <p className="text-sm text-muted-foreground">
                  Manage advertising campaigns across the platform
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold">${(revenue?.total || 0).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-xl font-bold">{activeCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <p className="text-xl font-bold">{pendingCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fraud Signals</p>
                    <p className="text-xl font-bold">{fraudSignals?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingCount || 0})
              </TabsTrigger>
              <TabsTrigger value="fraud">Fraud Monitor</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Restaurant</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Spent</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading campaigns...
                          </TableCell>
                        </TableRow>
                      ) : ads?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No campaigns found
                          </TableCell>
                        </TableRow>
                      ) : (
                        ads?.map((ad) => (
                          <TableRow key={ad.id}>
                            <TableCell className="font-medium">
                              {ad.restaurantName || "Unknown"}
                            </TableCell>
                            <TableCell>{ad.name || "Untitled"}</TableCell>
                            <TableCell>
                              {getStatusBadge(ad.status, ad.isApproved)}
                            </TableCell>
                            <TableCell className="text-right">
                              ${ad.spent.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {ad.impressions > 0
                                ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                                : 0}%
                            </TableCell>
                            <TableCell className="text-right">
                              {ad.ordersFromAds}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {ad.status === "active" ? (
                                    <DropdownMenuItem onClick={() => pauseAd.mutate(ad.id)}>
                                      <Pause className="h-4 w-4 mr-2" />
                                      Pause
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => resumeAd.mutate(ad.id)}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Resume
                                    </DropdownMenuItem>
                                  )}
                                  {!ad.isApproved && (
                                    <>
                                      <DropdownMenuItem onClick={() => approveAd.mutate(ad.id)}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => rejectAd.mutate({ id: ad.id, reason: "Policy violation" })}
                                        className="text-destructive"
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  {ads?.filter((a) => !a.isApproved).length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No campaigns pending approval
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {ads
                        ?.filter((a) => !a.isApproved)
                        .map((ad) => (
                          <div
                            key={ad.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{ad.restaurantName}</p>
                              <p className="text-sm text-muted-foreground">
                                {ad.name} · ${ad.dailyBudget}/day · {ad.placement}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Submitted {formatDistanceToNow(new Date(ad.createdAt))} ago
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectAd.mutate({ id: ad.id, reason: "Policy violation" })}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => approveAd.mutate(ad.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fraud" className="mt-4">
              <AdFraudMonitor />
            </TabsContent>

            <TabsContent value="revenue" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdRevenueChart />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminAdsPage;
