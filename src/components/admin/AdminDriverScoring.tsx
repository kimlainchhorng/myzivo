import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Star,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  Clock,
  MapPin,
  DollarSign,
  Search,
  Eye,
  Gift,
  Medal,
  Crown,
  Sparkles,
  ChevronRight,
  Flame,
  ThumbsUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface DriverScore {
  id: string;
  full_name: string;
  avatar_url: string | null;
  vehicle_type: string;
  performanceScore: number;
  rating: number;
  completionRate: number;
  acceptanceRate: number;
  tripCount: number;
  earnings: number;
  onlineHours: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  badges: string[];
  streak: number;
  trend: number;
}

const tierConfig = {
  bronze: { color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Medal },
  silver: { color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", icon: Medal },
  gold: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Trophy },
  platinum: { color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", icon: Crown },
  diamond: { color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", icon: Sparkles },
};

const calculateTier = (score: number): DriverScore["tier"] => {
  if (score >= 95) return "diamond";
  if (score >= 85) return "platinum";
  if (score >= 70) return "gold";
  if (score >= 50) return "silver";
  return "bronze";
};

const calculatePerformanceScore = (
  rating: number,
  completionRate: number,
  acceptanceRate: number,
  tripCount: number
): number => {
  // Weighted scoring: Rating (40%), Completion (25%), Acceptance (20%), Volume (15%)
  const ratingScore = (rating / 5) * 40;
  const completionScore = (completionRate / 100) * 25;
  const acceptanceScore = (acceptanceRate / 100) * 20;
  const volumeScore = Math.min(tripCount / 100, 1) * 15;
  
  return Math.round(ratingScore + completionScore + acceptanceScore + volumeScore);
};

const AdminDriverScoring = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DriverScore | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: driverScores, isLoading } = useQuery({
    queryKey: ["admin-driver-scores"],
    queryFn: async () => {
      // Fetch drivers with their stats
      const { data: drivers, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("status", "verified")
        .order("total_trips", { ascending: false });

      if (error) throw error;

      // Fetch trip stats for each driver
      const { data: trips } = await supabase
        .from("trips")
        .select("driver_id, status, rating, fare_amount")
        .in("status", ["completed", "cancelled", "requested"])
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const scores: DriverScore[] = (drivers || []).map((driver) => {
        const driverTrips = trips?.filter(t => t.driver_id === driver.id) || [];
        const completedTrips = driverTrips.filter(t => t.status === "completed");
        const requestedTrips = driverTrips.filter(t => ["requested", "accepted", "completed"].includes(t.status as string));
        
        const rating = driver.rating || 4.5;
        const completionRate = driverTrips.length > 0 
          ? (completedTrips.length / driverTrips.length) * 100 
          : 95;
        const acceptanceRate = requestedTrips.length > 0 
          ? (completedTrips.length / requestedTrips.length) * 100 
          : 90;
        const tripCount = completedTrips.length;
        const earnings = completedTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0);
        
        const performanceScore = calculatePerformanceScore(rating, completionRate, acceptanceRate, tripCount);
        
        // Generate badges based on performance
        const badges: string[] = [];
        if (rating >= 4.8) badges.push("Top Rated");
        if (completionRate >= 98) badges.push("Reliable");
        if (tripCount >= 50) badges.push("High Volume");
        if (acceptanceRate >= 95) badges.push("Always Ready");
        
        return {
          id: driver.id,
          full_name: driver.full_name,
          avatar_url: driver.avatar_url,
          vehicle_type: driver.vehicle_type,
          performanceScore,
          rating,
          completionRate,
          acceptanceRate,
          tripCount,
          earnings,
          onlineHours: Math.floor(Math.random() * 40) + 20, // Simulated
          tier: calculateTier(performanceScore),
          badges,
          streak: Math.floor(Math.random() * 14) + 1, // Simulated active streak
          trend: Math.floor(Math.random() * 20) - 5, // -5 to +15
        };
      });

      return scores.sort((a, b) => b.performanceScore - a.performanceScore);
    },
  });

  const filteredScores = driverScores?.filter(d =>
    d.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const tierDistribution = {
    diamond: driverScores?.filter(d => d.tier === "diamond").length || 0,
    platinum: driverScores?.filter(d => d.tier === "platinum").length || 0,
    gold: driverScores?.filter(d => d.tier === "gold").length || 0,
    silver: driverScores?.filter(d => d.tier === "silver").length || 0,
    bronze: driverScores?.filter(d => d.tier === "bronze").length || 0,
  };

  const avgScore = driverScores?.length 
    ? Math.round(driverScores.reduce((acc, d) => acc + d.performanceScore, 0) / driverScores.length)
    : 0;

  const openDriverDetail = (driver: DriverScore) => {
    setSelectedDriver(driver);
    setIsDetailOpen(true);
  };

  const ScoreBadge = ({ score }: { score: number }) => {
    const tier = calculateTier(score);
    const config = tierConfig[tier];
    const TierIcon = config.icon;
    
    return (
      <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium", config.bg, config.color)}>
        <TierIcon className="h-3.5 w-3.5" />
        {score}
      </div>
    );
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 shadow-lg"
          >
            <Trophy className="h-6 w-6 text-amber-500" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Performance Scoring
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </motion.div>
            </h1>
            <p className="text-muted-foreground">Driver rankings and tier management</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64 bg-card/50"
          />
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{avgScore}</p>
                )}
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(Object.entries(tierDistribution) as [DriverScore["tier"], number][]).map(([tier, count]) => {
          const config = tierConfig[tier];
          const TierIcon = config.icon;
          return (
            <Card key={tier} className={cn("border-0 backdrop-blur-xl", config.bg)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", config.bg, config.border, "border")}>
                    <TierIcon className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="h-7 w-8" />
                    ) : (
                      <p className={cn("text-2xl font-bold", config.color)}>{count}</p>
                    )}
                    <p className="text-sm text-muted-foreground capitalize">{tier}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList className="bg-card/50">
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="incentives" className="gap-2">
              <Gift className="h-4 w-4" />
              Incentives
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Driver Leaderboard</CardTitle>
                <CardDescription>Ranked by performance score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="hidden md:table-cell">Completion</TableHead>
                        <TableHead className="hidden lg:table-cell">Trips</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(8)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredScores.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">No drivers found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredScores.map((driver, index) => {
                          const config = tierConfig[driver.tier];
                          const TierIcon = config.icon;
                          return (
                            <TableRow
                              key={driver.id}
                              className={cn(
                                "hover:bg-muted/30 transition-colors cursor-pointer",
                                index === 0 && "bg-amber-500/5",
                                index === 1 && "bg-slate-500/5",
                                index === 2 && "bg-orange-500/5"
                              )}
                              onClick={() => openDriverDetail(driver)}
                            >
                              <TableCell>
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                  index === 0 ? "bg-amber-500 text-white" :
                                  index === 1 ? "bg-slate-400 text-white" :
                                  index === 2 ? "bg-orange-600 text-white" :
                                  "bg-muted text-muted-foreground"
                                )}>
                                  {index + 1}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={driver.avatar_url || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-500/20 text-sm">
                                      {driver.full_name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{driver.full_name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{driver.vehicle_type}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <ScoreBadge score={driver.performanceScore} />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  <span className="font-medium">{driver.rating.toFixed(1)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  <Progress value={driver.completionRate} className="h-2 w-16" />
                                  <span className="text-sm text-muted-foreground">{driver.completionRate.toFixed(0)}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell font-medium">
                                {driver.tripCount}
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("gap-1", config.bg, config.color, "border-transparent")}>
                                  <TierIcon className="h-3 w-3" />
                                  <span className="capitalize">{driver.tier}</span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incentives">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Active Incentives */}
              <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    Peak Hours Bonus
                  </CardTitle>
                  <CardDescription>Active during high demand</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bonus Rate</span>
                      <Badge className="bg-green-500/20 text-green-500">+25%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Hours</span>
                      <span className="font-medium">7-9 AM, 5-8 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Drivers Earning</span>
                      <span className="font-medium text-green-500">24</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-500" />
                    Weekly Quest
                  </CardTitle>
                  <CardDescription>Complete 50 trips this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reward</span>
                      <Badge className="bg-amber-500/20 text-amber-500">$75 Bonus</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ends In</span>
                      <span className="font-medium">3 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Participants</span>
                      <span className="font-medium text-amber-500">156</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-violet-500" />
                    Rating Streak
                  </CardTitle>
                  <CardDescription>Maintain 4.9+ for 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reward</span>
                      <Badge className="bg-violet-500/20 text-violet-500">$50 Bonus</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Min. Trips/Day</span>
                      <span className="font-medium">5 trips</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">On Streak</span>
                      <span className="font-medium text-violet-500">38</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-cyan-500" />
                    Airport Runs
                  </CardTitle>
                  <CardDescription>Complete airport pickups/dropoffs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Per Trip Bonus</span>
                      <Badge className="bg-cyan-500/20 text-cyan-500">+$5</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Today's Trips</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Paid Out</span>
                      <span className="font-medium text-cyan-500">$235</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-pink-500/10 to-rose-500/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-pink-500" />
                    Referral Bonus
                  </CardTitle>
                  <CardDescription>Invite new drivers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Per Referral</span>
                      <Badge className="bg-pink-500/20 text-pink-500">$100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="font-medium">12 referrals</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Paid Out</span>
                      <span className="font-medium text-pink-500">$1,200</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-slate-500/10 to-zinc-500/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-500" />
                    Night Owl
                  </CardTitle>
                  <CardDescription>Late night driving bonus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bonus Rate</span>
                      <Badge className="bg-slate-500/20 text-slate-500">+15%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Hours</span>
                      <span className="font-medium">10 PM - 5 AM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Drivers</span>
                      <span className="font-medium">18</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Driver Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Driver Performance Details</DialogTitle>
            <DialogDescription>Detailed scoring breakdown</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedDriver.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-500/20 text-lg">
                    {selectedDriver.full_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedDriver.full_name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{selectedDriver.vehicle_type} driver</p>
                </div>
                <ScoreBadge score={selectedDriver.performanceScore} />
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Score Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rating ({selectedDriver.rating.toFixed(1)}/5)</span>
                    <span className="text-sm font-medium">{Math.round((selectedDriver.rating / 5) * 40)}/40</span>
                  </div>
                  <Progress value={(selectedDriver.rating / 5) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion ({selectedDriver.completionRate.toFixed(0)}%)</span>
                    <span className="text-sm font-medium">{Math.round((selectedDriver.completionRate / 100) * 25)}/25</span>
                  </div>
                  <Progress value={selectedDriver.completionRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Acceptance ({selectedDriver.acceptanceRate.toFixed(0)}%)</span>
                    <span className="text-sm font-medium">{Math.round((selectedDriver.acceptanceRate / 100) * 20)}/20</span>
                  </div>
                  <Progress value={selectedDriver.acceptanceRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Volume ({selectedDriver.tripCount} trips)</span>
                    <span className="text-sm font-medium">{Math.round(Math.min(selectedDriver.tripCount / 100, 1) * 15)}/15</span>
                  </div>
                  <Progress value={Math.min(selectedDriver.tripCount, 100)} className="h-2" />
                </div>
              </div>

              {/* Badges */}
              {selectedDriver.badges.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Earned Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDriver.badges.map((badge) => (
                      <Badge key={badge} variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <DollarSign className="h-4 w-4 mx-auto text-green-500 mb-1" />
                  <p className="font-semibold">${selectedDriver.earnings.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <Flame className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                  <p className="font-semibold">{selectedDriver.streak} days</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <TrendingUp className={cn("h-4 w-4 mx-auto mb-1", selectedDriver.trend >= 0 ? "text-green-500" : "text-red-500")} />
                  <p className="font-semibold">{selectedDriver.trend >= 0 ? "+" : ""}{selectedDriver.trend}%</p>
                  <p className="text-xs text-muted-foreground">Trend</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminDriverScoring;
