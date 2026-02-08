/**
 * Marketing Hub Dashboard
 * Main marketing automation control center
 */
import { Link } from "react-router-dom";
import { 
  Megaphone, Users, ShoppingCart, DollarSign, 
  Plus, Mail, Gift, BarChart3, Clock, CheckCircle,
  Pause, Calendar, ChevronRight, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import { useCampaigns, useMarketingStats } from "@/hooks/useMarketing";
import { format } from "date-fns";

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const, icon: Clock },
  scheduled: { label: "Scheduled", variant: "outline" as const, icon: Calendar },
  running: { label: "Running", variant: "default" as const, icon: Sparkles },
  completed: { label: "Completed", variant: "secondary" as const, icon: CheckCircle },
  paused: { label: "Paused", variant: "destructive" as const, icon: Pause },
};

const TYPE_LABELS = {
  promo: "Promo Campaign",
  push: "Push Notification",
  winback: "Win-back",
  restaurant_boost: "Restaurant Boost",
};

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  loading 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  loading?: boolean;
}) {
  return (
    <Card className="bg-zinc-900/80 border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href 
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link to={href}>
      <Card className="bg-zinc-900/60 border-white/10 hover:bg-zinc-800/80 transition-colors cursor-pointer group">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-sm text-white/60 truncate">{description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/60" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MarketingHub() {
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: stats, isLoading: statsLoading } = useMarketingStats();

  const recentCampaigns = campaigns?.slice(0, 5) || [];

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header */}
        <div className="border-b border-white/10 bg-zinc-900/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Marketing Hub</h1>
                  <p className="text-sm text-white/60">Automate campaigns and engage users</p>
                </div>
              </div>
              <Link to="/admin/marketing/campaigns/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Campaigns"
              value={stats?.active_campaigns || 0}
              icon={Megaphone}
              loading={statsLoading}
            />
            <StatCard
              title="Users Reached"
              value={(stats?.total_users_reached || 0).toLocaleString()}
              icon={Users}
              loading={statsLoading}
            />
            <StatCard
              title="Orders Generated"
              value={(stats?.total_orders_generated || 0).toLocaleString()}
              icon={ShoppingCart}
              loading={statsLoading}
            />
            <StatCard
              title="Revenue Impact"
              value={`$${((stats?.total_revenue_impact || 0) / 100).toLocaleString()}`}
              icon={DollarSign}
              loading={statsLoading}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                title="Campaigns"
                description="Manage all campaigns"
                icon={Megaphone}
                href="/admin/marketing/campaigns"
              />
              <QuickActionCard
                title="Email Flows"
                description="Automated email sequences"
                icon={Mail}
                href="/admin/email-campaigns"
              />
              <QuickActionCard
                title="Promo Codes"
                description="Create and manage promos"
                icon={Gift}
                href="/admin/promotions"
              />
              <QuickActionCard
                title="Analytics"
                description="Campaign performance"
                icon={BarChart3}
                href="/admin/analytics"
              />
            </div>
          </div>

          {/* Recent Campaigns */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Campaigns</h2>
              <Link to="/admin/marketing/campaigns">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <Card className="bg-zinc-900/80 border-white/10">
              {campaignsLoading ? (
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24 mt-2" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              ) : recentCampaigns.length === 0 ? (
                <CardContent className="p-12 text-center">
                  <Megaphone className="h-12 w-12 mx-auto text-white/20 mb-4" />
                  <h3 className="font-medium text-white/80">No campaigns yet</h3>
                  <p className="text-sm text-white/60 mt-1 mb-4">
                    Create your first campaign to start engaging users
                  </p>
                  <Link to="/admin/marketing/campaigns/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Campaign
                    </Button>
                  </Link>
                </CardContent>
              ) : (
                <div className="divide-y divide-white/10">
                  {recentCampaigns.map(campaign => {
                    const statusConfig = STATUS_CONFIG[campaign.status];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <Link
                        key={campaign.id}
                        to={`/admin/marketing/campaigns/${campaign.id}`}
                        className="block"
                      >
                        <div className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <StatusIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">
                              {campaign.name}
                            </h3>
                            <p className="text-sm text-white/60">
                              {TYPE_LABELS[campaign.campaign_type]} • Created {format(new Date(campaign.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-white/40" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Campaign Types Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Campaign Types</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gift className="h-4 w-4 text-emerald-400" />
                    Promo Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60">
                    Distribute discount codes or credits to targeted users
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-blue-400" />
                    Push Notification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60">
                    Send push notifications to engage users instantly
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-400" />
                    Win-back
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60">
                    Re-engage inactive users with personalized offers
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-purple-400" />
                    Restaurant Boost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60">
                    Promote specific restaurants during slow periods
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
