import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Tag, ArrowRight, Percent, Gift } from "lucide-react";

const PROMOS = [
  {
    id: "costco-10",
    store: "Costco",
    slug: "costco",
    title: "$10 off your first order",
    subtitle: "Bulk deals & warehouse prices",
    icon: Tag,
    gradient: "from-red-500/20 via-red-500/10 to-transparent",
    accent: "text-red-400",
  },
  {
    id: "lowes-15",
    store: "Lowe's",
    slug: "lowes",
    title: "$15 off home essentials",
    subtitle: "Tools, hardware & more",
    icon: Gift,
    gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
    accent: "text-blue-400",
  },
  {
    id: "petco-10",
    store: "Petco",
    slug: "petco",
    title: "$10 off pet supplies",
    subtitle: "Food, treats & accessories",
    icon: Percent,
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    accent: "text-emerald-400",
  },
];

export default function GroceryPromos() {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4">
      <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider mb-2.5">
        Deals & Offers
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {PROMOS.map((promo, i) => {
          const Icon = promo.icon;
          return (
            <motion.button
              key={promo.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/grocery/store/${promo.slug}`)}
              className={`group relative flex flex-col justify-between min-w-[200px] p-4 rounded-[18px] border border-border/30 bg-gradient-to-br ${promo.gradient} backdrop-blur-sm hover:border-primary/20 transition-all duration-300 shrink-0`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl bg-background/60 border border-border/20 ${promo.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{promo.store}</p>
                <p className="text-[13px] font-bold text-foreground mt-0.5">{promo.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{promo.subtitle}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
