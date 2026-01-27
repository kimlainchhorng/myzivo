import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Flame, 
  TrendingUp,
  RefreshCw,
  Eye,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HotZone {
  id: string;
  name: string;
  demand: "high" | "medium" | "low";
  trips: number;
  avgFare: number;
  trend: "up" | "down" | "stable";
  coordinates: { lat: number; lng: number };
}

const mockZones: HotZone[] = [
  { id: "1", name: "Downtown", demand: "high", trips: 245, avgFare: 18.50, trend: "up", coordinates: { lat: 40.7128, lng: -74.0060 } },
  { id: "2", name: "Airport Terminal", demand: "high", trips: 189, avgFare: 45.00, trend: "up", coordinates: { lat: 40.6413, lng: -73.7781 } },
  { id: "3", name: "Business District", demand: "medium", trips: 156, avgFare: 22.00, trend: "stable", coordinates: { lat: 40.7580, lng: -73.9855 } },
  { id: "4", name: "University Area", demand: "medium", trips: 134, avgFare: 12.50, trend: "up", coordinates: { lat: 40.7295, lng: -73.9965 } },
  { id: "5", name: "Shopping Mall", demand: "low", trips: 89, avgFare: 15.00, trend: "down", coordinates: { lat: 40.7484, lng: -73.9857 } },
  { id: "6", name: "Entertainment Hub", demand: "high", trips: 201, avgFare: 16.75, trend: "up", coordinates: { lat: 40.7589, lng: -73.9851 } },
];

const AdminDemandHeatmap = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: zones, isLoading, refetch } = useQuery({
    queryKey: ["admin-demand-zones"],
    queryFn: async () => {
      // In production, this would fetch real data based on trip locations
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockZones;
    },
    refetchInterval: 120000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" };
      case "medium": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" };
      case "low": return { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down": return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />;
    }
  };

  const highDemandCount = zones?.filter(z => z.demand === "high").length || 0;
  const totalTrips = zones?.reduce((acc, z) => acc + z.trips, 0) || 0;

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Demand Zones
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-500 border-red-500/20">
              <Zap className="h-3 w-3" />
              {highDemandCount} Hot Zones
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-center">
            <p className="text-2xl font-bold text-red-500">{highDemandCount}</p>
            <p className="text-xs text-muted-foreground">High Demand</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-2xl font-bold">{totalTrips}</p>
            <p className="text-xs text-muted-foreground">Active Trips</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-center">
            <p className="text-2xl font-bold text-primary">{zones?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Zones</p>
          </div>
        </div>

        {/* Zones List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))
          ) : (
            zones?.map((zone, index) => {
              const demandColors = getDemandColor(zone.demand);
              
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                    demandColors.bg,
                    demandColors.border
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", demandColors.bg)}>
                      <MapPin className={cn("h-4 w-4", demandColors.text)} />
                    </div>
                    <div>
                      <p className="font-medium">{zone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {zone.trips} trips • ${zone.avgFare.toFixed(2)} avg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(zone.trend)}
                    <Badge className={cn("capitalize", demandColors.bg, demandColors.text, demandColors.border)}>
                      {zone.demand}
                    </Badge>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* View Map Button */}
        <Button variant="outline" className="w-full mt-4 gap-2">
          <Eye className="h-4 w-4" />
          View Full Heatmap
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminDemandHeatmap;
