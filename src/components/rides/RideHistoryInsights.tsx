/**
 * RideHistoryInsights - Monthly stats, most visited places, ride streaks, and badges
 * Inspired by Uber/Lyft's ride history & wrapped
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, MapPin, Clock, DollarSign, Leaf, Flame, Trophy, Star, Car, Zap, Calendar, ChevronRight, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MonthStats {
  totalRides: number;
  totalSpent: number;
  totalDistance: string;
  totalTime: string;
  co2Saved: number;
  avgRating: number;
  streak: number;
  favoriteDriver: string;
}

interface TopPlace {
  name: string;
  visits: number;
  icon: typeof MapPin;
  color: string;
}

interface RideBadge {
  id: string;
  name: string;
  icon: typeof Trophy;
  color: string;
  earned: boolean;
  progress?: number;
  requirement?: string;
}

const mockStats: MonthStats = {
  totalRides: 28,
  totalSpent: 412.50,
  totalDistance: "186 mi",
  totalTime: "14h 32m",
  co2Saved: 12.4,
  avgRating: 4.95,
  streak: 7,
  favoriteDriver: "Marcus T.",
};

const topPlaces: TopPlace[] = [
  { name: "Office - 400 Tech Blvd", visits: 12, icon: MapPin, color: "text-sky-500" },
  { name: "Home - 123 Main St", visits: 10, icon: MapPin, color: "text-emerald-500" },
  { name: "Airport - JFK Terminal 4", visits: 3, icon: MapPin, color: "text-violet-500" },
  { name: "Downtown Gym", visits: 3, icon: MapPin, color: "text-orange-500" },
];

const rideBadges: RideBadge[] = [
  { id: "first100", name: "Century Rider", icon: Award, color: "text-amber-500", earned: true, requirement: "100 rides" },
  { id: "eco", name: "Eco Warrior", icon: Leaf, color: "text-emerald-500", earned: true, requirement: "10kg CO₂ offset" },
  { id: "streak", name: "7-Day Streak", icon: Flame, color: "text-orange-500", earned: true, requirement: "Ride 7 days straight" },
  { id: "night", name: "Night Owl", icon: Star, color: "text-violet-500", earned: false, progress: 72, requirement: "20 late-night rides" },
  { id: "tipper", name: "Generous Tipper", icon: Trophy, color: "text-primary", earned: false, progress: 85, requirement: "Tip on 50 rides" },
  { id: "explorer", name: "City Explorer", icon: Zap, color: "text-sky-500", earned: false, progress: 45, requirement: "Visit 25 unique places" },
];

const weeklyChart = [
  { day: "Mon", rides: 4, amount: 62 },
  { day: "Tue", rides: 3, amount: 48 },
  { day: "Wed", rides: 5, amount: 78 },
  { day: "Thu", rides: 2, amount: 32 },
  { day: "Fri", rides: 6, amount: 95 },
  { day: "Sat", rides: 4, amount: 55 },
  { day: "Sun", rides: 2, amount: 38 },
];

export default function RideHistoryInsights() {
  const [period, setPeriod] = useState<"week" | "month">("month");
  const maxRides = Math.max(...weeklyChart.map(d => d.rides));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground">Ride Insights</h2>
          </div>
          <div className="flex gap-1">
            {(["week", "month"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                  period === p ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"
                )}
              >
                {p === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 px-4">
        {[
          { label: "Rides", value: mockStats.totalRides.toString(), icon: Car, color: "text-primary" },
          { label: "Spent", value: `$${mockStats.totalSpent.toFixed(0)}`, icon: DollarSign, color: "text-emerald-500" },
          { label: "Distance", value: mockStats.totalDistance, icon: TrendingUp, color: "text-sky-500" },
          { label: "Time", value: mockStats.totalTime, icon: Clock, color: "text-amber-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-muted/20 border border-border/30 p-3"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-lg font-black text-foreground">{stat.value}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly chart */}
      <div className="px-4">
        <div className="rounded-xl bg-muted/20 border border-border/30 p-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rides this week</span>
          <div className="flex items-end gap-2 mt-3 h-20">
            {weeklyChart.map((day, i) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.rides / maxRides) * 100}%` }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  className={cn(
                    "w-full rounded-t-md min-h-[4px]",
                    i === 4 ? "bg-primary" : "bg-primary/30"
                  )}
                />
                <span className="text-[9px] text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="px-4">
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 p-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold text-foreground">{mockStats.streak}-day streak! 🔥</span>
            <p className="text-[10px] text-muted-foreground">Keep riding to maintain your streak</p>
          </div>
          <span className="text-2xl font-black text-orange-500">{mockStats.streak}</span>
        </div>
      </div>

      {/* Top places */}
      <div className="px-4">
        <span className="text-xs font-bold text-foreground mb-2 block">Most Visited</span>
        <div className="space-y-1.5">
          {topPlaces.map((place, i) => {
            const Icon = place.icon;
            return (
              <div key={place.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/20">
                <span className="text-[10px] font-black text-muted-foreground w-4">{i + 1}</span>
                <Icon className={cn("w-4 h-4 shrink-0", place.color)} />
                <span className="text-xs text-foreground flex-1 truncate">{place.name}</span>
                <Badge variant="outline" className="text-[9px] font-bold">{place.visits}x</Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements / Badges */}
      <div className="px-4 pb-4">
        <span className="text-xs font-bold text-foreground mb-2 block">Achievements</span>
        <div className="grid grid-cols-3 gap-2">
          {rideBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center",
                  badge.earned
                    ? "bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/20"
                    : "bg-muted/10 border-border/20 opacity-60"
                )}
              >
                <Icon className={cn("w-5 h-5", badge.earned ? badge.color : "text-muted-foreground")} />
                <span className="text-[9px] font-bold text-foreground leading-tight">{badge.name}</span>
                {!badge.earned && badge.progress && (
                  <Progress value={badge.progress} className="h-1 w-full mt-1" />
                )}
                {badge.earned && (
                  <span className="text-[8px] text-amber-500">✓ Earned</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CO₂ impact */}
      <div className="px-4 pb-4">
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-4 text-center">
          <Leaf className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <span className="text-xl font-black text-foreground">{mockStats.co2Saved} kg</span>
          <p className="text-[10px] text-muted-foreground mt-1">CO₂ offset this month through green rides</p>
        </div>
      </div>
    </div>
  );
}
