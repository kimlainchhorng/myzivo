/**
 * Win-Back Banner Component
 * Tiered banner for home pages to encourage inactive customers to return.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Gift, Copy, Check, Sparkles, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWinBackOffer, WinBackTier } from "@/hooks/useWinBackOffer";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function WinBackBanner({ className }: { className?: string }) {
  const { user } = useAuth();
  const { tier, promoCode, discountLabel, isLoading } = useWinBackOffer();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("winback_dismissed") === "true"
  );
  const [copied, setCopied] = useState(false);

  if (!user || !tier || isLoading || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("winback_dismissed", "true");
  };

  const handleCopy = async () => {
    if (!promoCode) return;
    await navigator.clipboard.writeText(promoCode);
    setCopied(true);
    toast.success("Promo code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const config: Record<NonNullable<WinBackTier>, {
    title: string;
    message: string;
    gradient: string;
    borderColor: string;
    icon: React.ElementType;
  }> = {
    gentle: {
      title: "We miss you! 👋",
      message: "Check out what's new — fresh restaurants and dishes are waiting for you.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/20",
      icon: UtensilsCrossed,
    },
    small: {
      title: "Welcome back! 🎉",
      message: promoCode
        ? `Here's ${discountLabel} on your next order. Use code below at checkout.`
        : "We've got something special for your next order.",
      gradient: "from-orange-500/20 to-amber-500/20",
      borderColor: "border-orange-500/20",
      icon: Gift,
    },
    strong: {
      title: "It's been a while! ✨",
      message: promoCode
        ? `Enjoy ${discountLabel} on us! This exclusive offer won't last long.`
        : "Come back and enjoy exclusive savings on your next order.",
      gradient: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/20",
      icon: Sparkles,
    },
  };

  const { title, message, gradient, borderColor, icon: Icon } = config[tier];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-xl",
          borderColor,
          className
        )}
      >
        {/* Background gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", gradient)} />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200 active:scale-[0.90] touch-manipulation"
        >
          <X className="w-3.5 h-3.5 text-foreground/60" />
        </button>

        <div className="relative p-4 flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-foreground" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-bold text-sm text-foreground mb-0.5">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>

            {/* Promo code display */}
            {promoCode && (tier === "small" || tier === "strong") && (
              <div className="mt-2 flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-mono text-sm font-bold text-foreground tracking-wider">
                  {promoCode}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 active:scale-[0.90] touch-manipulation"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}

            {/* CTA */}
            <Button
              size="sm"
              onClick={() => navigate("/eats/restaurants")}
              className="mt-3 h-8 text-xs bg-gradient-to-r from-eats to-orange-500 hover:opacity-90"
            >
              {tier === "gentle" ? "Browse Restaurants" : "Order Now"}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
