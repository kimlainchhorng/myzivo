/**
 * OrderEditSheet Component
 * Bottom sheet for editing order items and adding notes
 * Shows countdown timer and item management controls
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, Clock, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

interface OrderEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderItem[];
  currentNote?: string | null;
  remainingDisplay: string;
  remainingSeconds: number;
  urgency: "normal" | "warning" | "critical";
  onRemoveItem: (index: number) => Promise<boolean>;
  onUpdateQuantity: (index: number, quantity: number) => Promise<boolean>;
  onUpdateNote: (note: string) => Promise<boolean>;
  isUpdating: boolean;
}

export function OrderEditSheet({
  open,
  onOpenChange,
  items,
  currentNote,
  remainingDisplay,
  remainingSeconds,
  urgency,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateNote,
  isUpdating,
}: OrderEditSheetProps) {
  const [localNote, setLocalNote] = useState(currentNote || "");
  const [noteChanged, setNoteChanged] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Sync local note with prop
  useEffect(() => {
    setLocalNote(currentNote || "");
    setNoteChanged(false);
  }, [currentNote, open]);

  // Close sheet if window expires
  useEffect(() => {
    if (remainingSeconds <= 0 && open) {
      onOpenChange(false);
    }
  }, [remainingSeconds, open, onOpenChange]);

  // Urgency colors for timer
  const timerColors = {
    normal: "text-cyan-400",
    warning: "text-amber-400",
    critical: "text-red-400 animate-pulse",
  };

  // Handle quantity change
  const handleQuantityChange = async (index: number, delta: number) => {
    const newQty = items[index].quantity + delta;
    if (newQty < 1) {
      // Remove item if quantity would be 0
      setPendingAction(`remove-${index}`);
      const success = await onRemoveItem(index);
      setPendingAction(null);
      return success;
    }
    setPendingAction(`qty-${index}`);
    const success = await onUpdateQuantity(index, newQty);
    setPendingAction(null);
    return success;
  };

  // Handle remove item
  const handleRemoveItem = async (index: number) => {
    setPendingAction(`remove-${index}`);
    const success = await onRemoveItem(index);
    setPendingAction(null);
    return success;
  };

  // Handle save note
  const handleSaveNote = async () => {
    if (!noteChanged) return;
    setPendingAction("note");
    const success = await onUpdateNote(localNote.trim());
    if (success) {
      setNoteChanged(false);
    }
    setPendingAction(null);
  };

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] bg-zinc-950 border-white/10 rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          {/* Header with timer */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold text-white">Edit Order</SheetTitle>
              <div className="flex items-center gap-2">
                <Clock className={cn("w-4 h-4", timerColors[urgency])} />
                <span className={cn("font-mono font-bold text-sm", timerColors[urgency])}>
                  {remainingDisplay}
                </span>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Items list */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">Items</h3>
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.menu_item_id}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-zinc-900/80 border border-white/5 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-zinc-500 text-sm">${item.price.toFixed(2)} each</p>
                        {item.notes && (
                          <p className="text-xs text-zinc-600 mt-1 truncate">{item.notes}</p>
                        )}
                      </div>
                      <p className="font-medium text-eats">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(index, -1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center hover:bg-zinc-700 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-bold min-w-[2ch] text-center">
                          {pendingAction === `qty-${index}` ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(index, 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center hover:bg-zinc-700 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove button - only show if more than 1 item */}
                      {items.length > 1 && (
                        <button
                          onClick={() => handleRemoveItem(index)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {pendingAction === `remove-${index}` ? "..." : "Remove"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add note section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-medium text-zinc-400">Order Note</h3>
              </div>
              <Textarea
                value={localNote}
                onChange={(e) => {
                  setLocalNote(e.target.value);
                  setNoteChanged(e.target.value !== (currentNote || ""));
                }}
                placeholder="Add special instructions..."
                className="bg-zinc-900/80 border-white/10 rounded-xl min-h-[80px] resize-none"
                maxLength={200}
              />
              {noteChanged && (
                <Button
                  onClick={handleSaveNote}
                  disabled={isUpdating}
                  size="sm"
                  className="w-full bg-eats hover:bg-eats/90 text-white"
                >
                  {pendingAction === "note" ? "Saving..." : "Save Note"}
                </Button>
              )}
            </div>
          </div>

          {/* Footer with subtotal */}
          <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Updated Subtotal</span>
              <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-zinc-500 text-center">
              Delivery fee, tax, and total will be recalculated
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
