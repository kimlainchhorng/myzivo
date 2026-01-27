import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, CheckCircle, XCircle, DollarSign, TrendingUp, TrendingDown, Users, Clock, Route, Star, Zap } from "lucide-react";
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
  pendingTrips?: number;
  peakHourTrips?: number;
}

interface TripStatsCardsProps {
  stats: TripStats | null | undefined;
  isLoading?: boolean;
  variant?: "compact" | "detailed" | "minimal";
  showTrends?: boolean;
}

const statConfig = [
  { 
    key: "activeTrips",
    label: "Active Trips",
    description: "Currently ongoing trips",
    icon: Activity,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/5",
    format: (v: number) => v.toString(),
    trend: 12,
  },
  { 
    key: "completedToday",
    label: "Completed",
    description: "Trips completed today",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-green-500",
    bgGradient: "from-emerald-500/10 to-green-500/5",
    format: (v: number) => v.toString(),
    trend: 8,
  },
  { 
    key: "cancelledToday",
    label: "Cancelled",
    description: "Trips cancelled today",
    icon: XCircle,
    gradient: "from-red-500 to-rose-500",
    bgGradient: "from-red-500/10 to-rose-500/5",
    format: (v: number) => v.toString(),
    trend: -5,
  },
  { 
    key: "revenueToday",
    label: "Revenue",
    description: "Total earnings today",
    icon: DollarSign,
    gradient: "from-primary to-teal-400",
    bgGradient: "from-primary/10 to-teal-400/5",
    format: (v: number) => `$${v.toLocaleString()}`,
    trend: 15,
  },
];

const detailedStatConfig = [
  ...statConfig,
  { 
    key: "totalDrivers",
    label: "Online Drivers",
    description: "Drivers currently available",
    icon: Users,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/5",
    format: (v: number) => v.toString(),
    trend: 3,
  },
  { 
    key: "averageTripTime",
    label: "Avg. Duration",
    description: "Average trip time",
    icon: Clock,
    gradient: "from-sky-500 to-blue-500",
    bgGradient: "from-sky-500/10 to-blue-500/5",
    format: (v: number) => `${v} min`,
    trend: -2,
  },
  { 
    key: "totalDistance",
    label: "Total Distance",
    description: "Distance covered today",
    icon: Route,
    gradient: "from-indigo-500 to-violet-500",
    bgGradient: "from-indigo-500/10 to-violet-500/5",
    format: (v: number) => `${(v * 0.621371).toFixed(0)} mi`,
    trend: 10,
  },
  { 
    key: "averageRating",
    label: "Avg. Rating",
    description: "Average driver rating",
    icon: Star,
    gradient: "from-amber-400 to-yellow-500",
    bgGradient: "from-amber-400/10 to-yellow-500/5",
    format: (v: number) => v.toFixed(1),
    trend: 1,
  },
];

const minimalStatConfig = [
  { 
    key: "activeTrips",
    label: "Active",
    icon: Zap,
    gradient: "from-amber-500 to-orange-500",
    format: (v: number) => v.toString(),
  },
  { 
    key: "completedToday",
    label: "Done",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-green-500",
    format: (v: number) => v.toString(),
  },
  { 
    key: "revenueToday",
    label: "Revenue",
    icon: DollarSign,
    gradient: "from-primary to-teal-400",
    format: (v: number) => `$${(v / 1000).toFixed(1)}k`,
  },
];

export const TripStatsCards = ({ stats, isLoading, variant = "compact", showTrends = true }: TripStatsCardsProps) => {
  const config = variant === "detailed" ? detailedStatConfig : variant === "minimal" ? minimalStatConfig : statConfig;
  
  const gridCols = variant === "detailed" 
    ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" 
    : variant === "minimal"
    ? "grid-cols-3"
    : "grid-cols-2 sm:grid-cols-4";

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-4 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50", gridCols)}>
        {config.map((stat) => {
          const Icon = stat.icon;
          const value = stats?.[stat.key as keyof TripStats] as number | undefined;
          return (
            <div key={stat.key} className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", stat.gradient)}>
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <p className="text-sm font-bold">{value !== undefined ? stat.format(value) : "—"}</p>
                )}
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.05 }}
        className={cn("grid gap-3", gridCols)}
      >
        {config.map((stat, index) => {
          const Icon = stat.icon;
          const value = stats?.[stat.key as keyof TripStats] as number | undefined;
          const trend: number | undefined = 'trend' in stat ? (stat.trend as number) : undefined;
          
          return (
            <Tooltip key={stat.key}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    {/* Background gradient on hover */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      'bgGradient' in stat ? (stat.bgGradient as string) : ""
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
                        <div className="flex-1 min-w-0">
                          {isLoading ? (
                            <Skeleton className="h-7 w-14 mb-1" />
                          ) : (
                            <motion.p 
                              key={value}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-2xl font-bold truncate"
                            >
                              {value !== undefined ? stat.format(value) : "—"}
                            </motion.p>
                          )}
                          <p className="text-xs text-muted-foreground font-medium truncate">{stat.label}</p>
                        </div>
                        {showTrends && trend !== undefined && !isLoading && (
                          <div className={cn(
                            "flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full",
                            trend >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(trend)}%
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{'description' in stat ? String(stat.description) : stat.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </motion.div>
    </TooltipProvider>
  );
};

export default TripStatsCards;
