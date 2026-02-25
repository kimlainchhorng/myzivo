import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  Plane, 
  Hotel, 
  Car, 
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UnifiedSearchHubProps {
  className?: string;
}

const searchModes = [
  { id: "flight", label: "Flights", icon: Plane, color: "text-sky-500", bgColor: "bg-sky-500/10" },
  { id: "hotel", label: "Hotels", icon: Hotel, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  { id: "car", label: "Cars", icon: Car, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
];

const recentSearches = [
  { id: "1", query: "New York → Los Angeles", type: "flight", time: "2 hours ago" },
  { id: "2", query: "Hotels in Paris", type: "hotel", time: "Yesterday" },
  { id: "3", query: "Car rental Miami", type: "car", time: "3 days ago" },
];

const trendingNow = [
  { id: "1", destination: "Tokyo", color: "text-rose-400 bg-rose-500/10", discount: "-25%" },
  { id: "2", destination: "Bali", color: "text-cyan-400 bg-cyan-500/10", discount: "-30%" },
  { id: "3", destination: "Dubai", color: "text-amber-400 bg-amber-500/10", discount: "-20%" },
  { id: "4", destination: "Rome", color: "text-indigo-400 bg-indigo-500/10", discount: "-15%" },
];

const UnifiedSearchHub = ({ className }: UnifiedSearchHubProps) => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState("flight");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    switch (activeMode) {
      case "flight":
        navigate("/book-flight");
        break;
      case "hotel":
        navigate("/book-hotel");
        break;
      case "car":
        navigate("/rent-car");
        break;
    }
  };

  const handleTrendingClick = (destination: string) => {
    setSearchQuery(destination);
    navigate("/book-flight");
  };

  return (
    <section className={cn("py-8 sm:py-12", className)}>
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4" />
                Unified Travel Search
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Where's your next adventure?
              </h2>
              <p className="text-muted-foreground">Search flights, hotels, and cars in one place</p>
            </div>

            {/* Mode Selector */}
            <div className="flex justify-center gap-2 mb-6">
              {searchModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                    activeMode === mode.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground"
                  )}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto mb-6">
              <div className={cn(
                "relative flex items-center gap-2 p-2 rounded-2xl border-2 transition-all bg-background",
                isFocused ? "border-primary shadow-lg shadow-primary/20" : "border-border"
              )}>
                <div className="flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={
                    activeMode === "flight" 
                      ? "Where do you want to fly?" 
                      : activeMode === "hotel"
                      ? "City or hotel name"
                      : "Pickup location"
                  }
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 text-base sm:text-lg"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-primary to-teal-500 px-6 rounded-xl"
                >
                  Search
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Recent Searches & Trending */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Recent Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search) => {
                    const mode = searchModes.find(m => m.id === search.type);
                    return (
                      <button
                        key={search.id}
                        onClick={() => setSearchQuery(search.query)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className={cn("p-2 rounded-xl", mode?.bgColor)}>
                          {mode && <mode.icon className={cn("w-4 h-4", mode.color)} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{search.query}</p>
                          <p className="text-xs text-muted-foreground">{search.time}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trending Destinations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Trending Now</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {trendingNow.map((trend) => (
                    <button
                      key={trend.id}
                      onClick={() => handleTrendingClick(trend.destination)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-teal-500/5 hover:from-primary/10 hover:to-teal-500/10 border border-primary/10 transition-all text-left group"
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", trend.color.split(" ")[1])}>
                        <MapPin className={cn("w-4 h-4", trend.color.split(" ")[0])} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{trend.destination}</p>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                          {trend.discount}
                        </Badge>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default UnifiedSearchHub;
