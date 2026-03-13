/**
 * GroceryCheckoutDrawer - 2026 Spatial UI Checkout (v4)
 * 2-step: Delivery Details → Review & Pay
 * Real-time ETA, substitution preferences, persistent profile
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader2, X, ShoppingCart, Truck, Shield, User, Phone,
  ChevronDown, Lock, CheckCircle, Package, Clock, Heart,
  CreditCard, Sparkles, Timer, BadgeCheck, ArrowRight, ArrowLeft,
  MessageSquare, DoorOpen, Star, Gift, RefreshCw, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GroceryCartItem } from "@/hooks/useGroceryCart";
import { GroceryPromoInput } from "@/components/grocery/GroceryPromoBanner";
import { getLiveEta } from "@/utils/storeStatus";
import { getStoreConfig, type StoreName, GROCERY_STORES } from "@/config/groceryStores";
import { DELIVERY_FEE, SERVICE_FEE, TIP_OPTIONS } from "@/config/groceryPricing";

interface GroceryCheckoutDrawerProps {
  items: GroceryCartItem[];
  total: number;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
}

type SubstitutionPref = "contact_me" | "best_match" | "refund";

function getSavedAddress(): { address: string; label: string } | null {
  try {
    const raw = localStorage.getItem("zivo_selected_address");
    if (raw) {
      const parsed = JSON.parse(raw);
      return { address: parsed.address || "", label: parsed.label || "" };
    }
  } catch {}
  return null;
}

function getSavedProfile(): { name: string; phone: string; subPref: SubstitutionPref } {
  try {
    const raw = localStorage.getItem("zivo_checkout_profile");
    if (raw) return { subPref: "contact_me", ...JSON.parse(raw) };
  } catch {}
  return { name: "", phone: "", subPref: "contact_me" };
}

export function GroceryCheckoutDrawer({ items, total, onClose, onOrderPlaced }: GroceryCheckoutDrawerProps) {
  const savedAddr = getSavedAddress();
  const savedProfile = getSavedProfile();

  const [address, setAddress] = useState(savedAddr?.address || "");
  const [name, setName] = useState(savedProfile.name);
  const [phone, setPhone] = useState(savedProfile.phone);
  const [tip, setTip] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [leaveAtDoor, setLeaveAtDoor] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [subPref, setSubPref] = useState<SubstitutionPref>(savedProfile.subPref);

  const grandTotal = Math.max(0, total + DELIVERY_FEE + SERVICE_FEE + tip - promoDiscount);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const isValid = address.trim().length > 0 && name.trim().length > 0;

  // Live ETA
  const storeName = items[0]?.store || "Walmart";
  const storeCfg = GROCERY_STORES.find(s => s.name.toLowerCase() === storeName.toLowerCase());
  const [liveEta, setLiveEta] = useState(storeCfg?.deliveryMin ?? 35);
  useEffect(() => {
    const compute = () => setLiveEta(getLiveEta(storeCfg?.deliveryMin ?? 35));
    compute();
    const interval = setInterval(compute, 30_000);
    return () => clearInterval(interval);
  }, [storeCfg]);

  // Persist profile
  useEffect(() => {
    if (name || phone) {
      localStorage.setItem("zivo_checkout_profile", JSON.stringify({ name, phone, subPref }));
    }
  }, [name, phone, subPref]);

  const goToReview = () => {
    if (!address.trim()) { toast.error("Please enter a delivery address"); return; }
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    setStep(2);
  };

  const handleStripeCheckout = async () => {
    setIsSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId, name: i.name, price: i.price,
        image: i.image, brand: i.brand, quantity: i.quantity, store: i.store,
      }));

      const { data, error } = await supabase.functions.invoke("create-grocery-checkout", {
        body: {
          items: orderItems,
          delivery_address: address.trim(),
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          tip,
          store: items[0]?.store || "Unknown",
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

  const SUB_OPTIONS: { value: SubstitutionPref; label: string; desc: string; icon: typeof RefreshCw }[] = [
    { value: "contact_me", label: "Contact Me", desc: "Driver will message you", icon: MessageSquare },
    { value: "best_match", label: "Best Match", desc: "Pick a similar item", icon: RefreshCw },
    { value: "refund", label: "Refund", desc: "Skip & refund", icon: AlertTriangle },
  ];

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
              {step === 2 && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setStep(1)}
                  className="p-1.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
              )}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/15"
              >
                {step === 1 ? <MapPin className="h-5 w-5 text-primary" /> : <CreditCard className="h-5 w-5 text-primary" />}
              </motion.div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  {step === 1 ? "Delivery Details" : "Review & Pay"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Step {step} of 2 · {itemCount} items from {storeName}
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

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1.5 rounded-full bg-primary" />
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? "bg-primary" : "bg-muted/40"}`} />
          </div>

          {/* ═════════ STEP 1: Delivery Details ═════════ */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Live ETA banner */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 mb-4">
                  <div className="p-2 rounded-xl bg-primary/15 shrink-0">
                    <Timer className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-bold text-foreground">
                      Estimated delivery:{" "}
                      <motion.span key={liveEta} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary">
                        {liveEta}–{liveEta + 15} min
                      </motion.span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">A ZIVO driver will shop & deliver your items</p>
                  </div>
                </div>

                {/* Auto-filled address badge */}
                {savedAddr && address === savedAddr.address && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 w-fit mb-3"
                  >
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Address auto-filled from your saved location
                    </span>
                  </motion.div>
                )}

                {/* Contact info */}
                <h3 className="text-[13px] font-bold flex items-center gap-2 mb-2.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-2.5 mb-4">
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

                {/* Delivery address */}
                <h3 className="text-[13px] font-bold flex items-center gap-2 mb-2.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Delivery Address
                </h3>
                <div className="relative mb-4">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Delivery address *"
                    className="pl-10 rounded-xl h-11 bg-muted/15 border-border/15 text-[13px] focus:bg-muted/25 transition-colors"
                  />
                </div>

                {/* Delivery preferences */}
                <h3 className="text-[13px] font-bold flex items-center gap-2 mb-2.5">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  Delivery Preferences
                </h3>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLeaveAtDoor(!leaveAtDoor)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all mb-2.5 ${
                    leaveAtDoor ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border/15"
                  }`}
                >
                  <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    leaveAtDoor ? "bg-primary border-primary" : "border-muted-foreground/30"
                  }`}>
                    {leaveAtDoor && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[12px] font-medium">Leave at my door</span>
                </motion.button>

                <Textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Delivery instructions (e.g., gate code, apartment #)"
                  className="rounded-xl bg-muted/15 border-border/15 text-[12px] min-h-[60px] resize-none focus:bg-muted/25 transition-colors mb-4"
                  rows={2}
                />

                {/* Substitution preference */}
                <h3 className="text-[13px] font-bold flex items-center gap-2 mb-2.5">
                  <RefreshCw className="h-3.5 w-3.5 text-primary" />
                  If an item is unavailable
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {SUB_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSubPref(opt.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        subPref === opt.value
                          ? "bg-primary/5 border-primary/25 shadow-sm"
                          : "bg-muted/10 border-border/15 hover:bg-muted/20"
                      }`}
                    >
                      <opt.icon className={`h-4 w-4 mx-auto mb-1 ${subPref === opt.value ? "text-primary" : "text-muted-foreground/50"}`} />
                      <p className={`text-[10px] font-bold ${subPref === opt.value ? "text-primary" : "text-foreground/70"}`}>{opt.label}</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Item preview */}
                <div className="rounded-2xl bg-muted/15 border border-border/20 overflow-hidden mb-4">
                  <button
                    onClick={() => setShowItems(!showItems)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-primary/10">
                        <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-[13px] font-semibold">{itemCount} items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-foreground">${total.toFixed(2)}</span>
                      <motion.div animate={{ rotate: showItems ? 180 : 0 }}>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {showItems && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
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
                                <img src={item.image} alt="" className="h-9 w-9 rounded-xl object-contain bg-background border border-border/15 p-0.5" referrerPolicy="no-referrer" />
                              )}
                              <span className="text-muted-foreground truncate flex-1">{item.quantity}× {item.name}</span>
                              <span className="font-semibold shrink-0 tabular-nums">${(item.price * item.quantity).toFixed(2)}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ═════════ STEP 2: Review & Pay ═════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Delivery summary card */}
                <div className="rounded-2xl bg-muted/15 border border-border/20 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-[13px] font-bold">Delivering to</span>
                  </div>
                  <p className="text-[12px] text-foreground font-medium">{name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{address}</p>
                  {phone && <p className="text-[11px] text-muted-foreground mt-0.5">{phone}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {leaveAtDoor && (
                      <div className="flex items-center gap-1.5">
                        <DoorOpen className="h-3 w-3 text-primary" />
                        <span className="text-[10px] text-primary font-semibold">Leave at door</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Substitutions: {SUB_OPTIONS.find(o => o.value === subPref)?.label}
                      </span>
                    </div>
                  </div>
                  {deliveryNote && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-[10px] text-muted-foreground">{deliveryNote}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setStep(1)}
                    className="text-[10px] text-primary font-semibold mt-2 hover:underline"
                  >
                    Edit details
                  </button>
                </div>

                {/* Live ETA */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-primary/5 border border-primary/10 mb-4"
                >
                  <Timer className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-foreground">
                      Est. delivery:{" "}
                      <motion.span key={liveEta} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary">
                        {liveEta}–{liveEta + 15} min
                      </motion.span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-600">No markup</span>
                  </div>
                </motion.div>

                {/* Full order summary */}
                <div className="rounded-2xl bg-muted/15 border border-border/20 overflow-hidden mb-4">
                  <button
                    onClick={() => setShowItems(!showItems)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-primary/10">
                        <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-[13px] font-semibold">Order Summary</span>
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">{itemCount} items</span>
                    </div>
                    <motion.div animate={{ rotate: showItems ? 180 : 0 }}>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showItems && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
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
                                <img src={item.image} alt="" className="h-9 w-9 rounded-xl object-contain bg-background border border-border/15 p-0.5" referrerPolicy="no-referrer" />
                              )}
                              <span className="text-muted-foreground truncate flex-1">{item.quantity}× {item.name}</span>
                              <span className="font-semibold shrink-0 tabular-nums">${(item.price * item.quantity).toFixed(2)}</span>
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
                      <span className="flex items-center gap-1.5"><Truck className="h-3 w-3" /> Delivery</span>
                      <span className="text-foreground tabular-nums">${DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[12px] text-muted-foreground">
                      <span>Service fee</span>
                      <span className="text-foreground tabular-nums">${SERVICE_FEE.toFixed(2)}</span>
                    </div>
                    {tip > 0 && (
                      <div className="flex justify-between text-[12px] text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Heart className="h-3 w-3 text-pink-500" /> Driver tip</span>
                        <span className="text-foreground tabular-nums">${tip.toFixed(2)}</span>
                      </div>
                    )}
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-[12px] text-emerald-600">
                        <span className="flex items-center gap-1.5"><Gift className="h-3 w-3" /> Promo discount</span>
                        <span className="font-semibold">-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[15px] font-bold pt-2 mt-1.5 border-t border-border/10">
                      <span>Total</span>
                      <span className="text-primary tabular-nums">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Tip selection */}
                <div className="mb-4">
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
                </div>

                {/* Promo code */}
                <div className="mb-4">
                  <GroceryPromoInput
                    onApply={(code, discount) => {
                      setPromoCode(code);
                      setPromoDiscount(discount);
                    }}
                  />
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 py-3 mb-3">
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
                </div>

                <p className="text-[9px] text-muted-foreground/60 text-center mb-3 leading-relaxed px-4">
                  You'll be redirected to Stripe for secure payment. A verified ZIVO driver will shop your items and deliver to your door.
                </p>

                {/* Policy disclosures */}
                <div className="space-y-1.5 mb-3 px-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/10">
                    <RotateCcwIcon className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                    <p className="text-[9px] text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground/70">Freshness Guarantee:</span> Report quality issues within 24h for a full refund. <a href="/grocery/returns" className="text-primary/70 underline">Returns policy</a>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/10">
                    <AlertTriangle className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                    <p className="text-[9px] text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground/70">Cancellation:</span> Free before driver starts · Fees apply after. <a href="/grocery/fees" className="text-primary/70 underline">View fees</a>
                    </p>
                  </div>
                  <p className="text-[8px] text-muted-foreground/50 text-center px-2">
                    By placing your order, you agree to our <a href="/grocery/terms" className="text-primary/50 underline">Terms</a> and <a href="/privacy" className="text-primary/50 underline">Privacy Policy</a>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky CTA */}
        <div className="shrink-0 px-5 pt-3 pb-20 border-t border-border/10 bg-background/95 backdrop-blur-md" style={{ paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))" }}>
          {step === 1 ? (
            <motion.div whileTap={isValid ? { scale: 0.97 } : {}}>
              <Button
                className="w-full h-[50px] rounded-2xl text-[14px] font-bold shadow-lg shadow-primary/20 gap-2"
                disabled={!isValid}
                onClick={goToReview}
              >
                Review Order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileTap={!isSubmitting ? { scale: 0.97 } : {}}>
              <Button
                className="w-full h-[50px] rounded-2xl text-[14px] font-bold shadow-lg shadow-primary/20 gap-2"
                disabled={isSubmitting}
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
          )}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Lock className="h-2.5 w-2.5 text-muted-foreground/40" />
            <span className="text-[9px] text-muted-foreground/40">Powered by Stripe · 256-bit encryption</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
