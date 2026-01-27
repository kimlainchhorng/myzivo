import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Car, UtensilsCrossed, Plane, Hotel, CarFront, Package, 
  Train, Ticket, Shield, TrendingUp, Clock, Star, Zap,
  ChevronRight, ArrowRight, Sparkles, MapPin, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard, QuickAction } from "@/components/ui/premium-card";
import { RecommendationCard, QuickRepeatOrders, RecentlyViewed } from "@/components/ui/personalization";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
};

const quickActions = [
  { id: "ride", icon: Car, label: "Book a Ride", description: "Get there in minutes", href: "/ride", color: "rides" as const, badge: "5 min" },
  { id: "food", icon: UtensilsCrossed, label: "Order Food", description: "1000+ restaurants", href: "/food", color: "eats" as const, badge: "20% off" },
  { id: "flight", icon: Plane, label: "Book Flight", description: "500+ destinations", href: "/book-flight", color: "sky" as const },
  { id: "hotel", icon: Hotel, label: "Find Hotel", description: "Best rates guaranteed", href: "/book-hotel", color: "amber" as const },
];

const defaultTrendingServices = [
  { id: 1, title: "Airport Transfer", emoji: "✈️", subtitle: "LAX, JFK, ORD", reason: "Trending this week", rating: 4.9, price: "From $45", color: "rides" as const },
  { id: 2, title: "Burger Joint", emoji: "🍔", subtitle: "American • Fast Food", reason: "Based on your orders", rating: 4.8, price: "Free delivery", color: "eats" as const, badge: "20% OFF" },
  { id: 3, title: "NYC → Miami", emoji: "🌴", subtitle: "Jan 28 - Feb 2", reason: "Prices dropped 15%", rating: 4.7, price: "From $189", color: "sky" as const },
];

const defaultRecentItems = [
  { id: "1", title: "Pizza Palace", subtitle: "Italian", emoji: "🍕", type: "restaurant" as const },
  { id: "2", title: "Grand Plaza", subtitle: "New York", emoji: "🏨", type: "hotel" as const },
  { id: "3", title: "Home → Work", subtitle: "Daily commute", emoji: "🏠", type: "ride" as const },
];

const defaultRepeatOrders = [
  { id: "1", title: "Burger Joint", items: ["Double Stack", "Fries", "Coke"], price: "$24.99", emoji: "🍔", lastOrdered: "2 days ago" },
  { id: "2", title: "Sakura Sushi", items: ["Dragon Roll", "Miso Soup"], price: "$32.50", emoji: "🍣", lastOrdered: "Last week" },
];

const QuickActionsSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch real recent activity for logged-in users
  const { data: recentActivity } = useQuery({
    queryKey: ["home-recent-activity", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const [trips, foodOrders, hotels] = await Promise.all([
        supabase.from("trips").select("id, pickup_address, created_at").eq("rider_id", user.id).order("created_at", { ascending: false }).limit(2),
        supabase.from("food_orders").select("id, restaurants(name), created_at").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(2),
        supabase.from("hotel_bookings").select("id, hotels(name, city), created_at").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(1),
      ]);

      const items: any[] = [];
      trips.data?.forEach(t => items.push({ id: t.id, title: t.pickup_address?.slice(0, 20) || "Ride", subtitle: "Recent trip", emoji: "🚗", type: "ride" as const }));
      foodOrders.data?.forEach((o: any) => items.push({ id: o.id, title: o.restaurants?.name || "Order", subtitle: "Food order", emoji: "🍕", type: "restaurant" as const }));
      hotels.data?.forEach((h: any) => items.push({ id: h.id, title: h.hotels?.name || "Hotel", subtitle: h.hotels?.city || "Stay", emoji: "🏨", type: "hotel" as const }));
      
      return items.slice(0, 3);
    },
    enabled: !!user?.id,
  });

  // Fetch repeat food orders
  const { data: repeatFoodOrders } = useQuery({
    queryKey: ["home-repeat-orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from("food_orders")
        .select("id, total_amount, items, restaurants(name), created_at")
        .eq("customer_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(2);
      
      return data?.map((order: any) => {
        const items = Array.isArray(order.items) ? order.items.slice(0, 3).map((i: any) => i.name || "Item") : [];
        const daysAgo = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: order.id,
          title: order.restaurants?.name || "Restaurant",
          items,
          price: `$${order.total_amount?.toFixed(2) || "0.00"}`,
          emoji: "🍔",
          lastOrdered: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`
        };
      }) || [];
    },
    enabled: !!user?.id,
  });

  const recentItems = recentActivity?.length ? recentActivity : defaultRecentItems;
  const repeatOrders = repeatFoodOrders?.length ? repeatFoodOrders : defaultRepeatOrders;
  
  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-rides">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold">Quick Actions</h2>
                <p className="text-sm text-muted-foreground">One tap to get started</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <QuickAction
                key={action.id}
                icon={<action.icon className="w-6 h-6 text-white" />}
                label={action.label}
                description={action.description}
                onClick={() => navigate(action.href)}
                color={action.color}
                badge={action.badge}
              />
            ))}
          </motion.div>

          {/* Recent + Repeat Orders */}
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}>
              <RecentlyViewed 
                items={recentItems} 
                onItemClick={(item) => console.log("Clicked:", item)}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <QuickRepeatOrders 
                orders={repeatOrders}
                onReorder={(id) => console.log("Reorder:", id)}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

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
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-eats/10">
                <TrendingUp className="w-5 h-5 text-eats" />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold">Recommended For You</h2>
                <p className="text-sm text-muted-foreground">Personalized picks based on your activity</p>
              </div>
            </div>
            <Button variant="ghost" className="text-primary gap-1 hidden sm:flex">
              View all <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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

const LiveStatsSection = () => {
  return (
    <section className="py-12 lg:py-16 border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Live Platform Stats</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Trusted by <span className="text-gradient-rides">millions</span> worldwide
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              value="2.5M+"
              label="Active riders"
              icon={<Users className="w-5 h-5" />}
              trend={{ value: "12%", positive: true }}
              color="rides"
            />
            <StatCard
              value="50K+"
              label="Partner restaurants"
              icon={<UtensilsCrossed className="w-5 h-5" />}
              trend={{ value: "8%", positive: true }}
              color="eats"
            />
            <StatCard
              value="4.9★"
              label="Average rating"
              icon={<Star className="w-5 h-5" />}
              trend={{ value: "0.2", positive: true }}
              color="amber"
            />
            <StatCard
              value="< 5 min"
              label="Avg. pickup time"
              icon={<Clock className="w-5 h-5" />}
              trend={{ value: "15%", positive: true }}
              color="primary"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const AllServicesSection = () => {
  const navigate = useNavigate();

  const services = [
    { id: "rides", icon: Car, title: "Rides", desc: "Get there fast", href: "/ride", color: "gradient-rides" },
    { id: "eats", icon: UtensilsCrossed, title: "Eats", desc: "Food delivered", href: "/food", color: "gradient-eats" },
    { id: "flights", icon: Plane, title: "Flights", desc: "500+ destinations", href: "/book-flight", color: "bg-gradient-to-br from-sky-500 to-sky-600" },
    { id: "hotels", icon: Hotel, title: "Hotels", desc: "Best rates", href: "/book-hotel", color: "bg-gradient-to-br from-amber-500 to-amber-600" },
    { id: "cars", icon: CarFront, title: "Car Rental", desc: "Drive anywhere", href: "/rent-car", color: "bg-gradient-to-br from-primary to-accent" },
    { id: "package", icon: Package, title: "Package", desc: "Same-day delivery", href: "/package-delivery", color: "bg-gradient-to-br from-emerald-500 to-emerald-600", isNew: true },
    { id: "train", icon: Train, title: "Bus & Train", desc: "Intercity travel", href: "/ground-transport", color: "bg-gradient-to-br from-violet-500 to-violet-600", isNew: true },
    { id: "events", icon: Ticket, title: "Events", desc: "Concerts & sports", href: "/events", color: "bg-gradient-to-br from-pink-500 to-pink-600", isNew: true },
    { id: "insurance", icon: Shield, title: "Insurance", desc: "Travel protection", href: "/travel-insurance", color: "bg-gradient-to-br from-cyan-500 to-cyan-600", isNew: true },
  ];

  return (
    <section className="py-12 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-eats/5 via-transparent to-transparent opacity-40" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-rides" />
            <span className="text-muted-foreground">All-in-One Platform</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Everything you need, <span className="text-gradient-rides">one app</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From daily commutes to dream vacations, ZIVO has you covered
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {services.map((service) => (
            <motion.button
              key={service.id}
              variants={itemVariants}
              onClick={() => navigate(service.href)}
              className="relative glass-card p-4 sm:p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group text-left overflow-hidden"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {service.isNew && (
                <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold bg-eats/20 text-eats rounded-full">
                  New
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{service.desc}</p>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button variant="hero" size="lg" className="gap-2" onClick={() => navigate("/install")}>
            Download the ZIVO app
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export { QuickActionsSection, TrendingSection, LiveStatsSection, AllServicesSection };
