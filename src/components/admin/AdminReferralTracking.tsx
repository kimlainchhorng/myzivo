import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Gift,
  CheckCircle,
  Clock,
  ChevronRight
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const referralData = [
  { month: "Jan", referrals: 120, conversions: 85, revenue: 4250 },
  { month: "Feb", referrals: 145, conversions: 98, revenue: 4900 },
  { month: "Mar", referrals: 168, conversions: 112, revenue: 5600 },
  { month: "Apr", referrals: 192, conversions: 135, revenue: 6750 },
  { month: "May", referrals: 210, conversions: 152, revenue: 7600 },
  { month: "Jun", referrals: 245, conversions: 178, revenue: 8900 }
];

interface TopReferrer {
  id: string;
  name: string;
  referrals: number;
  conversions: number;
  earnings: number;
  tier: "gold" | "silver" | "bronze";
}

const topReferrers: TopReferrer[] = [
  { id: "1", name: "Michael Chen", referrals: 45, conversions: 38, earnings: 1900, tier: "gold" },
  { id: "2", name: "Sarah Johnson", referrals: 32, conversions: 28, earnings: 1400, tier: "gold" },
  { id: "3", name: "James Wilson", referrals: 28, conversions: 22, earnings: 1100, tier: "silver" },
  { id: "4", name: "Emily Davis", referrals: 24, conversions: 19, earnings: 950, tier: "silver" },
  { id: "5", name: "Robert Brown", referrals: 18, conversions: 14, earnings: 700, tier: "bronze" }
];

const getTierBadge = (tier: TopReferrer["tier"]) => {
  switch (tier) {
    case "gold":
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">🥇 Gold</Badge>;
    case "silver":
      return <Badge className="bg-gray-400/10 text-gray-400 border-gray-400/20">🥈 Silver</Badge>;
    case "bronze":
      return <Badge className="bg-orange-600/10 text-orange-600 border-orange-600/20">🥉 Bronze</Badge>;
  }
};

const AdminReferralTracking = () => {
  const totalReferrals = referralData.reduce((sum, d) => sum + d.referrals, 0);
  const totalConversions = referralData.reduce((sum, d) => sum + d.conversions, 0);
  const totalRevenue = referralData.reduce((sum, d) => sum + d.revenue, 0);
  const conversionRate = ((totalConversions / totalReferrals) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Referral Tracking
          </h2>
          <p className="text-muted-foreground">Monitor referral program performance</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Gift className="h-4 w-4" />
          Configure Rewards
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalConversions}</p>
                <p className="text-xs text-muted-foreground">Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Rewards Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Referral Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={referralData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="referrals" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--muted-foreground))' }}
                    name="Referrals"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topReferrers.map((referrer, index) => (
                <div 
                  key={referrer.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center font-medium">
                      {referrer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{referrer.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{referrer.referrals} referrals</span>
                        <span>•</span>
                        <span>{referrer.conversions} converted</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-green-500">${referrer.earnings}</p>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                    {getTierBadge(referrer.tier)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReferralTracking;
