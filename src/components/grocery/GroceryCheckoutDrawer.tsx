/**
 * GroceryCheckoutDrawer - Real Stripe Checkout integration
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader2, X, ShoppingCart, Truck, Shield, User, Phone,
  ChevronDown, ChevronUp, Lock, CheckCircle, Package, Clock, Heart,
  CreditCard,
} from "lucide-react";
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
const SERVICE_FEE = 1.99;
const TIP_OPTIONS = [0, 2, 3, 5];

export function GroceryCheckoutDrawer({ items, total, onClose, onOrderPlaced }: GroceryCheckoutDrawerProps) {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tip, setTip] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const grandTotal = total + DELIVERY_FEE + SERVICE_FEE + tip;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleStripeCheckout = async () => {
    if (!address.trim()) { toast.error("Please enter a delivery address"); return; }
    if (!name.trim()) { toast.error("Please enter your name"); return; }

    setIsSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId, name: i.name, price: i.price,
        image: i.image, brand: i.brand, quantity: i.quantity, store: i.store,
      }));

      const storeName = items[0]?.store || "Unknown";

      const { data, error } = await supabase.functions.invoke("create-grocery-checkout", {
        body: {
          items: orderItems,
          delivery_address: address.trim(),
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          tip,
          store: storeName,
        },
      });

      if (error) throw new Error(error.message || "Checkout failed");
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = address.trim().length > 0 && name.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[28px] border-t border-border/20 max-h-[92vh] overflow-y-auto safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 z-10">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/15" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Checkout</h2>
                <p className="text-[11px] text-muted-foreground">{itemCount} items from {items[0]?.store}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="p-2 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Estimated delivery */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-3 rounded-[16px] bg-primary/5 border border-primary/10 mb-5"
          >
            <div className="p-2 rounded-xl bg-primary/15">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-foreground">Estimated delivery: 35–50 min</p>
              <p className="text-[10px] text-muted-foreground">A ZIVO driver will shop & deliver your items</p>
            </div>
          </motion.div>

          {/* Order Summary - Collapsible */}
          <div className="rounded-[20px] bg-muted/20 border border-border/20 overflow-hidden mb-5">
            <button
              onClick={() => setShowItems(!showItems)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-primary/10">
                  <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold">Order Summary</span>
                <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full font-medium">
                  {itemCount} items
                </span>
              </div>
              {showItems ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {showItems && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 space-y-2 max-h-40 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-2.5 text-xs">
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            className="h-8 w-8 rounded-lg object-contain bg-background border border-border/20"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="text-muted-foreground truncate flex-1">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="font-semibold shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Totals */}
            <div className="px-4 pb-4 pt-2 border-t border-border/15 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3 w-3" /> Delivery
                </span>
                <span className="text-foreground">${DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Service fee</span>
                <span className="text-foreground">${SERVICE_FEE.toFixed(2)}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-3 w-3 text-primary" /> Driver tip
                  </span>
                  <span className="text-foreground">${tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2.5 mt-1.5 border-t border-border/15">
                <span>Total</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Tip selection */}
          <div className="mb-5">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2.5">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Driver Tip
            </h3>
            <div className="flex gap-2">
              {TIP_OPTIONS.map((amount) => (
                <motion.button
                  key={amount}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setTip(amount)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    tip === amount
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border/20"
                  }`}
                >
                  {amount === 0 ? "None" : `$${amount}`}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-3 mb-5">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Delivery Details
            </h3>
            <div className="space-y-2.5">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name *"
                  className="pl-10 rounded-2xl h-12 bg-muted/20 border-border/20 text-sm focus:bg-muted/30 transition-colors"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Delivery address *"
                  className="pl-10 rounded-2xl h-12 bg-muted/20 border-border/20 text-sm focus:bg-muted/30 transition-colors"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="pl-10 rounded-2xl h-12 bg-muted/20 border-border/20 text-sm focus:bg-muted/30 transition-colors"
                  type="tel"
                />
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: Shield, label: "Protected" },
              { icon: Lock, label: "Encrypted" },
              { icon: CheckCircle, label: "Verified" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-primary/5 border border-primary/10">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground text-center mb-4 leading-relaxed">
            You'll be redirected to Stripe for secure payment. A verified ZIVO driver will then shop your items and deliver to your door.
          </p>

          {/* Pay with Stripe */}
          <motion.div whileTap={isValid && !isSubmitting ? { scale: 0.97 } : {}}>
            <Button
              className="w-full h-[52px] rounded-2xl text-[15px] font-bold shadow-lg shadow-primary/25 gap-2"
              disabled={isSubmitting || !isValid}
              onClick={handleStripeCheckout}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Redirecting to payment…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay ${grandTotal.toFixed(2)} · Stripe Checkout
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
