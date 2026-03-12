import { motion } from "framer-motion";
import { ShoppingCart, Cpu, Home, PawPrint, Pill, LayoutGrid } from "lucide-react";
import type { StoreCategory } from "@/config/groceryStores";

const CATEGORIES: { id: StoreCategory | "all"; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "grocery", label: "Grocery", icon: ShoppingCart },
  { id: "electronics", label: "Electronics", icon: Cpu },
  { id: "home", label: "Home", icon: Home },
  { id: "pets", label: "Pets", icon: PawPrint },
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
];

interface Props {
  active: StoreCategory | "all";
  onChange: (cat: StoreCategory | "all") => void;
}

export default function GroceryCategories({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id;
        const Icon = cat.icon;
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
          </motion.button>
        );
      })}
    </div>
  );
}
