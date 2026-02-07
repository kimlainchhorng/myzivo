/**
 * Ride Checkout Form
 * Embedded Stripe Elements payment form with "Secure Vault" aesthetic
 * Includes Apple Pay / Google Pay support via Payment Request Button
 * Also includes native Apple Pay button for iOS (Capacitor)
 */
import { useState, useEffect } from "react";
import {
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Lock, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Apple Pay icon SVG
const ApplePayIcon = () => (
  <svg viewBox="0 0 165.5 105.4" className="h-6 w-auto">
    <path fill="currentColor" d="M150.7 0H14.8C6.6 0 0 6.6 0 14.8v75.8c0 8.2 6.6 14.8 14.8 14.8h135.9c8.2 0 14.8-6.6 14.8-14.8V14.8c0-8.2-6.6-14.8-14.8-14.8zM34.1 41.8c1.5-1.9 2.5-4.4 2.2-7-.1-.1-.2-.1-.2-.1-2.3.1-5.1 1.5-6.7 3.5-1.4 1.7-2.7 4.4-2.4 7 2.6.2 5.2-1.4 7.1-3.4zm17.5 31.7c-.1 0-.1 0 0 0-3.1-.1-5.8-1.8-7.3-1.8-1.5 0-3.9 1.7-6.4 1.7h-.1c-4.8-.1-9.2-4.1-9.2-11.3 0-6.6 4.3-10.6 8.6-10.6h.1c1.9.1 4.2 1.2 5.5 1.2 1.2 0 3.4-1.4 6.2-1.4h.1c3.2.1 6.2 1.5 7.9 4-3.2 2-5.4 5.3-5.4 9.4 0 4.5 2.6 8 6.5 9.5-.9 2.2-2.4 5.6-4.9 8.7-2.2 2.8-4.5 5.6-8.1 5.6h-.1c-2-.1-3.4-1-5.2-1.5-1.7.5-3.3 1.5-5.3 1.5h-.1c-4.3-.1-7.5-4.9-10.7-10.1-3.5-5.7-6.3-14.3-6.3-22.4 0-13.2 8.6-20.2 17-20.2h.1c3.4.1 6.2 1.6 8.3 1.6 2 0 5-1.7 8.9-1.7h.1c1.4 0 6.5.1 9.9 4.9-2.5 1.7-5.9 5-5.9 10.4 0 6.2 4 10 6 11.4-1.6 4.7-3.9 9-6.2 12.1zm40.7-1.1h-5.4l-9.5-29.9h5l7.2 24.1 7.2-24.1h4.9l-9.4 29.9zm23.4.3c-5.7 0-9.4-3.3-9.4-8.4V55h5v8.9c0 3 1.8 4.9 4.7 4.9 2.9 0 4.7-1.9 4.7-4.9V55h5v8.9c0 5.1-3.7 8.4-10 8.4zm30.3-.3h-5v-3c-1.3 2.1-3.5 3.4-6.4 3.4-4.5 0-8.1-3.5-8.1-8.4s3.6-8.4 8.1-8.4c2.9 0 5.1 1.3 6.4 3.4v-3h5v16zm-5-8c0-2.6-1.9-4.4-4.5-4.4s-4.5 1.8-4.5 4.4 1.9 4.4 4.5 4.4 4.5-1.8 4.5-4.4z"/>
  </svg>
);

// Google Pay icon SVG  
const GooglePayIcon = () => (
  <svg viewBox="0 0 41 17" className="h-5 w-auto">
    <path fill="#5F6368" d="M19.5 8.4v4.9h-1.6V1.7h4.2c1 0 1.9.4 2.6 1 .7.6 1.1 1.5 1.1 2.5s-.4 1.9-1.1 2.5c-.7.7-1.6 1-2.6 1h-2.6v-.3zm0-5.3v4h2.7c.6 0 1.2-.2 1.6-.6.4-.4.7-.9.7-1.4 0-.5-.2-1-.6-1.4-.4-.4-1-.6-1.6-.6h-2.8z"/>
    <path fill="#5F6368" d="M28.3 5.2c1.2 0 2.1.3 2.8 1 .7.6 1 1.5 1 2.6v5.4h-1.5v-1.2c-.5.9-1.4 1.4-2.6 1.4-.9 0-1.7-.3-2.3-.8-.6-.5-.9-1.1-.9-1.9 0-.8.3-1.5.9-2 .6-.5 1.4-.7 2.5-.7.9 0 1.6.2 2.2.5v-.4c0-.5-.2-1-.6-1.3-.4-.3-.9-.5-1.5-.5-.9 0-1.6.4-2 1.1l-1.3-.8c.6-1 1.7-1.4 3.3-1.4zm-1.9 6.3c0 .4.2.7.5.9.3.2.7.3 1.1.3.6 0 1.2-.2 1.7-.7.5-.5.7-1 .7-1.6-.5-.4-1.1-.5-2-.5-.6 0-1.1.1-1.5.4-.3.3-.5.7-.5 1.2z"/>
    <path fill="#5F6368" d="M41 5.4l-4.9 11.3h-1.6l1.8-4L33 5.4h1.7l2.5 5.8 2.4-5.8H41z"/>
    <path fill="#4285F4" d="M13.2 7.3c0-.5 0-.9-.1-1.4H6.8v2.7h3.6c-.2.9-.7 1.6-1.4 2.1v1.7h2.3c1.3-1.2 2-3 2-5.1z"/>
    <path fill="#34A853" d="M6.8 14c1.9 0 3.5-.6 4.7-1.7l-2.3-1.7c-.6.4-1.4.7-2.4.7-1.8 0-3.4-1.2-4-2.9H.5v1.8C1.7 12.5 4 14 6.8 14z"/>
    <path fill="#FBBC04" d="M2.8 8.4c-.1-.4-.2-.8-.2-1.3s.1-.9.2-1.3V4H.5C.2 4.7 0 5.5 0 6.4s.2 1.7.5 2.4l2.3-1.8z"/>
    <path fill="#EA4335" d="M6.8 2.4c1 0 1.9.4 2.7 1.1l2-2C10.2.6 8.6 0 6.8 0 4 0 1.7 1.5.5 3.8l2.3 1.8c.6-1.7 2.2-2.8 4-2.8z"/>
  </svg>
);

interface RideCheckoutFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  pickupAddress: string;
  dropoffAddress: string;
  rideName: string;
}

