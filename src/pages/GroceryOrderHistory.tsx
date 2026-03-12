/**
 * GroceryOrderHistory - Past orders & order tracking
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin,
  ChevronRight, ShoppingBag, RotateCcw, Star, Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  store: string;
}

interface Order {
  id: string;
  store: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  items: OrderItem[];
  placed_at: string;
  customer_name: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof Package; label: string; color: string; bg: string }> = {
  pending_payment: { icon: Clock, label: "Pending Payment", color: "text-amber-500", bg: "bg-amber-500/10" },
  pending: { icon: Package, label: "Order Placed", color: "text-primary", bg: "bg-primary/10" },
  confirmed: { icon: CheckCircle, label: "Confirmed", color: "text-primary", bg: "bg-primary/10" },
  shopping: { icon: ShoppingBag, label: "Shopping", color: "text-violet-500", bg: "bg-violet-500/10" },
  picked_up: { icon: Truck, label: "Out for Delivery", color: "text-primary", bg: "bg-primary/10" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  cancelled: { icon: Package, label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10" },
};

function OrderStatusTracker({ status }: { status: string }) {
  const steps = ["pending", "confirmed", "shopping", "picked_up", "delivered"];
  const currentIdx = steps.indexOf(status);

  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, i) => {
        const isComplete = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1 flex-1">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isCurrent ? 1.1 : 1 }}
              className={`h-2 w-2 rounded-full shrink-0 transition-colors ${
                isComplete ? "bg-primary" : "bg-muted-foreground/20"
              } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
            />
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 rounded transition-colors ${
                i < currentIdx ? "bg-primary" : "bg-muted-foreground/15"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onReorder }: { order: Order; onReorder: (items: OrderItem[]) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const date = new Date(order.placed_at);
  const isActive = !["delivered", "cancelled"].includes(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden transition-all ${
        isActive ? "border-primary/20 bg-card shadow-md" : "border-border/20 bg-card/80"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
            <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-foreground">{order.store}</h3>
              <span className="text-[11px] text-muted-foreground">
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
              <span className="text-[10px] text-muted-foreground">
                · {order.items?.length || 0} items · ${order.total_amount?.toFixed(2)}
              </span>
            </div>
            {isActive && <OrderStatusTracker status={order.status} />}
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Items */}
              <div className="space-y-2">
                {(order.items || []).slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="h-8 w-8 rounded-lg object-contain bg-muted/20 border border-border/15 p-0.5"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="text-[11px] text-foreground/80 flex-1 truncate">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-[11px] font-semibold text-foreground tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                {(order.items?.length || 0) > 5 && (
                  <p className="text-[10px] text-muted-foreground pl-10">
                    +{order.items.length - 5} more items
                  </p>
                )}
              </div>

              {/* Address */}
              {order.delivery_address && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/10">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-[11px] text-muted-foreground">{order.delivery_address}</span>
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-1 pt-1 border-t border-border/10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${order.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">${order.delivery_fee?.toFixed(2)}</span>
                </div>
              </div>

              {/* Reorder button */}
              {order.status === "delivered" && order.items?.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl text-[11px] font-bold gap-1.5 h-9"
                  onClick={() => onReorder(order.items)}
                >
                  <RotateCcw className="h-3 w-3" />
                  Reorder
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GroceryOrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("shopping_orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("order_type", "shopping_delivery")
        .order("placed_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setOrders(data as unknown as Order[]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (filter === "active") return !["delivered", "cancelled"].includes(o.status);
    if (filter === "past") return ["delivered", "cancelled"].includes(o.status);
    return true;
  });

  const activeCount = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;

  const handleReorder = (items: OrderItem[]) => {
    // Save to localStorage for the store page to pick up
    localStorage.setItem("zivo-reorder-items", JSON.stringify(items));
    const store = items[0]?.store?.toLowerCase() || "walmart";
    navigate(`/grocery/store/${store}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/6 blur-[60px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/grocery")}
            className="p-2 rounded-2xl hover:bg-muted/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-base font-bold">My Orders</h1>
            <p className="text-[10px] text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
              {activeCount > 0 && ` · ${activeCount} active`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-4 pb-3">
          {([
            { key: "all", label: "All" },
            { key: "active", label: `Active${activeCount ? ` (${activeCount})` : ""}` },
            { key: "past", label: "Past" },
          ] as const).map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border/20"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground mb-1">
              {filter === "active" ? "No active orders" : filter === "past" ? "No past orders" : "No orders yet"}
            </h3>
            <p className="text-[11px] text-muted-foreground mb-4">
              {filter === "all" ? "Start shopping to see your orders here" : "Check back later"}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => navigate("/grocery")}
            >
              <Store className="h-3.5 w-3.5 mr-1.5" />
              Browse Stores
            </Button>
          </motion.div>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} onReorder={handleReorder} />
          ))
        )}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
