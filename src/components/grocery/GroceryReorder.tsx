/**
 * GroceryReorder — "Order Again" section with suggested items from past stores
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ArrowRight } from "lucide-react";
import { GROCERY_STORES } from "@/config/groceryStores";

const SUGGESTED_REORDERS = [
  { slug: "walmart", items: ["Milk, Bread, Eggs"], lastOrder: "2 days ago" },
  { slug: "costco", items: ["Paper Towels, Water"], lastOrder: "1 week ago" },
  { slug: "target", items: ["Snacks, Cereal"], lastOrder: "3 days ago" },
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
            className="group w-full flex items-center gap-3 p-3 rounded-[16px] border border-border/30 bg-card/60 backdrop-blur-sm hover:bg-card hover:border-primary/15 transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-xl bg-background border border-border/30 flex items-center justify-center p-1.5 shrink-0">
              <img src={r.store!.logo} alt={r.store!.name} className="h-full w-full object-contain" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-semibold text-foreground">{r.items.join(", ")}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {r.store!.name} · {r.lastOrder}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
