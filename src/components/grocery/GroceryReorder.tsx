/**
 * GroceryReorder — "Order Again" with richer visuals and animated cards
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ArrowRight, Clock, ShoppingCart } from "lucide-react";
import { GROCERY_STORES } from "@/config/groceryStores";

const SUGGESTED_REORDERS = [
  { slug: "walmart", items: ["Milk", "Bread", "Eggs"], totalItems: 3, lastOrder: "2 days ago", price: "$12.47" },
  { slug: "costco", items: ["Paper Towels", "Water"], totalItems: 2, lastOrder: "1 week ago", price: "$28.99" },
  { slug: "target", items: ["Snacks", "Cereal"], totalItems: 2, lastOrder: "3 days ago", price: "$15.32" },
];

export default function GroceryReorder() {
  const navigate = useNavigate();

  const reorders = SUGGESTED_REORDERS.map((r) => ({
    ...r,
    store: GROCERY_STORES.find((s) => s.slug === r.slug),
  })).filter((r) => r.store);

  if (reorders.length === 0) return null;

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">Order Again</h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{reorders.length} orders</span>
      </div>
      <div className="space-y-2">
        {reorders.map((r, i) => (
          <motion.button
            key={r.slug}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 24 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/grocery/store/${r.slug}`)}
            className="group w-full flex items-center gap-3 p-3 rounded-[16px] border border-border/30 bg-card/60 backdrop-blur-sm hover:bg-card hover:border-primary/15 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
          >
            <div className="relative h-11 w-11 rounded-xl bg-background border border-border/30 flex items-center justify-center p-1.5 shrink-0 group-hover:shadow-md transition-shadow">
              <img src={r.store!.logo} alt={r.store!.name} className="h-full w-full object-contain" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary/15 flex items-center justify-center">
                <RotateCcw className="h-2 w-2 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-semibold text-foreground">{r.items.join(", ")}</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{r.store!.name}</span>
                <span className="text-[8px] text-muted-foreground/40">·</span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock className="h-2 w-2" />
                  {r.lastOrder}
                </span>
                <span className="text-[8px] text-muted-foreground/40">·</span>
                <span className="text-[10px] text-primary font-semibold">{r.price}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <motion.div
                whileHover={{ x: 3 }}
                className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
              >
                <ShoppingCart className="h-3 w-3 text-primary" />
              </motion.div>
              <span className="text-[8px] text-muted-foreground font-medium">Reorder</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
