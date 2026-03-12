/**
 * GroceryStoreHero - Premium store landing header with info cards
 */
import { motion } from "framer-motion";
import { Clock, Star, MapPin, Truck, Shield, Zap, ChevronRight } from "lucide-react";
import type { StoreConfig } from "@/config/groceryStores";

interface Props {
  store: StoreConfig;
  liveEta: number;
  isOpen: boolean;
}

export function GroceryStoreHero({ store, liveEta, isOpen }: Props) {
  return (
    <div className="px-4 pt-1 pb-3">
      {/* Store info card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-card to-muted/20 border border-border/25 p-4 space-y-3"
      >
        {/* Top row: logo + name + status */}
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-background border border-border/30 flex items-center justify-center p-2 shadow-sm shrink-0">
            <img src={store.logo} alt={store.name} className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground tracking-tight">{store.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                isOpen
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-muted text-muted-foreground border border-border/20"
              }`}>
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Delivered by ZIVO · {store.hours}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Clock, label: `${liveEta} min`, sub: "Delivery", color: "text-primary" },
            { icon: Star, label: `${store.rating}`, sub: "Rating", color: "text-amber-500" },
            { icon: Truck, label: "$5.99", sub: "Delivery fee", color: "text-primary" },
          ].map((stat) => (
            <motion.div
              key={stat.sub}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-background/60 border border-border/15"
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-[13px] font-extrabold text-foreground">{stat.label}</span>
              <span className="text-[9px] text-muted-foreground font-medium">{stat.sub}</span>
            </motion.div>
          ))}
        </div>

        {/* Perks strip */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { icon: Zap, text: "Same-day delivery" },
            { icon: Shield, text: "Quality guaranteed" },
            { icon: MapPin, text: "Real store prices" },
          ].map((perk) => (
            <div
              key={perk.text}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 shrink-0"
            >
              <perk.icon className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground/80 whitespace-nowrap">{perk.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
