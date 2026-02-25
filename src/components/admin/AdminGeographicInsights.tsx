import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  MapPin, 
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  Utensils
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RegionData {
  id: string;
  name: string;
  country: string;
  flag: string;
  users: number;
  drivers: number;
  restaurants: number;
  revenue: number;
  growth: number;
  isHotspot: boolean;
}

const regions: RegionData[] = [
  {
    id: "nyc",
    name: "New York City",
    country: "USA",
    flag: "🇺🇸",
    users: 45200,
    drivers: 1250,
    restaurants: 320,
    revenue: 125000,
    growth: 18.5,
    isHotspot: true,
  },
  {
    id: "la",
    name: "Los Angeles",
    country: "USA",
    flag: "🇺🇸",
    users: 38500,
    drivers: 980,
    restaurants: 280,
    revenue: 98000,
    growth: 12.3,
    isHotspot: true,
  },
  {
    id: "london",
    name: "London",
    country: "UK",
    flag: "🇬🇧",
    users: 32100,
    drivers: 750,
    restaurants: 195,
    revenue: 85000,
    growth: 8.7,
    isHotspot: false,
  },
  {
    id: "toronto",
    name: "Toronto",
    country: "Canada",
    flag: "🇨🇦",
    users: 28400,
    drivers: 620,
    restaurants: 168,
    revenue: 72000,
    growth: 15.2,
    isHotspot: true,
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    users: 21800,
    drivers: 480,
    restaurants: 142,
    revenue: 58000,
    growth: -2.4,
    isHotspot: false,
  },
];

const AdminGeographicInsights = () => {
  const totalUsers = regions.reduce((sum, r) => sum + r.users, 0);
  const hotspotCount = regions.filter(r => r.isHotspot).length;

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Geographic Insights
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {hotspotCount} Hotspots
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={cn(
                "p-3 rounded-xl transition-all group hover:shadow-md",
                region.isHotspot 
                  ? "bg-gradient-to-r from-primary/10 to-teal-500/5 border border-primary/20" 
                  : "bg-muted/30 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Location Info */}
                <div className="flex items-center gap-2 w-[160px] shrink-0">
                  <span className="text-xl">{region.flag}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-medium text-sm">{region.name}</h4>
                      {region.isHotspot && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{region.country}</p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-medium">{(region.users / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs font-medium">{region.drivers}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium">{region.restaurants}</span>
                  </div>
                </div>
                
                {/* Revenue & Growth */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold">${(region.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-[10px] text-muted-foreground">Revenue</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium",
                    region.growth >= 0 
                      ? "bg-green-500/10 text-green-500" 
                      : "bg-red-500/10 text-red-500"
                  )}>
                    {region.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(region.growth)}%
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Summary Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{regions.length} Active Regions</span>
          </div>
          <span className="font-semibold">
            {(totalUsers / 1000).toFixed(0)}K+ Total Users
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminGeographicInsights;
