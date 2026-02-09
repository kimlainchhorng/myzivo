/**
 * ETA Breakdown Card
 * Visual breakdown of delivery ETA components at checkout
 */
import { Package, ClipboardList, ChefHat, Car, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EtaBreakdownCardProps {
  queueMinutes: number;
  prepMinutes: number;
  driverMinutes: number;
  totalMinRange: number;
  totalMaxRange: number;
  isHighVolume: boolean;
  queueLength?: number;
  surgeActive?: boolean;
  className?: string;
}

interface BreakdownRowProps {
  icon: React.ReactNode;
  label: string;
  minutes: number;
  totalMinutes: number;
  colorClass: string;
  tooltip?: string;
}

function BreakdownRow({
  icon,
  label,
  minutes,
  totalMinutes,
  colorClass,
  tooltip,
}: BreakdownRowProps) {
  const percentage = totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium flex items-center gap-1">
            {label}
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </span>
          <span className="text-sm text-muted-foreground">~{minutes} min</span>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>
    </div>
  );
}

export function EtaBreakdownCard({
  queueMinutes,
  prepMinutes,
  driverMinutes,
  totalMinRange,
  totalMaxRange,
  isHighVolume,
  queueLength = 0,
  surgeActive = false,
  className,
}: EtaBreakdownCardProps) {
  const totalMinutes = queueMinutes + prepMinutes + driverMinutes;

  return (
    <div
      className={cn(
        "rounded-xl border bg-muted/30 p-4 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-eats" />
          <span className="font-medium text-sm">Estimated Delivery</span>
        </div>
        <span className="font-bold text-eats">
          {totalMinRange}–{totalMaxRange} min
        </span>
      </div>

      {/* Breakdown rows */}
      <div className="space-y-3">
        {queueMinutes > 0 && (
          <BreakdownRow
            icon={<ClipboardList className="w-4 h-4 text-amber-400" />}
            label="Queue Wait"
            minutes={queueMinutes}
            totalMinutes={totalMinutes}
            colorClass="bg-amber-500/20"
            tooltip={`${queueLength} order${queueLength !== 1 ? "s" : ""} ahead of yours`}
          />
        )}
        
        <BreakdownRow
          icon={<ChefHat className="w-4 h-4 text-orange-400" />}
          label="Cooking Time"
          minutes={prepMinutes}
          totalMinutes={totalMinutes}
          colorClass="bg-orange-500/20"
          tooltip="Time to prepare your order"
        />
        
        <BreakdownRow
          icon={<Car className="w-4 h-4 text-emerald-400" />}
          label="Driver Delivery"
          minutes={driverMinutes}
          totalMinutes={totalMinutes}
          colorClass="bg-emerald-500/20"
          tooltip="Travel time from restaurant to you"
        />
      </div>

      {/* Footer notes */}
      {isHighVolume && queueLength > 0 && (
        <div className="flex items-start gap-2 pt-2 border-t border-border/50">
          <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            ETA includes {queueLength} order{queueLength !== 1 ? "s" : ""} ahead of yours.
          </p>
        </div>
      )}

      {surgeActive && (
        <div className="flex items-start gap-2 pt-2 border-t border-border/50">
          <Info className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Delivery times may be longer due to high demand in your area.
          </p>
        </div>
      )}
    </div>
  );
}
