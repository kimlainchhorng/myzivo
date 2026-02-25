/**
 * BatchStopsList Component
 * Displays ordered stops with drag-drop reordering capability
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Store,
  GripVertical,
  Check,
  Clock,
  Navigation,
  Phone,
} from "lucide-react";
import type { BatchStop } from "@/hooks/useBatches";

interface BatchStopsListProps {
  stops: BatchStop[];
  onReorder?: (stopIds: string[]) => void;
  isEditable?: boolean;
  showActions?: boolean;
  onStopAction?: (stopId: string, action: "arrived" | "completed") => void;
  currentStopId?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  arrived: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  completed: "bg-green-500/20 text-green-600 dark:text-green-400",
};

const BatchStopsList = ({
  stops,
  onReorder,
  isEditable = false,
  showActions = false,
  onStopAction,
  currentStopId,
}: BatchStopsListProps) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [orderedStops, setOrderedStops] = useState(stops);

  // Sync with props
  if (JSON.stringify(stops.map(s => s.id)) !== JSON.stringify(orderedStops.map(s => s.id))) {
    setOrderedStops(stops);
  }

  const handleDragStart = (idx: number) => {
    if (!isEditable) return;
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newStops = [...orderedStops];
    const [dragged] = newStops.splice(draggedIdx, 1);
    newStops.splice(idx, 0, dragged);
    setOrderedStops(newStops);
    setDraggedIdx(idx);
  };

  const handleDragEnd = () => {
    if (onReorder && draggedIdx !== null) {
      onReorder(orderedStops.map(s => s.id));
    }
    setDraggedIdx(null);
  };

  const openInMaps = (lat: number | null, lng: number | null, address: string) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
    }
  };

  const getNextPendingStop = () => {
    return orderedStops.find(s => s.status === "pending");
  };

  const nextStop = getNextPendingStop();

  return (
    <div className="space-y-2">
      {orderedStops.map((stop, idx) => {
        const isPickup = stop.kind === "pickup";
        const isNext = nextStop?.id === stop.id;
        const isCompleted = stop.status === "completed";
        const isArrived = stop.status === "arrived";

        return (
          <div
            key={stop.id}
            draggable={isEditable}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
              isNext && "ring-2 ring-primary bg-primary/5",
              isCompleted && "opacity-60",
              draggedIdx === idx && "opacity-50",
              isEditable && "cursor-grab active:cursor-grabbing"
            )}
          >
            {/* Drag handle */}
            {isEditable && (
              <div className="pt-1 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
            )}

            {/* Stop number */}
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                isCompleted
                  ? "bg-green-500 text-white"
                  : isPickup
                  ? "bg-orange-500 text-white"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
            </div>

            {/* Stop info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isPickup ? (
                  <Store className="h-4 w-4 text-orange-500" />
                ) : (
                  <MapPin className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium text-sm">
                  {isPickup ? "Pickup" : "Dropoff"}
                </span>
                <Badge variant="secondary" className={statusColors[stop.status]}>
                  {stop.status}
                </Badge>
                {isNext && (
                  <Badge className="bg-primary text-primary-foreground">
                    Next
                  </Badge>
                )}
              </div>

              <p className="text-sm text-foreground truncate">{stop.address}</p>

              {!isPickup && stop.customer_name && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{stop.customer_name}</span>
                  {stop.customer_phone && (
                    <a
                      href={`tel:${stop.customer_phone}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {stop.customer_phone}
                    </a>
                  )}
                </div>
              )}

              {stop.eta && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  ETA: {new Date(stop.eta).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openInMaps(stop.lat, stop.lng, stop.address)}
              >
                <Navigation className="h-4 w-4" />
              </Button>

              {showActions && !isCompleted && onStopAction && (
                <>
                  {!isArrived && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onStopAction(stop.id, "arrived")}
                    >
                      Arrived
                    </Button>
                  )}
                  {isArrived && (
                    <Button
                      size="sm"
                      onClick={() => onStopAction(stop.id, "completed")}
                    >
                      {isPickup ? "Picked Up" : "Delivered"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {orderedStops.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No stops in this batch
        </div>
      )}
    </div>
  );
};

export default BatchStopsList;
