/**
 * Delivery Task Card
 * Shows delivery/pickup task status and details
 */

import { format } from "date-fns";
import {
  Truck,
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Navigation,
  Camera,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeliveryTask } from "@/hooks/useVehicleDelivery";

interface DeliveryTaskCardProps {
  task: DeliveryTask;
  showDriverActions?: boolean;
  onAccept?: () => void;
  onStartRoute?: () => void;
  onArrive?: () => void;
  onComplete?: () => void;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  assigned: { label: "Assigned", color: "bg-blue-100 text-blue-700", icon: User },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  en_route: { label: "En Route", color: "bg-violet-100 text-violet-700", icon: Navigation },
  arrived: { label: "Arrived", color: "bg-emerald-100 text-emerald-700", icon: MapPin },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

export default function DeliveryTaskCard({
  task,
  showDriverActions = false,
  onAccept,
  onStartRoute,
  onArrive,
  onComplete,
  className,
}: DeliveryTaskCardProps) {
  const status = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isDelivery = task.task_type === "delivery";

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className={cn("w-4 h-4", isDelivery ? "text-blue-500" : "text-violet-500")} />
            {isDelivery ? "Vehicle Delivery" : "Vehicle Pickup"}
          </CardTitle>
          <Badge className={cn("gap-1", status.color)}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-5 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="w-px h-6 bg-border" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm truncate">{task.pickup_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Dropoff</p>
              <p className="text-sm truncate">{task.dropoff_address}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(task.scheduled_at), "MMM d, h:mm a")}</span>
          </div>
          {task.distance_miles && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Navigation className="w-4 h-4" />
              <span>{task.distance_miles.toFixed(1)} miles</span>
            </div>
          )}
        </div>

        {/* Payout info */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl">
          <span className="text-sm text-muted-foreground">Task Payout</span>
          <span className="font-bold text-emerald-600">
            ${(task.driver_payout || task.total_fee * 0.8).toFixed(2)}
          </span>
        </div>

        {/* Handoff verification status */}
        {task.status === "completed" && (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              Handoff verified
              {task.vehicle_photos?.length > 0 && ` • ${task.vehicle_photos.length} photos`}
            </span>
          </div>
        )}

        {/* Driver Actions */}
        {showDriverActions && (
          <div className="flex gap-2 pt-2">
            {task.status === "pending" && onAccept && (
              <Button onClick={onAccept} className="flex-1">
                Accept Task
              </Button>
            )}
            {task.status === "accepted" && onStartRoute && (
              <Button onClick={onStartRoute} className="flex-1 gap-2">
                <Navigation className="w-4 h-4" />
                Start Route
              </Button>
            )}
            {task.status === "en_route" && onArrive && (
              <Button onClick={onArrive} className="flex-1 gap-2">
                <MapPin className="w-4 h-4" />
                I've Arrived
              </Button>
            )}
            {task.status === "arrived" && onComplete && (
              <Button onClick={onComplete} className="flex-1 gap-2">
                <Camera className="w-4 h-4" />
                Complete Handoff
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
