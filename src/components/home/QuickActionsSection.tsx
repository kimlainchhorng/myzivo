import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Car, UtensilsCrossed, Plane, Hotel, Zap, ChevronRight } from "lucide-react";
import { QuickAction } from "@/components/ui/premium-card";
import { QuickRepeatOrders, RecentlyViewed } from "@/components/ui/personalization";
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
    <section className="py-14 lg:py-24 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/10 to-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl" />
      
      {/* Floating emoji */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-24 right-[10%] text-4xl hidden lg:block opacity-40"
      >
        ⚡
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-primary to-teal-400 shadow-xl shadow-primary/30"
              >
                <Zap className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Quick Actions</h2>
                <p className="text-sm sm:text-base text-muted-foreground">One tap to get started</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <QuickAction
                  icon={<action.icon className="w-6 h-6 text-white" />}
                  label={action.label}
                  description={action.description}
                  onClick={() => navigate(action.href)}
                  color={action.color}
                  badge={action.badge}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Recent + Repeat Orders */}
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div 
              variants={itemVariants}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <RecentlyViewed 
                items={recentItems} 
                onItemClick={(item) => console.log("Clicked:", item)}
              />
            </motion.div>
            <motion.div 
              variants={itemVariants}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
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

export default QuickActionsSection;
