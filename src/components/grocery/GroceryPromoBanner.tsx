/**
 * GroceryPromoBanner - Animated weekly deals banner + promo code support
 * Features: auto-scroll, gradient backgrounds, dismiss with animation
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, ChevronRight, Tag, X, Check, Percent, Truck, Zap } from "lucide-react";

const PROMOS = [
  { id: "free-delivery", icon: Truck, title: "Free Delivery", desc: "On your first grocery order", gradient: "from-primary/12 via-primary/8 to-primary/4", accent: "text-primary" },
  { id: "save-10", icon: Tag, title: "Save $10", desc: "On orders over $50", gradient: "from-amber-500/12 via-amber-400/8 to-amber-300/4", accent: "text-amber-600" },
  { id: "bundle-deal", icon: Zap, title: "Bundle & Save", desc: "Buy 3, get 15% off", gradient: "from-violet-500/12 via-violet-400/8 to-violet-300/4", accent: "text-violet-600" },
  { id: "fresh-savings", icon: Sparkles, title: "Fresh Savings", desc: "Up to 30% off produce", gradient: "from-emerald-500/12 via-emerald-400/8 to-emerald-300/4", accent: "text-emerald-600" },
];

export function GroceryPromoBanner() {
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("zivo-grocery-dismissed-promos");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDismiss = (id: string) => {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    localStorage.setItem("zivo-grocery-dismissed-promos", JSON.stringify([...next]));
  };

  const visible = PROMOS.filter((p) => !dismissed.has(p.id));
  if (visible.length === 0) return null;

  return (
    <div className="px-4 pt-2 pb-1">
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        <AnimatePresence mode="popLayout">
          {visible.map((promo, i) => (
            <motion.div
              key={promo.id}
              layout
              initial={{ opacity: 0, scale: 0.92, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 24 }}
              className={`snap-start shrink-0 w-[210px] rounded-2xl bg-gradient-to-br ${promo.gradient} border border-border/20 p-3.5 relative group overflow-hidden`}
            >
              {/* Decorative circle */}
              <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-background/10 blur-lg pointer-events-none" />

              <button
                onClick={() => handleDismiss(promo.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background/60"
              >
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
              <div className="flex items-start gap-2.5 relative">
                <div className={`flex items-center justify-center h-9 w-9 rounded-xl bg-background/50 backdrop-blur-sm border border-border/20 shrink-0`}>
                  <promo.icon className={`h-4 w-4 ${promo.accent}`} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-foreground leading-tight">{promo.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{promo.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
        className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
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
                className={`flex-1 h-9 px-3 rounded-xl text-[12px] font-semibold bg-muted/20 border transition-all focus:ring-2 focus:ring-primary/20 ${
                  status === "invalid" ? "border-destructive/40 text-destructive" : "border-border/20"
                }`}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                disabled={status === "checking" || !code.trim()}
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold disabled:opacity-50 transition-opacity"
              >
                {status === "checking" ? (
                  <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                    Checking...
                  </motion.span>
                ) : "Apply"}
              </motion.button>
            </div>
            {status === "invalid" && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-destructive mt-1"
              >
                Invalid promo code
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "applied" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15"
          >
            <Check className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-600 font-semibold">
              {code} — ${discount.toFixed(2)} off applied!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
