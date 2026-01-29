import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Gift, Star, Crown, Trophy, Zap, 
  TrendingUp, Users, Coins, Settings
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const tierDistribution = [
  { name: "Bronze", value: 45, color: "hsl(var(--chart-5))" },
  { name: "Silver", value: 30, color: "hsl(var(--muted))" },
  { name: "Gold", value: 18, color: "hsl(var(--chart-4))" },
  { name: "Platinum", value: 5, color: "hsl(var(--chart-2))" },
  { name: "Diamond", value: 2, color: "hsl(var(--primary))" },
];

const pointsActivity = [
  { month: "Aug", earned: 125000, redeemed: 45000 },
  { month: "Sep", earned: 142000, redeemed: 52000 },
  { month: "Oct", earned: 168000, redeemed: 61000 },
  { month: "Nov", earned: 185000, redeemed: 72000 },
  { month: "Dec", earned: 210000, redeemed: 89000 },
  { month: "Jan", earned: 235000, redeemed: 98000 },
];

const rewardCatalog = [
  { id: "1", name: "Free Ride (Up to $20)", points: 2000, redeemed: 4520, stock: "unlimited" },
  { id: "2", name: "50% Off Next Order", points: 1000, redeemed: 8900, stock: "unlimited" },
  { id: "3", name: "Priority Matching", points: 500, redeemed: 12400, stock: "unlimited" },
  { id: "4", name: "VIP Lounge Access", points: 10000, redeemed: 245, stock: "500" },
  { id: "5", name: "$50 Travel Credit", points: 5000, redeemed: 890, stock: "unlimited" },
];

export default function AdminRewardsProgram() {
  const totalMembers = 125000;
  const totalPointsIssued = 12500000;
  const redemptionRate = 42;
  const avgPointsPerUser = 1250;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Rewards Program
          </h2>
          <p className="text-muted-foreground">Manage loyalty points and rewards</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Rewards
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{(totalMembers / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Coins className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points Issued</p>
                <p className="text-2xl font-bold">{(totalPointsIssued / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Gift className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Redemption Rate</p>
                <p className="text-2xl font-bold">{redemptionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Star className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Points/User</p>
                <p className="text-2xl font-bold">{avgPointsPerUser.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
            <CardDescription>Members by loyalty tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={tierDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Points Activity</CardTitle>
            <CardDescription>Monthly earned vs redeemed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pointsActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Bar dataKey="earned" name="Earned" fill="hsl(var(--primary))" radius={4} />
                <Bar dataKey="redeemed" name="Redeemed" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reward Catalog</CardTitle>
          <CardDescription>Available rewards and redemption stats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewardCatalog.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Gift className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">{reward.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Coins className="h-3 w-3" />
                      {reward.points.toLocaleString()} points
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-medium">{reward.redeemed.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">redeemed</p>
                  </div>
                  <Badge variant="outline">
                    {reward.stock === "unlimited" ? "Unlimited" : `${reward.stock} left`}
                  </Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
