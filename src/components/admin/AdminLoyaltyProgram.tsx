import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Star, 
  Gift,
  TrendingUp,
  Users,
  Coins,
  Award,
  Sparkles,
  ArrowRight,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoyaltyTier {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: string[];
  memberCount: number;
  percentOfTotal: number;
}

const tiers: LoyaltyTier[] = [
  {
    id: "diamond",
    name: "Diamond",
    icon: Crown,
    color: "text-cyan-400",
    bgColor: "bg-gradient-to-br from-cyan-400/20 to-blue-500/20",
    minPoints: 10000,
    maxPoints: null,
    benefits: ["5% cashback", "Priority support", "Free upgrades", "Exclusive events"],
    memberCount: 1245,
    percentOfTotal: 4.9,
  },
  {
    id: "platinum",
    name: "Platinum",
    icon: Award,
    color: "text-slate-300",
    bgColor: "bg-gradient-to-br from-slate-300/20 to-slate-500/20",
    minPoints: 5000,
    maxPoints: 9999,
    benefits: ["3% cashback", "Priority support", "Birthday bonus"],
    memberCount: 3420,
    percentOfTotal: 13.5,
  },
  {
    id: "gold",
    name: "Gold",
    icon: Star,
    color: "text-amber-400",
    bgColor: "bg-gradient-to-br from-amber-400/20 to-yellow-500/20",
    minPoints: 2000,
    maxPoints: 4999,
    benefits: ["2% cashback", "Early access to promos"],
    memberCount: 6890,
    percentOfTotal: 27.2,
  },
  {
    id: "silver",
    name: "Silver",
    icon: Sparkles,
    color: "text-slate-400",
    bgColor: "bg-gradient-to-br from-slate-400/20 to-slate-600/20",
    minPoints: 500,
    maxPoints: 1999,
    benefits: ["1% cashback"],
    memberCount: 8750,
    percentOfTotal: 34.5,
  },
  {
    id: "bronze",
    name: "Bronze",
    icon: Gift,
    color: "text-orange-600",
    bgColor: "bg-gradient-to-br from-orange-600/20 to-orange-700/20",
    minPoints: 0,
    maxPoints: 499,
    benefits: ["Welcome bonus"],
    memberCount: 5045,
    percentOfTotal: 19.9,
  },
];

interface RewardActivity {
  id: string;
  type: "earned" | "redeemed" | "expired";
  user: string;
  points: number;
  description: string;
  timestamp: string;
}

const recentActivity: RewardActivity[] = [
  { id: "1", type: "earned", user: "Sarah J.", points: 250, description: "Completed 5 rides", timestamp: "2 min ago" },
  { id: "2", type: "redeemed", user: "Mike T.", points: -500, description: "Free ride voucher", timestamp: "15 min ago" },
  { id: "3", type: "earned", user: "Emily C.", points: 100, description: "Referral bonus", timestamp: "32 min ago" },
  { id: "4", type: "expired", user: "John D.", points: -200, description: "Points expired", timestamp: "1 hour ago" },
  { id: "5", type: "earned", user: "Lisa M.", points: 150, description: "Food order bonus", timestamp: "2 hours ago" },
];

const AdminLoyaltyProgram = () => {
  const totalMembers = tiers.reduce((sum, t) => sum + t.memberCount, 0);
  const totalPointsCirculating = 4250000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Loyalty Program</h1>
            <p className="text-muted-foreground">Manage tiers, rewards, and member engagement</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" /> Configure Program
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: totalMembers.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Points Circulating", value: `${(totalPointsCirculating / 1000000).toFixed(1)}M`, icon: Coins, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Redemption Rate", value: "68%", icon: Gift, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Program Growth", value: "+12.5%", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tiers */}
        <div className="lg:col-span-2">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Loyalty Tiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tiers.map((tier, index) => {
                  const Icon = tier.icon;
                  
                  return (
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", tier.bgColor)}>
                          <Icon className={cn("h-6 w-6", tier.color)} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{tier.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {tier.minPoints.toLocaleString()}+ pts
                              </Badge>
                            </div>
                            <span className="font-bold">{tier.memberCount.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Progress value={tier.percentOfTotal} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {tier.percentOfTotal}%
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {tier.benefits.map((benefit) => (
                              <Badge key={benefit} variant="secondary" className="text-[10px]">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      activity.type === "earned" ? "bg-green-500/10 text-green-500" :
                      activity.type === "redeemed" ? "bg-blue-500/10 text-blue-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {activity.type === "earned" ? "+" : "-"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "font-bold text-sm",
                        activity.points > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {activity.points > 0 ? "+" : ""}{activity.points}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="ghost" className="w-full mt-4 gap-2">
                View All Activity <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLoyaltyProgram;
