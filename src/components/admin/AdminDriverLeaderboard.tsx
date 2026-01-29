import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Star, Car, DollarSign, Medal, Crown, 
  TrendingUp, Award, Flame
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const topDrivers = [
  { rank: 1, name: "Michael Chen", avatar: "", rating: 4.98, trips: 892, earnings: 12500, completionRate: 99.2, tier: "diamond" },
  { rank: 2, name: "Sarah Williams", avatar: "", rating: 4.96, trips: 845, earnings: 11800, completionRate: 98.8, tier: "diamond" },
  { rank: 3, name: "James Rodriguez", avatar: "", rating: 4.95, trips: 812, earnings: 11200, completionRate: 98.5, tier: "platinum" },
  { rank: 4, name: "Emily Davis", avatar: "", rating: 4.94, trips: 788, earnings: 10900, completionRate: 98.2, tier: "platinum" },
  { rank: 5, name: "David Kim", avatar: "", rating: 4.93, trips: 765, earnings: 10500, completionRate: 97.9, tier: "platinum" },
  { rank: 6, name: "Lisa Thompson", avatar: "", rating: 4.92, trips: 742, earnings: 10200, completionRate: 97.6, tier: "gold" },
  { rank: 7, name: "Robert Brown", avatar: "", rating: 4.91, trips: 720, earnings: 9800, completionRate: 97.3, tier: "gold" },
  { rank: 8, name: "Jennifer Lee", avatar: "", rating: 4.90, trips: 698, earnings: 9500, completionRate: 97.0, tier: "gold" },
];

const getTierConfig = (tier: string) => {
  const config: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    diamond: { icon: <Crown className="h-4 w-4" />, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    platinum: { icon: <Award className="h-4 w-4" />, color: "text-slate-300", bg: "bg-slate-400/10" },
    gold: { icon: <Medal className="h-4 w-4" />, color: "text-amber-400", bg: "bg-amber-500/10" },
    silver: { icon: <Medal className="h-4 w-4" />, color: "text-slate-400", bg: "bg-slate-500/10" },
    bronze: { icon: <Medal className="h-4 w-4" />, color: "text-orange-400", bg: "bg-orange-500/10" }
  };
  return config[tier] || config.bronze;
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">🥇</div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold">🥈</div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold">🥉</div>;
  return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">{rank}</div>;
};

export default function AdminDriverLeaderboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Driver Leaderboard
          </h2>
          <p className="text-muted-foreground">Top performing drivers this month</p>
        </div>
        <Badge className="bg-amber-500/10 text-amber-500 gap-1">
          <Flame className="h-3 w-3" />
          January 2024
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topDrivers.slice(0, 3).map((driver) => {
          const tierConfig = getTierConfig(driver.tier);
          return (
            <Card key={driver.rank} className={`${driver.rank === 1 ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block">
                  <Avatar className="h-20 w-20 mx-auto">
                    <AvatarImage src={driver.avatar} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {driver.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    {getRankBadge(driver.rank)}
                  </div>
                </div>
                <h3 className="font-bold text-lg mt-3">{driver.name}</h3>
                <Badge className={`${tierConfig.bg} ${tierConfig.color} mt-1`}>
                  {tierConfig.icon}
                  <span className="ml-1 capitalize">{driver.tier}</span>
                </Badge>
                <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-bold flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {driver.rating}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trips</p>
                    <p className="font-bold">{driver.trips}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Earnings</p>
                    <p className="font-bold text-green-500">${(driver.earnings / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
          <CardDescription>All top drivers by performance score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDrivers.map((driver) => {
              const tierConfig = getTierConfig(driver.tier);
              return (
                <div key={driver.rank} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  {getRankBadge(driver.rank)}
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {driver.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{driver.name}</span>
                      <Badge className={`${tierConfig.bg} ${tierConfig.color} text-xs`}>
                        {driver.tier}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        {driver.rating}
                      </span>
                      <span>{driver.trips} trips</span>
                      <span>{driver.completionRate}% completion</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">${driver.earnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">this month</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
