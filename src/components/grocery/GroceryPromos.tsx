/**
 * GroceryPromos - Real store quick-access cards (no fake promos)
 * Shows available stores with real info
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, Clock, ChevronRight, Store } from "lucide-react";
import { GROCERY_STORES } from "@/config/groceryStores";
import { getStoreStatus, getLiveEta } from "@/utils/storeStatus";

export default function GroceryPromos() {
  const navigate = useNavigate();

  const openStores = GROCERY_STORES.filter((s) => getStoreStatus(s.hours).isOpen);

  if (openStores.length === 0) return null;

  return (
    <div className="px-4 pt-4">
      <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        <Store className="h-3.5 w-3.5 text-primary" />
        Quick Shop
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {openStores.map((store, i) => {
          const eta = getLiveEta(store.deliveryMin);
          return (
            <motion.button
              key={store.slug}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/grocery/store/${store.slug}`)}
              className="group relative flex flex-col min-w-[180px] p-4 rounded-[18px] border border-border/25 bg-card hover:border-primary/20 hover:shadow-lg transition-all duration-300 shrink-0"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-background border border-border/30 flex items-center justify-center p-1.5 shadow-sm">
                  <img src={store.logo} alt={store.name} className="h-full w-full object-contain" />
                </div>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/15">
                  Open
                </span>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-foreground">{store.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5 text-primary" />
                    {eta}m
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    {store.rating}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end mt-2">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
