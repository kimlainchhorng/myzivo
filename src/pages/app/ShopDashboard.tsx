/**
 * ShopDashboard — Shop owner management hub.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Package, ShoppingBag, BarChart3, Settings, Tag, Truck,
  Plus, TrendingUp, DollarSign, Box, Users, Calendar, Clock, Wallet, Shield, ChevronRight,
  CalendarCheck, GraduationCap, Star, FolderOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/app/AppLayout";
import { cn } from "@/lib/utils";

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { icon: ShoppingBag, label: "Orders", value: "0", color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: DollarSign, label: "Revenue", value: "$0", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: TrendingUp, label: "Views", value: "0", color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Box, label: "Products", value: "0", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const actions = [
    { icon: Package, label: "Products", description: "Manage your inventory", color: "from-blue-500 to-blue-600", onClick: () => navigate("/shop-dashboard/products") },
    { icon: ShoppingBag, label: "Orders", description: "View & manage orders", color: "from-orange-500 to-amber-500", onClick: () => navigate("/shop-dashboard/orders") },
    { icon: Tag, label: "Promotions", description: "Discounts & deals", color: "from-rose-500 to-pink-500", onClick: () => navigate("/shop-dashboard/promotions") },
    { icon: Truck, label: "Delivery", description: "Shipping settings", color: "from-emerald-500 to-green-500", onClick: () => navigate("/shop-dashboard/delivery") },
    { icon: BarChart3, label: "Analytics", description: "Sales & performance", color: "from-purple-500 to-purple-600", onClick: () => navigate("/shop-dashboard/analytics") },
    { icon: Settings, label: "Shop Settings", description: "Store profile & config", color: "from-slate-500 to-slate-600", onClick: () => navigate("/shop-dashboard/settings") },
  ];

  const employeeActions = [
    { icon: Users, label: "Employees", description: "Manage staff members", color: "text-blue-500", bg: "bg-blue-500/10", onClick: () => navigate("/shop-dashboard/employees") },
    { icon: Wallet, label: "Payroll", description: "Wages & pay runs", color: "text-emerald-500", bg: "bg-emerald-500/10", onClick: () => navigate("/shop-dashboard/payroll") },
    { icon: Calendar, label: "Schedule", description: "Shift planning", color: "text-purple-500", bg: "bg-purple-500/10", onClick: () => navigate("/shop-dashboard/employee-schedule") },
    { icon: Clock, label: "Time Clock", description: "Clock in & out records", color: "text-amber-500", bg: "bg-amber-500/10", onClick: () => navigate("/shop-dashboard/time-clock") },
    { icon: Shield, label: "Employee Rules", description: "Policies & permissions", color: "text-rose-500", bg: "bg-rose-500/10", onClick: () => navigate("/shop-dashboard/employee-rules") },
  ];

  return (
    <AppLayout title="Shop Dashboard" hideHeader>
      <div className="flex flex-col px-5 py-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
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

        {/* Employee Management */}
        <h2 className="font-bold text-lg mb-3 mt-6">Employee Management</h2>
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
          {employeeActions.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.04 }}
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
    </AppLayout>
  );
};

export default ShopDashboard;
