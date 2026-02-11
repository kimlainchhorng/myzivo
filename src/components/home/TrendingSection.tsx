import { useNavigate } from "react-router-dom";
import { TrendingUp, ChevronRight, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/ui/personalization";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const defaultTrendingServices = [
  { id: 1, title: "Airport Transfer", emoji: "✈️", subtitle: "LAX, JFK, ORD", reason: "Trending this week", rating: 4.9, price: "From $45", color: "rides" as const },
  { id: 2, title: "Burger Joint", emoji: "🍔", subtitle: "American • Fast Food", reason: "Based on your orders", rating: 4.8, price: "Free delivery", color: "eats" as const, badge: "20% OFF" },
  { id: 3, title: "NYC → Miami", emoji: "🌴", subtitle: "Jan 28 - Feb 2", reason: "Prices dropped 15%", rating: 4.7, price: "From $189", color: "sky" as const },
];

const TrendingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch personalized recommendations
  const { data: recommendations } = useQuery({
    queryKey: ["home-recommendations", user?.id],
    queryFn: async () => {
      const items: any[] = [];
      
      // Fetch popular restaurants
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, rating")
        .eq("status", "active")
        .order("rating", { ascending: false })
        .limit(2);
      
      restaurants?.forEach(r => items.push({
        id: r.id,
        title: r.name,
        emoji: "🍔",
        subtitle: r.cuisine_type || "Restaurant",
        reason: "Top rated",
        rating: r.rating || 4.5,
        price: "Free delivery",
        color: "eats" as const,
      }));

      // Fetch popular flights
      const { data: flights } = await supabase
        .from("flights")
        .select("id, departure_city, arrival_city, economy_price")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);
      
      flights?.forEach(f => items.push({
        id: f.id,
        title: `${f.departure_city} → ${f.arrival_city}`,
        emoji: "✈️",
        subtitle: "Available now",
        reason: "Popular route",
        rating: 4.7,
        price: `From $${f.economy_price || 199}`,
        color: "sky" as const,
      }));
      
      return items.length ? items : defaultTrendingServices;
    },
    staleTime: 5 * 60 * 1000,
  });

  const trendingServices = recommendations?.length ? recommendations : defaultTrendingServices;

  return (
    <section className="py-10 sm:py-14 lg:py-24 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-radial from-eats/8 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-bl from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 rounded-full blur-3xl" />
      
      {/* Floating icon decorations */}
      <div className="absolute top-24 left-[8%] hidden md:block opacity-30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/15 to-red-500/15 flex items-center justify-center backdrop-blur-sm">
          <Flame className="w-5 h-5 text-orange-500/50" />
        </div>
      </div>
      <div className="absolute bottom-32 right-[6%] hidden md:block opacity-30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-500/15 flex items-center justify-center backdrop-blur-sm">
          <Star className="w-5 h-5 text-amber-500/50" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header with enhanced styling */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-eats to-orange-500 shadow-lg sm:shadow-xl shadow-eats/30 overflow-hidden transition-transform duration-200 hover:scale-110 hover:-rotate-3">
                <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl lg:text-4xl font-bold">Recommended For You</h2>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Personalized picks based on your activity</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="text-eats gap-1 hidden sm:flex font-bold group transition-transform duration-200 hover:translate-x-1"
            >
              View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Recommendations Grid - mobile-optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {trendingServices.map((service, index) => (
              <div
                key={service.id}
                className={cn(
                  "animate-in fade-in slide-in-from-bottom-4",
                  "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <RecommendationCard
                  title={service.title}
                  subtitle={service.subtitle}
                  emoji={service.emoji}
                  reason={service.reason}
                  rating={service.rating}
                  price={service.price}
                  color={service.color}
                  badge={service.badge}
                  onClick={() => navigate(service.color === "eats" ? "/food" : service.color === "sky" ? "/book-flight" : "/ride")}
                />
              </div>
            ))}
          </div>
          
          {/* Mobile "View all" button */}
          <div className="sm:hidden text-center">
            <Button 
              variant="outline" 
              className="text-eats border-eats/30 gap-1 font-semibold touch-manipulation active:scale-[0.98]"
            >
              View all recommendations <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;