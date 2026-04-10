/**
 * MarketplaceOrdersPage — Track marketplace purchases and sales
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, ShoppingBag, DollarSign, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
  confirmed: { icon: Package, color: "text-blue-500", label: "Confirmed" },
  shipped: { icon: Truck, color: "text-purple-500", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-emerald-500", label: "Delivered" },
  completed: { icon: CheckCircle, color: "text-emerald-500", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Cancelled" },
};

export default function MarketplaceOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"purchases" | "sales">("purchases");

  // Purchases (I'm the buyer)
  const { data: purchases = [] } = useQuery({
    queryKey: ["marketplace-purchases", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("marketplace_orders")
        .select("*")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Sales (I'm the seller)
  const { data: sales = [] } = useQuery({
    queryKey: ["marketplace-sales", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("marketplace_orders")
        .select("*")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const orders = tab === "purchases" ? purchases : sales;

  return (
    <div className="min-h-dvh bg-background pb-24">
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Orders</h1>
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3">
          {(["purchases", "sales"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
              }`}
            >
              {t === "purchases" ? `Purchases (${purchases.length})` : `Sales (${sales.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {tab === "purchases" ? "No purchases yet" : "No sales yet"}
            </p>
          </div>
        ) : (
          orders.map((order: any, i: number) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl border border-border/30 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50`}>
                    <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.color}`} />
                    <span className={`text-[11px] font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-base font-bold text-foreground">
                      ${(order.total_cents / 100).toFixed(2)}
                    </span>
                    {order.shipping_cents > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        +${(order.shipping_cents / 100).toFixed(2)} shipping
                      </span>
                    )}
                  </div>
                </div>

                {/* Order progress */}
                {order.status !== "cancelled" && (
                  <div className="mt-3 flex gap-1">
                    {["pending", "confirmed", "shipped", "delivered"].map((step, si) => {
                      const steps = ["pending", "confirmed", "shipped", "delivered"];
                      const currentIdx = steps.indexOf(order.status);
                      const isActive = si <= currentIdx;
                      return (
                        <div key={step} className={`h-1 flex-1 rounded-full ${isActive ? "bg-primary" : "bg-muted"}`} />
                      );
                    })}
                  </div>
                )}

                {order.notes && (
                  <p className="text-[11px] text-muted-foreground mt-2 italic">"{order.notes}"</p>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
