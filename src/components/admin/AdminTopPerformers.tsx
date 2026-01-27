import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Car, 
  Utensils,
  Medal,
  Crown,
  Flame
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Performer {
  id: string;
  name: string;
  avatar?: string;
  metric: number;
  metricLabel: string;
  rating: number;
  badge?: "gold" | "silver" | "bronze";
  streak?: number;
}

const topDrivers: Performer[] = [
  { id: "1", name: "Michael Chen", metric: 487, metricLabel: "trips", rating: 4.98, badge: "gold", streak: 15 },
  { id: "2", name: "Sarah Johnson", metric: 423, metricLabel: "trips", rating: 4.95, badge: "silver", streak: 12 },
  { id: "3", name: "David Williams", metric: 398, metricLabel: "trips", rating: 4.92, badge: "bronze", streak: 8 },
  { id: "4", name: "Emily Davis", metric: 356, metricLabel: "trips", rating: 4.90 },
  { id: "5", name: "James Brown", metric: 334, metricLabel: "trips", rating: 4.88 },
];

const topRestaurants: Performer[] = [
  { id: "1", name: "Bella Italia", metric: 1250, metricLabel: "orders", rating: 4.9, badge: "gold" },
  { id: "2", name: "Golden Dragon", metric: 1120, metricLabel: "orders", rating: 4.85, badge: "silver" },
  { id: "3", name: "Burger Palace", metric: 980, metricLabel: "orders", rating: 4.82, badge: "bronze" },
  { id: "4", name: "Sushi Express", metric: 890, metricLabel: "orders", rating: 4.8 },
  { id: "5", name: "Taco Fiesta", metric: 820, metricLabel: "orders", rating: 4.78 },
];

const badgeConfig = {
  gold: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  silver: { icon: Medal, color: "text-slate-400", bg: "bg-slate-400/10" },
  bronze: { icon: Medal, color: "text-amber-700", bg: "bg-amber-700/10" },
};

const PerformerList = ({ performers, type }: { performers: Performer[]; type: "driver" | "restaurant" }) => (
  <div className="space-y-2">
    {performers.map((performer, index) => {
      const BadgeConfig = performer.badge ? badgeConfig[performer.badge] : null;
      const BadgeIcon = BadgeConfig?.icon;
      
      return (
        <motion.div
          key={performer.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all",
            index === 0 
              ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20" 
              : "bg-muted/30 hover:bg-muted/50"
          )}
        >
          {/* Rank */}
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
            index === 0 ? "bg-yellow-500 text-white" :
            index === 1 ? "bg-slate-400 text-white" :
            index === 2 ? "bg-amber-700 text-white" :
            "bg-muted text-muted-foreground"
          )}>
            {index + 1}
          </div>
          
          {/* Avatar & Name */}
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={performer.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {performer.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{performer.name}</span>
              {BadgeIcon && (
                <BadgeIcon className={cn("h-4 w-4 shrink-0", BadgeConfig?.color)} />
              )}
              {performer.streak && performer.streak >= 10 && (
                <div className="flex items-center gap-0.5 text-orange-500">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold">{performer.streak}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {performer.metric.toLocaleString()} {performer.metricLabel}
              </span>
              <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-current" />
                {performer.rating}
              </span>
            </div>
          </div>
          
          {/* Trend */}
          <div className="flex items-center gap-1 text-green-500 text-xs font-medium shrink-0">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{Math.floor(Math.random() * 15 + 5)}%</span>
          </div>
        </motion.div>
      );
    })}
  </div>
);

const AdminTopPerformers = () => {
  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Performers
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            This Month
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="drivers" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="drivers" className="gap-2">
              <Car className="h-4 w-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="gap-2">
              <Utensils className="h-4 w-4" />
              Restaurants
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="drivers" className="mt-0">
            <PerformerList performers={topDrivers} type="driver" />
          </TabsContent>
          
          <TabsContent value="restaurants" className="mt-0">
            <PerformerList performers={topRestaurants} type="restaurant" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminTopPerformers;
