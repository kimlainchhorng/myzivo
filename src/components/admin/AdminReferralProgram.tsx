import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Gift, Users, DollarSign, TrendingUp, Share2, 
  Crown, Star, Settings
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

const referralTrend = [
  { month: "Aug", referrals: 450, conversions: 180 },
  { month: "Sep", referrals: 520, conversions: 208 },
  { month: "Oct", referrals: 680, conversions: 272 },
  { month: "Nov", referrals: 720, conversions: 302 },
  { month: "Dec", referrals: 890, conversions: 378 },
  { month: "Jan", referrals: 1050, conversions: 462 },
];

const topReferrers = [
  { rank: 1, name: "John Smith", referrals: 45, conversions: 38, earnings: 380 },
  { rank: 2, name: "Sarah Johnson", referrals: 38, conversions: 32, earnings: 320 },
  { rank: 3, name: "Mike Brown", referrals: 32, conversions: 28, earnings: 280 },
  { rank: 4, name: "Emma Wilson", referrals: 28, conversions: 24, earnings: 240 },
  { rank: 5, name: "David Lee", referrals: 25, conversions: 21, earnings: 210 },
];

const rewardTiers = [
  { tier: "Bronze", referrals: "1-5", reward: "$10 per referral", active: true },
  { tier: "Silver", referrals: "6-15", reward: "$15 per referral", active: true },
  { tier: "Gold", referrals: "16-30", reward: "$20 per referral", active: true },
  { tier: "Platinum", referrals: "31+", reward: "$25 per referral + VIP status", active: true },
];

export default function AdminReferralProgram() {
  const totalReferrals = 4310;
  const conversionRate = 42;
  const totalPaid = 45600;
  const activeReferrers = 1280;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Referral Program
          </h2>
          <p className="text-muted-foreground">Manage referral rewards and tracking</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Program
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{totalReferrals.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">${(totalPaid / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Referrers</p>
                <p className="text-2xl font-bold">{activeReferrers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referral Trend</CardTitle>
            <CardDescription>Monthly referrals and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={referralTrend}>
                <defs>
                  <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="referrals" name="Referrals" stroke="hsl(var(--primary))" fill="url(#refGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="conversions" name="Conversions" stroke="hsl(var(--chart-2))" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reward Tiers</CardTitle>
            <CardDescription>Current referral reward structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rewardTiers.map((tier) => (
              <div key={tier.tier} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Badge className={
                    tier.tier === "Platinum" ? "bg-purple-500/10 text-purple-500" :
                    tier.tier === "Gold" ? "bg-amber-500/10 text-amber-500" :
                    tier.tier === "Silver" ? "bg-slate-400/10 text-slate-400" :
                    "bg-orange-500/10 text-orange-500"
                  }>
                    {tier.tier}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{tier.referrals} referrals</span>
                </div>
                <span className="font-medium">{tier.reward}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>Users with most successful referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topReferrers.map((referrer) => (
              <div key={referrer.rank} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    referrer.rank === 1 ? "bg-amber-500 text-white" :
                    referrer.rank === 2 ? "bg-slate-400 text-white" :
                    referrer.rank === 3 ? "bg-orange-400 text-white" :
                    "bg-muted"
                  }`}>
                    {referrer.rank}
                  </div>
                  <div>
                    <p className="font-medium">{referrer.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{referrer.referrals} referrals</span>
                      <span>{referrer.conversions} conversions</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500">${referrer.earnings}</p>
                  <p className="text-xs text-muted-foreground">earned</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