export default function RideCheckoutForm({
  amount,
  onSuccess,
  onCancel,
  pickupAddress,
  dropoffAddress,
  rideName,
}: RideCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "web">("web");

  // Detect platform for native wallet buttons
  useEffect(() => {
    const currentPlatform = Capacitor.getPlatform();
    if (currentPlatform === "ios") {
      setPlatform("ios");
    } else if (currentPlatform === "android") {
      setPlatform("android");
    } else {
      setPlatform("web");
    }
  }, []);

  // Set up Apple Pay / Google Pay via Stripe Payment Request
  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: `ZIVO Ride - ${rideName}`,
        amount: Math.round(amount * 100), // cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if Apple Pay or Google Pay is available
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    // Handle payment method from Apple Pay / Google Pay
    pr.on("paymentmethod", async (ev) => {
      if (!elements) {
        ev.complete("fail");
        return;
      }

      setIsProcessing(true);
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method: ev.paymentMethod.id,
          return_url: `${window.location.origin}/rides/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        ev.complete("fail");
        setErrorMessage(error.message || "Payment failed");
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        ev.complete("success");
        toast.success("Payment successful!");
        onSuccess(paymentIntent.id);
      } else {
        ev.complete("fail");
        setIsProcessing(false);
      }
    });
  }, [stripe, elements, amount, rideName, onSuccess]);

  // Handle native Apple Pay tap (triggers Stripe's Payment Request)
  const handleNativeApplePay = () => {
    if (paymentRequest) {
      paymentRequest.show();
    } else {
      toast.error("Apple Pay is not available on this device");
    }
  };

  // Handle native Google Pay tap
  const handleNativeGooglePay = () => {
    if (paymentRequest) {
      paymentRequest.show();
    } else {
      toast.error("Google Pay is not available on this device");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/rides/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message || "Payment failed");
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("Payment failed. Please try again.");
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary - Receipt Rail */}
      <div className="rides-glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-lg">Order Summary</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Ride</span>
            <span className="font-medium">{rideName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">From</span>
            <span className="font-medium truncate max-w-[180px]">{pickupAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">To</span>
            <span className="font-medium truncate max-w-[180px]">{dropoffAddress}</span>
          </div>
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 font-medium">Total</span>
              <span className="text-2xl font-bold text-primary">${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Vault Payment Form */}
      <div className="rides-glass-panel rounded-2xl p-5 border border-primary/20 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90">
        {/* Security Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold">Secure Payment</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">TLS 1.3 Encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase">PCI Compliant</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Native Apple Pay Button (iOS) */}
          {platform === "ios" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleNativeApplePay}
                disabled={isProcessing}
                className="w-full h-14 bg-black hover:bg-zinc-900 text-white rounded-xl font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-50 border border-white/10"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ApplePayIcon />
                    <span>Pay ${amount.toFixed(2)}</span>
                  </>
                )}
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-zinc-900 text-muted-foreground">or pay with card</span>
                </div>
              </div>
            </div>
          )}

          {/* Native Google Pay Button (Android) */}
          {platform === "android" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleNativeGooglePay}
                disabled={isProcessing}
                className="w-full h-14 bg-white hover:bg-zinc-100 text-black rounded-xl font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-50 border border-zinc-300"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <>
                    <GooglePayIcon />
                    <span>Pay ${amount.toFixed(2)}</span>
                  </>
                )}
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-zinc-900 text-muted-foreground">or pay with card</span>
                </div>
              </div>
            </div>
          )}

          {/* Web: Stripe Payment Request Button (shows Apple Pay/Google Pay when available) */}
          {platform === "web" && canMakePayment && paymentRequest && (
            <div className="space-y-3">
              <PaymentRequestButtonElement
                options={{
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      type: "default",
                      theme: "dark",
                      height: "48px",
                    },
                  },
                }}
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-zinc-900 text-muted-foreground">or pay with card</span>
                </div>
              </div>
            </div>
          )}

          {/* Stripe Payment Element */}
          <div className="rounded-xl overflow-hidden">
            <PaymentElement 
              options={{
                layout: "tabs",
                defaultValues: {
                  billingDetails: {
                    name: "",
                  }
                },
              }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="w-full h-14 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Pay ${amount.toFixed(2)}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isProcessing}
              className="text-zinc-400 hover:text-white hover:bg-white/10"
            >
              ← Cancel
            </Button>
          </div>
        </form>

        {/* Trust Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            256-bit SSL
          </span>
          <span>•</span>
          <span>Powered by Stripe</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Secure Vault
          </span>
        </div>
      </div>
    </div>
  );
}
