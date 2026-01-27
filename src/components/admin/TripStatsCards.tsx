import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle, XCircle, DollarSign, TrendingUp, Users, Clock, Route } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripStats {
  activeTrips?: number;
  completedToday?: number;
  cancelledToday?: number;
  revenueToday?: number;
  averageRating?: number;
  totalDrivers?: number;
  averageTripTime?: number;
  totalDistance?: number;
}

interface TripStatsCardsProps {
  stats: TripStats | null | undefined;
  isLoading?: boolean;
  variant?: "compact" | "detailed";
}

const statConfig = [
  { 
    key: "activeTrips",
    label: "Active Trips",
    icon: Activity,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/5",
    format: (v: number) => v.toString(),
  },
  { 
    key: "completedToday",
    label: "Completed",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-green-500",
    bgGradient: "from-emerald-500/10 to-green-500/5",
    format: (v: number) => v.toString(),
  },
  { 
    key: "cancelledToday",
    label: "Cancelled",
    icon: XCircle,
    gradient: "from-red-500 to-rose-500",
    bgGradient: "from-red-500/10 to-rose-500/5",
    format: (v: number) => v.toString(),
  },
  { 
    key: "revenueToday",
    label: "Revenue",
    icon: DollarSign,
    gradient: "from-primary to-teal-400",
    bgGradient: "from-primary/10 to-teal-400/5",
    format: (v: number) => `$${v.toFixed(0)}`,
  },
];

const detailedStatConfig = [
  ...statConfig,
  { 
    key: "totalDrivers",
    label: "Online Drivers",
    icon: Users,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/5",
    format: (v: number) => v.toString(),
  },
  { 
    key: "averageTripTime",
    label: "Avg. Duration",
    icon: Clock,
    gradient: "from-sky-500 to-blue-500",
    bgGradient: "from-sky-500/10 to-blue-500/5",
    format: (v: number) => `${v} min`,
  },
  { 
    key: "totalDistance",
    label: "Total Distance",
    icon: Route,
    gradient: "from-indigo-500 to-violet-500",
    bgGradient: "from-indigo-500/10 to-violet-500/5",
    format: (v: number) => `${v.toFixed(0)} km`,
  },
  { 
    key: "averageRating",
    label: "Avg. Rating",
    icon: TrendingUp,
    gradient: "from-amber-400 to-yellow-500",
    bgGradient: "from-amber-400/10 to-yellow-500/5",
    format: (v: number) => v.toFixed(1),
  },
];

export const TripStatsCards = ({ stats, isLoading, variant = "compact" }: TripStatsCardsProps) => {
  const config = variant === "detailed" ? detailedStatConfig : statConfig;
  const gridCols = variant === "detailed" 
    ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" 
    : "grid-cols-2 sm:grid-cols-4";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.05 }}
      className={cn("grid gap-3", gridCols)}
    >
      {config.map((stat, index) => {
        const Icon = stat.icon;
        const value = stats?.[stat.key as keyof TripStats] as number | undefined;
        
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all group">
              {/* Background gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                stat.bgGradient
              )} />
              
              <CardContent className="p-4 relative">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={cn(
                      "p-2.5 rounded-xl bg-gradient-to-br shadow-lg",
                      stat.gradient
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="h-7 w-14 mb-1" />
                    ) : (
                      <motion.p 
                        key={value}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-2xl font-bold"
                      >
                        {value !== undefined ? stat.format(value) : "—"}
                      </motion.p>
                    )}
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default TripStatsCards;
