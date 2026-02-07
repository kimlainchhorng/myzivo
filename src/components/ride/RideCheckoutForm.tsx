/**
 * Ride Checkout Form
 * Embedded Stripe Elements payment form with "Secure Vault" aesthetic
 */
import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Lock, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
