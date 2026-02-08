/**
 * ADMIN LOYALTY DASHBOARD
 * Manage loyalty program settings, rewards, and view top customers
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Settings,
  Gift,
  Users,
  TrendingUp,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEOHead from "@/components/SEOHead";
import {
  useLoyaltySettings,
  useLoyaltyProgramStats,
} from "@/hooks/useLoyalty";
import EarnRateConfig from "@/components/admin/loyalty/EarnRateConfig";
import RewardsManager from "@/components/admin/loyalty/RewardsManager";
import TopCustomersTable from "@/components/admin/loyalty/TopCustomersTable";
import PointsAdjustmentModal from "@/components/admin/loyalty/PointsAdjustmentModal";

export default function AdminLoyaltyPage() {
  const { data: settings, isLoading: settingsLoading } = useLoyaltySettings();
  const { data: stats, isLoading: statsLoading } = useLoyaltyProgramStats();
  const [activeTab, setActiveTab] = useState("settings");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleAdjustPoints = (userId: string) => {
    setSelectedUserId(userId);
    setAdjustModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Loyalty Program | ZIVO Admin"
        description="Manage ZIVO Points loyalty program settings, rewards, and customers."
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Loyalty Program
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage ZIVO Points settings, rewards, and customers
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Points Issued"
            value={stats?.totalPointsIssued.toLocaleString() || "0"}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={statsLoading}
          />
          <StatsCard
            title="Points Redeemed"
            value={stats?.totalPointsRedeemed.toLocaleString() || "0"}
            icon={<Gift className="w-5 h-5" />}
            loading={statsLoading}
          />
          <StatsCard
            title="Active Members"
            value={stats?.activeMembers.toLocaleString() || "0"}
            icon={<Users className="w-5 h-5" />}
            loading={statsLoading}
          />
          <StatsCard
            title="Total Redemptions"
            value={stats?.totalRedemptions.toLocaleString() || "0"}
            icon={<Sparkles className="w-5 h-5" />}
            loading={statsLoading}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Earn Rate
            </TabsTrigger>
            <TabsTrigger value="rewards" className="gap-2">
              <Gift className="w-4 h-4" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Users className="w-4 h-4" />
              Top Customers
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings">
            {settingsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : settings ? (
              <EarnRateConfig settings={settings} />
            ) : null}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <RewardsManager />
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <TopCustomersTable onAdjustPoints={handleAdjustPoints} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Points Adjustment Modal */}
      <PointsAdjustmentModal
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        userId={selectedUserId}
      />
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm">{title}</span>
          <span className="text-primary">{icon}</span>
        </div>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
