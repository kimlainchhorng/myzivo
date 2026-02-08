/**
 * Merchant Ads Dashboard
 * Manage restaurant advertising campaigns
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Wallet,
  Eye,
  MousePointer,
  TrendingUp,
  Pause,
  Play,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import {
  useRestaurantAds,
  useMerchantAdStats,
  useMerchantBalance,
  usePauseAd,
  useResumeAd,
  useDeleteAd,
} from "@/hooks/useRestaurantAds";
import AdCampaignBuilder from "@/components/merchant/AdCampaignBuilder";
import AdPerformanceChart from "@/components/merchant/AdPerformanceChart";
import { formatDistanceToNow } from "date-fns";

const MerchantAdsPage = () => {
  const { data: merchantRole, isLoading: roleLoading } = useMerchantRole();
  const restaurantId = merchantRole?.restaurantId;

  const { data: ads, isLoading: adsLoading } = useRestaurantAds(restaurantId || undefined);
  const { data: stats } = useMerchantAdStats(restaurantId || undefined);
  const { data: balance } = useMerchantBalance(restaurantId || undefined);

  const pauseAd = usePauseAd();
  const resumeAd = useResumeAd();
  const deleteAd = useDeleteAd();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!merchantRole?.isMerchant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You need to be a restaurant owner to access this page.
          </p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeAds = ads?.filter((a) => a.status === "active") || [];
  const pausedAds = ads?.filter((a) => a.status === "paused" || a.status === "exhausted") || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Paused</Badge>;
      case "exhausted":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">Budget Exhausted</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Restaurant Ads | ZIVO Merchant</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/merchant">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold">Boost Your Restaurant</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage advertising campaigns
                  </p>
                </div>
              </div>

              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Ad Campaign</DialogTitle>
                  </DialogHeader>
                  <AdCampaignBuilder
                    restaurantId={restaurantId!}
                    onSuccess={() => setCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
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
                    <Wallet className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ad Balance</p>
                    <p className="text-xl font-bold">${(balance || 0).toFixed(2)}</p>
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
                    <p className="text-xl font-bold">{activeAds.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Eye className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impressions</p>
                    <p className="text-xl font-bold">
                      {stats?.totalImpressions.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <MousePointer className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clicks</p>
                    <p className="text-xl font-bold">
                      {stats?.totalClicks.toLocaleString() || 0}
                      {stats && stats.totalImpressions > 0 && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          ({stats.ctr.toFixed(1)}% CTR)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          {restaurantId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdPerformanceChart restaurantId={restaurantId} />
              </CardContent>
            </Card>
          )}

          {/* Campaigns */}
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeAds.length})
              </TabsTrigger>
              <TabsTrigger value="paused">
                Paused ({pausedAds.length})
              </TabsTrigger>
              <TabsTrigger value="all">All ({ads?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4 space-y-3">
              {activeAds.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No active campaigns. Create one to start boosting your restaurant!
                  </CardContent>
                </Card>
              ) : (
                activeAds.map((ad) => (
                  <CampaignCard
                    key={ad.id}
                    ad={ad}
                    onPause={() => pauseAd.mutate(ad.id)}
                    onResume={() => resumeAd.mutate(ad.id)}
                    onDelete={() => deleteAd.mutate(ad.id)}
                    getStatusBadge={getStatusBadge}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="paused" className="mt-4 space-y-3">
              {pausedAds.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No paused campaigns.
                  </CardContent>
                </Card>
              ) : (
                pausedAds.map((ad) => (
                  <CampaignCard
                    key={ad.id}
                    ad={ad}
                    onPause={() => pauseAd.mutate(ad.id)}
                    onResume={() => resumeAd.mutate(ad.id)}
                    onDelete={() => deleteAd.mutate(ad.id)}
                    getStatusBadge={getStatusBadge}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-4 space-y-3">
              {adsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading campaigns...
                </div>
              ) : ads?.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No campaigns yet. Create your first campaign!
                  </CardContent>
                </Card>
              ) : (
                ads?.map((ad) => (
                  <CampaignCard
                    key={ad.id}
                    ad={ad}
                    onPause={() => pauseAd.mutate(ad.id)}
                    onResume={() => resumeAd.mutate(ad.id)}
                    onDelete={() => deleteAd.mutate(ad.id)}
                    getStatusBadge={getStatusBadge}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

// Campaign Card Component
interface CampaignCardProps {
  ad: any;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const CampaignCard = ({
  ad,
  onPause,
  onResume,
  onDelete,
  getStatusBadge,
}: CampaignCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{ad.name || "Untitled Campaign"}</h3>
              {getStatusBadge(ad.status)}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>${ad.dailyBudget}/day</span>
              <span>{ad.impressions.toLocaleString()} impressions</span>
              <span>{ad.clicks} clicks</span>
              <span>${ad.spent.toFixed(2)} spent</span>
            </div>
            {ad.startDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Started {formatDistanceToNow(new Date(ad.startDate))} ago
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {ad.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
              >
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onResume}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MerchantAdsPage;
