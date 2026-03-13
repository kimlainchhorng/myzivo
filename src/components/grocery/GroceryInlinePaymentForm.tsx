import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Loader2, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe";
import { toast } from "sonner";

const stripePromise = getStripe();

interface GroceryInlinePaymentFormProps {
  clientSecret: string;
  totalCents: number;
  onCancel: () => void;
  onSuccess: (paymentIntentId: string) => Promise<void> | void;
}

function InnerPaymentForm({ totalCents, onCancel, onSuccess }: Omit<GroceryInlinePaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || "Please check your card details");
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      if (!paymentIntent?.id || !["succeeded", "processing", "requires_capture"].includes(paymentIntent.status)) {
        throw new Error("Unexpected payment status");
      }

      await onSuccess(paymentIntent.id);
    } catch (err: any) {
      toast.error(err?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-2xl bg-card border border-border/20 p-3.5">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card"],
            wallets: { applePay: "never", googlePay: "never" },
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>Secured by Stripe · TLS 1.3 encrypted</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl font-semibold"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="h-11 rounded-xl font-bold gap-2"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Pay ${(totalCents / 100).toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function GroceryInlinePaymentForm({ clientSecret, totalCents, onCancel, onSuccess }: GroceryInlinePaymentFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "hsl(var(--primary))",
            borderRadius: "12px",
          },
        },
      }}
    >
      <InnerPaymentForm totalCents={totalCents} onCancel={onCancel} onSuccess={onSuccess} />
    </Elements>
  );
}
