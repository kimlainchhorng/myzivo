/**
 * GroceryCheckoutDrawer - 2026 Spatial UI Checkout
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader2, X, ShoppingCart, Truck, Shield, User, Phone,
  ChevronDown, ChevronUp, Lock, CheckCircle, Package, Clock, Heart,
  CreditCard, Sparkles, Timer, BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [deliveryNote, setDeliveryNote] = useState("");
  const [leaveAtDoor, setLeaveAtDoor] = useState(false);

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

  const savingsAmount = (total * 0.08).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[32px] max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-[3px] rounded-full bg-muted-foreground/20" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 min-h-0 px-5 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/15"
              >
                <Package className="h-5 w-5 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Checkout</h2>
                <p className="text-[11px] text-muted-foreground">
                  {itemCount} items from {items[0]?.store}
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="p-2 rounded-full bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </motion.button>
          </div>

          {/* Estimated delivery banner */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 mb-4"
          >
            <div className="p-2 rounded-xl bg-primary/15 shrink-0">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-foreground">Estimated delivery: 35–50 min</p>
              <p className="text-[10px] text-muted-foreground">A ZIVO driver will shop & deliver your items</p>
            </div>
          </motion.div>

          {/* Savings chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 w-fit mb-4"
          >
            <Sparkles className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              You're saving ${savingsAmount} with ZIVO pricing
            </span>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-2xl bg-muted/15 border border-border/20 overflow-hidden mb-4"
          >
            <button
              onClick={() => setShowItems(!showItems)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-primary/10">
                  <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[13px] font-semibold">Order Summary</span>
                <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                  {itemCount} items
                </span>
              </div>
              <motion.div animate={{ rotate: showItems ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showItems && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-3 space-y-2 max-h-36 overflow-y-auto">
                    {items.map((item, idx) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-center gap-2.5 text-xs"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            className="h-9 w-9 rounded-xl object-contain bg-background border border-border/15 p-0.5"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="text-muted-foreground truncate flex-1">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="font-semibold shrink-0 tabular-nums">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price breakdown */}
            <div className="px-3.5 pb-3.5 pt-2 border-t border-border/10 space-y-1.5">
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground tabular-nums">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3 w-3" /> Delivery
                </span>
                <span className="text-foreground tabular-nums">${DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>Service fee</span>
                <span className="text-foreground tabular-nums">${SERVICE_FEE.toFixed(2)}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-3 w-3 text-pink-500" /> Driver tip
                  </span>
                  <span className="text-foreground tabular-nums">${tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[15px] font-bold pt-2 mt-1.5 border-t border-border/10">
                <span>Total</span>
                <span className="text-primary tabular-nums">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Tip selection */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mb-4"
          >
            <h3 className="text-[13px] font-bold flex items-center gap-2 mb-2.5">
              <Heart className="h-3.5 w-3.5 text-pink-500" />
              Driver Tip
            </h3>
            <div className="flex gap-2">
              {TIP_OPTIONS.map((amount) => (
                <motion.button
                  key={amount}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setTip(amount)}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                    tip === amount
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-muted/25 text-muted-foreground hover:bg-muted/40 border border-border/15"
                  }`}
                >
                  {amount === 0 ? "None" : `$${amount}`}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Delivery Details */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="mb-4"
          >
            <h3 className="text-[13px] font-bold flex items-center gap-2 mb-2.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Delivery Details
            </h3>
            <div className="space-y-2.5">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name *"
                  className="pl-10 rounded-xl h-11 bg-muted/15 border-border/15 text-[13px] focus:bg-muted/25 transition-colors"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Delivery address *"
                  className="pl-10 rounded-xl h-11 bg-muted/15 border-border/15 text-[13px] focus:bg-muted/25 transition-colors"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="pl-10 rounded-xl h-11 bg-muted/15 border-border/15 text-[13px] focus:bg-muted/25 transition-colors"
                  type="tel"
                />
              </div>
            </div>
          </motion.div>

          {/* Delivery preferences */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <h3 className="text-[13px] font-bold flex items-center gap-2 mb-2.5">
              <Package className="h-3.5 w-3.5 text-primary" />
              Delivery Preferences
            </h3>

            {/* Leave at door toggle */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setLeaveAtDoor(!leaveAtDoor)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all mb-2.5 ${
                leaveAtDoor
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/10 border-border/15"
              }`}
            >
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                leaveAtDoor
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              }`}>
                {leaveAtDoor && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
              </div>
              <span className="text-[12px] font-medium">Leave at my door</span>
            </motion.button>

            <Textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Delivery instructions (e.g., gate code, apartment #)"
              className="rounded-xl bg-muted/15 border-border/15 text-[12px] min-h-[60px] resize-none focus:bg-muted/25 transition-colors"
              rows={2}
            />
          </motion.div>

          {/* Trust & security */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="flex items-center justify-center gap-4 py-3 mb-3"
          >
            {[
              { icon: Shield, label: "Protected" },
              { icon: Lock, label: "Encrypted" },
              { icon: BadgeCheck, label: "Verified" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-primary/70" />
                <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
              </div>
            ))}
          </motion.div>

          <p className="text-[9px] text-muted-foreground/60 text-center mb-3 leading-relaxed px-4">
            You'll be redirected to Stripe for secure payment. A verified ZIVO driver will shop your items and deliver to your door.
          </p>
        </div>

        {/* Sticky CTA */}
        <div className="shrink-0 px-5 pt-3 border-t border-border/10 bg-background/95 backdrop-blur-md" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))" }}>
          <motion.div whileTap={isValid && !isSubmitting ? { scale: 0.97 } : {}}>
            <Button
              className="w-full h-[50px] rounded-2xl text-[14px] font-bold shadow-lg shadow-primary/20 gap-2"
              disabled={isSubmitting || !isValid}
              onClick={handleStripeCheckout}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Redirecting to payment…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay ${grandTotal.toFixed(2)} · Secure Checkout
                </>
              )}
            </Button>
          </motion.div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Lock className="h-2.5 w-2.5 text-muted-foreground/40" />
            <span className="text-[9px] text-muted-foreground/40">Powered by Stripe · 256-bit encryption</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
