/**
 * Ride Embedded Checkout Wrapper
 * Wraps the checkout form with Stripe Elements provider
 */
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import RideCheckoutForm from "./RideCheckoutForm";
import { Loader2 } from "lucide-react";

interface RideEmbeddedCheckoutProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  pickupAddress: string;
  dropoffAddress: string;
  rideName: string;
}

export default function RideEmbeddedCheckout({
  clientSecret,
  amount,
  onSuccess,
  onCancel,
  pickupAddress,
  dropoffAddress,
  rideName,
}: RideEmbeddedCheckoutProps) {
  const stripePromise = getStripe();

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#c084fc",
            colorBackground: "#18181b",
            colorText: "#ffffff",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              backgroundColor: "#27272a",
              border: "1px solid #3f3f46",
              boxShadow: "none",
              padding: "12px 16px",
            },
            ".Input:focus": {
              border: "1px solid #c084fc",
              boxShadow: "0 0 0 2px rgba(192, 132, 252, 0.2)",
            },
            ".Input::placeholder": {
              color: "#71717a",
            },
            ".Label": {
              color: "#a1a1aa",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            },
            ".Tab": {
              backgroundColor: "#27272a",
              border: "1px solid #3f3f46",
              color: "#a1a1aa",
            },
            ".Tab:hover": {
              backgroundColor: "#3f3f46",
              color: "#ffffff",
            },
            ".Tab--selected": {
              backgroundColor: "#c084fc",
              border: "1px solid #c084fc",
              color: "#ffffff",
            },
            ".TabIcon--selected": {
              fill: "#ffffff",
            },
            ".Error": {
              color: "#ef4444",
              fontSize: "12px",
            },
          },
        },
      }}
    >
      <RideCheckoutForm
        amount={amount}
        onSuccess={onSuccess}
        onCancel={onCancel}
        pickupAddress={pickupAddress}
        dropoffAddress={dropoffAddress}
        rideName={rideName}
      />
    </Elements>
  );
}
