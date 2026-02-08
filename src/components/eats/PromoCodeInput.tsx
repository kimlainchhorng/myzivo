/**
 * Promo Code Input Component
 * Input field with apply button for discount codes
 */
import { useState } from "react";
import { Tag, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { PromoCode } from "@/lib/promoCodeService";

interface PromoCodeInputProps {
  appliedPromo: PromoCode | null;
  discountAmount: number;
  isValidating: boolean;
  error: string | null;
  onApply: (code: string) => Promise<boolean>;
  onClear: () => void;
}

export function PromoCodeInput({
  appliedPromo,
  discountAmount,
  isValidating,
  error,
  onApply,
  onClear,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");

  const handleApply = async () => {
    const success = await onApply(code);
    if (success) {
      setCode("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  // Applied promo display
  if (appliedPromo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">
                {appliedPromo.code}
              </p>
              <p className="text-xs text-emerald-300/70">
                {appliedPromo.discount_type === "percent"
                  ? `${appliedPromo.discount_value}% off`
                  : `$${appliedPromo.discount_value.toFixed(2)} off`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">
              -${discountAmount.toFixed(2)}
            </span>
            <button
              onClick={onClear}
              className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Input mode
  return (
    <div className="space-y-2">
      <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-zinc-400" />
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter promo code"
            className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm font-medium outline-none"
            disabled={isValidating}
          />
          <Button
            onClick={handleApply}
            disabled={!code.trim() || isValidating}
            size="sm"
            className="h-8 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-400 px-4"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
