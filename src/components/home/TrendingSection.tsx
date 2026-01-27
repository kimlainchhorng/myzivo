import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/ui/personalization";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    <section className="py-14 lg:py-24 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-radial from-eats/8 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 rounded-full blur-3xl" />
      
      {/* Floating emojis */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-24 left-[8%] text-4xl hidden lg:block opacity-40"
      >
        🔥
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-32 right-[6%] text-4xl hidden lg:block opacity-30"
      >
        ⭐
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-eats to-orange-500 shadow-xl shadow-eats/30"
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Recommended For You</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Personalized picks based on your activity</p>
              </div>
            </div>
            <motion.div whileHover={{ x: 5 }}>
              <Button variant="ghost" className="text-eats gap-1 hidden sm:flex font-bold group">
                View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trendingServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingSection;
