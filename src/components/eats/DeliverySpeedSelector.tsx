/**
 * DeliverySpeedSelector — Standard vs Express radio cards for Eats checkout.
 */
import { Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliverySpeedSelectorProps {
  isExpress: boolean;
  onSelect: (express: boolean) => void;
  expressFee: number;
  standardEtaMin: number;
  standardEtaMax: number;
  expressEtaMin: number;
  expressEtaMax: number;
  disabled?: boolean;
  className?: string;
}

export function DeliverySpeedSelector({
  isExpress,
  onSelect,
  expressFee,
  standardEtaMin,
  standardEtaMax,
  expressEtaMin,
  expressEtaMax,
  disabled = false,
  className,
}: DeliverySpeedSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {/* Standard */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(false)}
        className={cn(
          "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 active:scale-[0.98] touch-manipulation text-left",
          !isExpress
            ? "border-eats bg-eats/5 ring-1 ring-eats/20"
            : "border-border hover:border-muted-foreground/30"
        )}
      >
        <Clock className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-semibold">Standard</span>
        <span className="text-xs text-muted-foreground">
          {standardEtaMin}–{standardEtaMax} min
        </span>
        <span className="text-xs font-medium text-muted-foreground">Included</span>
      </button>

      {/* Express */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(true)}
        className={cn(
          "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 active:scale-[0.98] touch-manipulation text-left",
          isExpress
            ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20"
            : "border-border hover:border-amber-500/40"
        )}
      >
        {isExpress && (
          <span className="absolute -top-2.5 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
            FASTER
          </span>
        )}
        <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />
        <span className="text-sm font-semibold">Express</span>
        <span className="text-xs text-muted-foreground">
          {expressEtaMin}–{expressEtaMax} min
        </span>
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
          +${expressFee.toFixed(2)}
        </span>
      </button>
    </div>
  );
}
