/**
 * Payment Type Selector
 * Toggle between Card, Cash, Wallet, and Wallet+Card payment options
 */
import { CreditCard, Banknote, Check, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type PaymentType = "card" | "cash" | "wallet" | "wallet_card";

interface PaymentTypeSelectorProps {
  selected: PaymentType;
  onChange: (type: PaymentType) => void;
  disabled?: boolean;
  walletBalanceCents?: number;
  orderTotalCents?: number;
}

export function PaymentTypeSelector({
  selected,
  onChange,
  disabled = false,
  walletBalanceCents = 0,
  orderTotalCents = 0,
}: PaymentTypeSelectorProps) {
  const walletDollars = walletBalanceCents / 100;
  const hasWalletBalance = walletBalanceCents > 0;
  const walletCoversOrder = walletBalanceCents >= orderTotalCents && orderTotalCents > 0;

  const options: {
    type: PaymentType;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    activeColor: string;
    activeBg: string;
    activeBorder: string;
    show: boolean;
  }[] = [
    {
      type: "card",
      label: "Pay with Card",
      subtitle: "Pay now securely",
      icon: <CreditCard className="w-6 h-6" />,
      activeColor: "text-orange-400",
      activeBg: "bg-orange-500/10",
      activeBorder: "border-orange-500/50",
      show: true,
    },
    {
      type: "cash",
      label: "Cash",
      subtitle: "Pay on delivery",
      icon: <Banknote className="w-6 h-6" />,
      activeColor: "text-emerald-400",
      activeBg: "bg-emerald-500/10",
      activeBorder: "border-emerald-500/50",
      show: true,
    },
    {
      type: "wallet",
      label: "Pay with Wallet",
      subtitle: `$${walletDollars.toFixed(2)} available`,
      icon: <Wallet className="w-6 h-6" />,
      activeColor: "text-primary",
      activeBg: "bg-primary/10",
      activeBorder: "border-primary/50",
      show: hasWalletBalance && walletCoversOrder,
    },
    {
      type: "wallet_card",
      label: "Wallet + Card",
      subtitle: `Use $${walletDollars.toFixed(2)}, card for rest`,
      icon: <Wallet className="w-6 h-6" />,
      activeColor: "text-primary",
      activeBg: "bg-primary/10",
      activeBorder: "border-primary/50",
      show: hasWalletBalance && !walletCoversOrder,
    },
  ];

  const visibleOptions = options.filter((o) => o.show);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-400">How would you like to pay?</p>

      <div className={cn("grid gap-3", visibleOptions.length <= 2 ? "grid-cols-2" : "grid-cols-2")}>
        {visibleOptions.map((opt) => {
          const isActive = selected === opt.type;
          return (
            <motion.button
              key={opt.type}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => !disabled && onChange(opt.type)}
              disabled={disabled}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                isActive
                  ? `${opt.activeBg} ${opt.activeBorder}`
                  : "bg-zinc-800/50 border-white/5 hover:border-white/10",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isActive ? `${opt.activeBg}` : "bg-zinc-700"
                )}
              >
                <span className={cn(isActive ? opt.activeColor : "text-zinc-400")}>
                  {opt.icon}
                </span>
              </div>
              <div className="text-center">
                <p className={cn("font-bold text-sm", isActive ? opt.activeColor : "text-white")}>
                  {opt.label}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{opt.subtitle}</p>
              </div>

              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}