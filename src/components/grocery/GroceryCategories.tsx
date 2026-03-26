import { motion } from "framer-motion";
import { ShoppingCart, LayoutGrid, ShoppingBag, Shirt, UtensilsCrossed, Wine, Building2, Car, Wrench, CircleDot, Cog, Scissors } from "lucide-react";
import type { StoreCategory } from "@/config/groceryStores";

const CATEGORIES: { id: StoreCategory | "all"; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "grocery", label: "Grocery", icon: ShoppingCart },
  { id: "food-market", label: "Food Market", icon: ShoppingBag },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "drink", label: "Drink", icon: Wine },
  { id: "mall", label: "Mall", icon: Building2 },
  { id: "supermarket", label: "Supermarket", icon: ShoppingCart },
  { id: "car-rental", label: "Rental Car", icon: Car },
  { id: "car-dealership", label: "Car Dealer", icon: Car },
  { id: "auto-repair", label: "Auto Repair", icon: Wrench },
  { id: "tire-shop", label: "Tire Shop", icon: CircleDot },
  { id: "auto-parts", label: "Auto Parts", icon: Cog },
  { id: "salon", label: "Salon", icon: Scissors },
];

interface Props {
  active: StoreCategory | "all";
  onChange: (cat: StoreCategory | "all") => void;
  counts?: Record<string, number>;
}

export default function GroceryCategories({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id;
        const Icon = cat.icon;
        const count = counts?.[cat.id];
        return (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => onChange(cat.id)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.label}
            {count != null && count > 0 && (
              <motion.span
                key={`${cat.id}-${count}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className={`text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
