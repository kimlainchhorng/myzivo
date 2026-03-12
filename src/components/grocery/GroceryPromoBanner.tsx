/**
 * GroceryPromoBanner - Weekly deals banner + promo code support
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, ChevronRight, Tag, X, Check, Percent } from "lucide-react";

const PROMOS = [
  { id: "free-delivery", badge: "🚚", title: "Free Delivery", desc: "On your first grocery order", color: "from-primary/10 to-primary/5" },
  { id: "save-10", badge: "💰", title: "Save $10", desc: "On orders over $50", color: "from-amber-500/10 to-amber-400/5" },
  { id: "bundle-deal", badge: "📦", title: "Bundle & Save", desc: "Buy 3, get 15% off", color: "from-violet-500/10 to-violet-400/5" },
];

export function GroceryPromoBanner() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = PROMOS.filter((p) => !dismissed.has(p.id));
  if (visible.length === 0) return null;

  return (
    <div className="px-4 pt-2 pb-1">
      <div
        className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {visible.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className={`snap-start shrink-0 w-[200px] rounded-2xl bg-gradient-to-br ${promo.color} border border-border/20 p-3 relative group`}
          >
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(promo.id))}
              className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
            <div className="flex items-start gap-2">
              <span className="text-lg">{promo.badge}</span>
              <div>
                <p className="text-[12px] font-bold text-foreground">{promo.title}</p>
                <p className="text-[10px] text-muted-foreground">{promo.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Promo code input for checkout */
export function GroceryPromoInput({
  onApply,
}: {
  onApply: (code: string, discount: number) => void;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "applied" | "invalid">("idle");
  const [discount, setDiscount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setStatus("checking");

    // Simulate validation — in production, call supabase.rpc("validate_promo_code", ...)
    setTimeout(() => {
      const upper = code.trim().toUpperCase();
      if (upper === "ZIVO10" || upper === "GROCERY10") {
        setDiscount(10);
        setStatus("applied");
        onApply(upper, 10);
      } else if (upper === "SAVE5") {
        setDiscount(5);
        setStatus("applied");
        onApply(upper, 5);
      } else {
        setStatus("invalid");
        setTimeout(() => setStatus("idle"), 2000);
      }
    }, 800);
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-primary"
      >
        <Tag className="h-3 w-3" />
        {status === "applied" ? `Promo applied: -$${discount.toFixed(2)}` : "Have a promo code?"}
      </button>

      <AnimatePresence>
        {expanded && status !== "applied" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mt-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className={`flex-1 h-9 px-3 rounded-xl text-[12px] font-semibold bg-muted/20 border transition-all ${
                  status === "invalid" ? "border-destructive/40 text-destructive" : "border-border/20"
                }`}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                disabled={status === "checking" || !code.trim()}
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold disabled:opacity-50"
              >
                {status === "checking" ? "..." : "Apply"}
              </motion.button>
            </div>
            {status === "invalid" && (
              <p className="text-[10px] text-destructive mt-1">Invalid promo code</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {status === "applied" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1 mt-1.5"
        >
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-[10px] text-emerald-600 font-semibold">
            {code} — ${discount.toFixed(2)} off applied!
          </span>
        </motion.div>
      )}
    </div>
  );
}
