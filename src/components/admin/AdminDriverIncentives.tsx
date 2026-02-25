import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Gift, 
  Zap, 
  Flame, 
  Target, 
  Trophy,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Users,
  Sparkles,
  Award,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Incentive {
  id: string;
  name: string;
  type: "bonus" | "quest" | "streak" | "surge";
  description: string;
  reward: number;
  target: number;
  current: number;
  isActive: boolean;
  expiresAt: string;
  eligibleDrivers: number;
  claimed: number;
}

const incentives: Incentive[] = [
  {
    id: "1",
    name: "Peak Hour Bonus",
    type: "bonus",
    description: "Complete 3 rides between 5-8 PM",
    reward: 25,
    target: 3,
    current: 2,
    isActive: true,
    expiresAt: "2024-01-29T20:00:00",
    eligibleDrivers: 450,
    claimed: 127,
  },
  {
    id: "2",
    name: "Weekend Warrior Quest",
    type: "quest",
    description: "Complete 20 trips this weekend",
    reward: 100,
    target: 20,
    current: 12,
    isActive: true,
    expiresAt: "2024-01-28T23:59:00",
    eligibleDrivers: 820,
    claimed: 245,
  },
  {
    id: "3",
    name: "5-Day Streak",
    type: "streak",
    description: "Drive 5 consecutive days",
    reward: 75,
    target: 5,
    current: 3,
    isActive: true,
    expiresAt: "2024-02-01T23:59:00",
    eligibleDrivers: 1200,
    claimed: 89,
  },
  {
    id: "4",
    name: "Airport Surge",
    type: "surge",
    description: "1.8x surge at airport zone",
    reward: 0,
    target: 0,
    current: 0,
    isActive: true,
    expiresAt: "2024-01-29T18:00:00",
    eligibleDrivers: 0,
    claimed: 0,
  },
  {
    id: "5",
    name: "New Driver Welcome",
    type: "bonus",
    description: "Complete 10 trips in first week",
    reward: 150,
    target: 10,
    current: 4,
    isActive: true,
    expiresAt: "2024-02-05T23:59:00",
    eligibleDrivers: 45,
    claimed: 12,
  },
];

const typeConfig = {
  bonus: { icon: Gift, color: "text-green-500", bg: "bg-green-500/10", label: "Bonus" },
  quest: { icon: Target, color: "text-violet-500", bg: "bg-violet-500/10", label: "Quest" },
  streak: { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", label: "Streak" },
  surge: { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", label: "Surge" },
};

const AdminDriverIncentives = () => {
  const [activeIncentives, setActiveIncentives] = useState(incentives);

  const toggleIncentive = (id: string) => {
    setActiveIncentives(prev => 
      prev.map(inc => inc.id === id ? { ...inc, isActive: !inc.isActive } : inc)
    );
  };

  const stats = [
    { label: "Active Incentives", value: activeIncentives.filter(i => i.isActive).length, icon: Sparkles, color: "text-primary" },
    { label: "Total Budget", value: "$12,450", icon: DollarSign, color: "text-green-500" },
    { label: "Drivers Engaged", value: "2,515", icon: Users, color: "text-blue-500" },
    { label: "Completion Rate", value: "68%", icon: Trophy, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Award className="h-5 w-5 text-white" />
            </div>
            Driver Incentives
          </h2>
          <p className="text-muted-foreground mt-1">Manage bonuses, quests, streaks and surge pricing</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Incentive
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", stat.color.replace("text-", "bg-") + "/10")}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incentives List */}
      <div className="grid gap-4">
        {activeIncentives.map((incentive, index) => {
          const config = typeConfig[incentive.type];
          const Icon = config.icon;
          const progress = incentive.target > 0 ? (incentive.current / incentive.target) * 100 : 0;

          return (
            <Card 
              key={incentive.id}
              className={cn(
                "border-0 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300",
                !incentive.isActive && "opacity-60"
              )}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Icon & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn("p-3 rounded-xl shrink-0", config.bg)}>
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{incentive.name}</h3>
                        <Badge variant="secondary" className={cn("text-xs", config.bg, config.color)}>
                          {config.label}
                        </Badge>
                        {incentive.isActive && (
                          <Badge className="bg-green-500/10 text-green-500 text-xs">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{incentive.description}</p>
                      
                      {incentive.type !== "surge" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{incentive.current}/{incentive.target}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                    {incentive.type !== "surge" ? (
                      <>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-500">${incentive.reward}</p>
                          <p className="text-xs text-muted-foreground">Reward</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{incentive.eligibleDrivers}</p>
                          <p className="text-xs text-muted-foreground">Eligible</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">{incentive.claimed}</p>
                          <p className="text-xs text-muted-foreground">Claimed</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                        <span className="text-lg font-bold">1.8x</span>
                        <span className="text-sm text-muted-foreground">Multiplier</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Expires {new Date(incentive.expiresAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                      <Switch 
                        checked={incentive.isActive}
                        onCheckedChange={() => toggleIncentive(incentive.id)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Create Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(typeConfig).map(([type, config], index) => {
          const Icon = config.icon;
          return (
            <Card 
              key={type}
              className="border-0 bg-card/30 backdrop-blur-sm border-dashed border-2 border-border/50 hover:border-primary/50 hover:bg-card/50 transition-all cursor-pointer group animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className={cn("p-3 rounded-xl mb-3 transition-transform group-hover:scale-110", config.bg)}>
                  <Icon className={cn("h-6 w-6", config.color)} />
                </div>
                <h4 className="font-medium mb-1">New {config.label}</h4>
                <p className="text-xs text-muted-foreground">Click to create</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDriverIncentives;
