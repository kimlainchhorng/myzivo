import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Megaphone, 
  Mail, 
  MessageSquare, 
  Bell,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Play,
  Pause,
  Eye,
  MousePointer,
  Target,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "push" | "sms" | "in-app";
  status: "active" | "paused" | "scheduled" | "completed";
  startDate: string;
  endDate: string;
  audience: number;
  sent: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
  budget: number;
  spent: number;
}

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Winter Promo - 30% Off Rides",
    type: "push",
    status: "active",
    startDate: "Jan 15",
    endDate: "Feb 15",
    audience: 45000,
    sent: 42500,
    opened: 28000,
    clicked: 8500,
    conversions: 2150,
    revenue: 32500,
    budget: 5000,
    spent: 3200,
  },
  {
    id: "2",
    name: "New User Welcome Series",
    type: "email",
    status: "active",
    startDate: "Jan 1",
    endDate: "Dec 31",
    audience: 12000,
    sent: 11800,
    opened: 7200,
    clicked: 3100,
    conversions: 890,
    revenue: 18500,
    budget: 2000,
    spent: 1450,
  },
  {
    id: "3",
    name: "Driver Referral Boost",
    type: "sms",
    status: "paused",
    startDate: "Jan 10",
    endDate: "Jan 31",
    audience: 8500,
    sent: 6200,
    opened: 5800,
    clicked: 1200,
    conversions: 45,
    revenue: 4500,
    budget: 3000,
    spent: 2100,
  },
  {
    id: "4",
    name: "Valentine's Day Special",
    type: "in-app",
    status: "scheduled",
    startDate: "Feb 10",
    endDate: "Feb 14",
    audience: 65000,
    sent: 0,
    opened: 0,
    clicked: 0,
    conversions: 0,
    revenue: 0,
    budget: 8000,
    spent: 0,
  },
];

const getTypeConfig = (type: string) => {
  switch (type) {
    case "email":
      return { icon: Mail, color: "text-blue-500", bg: "bg-blue-500/10" };
    case "push":
      return { icon: Bell, color: "text-violet-500", bg: "bg-violet-500/10" };
    case "sms":
      return { icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10" };
    case "in-app":
      return { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" };
    default:
      return { icon: Megaphone, color: "text-primary", bg: "bg-primary/10" };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { color: "bg-green-500 text-white", label: "Active" };
    case "paused":
      return { color: "bg-amber-500 text-white", label: "Paused" };
    case "scheduled":
      return { color: "bg-blue-500 text-white", label: "Scheduled" };
    case "completed":
      return { color: "bg-slate-500 text-white", label: "Completed" };
    default:
      return { color: "bg-muted text-foreground", label: status };
  }
};

const AdminMarketingCampaigns = () => {
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Marketing Campaigns
          </h2>
          <p className="text-muted-foreground">Manage and track marketing initiatives</p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardContent className="p-4">
            <DollarSign className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <Target className="h-5 w-5 text-violet-500 mb-2" />
            <p className="text-2xl font-bold">{totalConversions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Conversions</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{activeCampaigns}</p>
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <Users className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">
              {(campaigns.reduce((sum, c) => sum + c.audience, 0) / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground">Total Reach</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign, index) => {
          const typeConfig = getTypeConfig(campaign.type);
          const statusConfig = getStatusConfig(campaign.status);
          const TypeIcon = typeConfig.icon;
          const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
          const ctr = campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0;
          const conversionRate = campaign.clicked > 0 ? Math.round((campaign.conversions / campaign.clicked) * 100) : 0;
          const budgetUsed = Math.round((campaign.spent / campaign.budget) * 100);

          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Campaign Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", typeConfig.bg)}>
                        <TypeIcon className={cn("h-6 w-6", typeConfig.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{campaign.name}</h3>
                          <Badge className={cn("text-xs shrink-0", statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {campaign.startDate} - {campaign.endDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.audience.toLocaleString()} audience
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 lg:gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm mb-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">{openRate}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Open Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm mb-1">
                          <MousePointer className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">{ctr}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">CTR</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm mb-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">{conversionRate}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Conv. Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm mb-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span className="font-semibold text-green-500">
                            ${campaign.revenue.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="w-full lg:w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Budget</span>
                        <span>{budgetUsed}%</span>
                      </div>
                      <Progress value={budgetUsed} className="h-2" />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        ${campaign.spent} / ${campaign.budget}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {campaign.status === "active" ? (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Pause className="h-3 w-3" />
                          Pause
                        </Button>
                      ) : campaign.status === "paused" ? (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Play className="h-3 w-3" />
                          Resume
                        </Button>
                      ) : null}
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMarketingCampaigns;
