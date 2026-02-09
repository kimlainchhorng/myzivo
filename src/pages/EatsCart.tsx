/**
 * ZIVO Eats — Enhanced Cart Page
 * Full checkout flow with address, promo, payment, tip, ZIVO+ discounts, wallet credits, surge pricing, and scheduled delivery
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, UtensilsCrossed, Loader2, Flame, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { AddressSelector } from "@/components/eats/AddressSelector";
import { DeliveryTimeSelector } from "@/components/eats/DeliveryTimeSelector";
import { PromoCodeInput } from "@/components/eats/PromoCodeInput";
import { PaymentMethodModal, PaymentMethodDisplay, type PaymentMethod } from "@/components/eats/PaymentMethodModal";
import { TipSelector } from "@/components/eats/TipSelector";
import { MembershipSavingsBadge } from "@/components/membership/MembershipSavingsBadge";
import { CreditSelector } from "@/components/eats/CreditSelector";
import { EatsSurgeBadge } from "@/components/eats/EatsSurgeBadge";
import { SurgeExplainerTooltip } from "@/components/eats/SurgeExplainerTooltip";
import { useEatsPromo } from "@/hooks/useEatsPromo";
import { useSavedLocations, type SavedLocation } from "@/hooks/useSavedLocations";
import { useCreateFoodOrder } from "@/hooks/useEatsOrders";
import { useMembership, calculateMembershipSavings } from "@/hooks/useMembership";
import { useCustomerWallet, useAppliedCredit } from "@/hooks/useCustomerWallet";
import { useEatsSurgePricing } from "@/hooks/useEatsSurgePricing";
import { useEatsDeliveryFactors } from "@/hooks/useEatsDeliveryFactors";
import { LiveDemandBanner } from "@/components/eats/LiveDemandBanner";
import { useDemandAdjustedEta } from "@/hooks/useDemandAdjustedEta";
import { useQueueAwareEta } from "@/hooks/useQueueAwareEta";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DeliveryMode } from "@/components/eats/DeliveryTimeSheet";

function EatsCartContent() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart, deliveryAddress, setDeliveryAddress } = useCart();

  // State
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [selectedAddress, setSelectedAddress] = useState<SavedLocation | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>({
    id: "pm_1",
    type: "card",
    brand: "Visa",
    last4: "4242",
    isDefault: true,
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [useCredits, setUseCredits] = useState(false);
  
  // Scheduled delivery state
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("asap");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);

  // Hooks
  const { data: addresses } = useSavedLocations(userId);
  const promo = useEatsPromo();
  const createOrder = useCreateFoodOrder();
  const { membership, isActive: isMember } = useMembership();
  const { wallet, balanceCents, applyCredit } = useCustomerWallet();
  
  // Surge pricing
  const { isActive: surgeActive, level: surgeLevel, multiplier: surgeMultiplier, calculateDeliveryFee } = useEatsSurgePricing();
  const deliveryFactors = useEatsDeliveryFactors();

  const restaurantName = items.length > 0 ? items[0].restaurantName : "";
  const restaurantId = items.length > 0 ? items[0].restaurantId : "";

  // Demand-adjusted ETA
  const { demandMultiplier } = useDemandAdjustedEta(restaurantId || undefined);
  const eta = useQueueAwareEta({
    restaurantId: restaurantId || undefined,
    demandMultiplier,
    surgeMultiplier,
    forecastMultiplier: deliveryFactors.forecastMultiplier,
  });

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  // Set default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(a => a.icon === "default") || addresses[0];
      setSelectedAddress(defaultAddr);
      setDeliveryAddress(defaultAddr.address);
    }
  }, [addresses, selectedAddress, setDeliveryAddress]);

  // Recalculate promo when subtotal changes
  const subtotal = getSubtotal();
  useEffect(() => {
    promo.recalculateDiscount(subtotal);
  }, [subtotal]);

  // Price calculations
  const deliveryFeeBase = 3.99;
  const serviceFeeBase = Math.round(subtotal * 0.05 * 100) / 100;
  
  // Apply surge to delivery fee
  const surgeBreakdown = calculateDeliveryFee(deliveryFeeBase);
  const deliveryFeeAfterSurge = surgeBreakdown.finalFee;
  
  // Calculate membership savings (on surged delivery fee)
  const membershipSavings = useMemo(() => {
    if (!isMember || !membership?.plan) {
      return { deliverySavings: 0, serviceSavings: 0, total: 0 };
    }
    return calculateMembershipSavings(membership.plan, subtotal, deliveryFeeAfterSurge, serviceFeeBase);
  }, [isMember, membership, subtotal, deliveryFeeAfterSurge, serviceFeeBase]);

  // Apply membership discounts
  const deliveryFee = Math.max(0, deliveryFeeAfterSurge - membershipSavings.deliverySavings);
  const serviceFee = Math.max(0, serviceFeeBase - membershipSavings.serviceSavings);
  const tax = Math.round((subtotal - promo.discountAmount) * 0.08 * 100) / 100;
  
  // Calculate total before credits
  const totalBeforeCredits = subtotal - promo.discountAmount + deliveryFee + serviceFee + tax + tipAmount;
  const totalBeforeCreditsCents = Math.round(totalBeforeCredits * 100);
  
  // Calculate credit to apply
  const { creditAppliedCents, creditAppliedDollars } = useAppliedCredit(
    useCredits,
    totalBeforeCreditsCents,
    balanceCents
  );
  
  // Final total
  const total = totalBeforeCredits - creditAppliedDollars;




  // Handle promo apply
  const handleApplyPromo = async (code: string) => {
    return promo.applyPromo(code, subtotal);
  };

  // Handle order submission
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!selectedPayment) {
      toast.error("Please select a payment method");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map(item => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
      }));

      // Calculate deliver_by timestamp for scheduled orders
      let deliverBy: string | null = null;
      if (deliveryMode === "scheduled" && scheduledDate && scheduledTime) {
        // Parse time like "6:30 PM" to create full date
        const [time, period] = scheduledTime.split(" ");
        const [hourStr, minuteStr] = time.split(":");
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(hour, minute, 0, 0);
        deliverBy = scheduledDateTime.toISOString();
      }

      const order = await createOrder.mutateAsync({
        customer_name: "Customer", // Would come from profile
        customer_phone: "", // Would come from profile
        customer_email: "", // Would come from profile
        delivery_address: selectedAddress.address,
        preferred_time: deliveryMode,
        restaurant_id: restaurantId,
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        tax: tax,
        tip_amount: tipAmount,
        total: total,
        // Membership tracking
        membership_applied: isMember,
        membership_discount_cents: Math.round(membershipSavings.total * 100),
        // Credit tracking
        credit_applied_cents: creditAppliedCents,
        // Surge tracking
        surge_multiplier: surgeMultiplier,
        surge_fee_cents: Math.round(surgeBreakdown.surgeAmount * 100),
        // Scheduled delivery tracking
        is_scheduled: deliveryMode === "scheduled",
        deliver_by: deliverBy,
        pickup_window_start: deliverBy,
      });

      // Apply wallet credit deduction if credits were used
      if (creditAppliedCents > 0) {
        try {
          await applyCredit.mutateAsync({
            amount_cents: creditAppliedCents,
            order_id: order.id,
          });
          toast.success(`You saved $${creditAppliedDollars.toFixed(2)} with credits!`);
        } catch (creditError) {
          console.warn("Credit deduction failed:", creditError);
          // Order still went through, just credit wasn't deducted
        }
      }

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/eats/orders/${order.id}`);
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <SEOHead title="Cart — ZIVO Eats" description="Your food order cart" />
        
        {/* Header */}
        <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">Your Cart</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center px-6 pt-32">
          <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 text-center mb-8">
            Add delicious food from our restaurants
          </p>
          <Button
            onClick={() => navigate("/eats")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-8 h-12 rounded-xl"
          >
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-48">
      <SEOHead title="Cart — ZIVO Eats" description="Review your food order" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-400 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Restaurant Name */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="font-bold">{restaurantName}</p>
            <p className="text-sm text-zinc-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Delivery Address */}
        <AddressSelector selectedAddress={selectedAddress} />

        {/* Delivery Time Selector */}
        <DeliveryTimeSelector
          mode={deliveryMode}
          scheduledDate={scheduledDate}
          scheduledTime={scheduledTime}
          onChange={(mode, date, time) => {
            setDeliveryMode(mode);
            setScheduledDate(date);
            setScheduledTime(time);
          }}
        />

        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-4"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <UtensilsCrossed className="w-5 h-5 text-orange-500/30" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-zinc-500 mt-1">{item.notes}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-orange-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Promo Code */}
        <PromoCodeInput
          appliedPromo={promo.promoCode}
          discountAmount={promo.discountAmount}
          isValidating={promo.isValidating}
          error={promo.error}
          onApply={handleApplyPromo}
          onClear={promo.clearPromo}
        />

        {/* Payment Method */}
        <PaymentMethodDisplay
          selectedMethod={selectedPayment}
          onClick={() => setPaymentModalOpen(true)}
        />

        {/* Tip Selector */}
        <TipSelector
          subtotal={subtotal}
          tipAmount={tipAmount}
          onTipChange={setTipAmount}
        />

        {/* ZIVO+ Membership Savings Badge */}
        {isMember && membershipSavings.total > 0 && (
          <MembershipSavingsBadge totalSavings={membershipSavings.total} />
        )}

        {/* Credit Selector */}
        <CreditSelector
          availableBalanceCents={balanceCents}
          orderTotalCents={totalBeforeCreditsCents}
          creditAppliedCents={creditAppliedCents}
          useCredits={useCredits}
          onToggle={setUseCredits}
        />

        {/* Live Demand Banner */}
        {(deliveryFactors.demandActive || deliveryFactors.isForecastedDemand) && (
          <LiveDemandBanner
            isActive={deliveryFactors.demandActive}
            isForecastedDemand={deliveryFactors.isForecastedDemand}
            isIncentivePeriod={deliveryFactors.isIncentivePeriod}
          />
        )}

        {/* Surge Fee Notice (kept for pricing context) */}
        {surgeActive && (
          <div className="flex items-start gap-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-orange-400">Delivery fee adjusted</p>
              <p className="text-xs text-zinc-400 mt-0.5">Delivery fee adjusted based on demand.</p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {promo.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span>Discount ({promo.promoCode?.code})</span>
              <span>-${promo.discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          {/* Delivery Fee with Surge Breakdown */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400 flex items-center gap-1">
                Delivery Fee
                {surgeActive && <SurgeExplainerTooltip />}
              </span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            {surgeActive && (
              <div className="ml-4 space-y-0.5 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Base</span>
                  <span>${deliveryFeeBase.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-orange-400">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    Busy time (×{surgeMultiplier.toFixed(1)})
                  </span>
                  <span>+${surgeBreakdown.surgeAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Service Fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          {tipAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Tip</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
          )}
          {creditAppliedCents > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span>Credit Applied</span>
              <span>-${creditAppliedDollars.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Delivery Time</span>
            <span className={deliveryMode === "scheduled" ? "text-violet-400" : ""}>
              {deliveryMode === "asap" 
                ? `ASAP (${eta.etaMinRange}–${eta.etaMaxRange} min)` 
                : scheduledDate && scheduledTime
                  ? `${format(scheduledDate, "MMM d")} at ${scheduledTime}`
                  : "Select time"
              }
            </span>
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        <Button
          onClick={handlePlaceOrder}
          disabled={isSubmitting || !selectedAddress}
          className="w-full h-14 rounded-2xl font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl shadow-orange-500/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            `Place Order · $${total.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Payment Modal */}
      <PaymentMethodModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        selectedMethodId={selectedPayment?.id || null}
        onSelect={setSelectedPayment}
      />
    </div>
  );
}

export default function EatsCart() {
  return (
    <CartProvider>
      <EatsCartContent />
    </CartProvider>
  );
}
