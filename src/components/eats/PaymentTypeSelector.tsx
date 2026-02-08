/**
 * Payment Type Selector
 * Toggle between Card and Cash payment options
 */
import { CreditCard, Banknote, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type PaymentType = "card" | "cash";

interface PaymentTypeSelectorProps {
  selected: PaymentType;
  onChange: (type: PaymentType) => void;
  disabled?: boolean;
}

export function PaymentTypeSelector({
  selected,
  onChange,
  disabled = false,
}: PaymentTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-400">How would you like to pay?</p>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Card Option */}
        <motion.button
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onChange("card")}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            selected === "card"
              ? "bg-orange-500/10 border-orange-500/50"
              : "bg-zinc-800/50 border-white/5 hover:border-white/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            selected === "card" ? "bg-orange-500/20" : "bg-zinc-700"
          )}>
            <CreditCard className={cn(
              "w-6 h-6",
              selected === "card" ? "text-orange-500" : "text-zinc-400"
            )} />
          </div>
          <div className="text-center">
            <p className={cn(
              "font-bold text-sm",
              selected === "card" ? "text-orange-400" : "text-white"
            )}>
              Pay with Card
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Pay now securely</p>
          </div>
          
          {selected === "card" && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </motion.button>

        {/* Cash Option */}
        <motion.button
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onChange("cash")}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            selected === "cash"
              ? "bg-emerald-500/10 border-emerald-500/50"
              : "bg-zinc-800/50 border-white/5 hover:border-white/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            selected === "cash" ? "bg-emerald-500/20" : "bg-zinc-700"
          )}>
            <Banknote className={cn(
              "w-6 h-6",
              selected === "cash" ? "text-emerald-500" : "text-zinc-400"
            )} />
          </div>
          <div className="text-center">
            <p className={cn(
              "font-bold text-sm",
              selected === "cash" ? "text-emerald-400" : "text-white"
            )}>
              Cash
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Pay on delivery</p>
          </div>
          
          {selected === "cash" && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
