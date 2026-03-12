/**
 * GroceryCheckoutDrawer - Collects delivery address and places shopping order
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, X, ShoppingCart, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GroceryCartItem } from "@/hooks/useGroceryCart";

interface GroceryCheckoutDrawerProps {
  items: GroceryCartItem[];
  total: number;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
}

const DELIVERY_FEE = 5.99;

export function GroceryCheckoutDrawer({ items, total, onClose, onOrderPlaced }: GroceryCheckoutDrawerProps) {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const grandTotal = total + DELIVERY_FEE;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const orderItems = items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        image: i.image,
        brand: i.brand,
        quantity: i.quantity,
        store: i.store,
      }));

      const { data, error } = await supabase
        .from("shopping_orders")
        .insert({
          user_id: user?.id || null,
          store: "Walmart",
          order_type: "shopping_delivery",
          status: "pending",
          items: orderItems as any,
          total_amount: total,
          delivery_fee: DELIVERY_FEE,
          delivery_address: address.trim(),
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          customer_email: user?.email || null,
          placed_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;

      onOrderPlaced(data.id);
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl border-t border-border/50 max-h-[85vh] overflow-y-auto safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Checkout</h2>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="rounded-xl bg-muted/50 border border-border/50 p-3 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{items.length} items from Walmart</span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-xs">
                  <span className="text-muted-foreground truncate flex-1 mr-2">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 mt-2 pt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Delivery
                </span>
                <span>${DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold">Delivery Details</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Your Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Delivery Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone (optional)</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="rounded-xl"
                type="tel"
              />
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            className="w-full h-13 rounded-2xl text-base font-bold"
            disabled={isSubmitting || !address.trim() || !name.trim()}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {isSubmitting ? "Placing Order..." : `Place Order · $${grandTotal.toFixed(2)}`}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            A ZIVO driver will shop and deliver your items
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
