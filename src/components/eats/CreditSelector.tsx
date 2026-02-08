/**
 * Credit Selector Component
 * Toggle to apply wallet credits at checkout
 */
import { Sparkles, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { MAX_CREDIT_PER_ORDER } from "@/hooks/useCustomerWallet";

interface CreditSelectorProps {
  availableBalanceCents: number;
  orderTotalCents: number;
  creditAppliedCents: number;
  useCredits: boolean;
  onToggle: (enabled: boolean) => void;
}

export function CreditSelector({
  availableBalanceCents,
  orderTotalCents,
  creditAppliedCents,
  useCredits,
  onToggle,
}: CreditSelectorProps) {
  const balanceDollars = availableBalanceCents / 100;
  const creditAppliedDollars = creditAppliedCents / 100;
  const maxPerOrderDollars = MAX_CREDIT_PER_ORDER / 100;

  // Don't show if no balance
  if (availableBalanceCents <= 0) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-zinc-900/80 backdrop-blur border border-emerald-500/20 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-sm">Use Credits</p>
            <p className="text-xs text-zinc-400">
              Balance: ${balanceDollars.toFixed(2)}
            </p>
          </div>
        </div>
        <Switch
          checked={useCredits}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>

      {useCredits && creditAppliedCents > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-400 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Credit Applied
            </span>
            <span className="font-bold text-emerald-400">
              -${creditAppliedDollars.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {availableBalanceCents > MAX_CREDIT_PER_ORDER && (
        <p className="text-[10px] text-zinc-500 mt-2">
          Max ${maxPerOrderDollars} per order
        </p>
      )}
    </div>
  );
}
