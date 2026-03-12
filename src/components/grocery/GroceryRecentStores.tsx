/**
 * GroceryRecentStores — horizontal scroll of recently visited stores
 * Uses localStorage to persist recent store slugs.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { GROCERY_STORES } from "@/config/groceryStores";
import { useMemo, useEffect, useState } from "react";

const STORAGE_KEY = "zivo_recent_stores";
const MAX_RECENT = 6;

export function addRecentStore(slug: string) {
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = [slug, ...existing.filter((s) => s !== slug)].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export default function GroceryRecentStores() {
  const navigate = useNavigate();
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setSlugs(stored);
    } catch {}
  }, []);

  const stores = useMemo(
    () => slugs.map((s) => GROCERY_STORES.find((st) => st.slug === s)).filter(Boolean),
    [slugs]
  );

  if (stores.length === 0) return null;

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">Recent</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {stores.map((store, i) => (
          <motion.button
            key={store!.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 22 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(`/grocery/store/${store!.slug}`)}
            className="group flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className="h-14 w-14 rounded-2xl bg-card border border-border/40 flex items-center justify-center p-2 shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all duration-200">
              <img src={store!.logo} alt={store!.name} className="h-full w-full object-contain" />
            </div>
            <p className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors w-14 text-center truncate">
              {store!.name}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
