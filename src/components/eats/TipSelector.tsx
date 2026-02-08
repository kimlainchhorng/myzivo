/**
 * ZIVO Eats — Tip Selector
 * Percentage-based tips with custom amount option
 */
import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TipSelectorProps {
  subtotal: number;
  tipAmount: number;
  onTipChange: (amount: number) => void;
  className?: string;
}

const TIP_PERCENTAGES = [0, 5, 10, 15] as const;

export function TipSelector({ subtotal, tipAmount, onTipChange, className }: TipSelectorProps) {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Calculate tip from percentage
  const calculateTip = (percentage: number): number => {
    return Math.round(subtotal * (percentage / 100) * 100) / 100;
  };

  // Check if current tip matches a percentage option
  const getActivePercentage = (): number | "custom" | null => {
    for (const pct of TIP_PERCENTAGES) {
      if (Math.abs(calculateTip(pct) - tipAmount) < 0.01) {
        return pct;
      }
    }
    return tipAmount > 0 ? "custom" : null;
  };

  const activeOption = getActivePercentage();

  const handleCustomSubmit = () => {
    const value = parseFloat(customValue);
    if (!isNaN(value) && value >= 0) {
      onTipChange(Math.round(value * 100) / 100);
      setCustomModalOpen(false);
      setCustomValue("");
    }
  };

  return (
    <div className={cn("bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-orange-500" />
        <span className="font-bold text-sm">Add a tip</span>
      </div>

      <div className="flex gap-2">
        {/* Percentage options */}
        {TIP_PERCENTAGES.map((pct) => {
          const amount = calculateTip(pct);
          const isActive = activeOption === pct;
          
          return (
            <button
              key={pct}
              onClick={() => onTipChange(amount)}
              className={cn(
                "flex-1 py-3 rounded-xl border text-center transition-all",
                isActive
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-zinc-800/50 border-white/10 text-zinc-300 hover:border-orange-500/50"
              )}
            >
              <div className="text-sm font-bold">
                {pct === 0 ? "None" : `${pct}%`}
              </div>
              {pct > 0 && (
                <div className="text-xs opacity-70">
                  ${amount.toFixed(2)}
                </div>
              )}
            </button>
          );
        })}

        {/* Custom option */}
        <button
          onClick={() => {
            setCustomValue(tipAmount > 0 && activeOption === "custom" ? tipAmount.toString() : "");
            setCustomModalOpen(true);
          }}
          className={cn(
            "flex-1 py-3 rounded-xl border text-center transition-all",
            activeOption === "custom"
              ? "bg-orange-500 border-orange-500 text-white"
              : "bg-zinc-800/50 border-white/10 text-zinc-300 hover:border-orange-500/50"
          )}
        >
          <div className="text-sm font-bold">Other</div>
          {activeOption === "custom" && (
            <div className="text-xs opacity-70">
              ${tipAmount.toFixed(2)}
            </div>
          )}
        </button>
      </div>

      <p className="text-xs text-zinc-500 mt-3 text-center">
        100% of tip goes to your driver
      </p>

      {/* Custom Tip Modal */}
      <Dialog open={customModalOpen} onOpenChange={setCustomModalOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-xs">
          <DialogHeader>
            <DialogTitle>Custom Tip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="pl-7 bg-zinc-800 border-white/10 text-lg h-12"
                autoFocus
              />
            </div>
            <Button
              onClick={handleCustomSubmit}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11"
            >
              Add Tip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
