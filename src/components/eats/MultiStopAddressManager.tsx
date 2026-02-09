/**
 * Multi-Stop Address Manager
 * Allows customers to add, edit, reorder, and remove delivery stops
 */

import { useState } from "react";
import { MapPin, Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AddDeliveryStopSheet } from "./AddDeliveryStopSheet";
import { DeliveryStop, MAX_STOPS } from "@/lib/multiStopDeliveryFee";
import { cn } from "@/lib/utils";

interface MultiStopAddressManagerProps {
  stops: DeliveryStop[];
  onAddStop: (stop: Omit<DeliveryStop, "id">) => void;
  onUpdateStop: (id: string, updates: Partial<DeliveryStop>) => void;
  onRemoveStop: (id: string) => void;
  onReorderStops?: (stopIds: string[]) => void;
  className?: string;
  errors?: string[];
  warnings?: string[];
}

export function MultiStopAddressManager({
  stops,
  onAddStop,
  onUpdateStop,
  onRemoveStop,
  onReorderStops,
  className,
  errors = [],
  warnings = [],
}: MultiStopAddressManagerProps) {
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  
  const canAddMore = stops.length < MAX_STOPS;
  const canRemove = stops.length > 1;
  
  const handleAddStop = (stop: Omit<DeliveryStop, "id">) => {
    onAddStop(stop);
    setAddStopOpen(false);
  };
  
  // Simple drag-drop reordering (could be enhanced with dnd-kit)
  const handleMoveUp = (index: number) => {
    if (index === 0 || !onReorderStops) return;
    const newOrder = [...stops.map((s) => s.id)];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorderStops(newOrder);
  };
  
  const handleMoveDown = (index: number) => {
    if (index === stops.length - 1 || !onReorderStops) return;
    const newOrder = [...stops.map((s) => s.id)];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorderStops(newOrder);
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-eats" />
          Delivery Stops
          {stops.length > 1 && (
            <Badge variant="secondary" className="ml-2">
              {stops.length} stops
            </Badge>
          )}
        </Label>
      </div>
      
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 space-y-1">
          {errors.map((error, i) => (
            <p key={i} className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1">
          {warnings.map((warning, i) => (
            <p key={i} className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      )}
      
      {/* Stop List */}
      <div className="space-y-3">
        {stops.map((stop, index) => (
          <div
            key={stop.id}
            className={cn(
              "border rounded-xl overflow-hidden transition-all",
              expandedStopId === stop.id
                ? "border-eats/50 bg-eats/5"
                : "border-border"
            )}
          >
            {/* Stop Header */}
            <div
              className="flex items-center gap-3 p-3 cursor-pointer"
              onClick={() =>
                setExpandedStopId(expandedStopId === stop.id ? null : stop.id)
              }
            >
              {/* Drag Handle & Number */}
              <div className="flex items-center gap-2">
                {onReorderStops && stops.length > 1 && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(index);
                      }}
                      disabled={index === 0}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <GripVertical className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="w-6 h-6 rounded-full bg-eats/20 text-eats flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              
              {/* Address */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {stop.address || "Enter address..."}
                </p>
                {stop.label && (
                  <p className="text-xs text-muted-foreground">{stop.label}</p>
                )}
                {stop.instructions && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {stop.instructions}
                  </p>
                )}
              </div>
              
              {/* Remove Button */}
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStop(stop.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Expanded Edit Form */}
            {expandedStopId === stop.id && (
              <div className="px-3 pb-3 pt-1 space-y-3 border-t">
                <div>
                  <Label htmlFor={`address-${stop.id}`} className="text-xs">
                    Address *
                  </Label>
                  <Input
                    id={`address-${stop.id}`}
                    value={stop.address}
                    onChange={(e) =>
                      onUpdateStop(stop.id, { address: e.target.value })
                    }
                    placeholder="123 Main St, City, State"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`instructions-${stop.id}`} className="text-xs">
                    Delivery Instructions
                  </Label>
                  <Textarea
                    id={`instructions-${stop.id}`}
                    value={stop.instructions || ""}
                    onChange={(e) =>
                      onUpdateStop(stop.id, { instructions: e.target.value })
                    }
                    placeholder="Apt #, gate code, leave at door..."
                    className="mt-1"
                    rows={2}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(stop.instructions?.length || 0)}/200
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add Stop Button */}
      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-eats/50 text-eats hover:bg-eats/5"
          onClick={() => setAddStopOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add another delivery address
        </Button>
      )}
      
      {!canAddMore && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum {MAX_STOPS} delivery stops allowed
        </p>
      )}
      
      {/* Add Stop Sheet */}
      <AddDeliveryStopSheet
        open={addStopOpen}
        onOpenChange={setAddStopOpen}
        onAdd={handleAddStop}
        stopNumber={stops.length + 1}
      />
    </div>
  );
}
