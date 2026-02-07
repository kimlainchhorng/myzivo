/**
 * Zone Surge Card
 * Displays real-time surge information for a zone
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, Users, Package, Clock } from "lucide-react";

interface ZoneSurgeCardProps {
  zoneName: string;
  multiplier: number;
  onlineDrivers: number;
  pendingOrders: number;
  avgWaitMinutes?: number;
  isActive?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function ZoneSurgeCard({
  zoneName,
  multiplier,
  onlineDrivers,
  pendingOrders,
  avgWaitMinutes,
  isActive = true,
  onClick,
  compact = false,
}: ZoneSurgeCardProps) {
  const isSurging = multiplier > 1.0;
  const isHighSurge = multiplier >= 1.5;

  if (compact) {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSurging && "border-amber-500/50 bg-amber-500/5",
          isHighSurge && "border-red-500/50 bg-red-500/5",
          !isActive && "opacity-50"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate">{zoneName}</span>
            <Badge
              variant={isSurging ? "destructive" : "secondary"}
              className={cn(
                "text-xs",
                isSurging && !isHighSurge && "bg-amber-500 hover:bg-amber-600"
              )}
            >
              {isSurging && <Zap className="h-3 w-3 mr-1" />}
              {multiplier.toFixed(1)}x
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "transition-all",
        onClick && "cursor-pointer hover:shadow-md",
        isSurging && "border-amber-500/50 bg-amber-500/5",
        isHighSurge && "border-red-500/50 bg-red-500/5",
        !isActive && "opacity-50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{zoneName}</h3>
            <Badge variant={isActive ? "default" : "secondary"} className="mt-1">
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-lg",
              isSurging
                ? isHighSurge
                  ? "bg-red-500 text-white"
                  : "bg-amber-500 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isSurging && <Zap className="h-4 w-4" />}
            {multiplier.toFixed(1)}x
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{onlineDrivers}</p>
              <p className="text-xs text-muted-foreground">Drivers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{pendingOrders}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>

          {avgWaitMinutes !== undefined && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{avgWaitMinutes}m</p>
                <p className="text-xs text-muted-foreground">Avg Wait</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
