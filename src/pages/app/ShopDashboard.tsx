/**
 * ShopDashboard — Shop owner management hub.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Package, ShoppingBag, BarChart3, Settings, Tag, Truck,
  Plus, TrendingUp, DollarSign, Box, Users, Calendar, Clock, Wallet, Shield, ChevronRight,
  CalendarCheck, GraduationCap, Star, FolderOpen, TestTube, Rocket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/app/AppLayout";
import { cn } from "@/lib/utils";

// Routes that exist in App.tsx — anything else shows a "Coming soon" toast
// instead of dropping the user on a 404 page.
const IMPLEMENTED_SHOP_ROUTES = new Set<string>([
  "/shop-dashboard/employees",
  "/shop-dashboard/payroll",
  "/shop-dashboard/employee-schedule",
  "/shop-dashboard/time-clock",
  "/shop-dashboard/employee-rules",
  "/shop-dashboard/attendance",
  "/shop-dashboard/training",
  "/shop-dashboard/performance",
  "/shop-dashboard/documents",
  "/shop-dashboard/truck",
  "/shop-dashboard/attribution",
  "/shop-dashboard/sandbox",
  "/shop-dashboard/roi",
  "/shop-dashboard/refer",
  "/shop-dashboard/boost",
  "/shop-dashboard/boost-engine",
  "/shop-dashboard/ai-creative",
  "/shop-dashboard/ai-content",
  "/shop-dashboard/wallet",
  "/shop-dashboard/tax-reports",
  "/shop-dashboard/products",
  "/shop-dashboard/orders",
  "/shop-dashboard/settings",
  "/shop-dashboard/promotions",
  "/shop-dashboard/analytics",
  "/shop-dashboard/delivery",
]);

const safeNavigate = (
  navigate: (to: string) => void,
  to: string,
  label: string,
) => {
  if (IMPLEMENTED_SHOP_ROUTES.has(to)) {
    navigate(to);
  } else {
    toast.info(`${label} — coming soon`, {
      description: "We're polishing this section. Check back shortly.",
    });
  }
};

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  const { data: store } = useQuery({
    queryKey: ["my-store", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("store_profiles").select("id, name").eq("owner_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: storeStats } = useQuery({
    queryKey: ["shop-dashboard-stats", store?.id],
    queryFn: async () => {
      const [ordersRes, productsRes, revenueRes, viewsRes] = await Promise.all([
        supabase.from("store_orders").select("id", { count: "exact", head: true }).eq("store_id", store!.id),
        supabase.from("store_products").select("id", { count: "exact", head: true }).eq("store_id", store!.id),
        supabase.from("store_orders").select("total_cents").eq("store_id", store!.id).eq("status", "delivered"),
        (supabase as any).from("store_posts").select("view_count").eq("store_id", store!.id),
      ]);
      const revenue = (revenueRes.data ?? []).reduce((sum, o) => sum + (o.total_cents ?? 0), 0) / 100;
      const views = ((viewsRes.data as any[]) ?? []).reduce((s: number, p: any) => s + (p.view_count ?? 0), 0);
      return {
        orders: ordersRes.count ?? 0,
        products: productsRes.count ?? 0,
        revenue,
        views,
      };
    },
    enabled: !!store?.id,
  });

  const stats = [
    { icon: ShoppingBag, label: "Orders", value: String(storeStats?.orders ?? 0), color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: DollarSign, label: "Revenue", value: `$${(storeStats?.revenue ?? 0).toFixed(0)}`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: TrendingUp, label: "Views", value: storeStats?.views != null ? (storeStats.views >= 1000 ? `${(storeStats.views / 1000).toFixed(1)}K` : String(storeStats.views)) : "0", color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Box, label: "Products", value: String(storeStats?.products ?? 0), color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, section: "dashboard" },
    { id: "products", label: "Products", icon: Package, section: "products" },
    { id: "orders", label: "Orders", icon: ShoppingBag, section: "orders" },
    { id: "marketing", label: "Marketing", icon: Rocket, section: "marketing" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, section: "analytics" },
    { id: "staff", label: "Staff", icon: Users, section: "staff" },
    { id: "settings", label: "Settings", icon: Settings, section: "settings" },
  ];

  const actions = [
    { icon: Package, label: "Products", description: "Manage your inventory", color: "from-blue-500 to-blue-600", onClick: () => navigate("/shop-dashboard/products") },
    { icon: ShoppingBag, label: "Orders", description: "View & manage orders", color: "from-orange-500 to-amber-500", onClick: () => navigate("/shop-dashboard/orders") },
    { icon: Tag, label: "Promotions", description: "Discounts & deals", color: "from-rose-500 to-pink-500", onClick: () => safeNavigate(navigate, "/shop-dashboard/promotions", "Promotions") },
    { icon: Truck, label: "Delivery", description: "Shipping settings", color: "from-emerald-500 to-green-500", onClick: () => safeNavigate(navigate, "/shop-dashboard/delivery", "Delivery") },
    { icon: BarChart3, label: "Analytics", description: "Sales & performance", color: "from-purple-500 to-purple-600", onClick: () => safeNavigate(navigate, "/shop-dashboard/analytics", "Analytics") },
    { icon: Rocket, label: "Sales Attribution", description: "Reel-to-purchase funnel", color: "from-amber-500 to-orange-500", onClick: () => safeNavigate(navigate, "/shop-dashboard/attribution", "Sales Attribution") },
    { icon: BarChart3, label: "Merchant ROI", description: "Views, clicks & revenue", color: "from-indigo-500 to-blue-500", onClick: () => safeNavigate(navigate, "/shop-dashboard/roi", "Merchant ROI") },
    { icon: Truck, label: "Truck Dashboard", description: "GPS inventory & sales", color: "from-teal-500 to-cyan-500", onClick: () => safeNavigate(navigate, "/shop-dashboard/truck", "Truck Dashboard") },
    { icon: TestTube, label: "Sandbox Mode", description: "Test transactions & CAPI", color: "from-yellow-500 to-amber-500", onClick: () => safeNavigate(navigate, "/shop-dashboard/sandbox", "Sandbox Mode") },
    { icon: Users, label: "Refer a Shop", description: "Invite shops, both get boosted", color: "from-pink-500 to-rose-500", onClick: () => safeNavigate(navigate, "/shop-dashboard/refer", "Refer a Shop") },
    { icon: Settings, label: "Shop Settings", description: "Store profile & config", color: "from-slate-500 to-slate-600", onClick: () => navigate("/shop-dashboard/settings") },
  ];

  const employeeActions = [
    { icon: Users, label: "Employees", description: "Manage staff members", color: "text-blue-500", bg: "bg-blue-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/employees", "Employees") },
    { icon: Wallet, label: "Payroll", description: "Wages & pay runs", color: "text-emerald-500", bg: "bg-emerald-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/payroll", "Payroll") },
    { icon: Calendar, label: "Schedule", description: "Shift planning", color: "text-purple-500", bg: "bg-purple-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/employee-schedule", "Schedule") },
    { icon: Clock, label: "Time Clock", description: "Clock in & out records", color: "text-amber-500", bg: "bg-amber-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/time-clock", "Time Clock") },
    { icon: CalendarCheck, label: "Attendance & Leave", description: "Track attendance & vacation", color: "text-teal-500", bg: "bg-teal-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/attendance", "Attendance & Leave") },
    { icon: GraduationCap, label: "Training", description: "Onboarding & training", color: "text-indigo-500", bg: "bg-indigo-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/training", "Training") },
    { icon: Star, label: "Performance", description: "Reviews & evaluations", color: "text-yellow-500", bg: "bg-yellow-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/performance", "Performance") },
    { icon: FolderOpen, label: "Documents", description: "Contracts & files", color: "text-sky-500", bg: "bg-sky-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/documents", "Documents") },
    { icon: Shield, label: "Employee Rules", description: "Policies & permissions", color: "text-rose-500", bg: "bg-rose-500/10", onClick: () => safeNavigate(navigate, "/shop-dashboard/employee-rules", "Employee Rules") },
  ];

  return (
    <AppLayout title="Shop Dashboard" hideHeader>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-xl">Shop Dashboard</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={() => navigate("/shop-dashboard/products")}
            className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
          >
            <Plus className="w-4.5 h-4.5 text-primary" />
          </button>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r border-border/40 bg-card/50 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-6 pb-28">
              {activeSection === "dashboard" && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3 mb-6"
                  >
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl bg-card border border-border/40 shadow-sm p-3.5"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", stat.bg)}>
                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                          </div>
                        </div>
                        <p className="font-bold text-xl">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Actions */}
                  <h2 className="font-bold text-lg mb-3">Manage</h2>
                  <div className="space-y-2">
                    {actions.map((action, i) => (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        onClick={action.onClick}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/30 bg-card/60 hover:bg-card/90 transition-colors touch-manipulation active:scale-[0.98] text-left"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                          <action.icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "staff" && (
                <div className="space-y-6">
                  <h2 className="font-bold text-lg">Employee Management</h2>
                  <div className="rounded-xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
                    {employeeActions.map((item, i) => (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-muted/30 transition-colors touch-manipulation active:bg-muted/50 text-left"
                      >
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", item.bg)}>
                          <item.icon className={cn("w-4 h-4", item.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[13px] leading-tight">{item.label}</p>
                          <p className="text-[11px] text-muted-foreground leading-tight">{item.description}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "products" && (
                <div className="space-y-6">
                  <h2 className="font-bold text-lg">Products</h2>
                  <div className="rounded-2xl border border-border/40 bg-card p-6 text-center">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-semibold text-foreground mb-2">Manage Your Inventory</p>
                    <p className="text-sm text-muted-foreground mb-4">View all products, add new items, and manage inventory</p>
                    <button
                      onClick={() => navigate("/shop-dashboard/products")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                      Go to Products
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "orders" && (
                <div className="space-y-6">
                  <h2 className="font-bold text-lg">Orders</h2>
                  <div className="rounded-2xl border border-border/40 bg-card p-6 text-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-semibold text-foreground mb-2">View & Manage Orders</p>
                    <p className="text-sm text-muted-foreground mb-4">Track orders, manage fulfillment, and handle customer requests</p>
                    <button
                      onClick={() => navigate("/shop-dashboard/orders")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                      Go to Orders
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "analytics" && (
                <div className="space-y-6">
                  <h2 className="font-bold text-lg">Analytics</h2>
                  <div className="rounded-2xl border border-border/40 bg-card p-6 text-center">
                    <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-semibold text-foreground mb-2">Sales & Performance</p>
                    <p className="text-sm text-muted-foreground mb-4">View detailed analytics, revenue trends, and key metrics</p>
                    <button
                      onClick={() => safeNavigate(navigate, "/shop-dashboard/analytics", "Analytics")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                      Go to Analytics
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "marketing" && (
                <div className="space-y-6">
                  <h2 className="font-bold text-lg">Marketing</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => safeNavigate(navigate, "/shop-dashboard/promotions", "Promotions")}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/30 bg-card/60 hover:bg-card/90 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                        <Tag className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">Promotions</p>
                        <p className="text-xs text-muted-foreground">Discounts & deals</p>
                      </div>
                    </button>
                    <button
                      onClick={() => safeNavigate(navigate, "/shop-dashboard/attribution", "Sales Attribution")}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/30 bg-card/60 hover:bg-card/90 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Rocket className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">Sales Attribution</p>
                        <p className="text-xs text-muted-foreground">Reel-to-purchase funnel</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "settings" && (
                <div className="space-y-6">
                  <h2 className="font-bold text-lg">Settings</h2>
                  <div className="rounded-2xl border border-border/40 bg-card p-6 text-center">
                    <Settings className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-semibold text-foreground mb-2">Shop Settings</p>
                    <p className="text-sm text-muted-foreground mb-4">Configure your store profile, payment settings, and business info</p>
                    <button
                      onClick={() => navigate("/shop-dashboard/settings")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                      Go to Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShopDashboard;
