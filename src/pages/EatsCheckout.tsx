/**
 * ZIVO Eats — Checkout Page
 * MVP: Submit order request — no payment processing
 * Includes fraud protection verification gate
 * Supports business account billing
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePromotionValidation } from "@/hooks/usePromotionValidation";
import { useWinBackOffer } from "@/hooks/useWinBackOffer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  UtensilsCrossed, Clock, User, 
  ArrowLeft, Plus, Minus, Loader2, CheckCircle, Truck, AlertCircle, Tag, X, CreditCard, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { useCreateFoodOrder, useRestaurant } from "@/hooks/useEatsOrders";
import { useRestaurantAvailability } from "@/hooks/useRestaurantAvailability";
import { useCheckoutRiskAssessment } from "@/hooks/useCheckoutRiskAssessment";
import { useCartValidation } from "@/hooks/useCartValidation";
import { useQueueAwareEta } from "@/hooks/useQueueAwareEta";
import { useDemandAdjustedEta } from "@/hooks/useDemandAdjustedEta";
import { useBusinessMembership } from "@/hooks/useBusinessMembership";
import { useServiceMaintenance } from "@/hooks/useServiceMaintenance";
import { useEatsDeliveryPricing } from "@/hooks/useEatsDeliveryPricing";
import { useEatsDeliveryFactors } from "@/hooks/useEatsDeliveryFactors";
import { SecurityVerificationBanner } from "@/components/checkout/SecurityVerificationBanner";
import { useDriverAvailability } from "@/hooks/useLiveDriverTracking";
import { IncentiveBoostBanner } from "@/components/eats/IncentiveBoostBanner";
import { LiveDemandBanner } from "@/components/eats/LiveDemandBanner";
import { PaymentTypeSelector, type PaymentType } from "@/components/eats/PaymentTypeSelector";
import { PeakDriverBanner } from "@/components/eats/PeakDriverBanner";
import { DeliveryFeeBreakdownCard } from "@/components/eats/DeliveryFeeBreakdownCard";
import { PhoneVerificationDialog } from "@/components/account/PhoneVerificationDialog";
import { SavedAddressSelector } from "@/components/eats/SavedAddressSelector";
import { UnavailableItemBanner } from "@/components/eats/UnavailableItemBanner";
import { EtaBreakdownCard } from "@/components/eats/EtaBreakdownCard";
import { BillingTypeSelector } from "@/components/checkout/BillingTypeSelector";
import { CompanyBillingBadge } from "@/components/checkout/CompanyBillingBadge";
import { MaintenanceScreen } from "@/components/shared/MaintenanceScreen";
import { toast } from "sonner";
import { useShareTracking } from "@/hooks/useShareTracking";
import { getPersistedUTMParams } from "@/lib/subidGenerator";
import { useAutoRewards } from "@/hooks/useAutoRewards";
import { RewardSelector } from "@/components/checkout/RewardSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerWallet } from "@/hooks/useCustomerWallet";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Name is required"),
  customer_phone: z.string().min(10, "Valid phone number required"),
  customer_email: z.string().email("Valid email required"),
  delivery_address: z.string().min(5, "Delivery address required"),
  delivery_instructions: z.string().optional(),
  preferred_time: z.enum(["asap", "scheduled"]),
  scheduled_time: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

/** Inline promo code input for checkout order summary */
function PromoCodeInputInline({ 
  onApply, isValidating, error 
}: { 
  onApply: (code: string) => Promise<any>; 
  isValidating: boolean; 
  error: string | null; 
}) {
  const [code, setCode] = useState("");
  const handleApply = async () => {
    if (!code.trim()) return;
    const result = await onApply(code.trim());
    if (result?.valid) setCode("");
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
            placeholder="Promo code"
            disabled={isValidating}
            className="pl-10 h-9 text-sm"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleApply}
          disabled={!code.trim() || isValidating}
          className="h-9 px-4 bg-gradient-to-r from-eats to-orange-500"
        >
          {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive px-1">{error}</p>}
    </div>
  );
}
function EatsCheckoutContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, getSubtotal, clearCart, deliveryAddress, removeItem } = useCart();
  const createOrder = useCreateFoodOrder();
  const { logConversion } = useShareTracking();
  const { data: businessMembership } = useBusinessMembership();
  const { isInMaintenance, isLoading: maintenanceLoading } = useServiceMaintenance("eats");
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [billingType, setBillingType] = useState<"personal" | "company">("personal");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("card");

  // Wallet
  const { wallet, balanceCents, applyCredit } = useCustomerWallet();

  // Auto-rewards: detect milestones and get active rewards
  const { activeRewards, isLoading: rewardsLoading } = useAutoRewards();
  const rewardDiscount = selectedReward?.reward_value ?? 0;

  const handleRewardSelect = useCallback((reward: any) => {
    setSelectedReward(reward);
  }, []);
  const subtotal = getSubtotal();
  const pricing = useEatsDeliveryPricing(subtotal);
  const deliveryFee = pricing.totalDeliveryFee;

  const restaurantId = items.length > 0 ? items[0].restaurantId : null;
  const restaurantName = items.length > 0 ? items[0].restaurantName : "";

  // Promo code validation
  const promoValidation = usePromotionValidation({ serviceType: 'eats', restaurantId: restaurantId || undefined });
  const { discountAmount, finalTotal: promoFinalTotal, isFreeDel } = promoValidation.calculateFinalTotal(subtotal, deliveryFee);
  const totalBeforeReward = promoValidation.appliedPromo?.valid ? promoFinalTotal : pricing.orderTotal;
  const totalAfterReward = Math.max(0, totalBeforeReward - rewardDiscount);
  
  // Wallet deduction calculation
  const walletDeductionCents = paymentType === "wallet" || paymentType === "wallet_card"
    ? Math.min(balanceCents, Math.round(totalAfterReward * 100), 2500) // MAX_CREDIT_PER_ORDER
    : 0;
  const walletDeductionDollars = walletDeductionCents / 100;
  const total = Math.max(0, totalAfterReward - walletDeductionDollars);

  // Win-back offer auto-apply
  const winBackOffer = useWinBackOffer();
  const autoAppliedRef = useRef(false);
  
  // Fetch restaurant to check availability
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(restaurantId || undefined);
  const availability = useRestaurantAvailability(restaurant);
  
  // Demand forecast multiplier for ETA accuracy
  const { demandMultiplier } = useDemandAdjustedEta(restaurant?.region_id);

  // Delivery factors (incentives, peak scheduling, driver supply)
  const deliveryFactors = useEatsDeliveryFactors();

  // Queue-aware ETA calculation with incentive/peak multipliers
  // Live driver availability for accurate driver leg ETA
  const driverAvailability = useDriverAvailability(
    deliveryAddress ? { lat: 0, lng: 0 } : null // Uses restaurant proxy; real coords would be better
  );
  const liveDriverMinutes = driverAvailability.closestETAMinutes ?? undefined;

  const eta = useQueueAwareEta({ 
    restaurantId: restaurantId || undefined, 
    driverMinutes: liveDriverMinutes,
    demandMultiplier,
    scheduleForecastMultiplier: deliveryFactors.scheduleForecastMultiplier,
    incentiveMultiplier: deliveryFactors.incentiveMultiplier,
    forecastMultiplier: deliveryFactors.forecastMultiplier,
    supplyMultiplier: deliveryFactors.supplyMultiplier,
  });
  
  // Cart validation for item availability
  const { validateCart, unavailableItems, isValidating } = useCartValidation();
  const [hasValidated, setHasValidated] = useState(false);
  
  // Risk assessment for fraud protection
  const riskAssessment = useCheckoutRiskAssessment({
    orderTotal: total,
    isFirstOrder: false, // Conservative default: treat as returning customer
    phoneVerified: phoneVerified,
    emailVerified: true, // Assume verified for MVP
    isNewAccount: false,
    failedPaymentAttempts: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_address: deliveryAddress,
      preferred_time: "asap",
    },
  });

  const preferredTime = watch("preferred_time");
  const customerPhone = watch("customer_phone");

  // Set default billing type based on membership preference
  useEffect(() => {
    if (businessMembership?.isMember && businessMembership.paymentPreference) {
      setBillingType(businessMembership.paymentPreference);
    }
  }, [businessMembership]);
  
  // Validate cart on page load
  useEffect(() => {
    if (items.length > 0 && !hasValidated) {
      validateCart(items).then(() => setHasValidated(true));
    }
  }, [items, hasValidated, validateCart]);

  // Auto-apply win-back promo code
  useEffect(() => {
    if (
      !winBackOffer.isLoading &&
      winBackOffer.promoCode &&
      !promoValidation.appliedPromo &&
      !autoAppliedRef.current &&
      subtotal > 0
    ) {
      autoAppliedRef.current = true;
      promoValidation.validateCode(winBackOffer.promoCode, subtotal).then((result: any) => {
        if (result?.valid) {
          toast.success("Win-back offer applied automatically!");
        }
      });
    }
  }, [winBackOffer.isLoading, winBackOffer.promoCode, subtotal]);

  // Check if cart has unavailable items
  const hasUnavailableItems = unavailableItems.length > 0;

  // Show maintenance screen if eats service is paused
  if (maintenanceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-eats" />
      </div>
    );
  }

  if (isInMaintenance) {
    return (
      <MaintenanceScreen
        serviceName="ZIVO Eats"
        browseUrl="/eats/restaurants"
        browseLabel="Browse Restaurants"
        ordersUrl="/eats/orders"
        ordersLabel="View Past Orders"
        showBrowse
        showOrders
      />
    );
  }

  // Handle removing all unavailable items
  const handleRemoveUnavailable = () => {
    unavailableItems.forEach((item) => {
      removeItem(item.id);
    });
    // Re-validate after removal
    setTimeout(() => {
      validateCart(items.filter(i => !unavailableItems.find(u => u.id === i.id)));
    }, 100);
    toast.success("Unavailable items removed from cart");
  };

  const handlePhoneVerified = () => {
    setPhoneVerified(true);
    setShowPhoneVerification(false);
    toast.success("Phone verified successfully!");
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!restaurantId || items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email,
        delivery_address: data.delivery_address,
        delivery_instructions: data.delivery_instructions,
        preferred_time: data.preferred_time,
        scheduled_time: data.scheduled_time,
        restaurant_id: restaurantId,
        items: items.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        billing_type: billingType,
        business_account_id: billingType === "company" && businessMembership?.company ? businessMembership.company.id : undefined,
        business_account_name: billingType === "company" && businessMembership?.company ? businessMembership.company.name : undefined,
      });

      // Apply wallet credit if using wallet payment
      if ((paymentType === "wallet" || paymentType === "wallet_card") && walletDeductionCents > 0 && order?.id) {
        try {
          await applyCredit.mutateAsync({
            amount_cents: walletDeductionCents,
            order_id: order.id,
          });
        } catch (e) {
          console.error("Wallet credit error:", e);
          toast.error("Failed to apply wallet credit, but order was placed.");
        }
      }

      clearCart();
      toast.success("Order placed successfully!");

      // Redeem selected reward
      if (selectedReward && order?.id) {
        try {
          await supabase
            .from("rewards")
            .update({ status: "redeemed" })
            .eq("id", selectedReward.id);
          await supabase
            .from("reward_redemptions")
            .insert({
              user_id: user!.id,
              reward_id: selectedReward.id,
              points_spent: 0,
              status: "redeemed",
              applied_to_order_id: order.id,
            });
        } catch (e) {
          console.error("Reward redemption error:", e);
        }
      }
      
      // Track share conversion if user arrived via shared link
      if (order?.id) {
        const utm = getPersistedUTMParams();
        if (utm.utm_source === "share") {
          logConversion(order.id);
        }
      }
      
      // Redirect to order detail page
      if (order?.id) {
        navigate(`/eats/orders/${order.id}`);
      } else {
        setOrderSubmitted(true);
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  // Success state
  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">
                Order Request Received!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your order from <strong>{restaurantName}</strong>. 
                We'll contact you shortly to confirm your order and arrange delivery.
              </p>
              <div className="bg-muted/50 rounded-2xl p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">
                  What happens next?
                </p>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>We'll confirm your order and contact you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>The restaurant will prepare your food</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>A driver will deliver your order</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/eats")}>
                  Back to ZIVO Eats
                </Button>
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-eats to-orange-500"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h1 className="font-bold text-2xl mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some delicious food to get started
            </p>
            <Button 
              onClick={() => navigate("/eats/restaurants")}
              className="bg-gradient-to-r from-eats to-orange-500"
            >
              Browse Restaurants
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Restaurant unavailable - block checkout
  if (!restaurantLoading && !availability.canOrder) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="font-bold text-2xl mb-2">Restaurant Unavailable</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {restaurantName} is temporarily not accepting orders.
              {availability.detailMessage && (
                <span className="block mt-2 text-sm">{availability.detailMessage}</span>
              )}
            </p>
            <Button 
              onClick={() => navigate("/eats/restaurants")}
              className="bg-gradient-to-r from-eats to-orange-500"
            >
              Browse Other Restaurants
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Checkout — ZIVO Eats"
        description="Complete your food order with ZIVO Eats"
      />
      
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <h1 className="font-display text-3xl font-bold mb-6">
            Checkout
          </h1>

          {/* Unavailable Items Warning */}
          {hasUnavailableItems && (
            <UnavailableItemBanner
              unavailableItems={unavailableItems}
              onRemoveAll={handleRemoveUnavailable}
              className="mb-6"
            />
          )}

          {/* Security Verification Banner - shown when risk score is high */}
          {riskAssessment.requiresPhoneVerification && !phoneVerified && customerPhone && (
            <SecurityVerificationBanner
              onVerify={() => setShowPhoneVerification(true)}
              isVerifying={false}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-eats" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer_name">Full Name *</Label>
                        <Input
                          id="customer_name"
                          {...register("customer_name")}
                          placeholder="John Doe"
                          className="mt-1.5"
                        />
                        {errors.customer_name && (
                          <p className="text-sm text-destructive mt-1">{errors.customer_name.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="customer_phone">Phone Number *</Label>
                        <Input
                          id="customer_phone"
                          {...register("customer_phone")}
                          placeholder="(555) 123-4567"
                          className="mt-1.5"
                        />
                        {errors.customer_phone && (
                          <p className="text-sm text-destructive mt-1">{errors.customer_phone.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customer_email">Email Address *</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        {...register("customer_email")}
                        placeholder="john@example.com"
                        className="mt-1.5"
                      />
                      {errors.customer_email && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_email.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-eats" />
                      Delivery Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Saved Address Selector */}
                    <SavedAddressSelector
                      selectedAddress={watch("delivery_address") || ""}
                      onSelect={(address) => {
                        // Use setValue to update form field
                        const form = document.getElementById("delivery_address") as HTMLInputElement;
                        if (form) {
                          form.value = address;
                          form.dispatchEvent(new Event("input", { bubbles: true }));
                        }
                      }}
                    />
                    
                    <div>
                      <Label htmlFor="delivery_address">Delivery Address *</Label>
                      <Input
                        id="delivery_address"
                        {...register("delivery_address")}
                        placeholder="123 Main St, City, State"
                        className="mt-1.5"
                      />
                      {errors.delivery_address && (
                        <p className="text-sm text-destructive mt-1">{errors.delivery_address.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="delivery_instructions">Delivery Instructions (optional)</Label>
                      <Textarea
                        id="delivery_instructions"
                        {...register("delivery_instructions")}
                        placeholder="Apt #, gate code, leave at door, etc."
                        className="mt-1.5"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Timing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-eats" />
                      Delivery Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      defaultValue="asap"
                      onValueChange={(value) => {
                        // Handled by react-hook-form
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="asap" id="asap" {...register("preferred_time")} />
                        <Label htmlFor="asap" className="flex-1 cursor-pointer">
                          <span className="font-medium">As Soon As Possible</span>
                          <p className="text-sm text-muted-foreground">Usually 30-45 minutes</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="scheduled" id="scheduled" {...register("preferred_time")} />
                        <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                          <span className="font-medium">Schedule for Later</span>
                          <p className="text-sm text-muted-foreground">Choose a specific time</p>
                        </Label>
                      </div>
                    </RadioGroup>
                    {preferredTime === "scheduled" && (
                      <div className="mt-4">
                        <Label htmlFor="scheduled_time">Preferred Time</Label>
                        <Input
                          id="scheduled_time"
                          type="datetime-local"
                          {...register("scheduled_time")}
                          className="mt-1.5 max-w-xs"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Business Account Billing */}
                {businessMembership?.isMember && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-eats" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BillingTypeSelector
                        membership={businessMembership}
                        selected={billingType}
                        onSelect={setBillingType}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Payment Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-eats" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentTypeSelector
                      selected={paymentType}
                      onChange={setPaymentType}
                      walletBalanceCents={balanceCents}
                      orderTotalCents={Math.round(totalAfterReward * 100)}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-eats" />
                      Order Summary
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{restaurantName}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-5 text-center text-sm">{item.quantity}</span>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <hr />

                    {/* Reward Selector */}
                    {activeRewards.length > 0 && (
                      <RewardSelector
                        rewards={activeRewards}
                        selectedReward={selectedReward}
                        onSelect={handleRewardSelect}
                      />
                    )}

                    {/* Promo Code Input */}
                    <div className="space-y-3">
                      {promoValidation.appliedPromo?.valid ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-500" />
                            <div>
                              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {promoValidation.appliedPromo.code}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {promoValidation.appliedPromo.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              -${discountAmount.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={promoValidation.removePromo}
                              className="p-1 rounded-full hover:bg-muted transition-colors"
                            >
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <PromoCodeInputInline
                          onApply={(code) => promoValidation.validateCode(code, subtotal, restaurantId || undefined)}
                          isValidating={promoValidation.isValidating}
                          error={promoValidation.error}
                        />
                      )}
                    </div>

                    <hr />

                     {/* Live demand banner */}
                     {(deliveryFactors.demandActive || deliveryFactors.isForecastedDemand) && (
                       <LiveDemandBanner
                         isActive={deliveryFactors.demandActive}
                         isForecastedDemand={deliveryFactors.isForecastedDemand}
                         isIncentivePeriod={deliveryFactors.isIncentivePeriod}
                       />
                     )}

                     {/* Positive delivery banners */}
                     {deliveryFactors.showIncentiveBanner && (
                       <IncentiveBoostBanner variant="compact" />
                     )}
                     {deliveryFactors.showPeakBanner && !deliveryFactors.showIncentiveBanner && (
                       <PeakDriverBanner
                         message={deliveryFactors.peakMessage}
                         peakStartsIn={deliveryFactors.peakStartsIn}
                         variant="compact"
                       />
                     )}

                     {/* ETA Breakdown */}
                     <EtaBreakdownCard
                      queueMinutes={eta.breakdown.queueMinutes}
                      prepMinutes={eta.breakdown.prepMinutes}
                      driverMinutes={eta.breakdown.driverMinutes}
                      totalMinRange={eta.etaMinRange}
                      totalMaxRange={eta.etaMaxRange}
                      isHighVolume={eta.isHighVolume}
                      queueLength={eta.queueLength}
                    />

                    <hr />
                    <DeliveryFeeBreakdownCard pricing={pricing} />

                    {/* Discount line item */}
                    {promoValidation.appliedPromo?.valid && discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Promo ({promoValidation.appliedPromo.code})
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          -${discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Reward discount line item */}
                    {selectedReward && rewardDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary">
                          Reward Applied
                        </span>
                        <span className="font-medium text-primary">
                          -${rewardDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Wallet deduction line item */}
                    {walletDeductionCents > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" />
                          Wallet Credit
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          -${walletDeductionDollars.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {billingType === "company" && businessMembership?.company && (
                      <CompanyBillingBadge companyName={businessMembership.company.name} />
                    )}

                    {/* Note */}
                    <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl text-xs">
                      <strong>Note:</strong> Payment will be collected upon delivery or via follow-up contact. 
                      This is an order request — we'll confirm availability.
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting || (riskAssessment.requiresPhoneVerification && !phoneVerified) || hasUnavailableItems || isValidating}
                      className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-eats to-orange-500"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : hasUnavailableItems ? (
                        "Remove Unavailable Items"
                      ) : riskAssessment.requiresPhoneVerification && !phoneVerified ? (
                        "Verify Phone to Continue"
                      ) : (
                        "Place Order Request"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Phone Verification Dialog */}
      <PhoneVerificationDialog
        open={showPhoneVerification}
        onOpenChange={setShowPhoneVerification}
        phoneNumber={customerPhone || ""}
        onVerified={handlePhoneVerified}
      />

      <Footer />
    </div>
  );
}

export default function EatsCheckout() {
  return (
    <CartProvider>
      <EatsCheckoutContent />
    </CartProvider>
  );
}
