/**
 * Stripe Payment Sheet
 * Embedded Stripe Elements for card payment
 */
import { useState } from "react";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface StripePaymentFormProps {
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

function StripePaymentForm({
  total,
  onSuccess,
  onError,
  onCancel,
}: StripePaymentFormProps) {
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
          return_url: `${window.location.origin}/eats/orders`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // 3D Secure or other action required - Stripe handles this
        console.log("Payment requires additional action");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
        <PaymentElement
          options={{
            layout: "accordion",
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </motion.div>
      )}

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
          <Lock className="w-3 h-3" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
          <ShieldCheck className="w-3 h-3" />
          <span>PCI Compliant</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 h-12 rounded-xl border-zinc-700 bg-zinc-800 text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `Pay $${total.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

interface StripePaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string;
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function StripePaymentSheet({
  open,
  onOpenChange,
  clientSecret,
  total,
  onSuccess,
  onError,
}: StripePaymentSheetProps) {
  const stripePromise = getStripe();

  const elementsOptions = {
    clientSecret,
    appearance: {
      theme: "night" as const,
      variables: {
        colorPrimary: "#f97316",
        colorBackground: "#27272a",
        colorText: "#ffffff",
        colorDanger: "#ef4444",
        fontFamily: "Inter, system-ui, sans-serif",
        borderRadius: "12px",
        spacingUnit: "4px",
      },
      rules: {
        ".Input": {
          backgroundColor: "#18181b",
          border: "1px solid rgba(255,255,255,0.1)",
        },
        ".Input:focus": {
          borderColor: "#f97316",
          boxShadow: "0 0 0 1px #f97316",
        },
        ".Label": {
          color: "#a1a1aa",
        },
      },
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        {clientSecret && (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <StripePaymentForm
              total={total}
              onSuccess={(piId) => {
                onSuccess(piId);
                onOpenChange(false);
              }}
              onError={onError}
              onCancel={() => onOpenChange(false)}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
