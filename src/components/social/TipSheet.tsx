/**
 * TipSheet — In-app Stripe-powered tip with embedded card form
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Heart, Sparkles, Send, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";

interface TipSheetProps {
  open: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string | null;
}

const TIP_AMOUNTS = [100, 200, 500, 1000, 2500, 5000];

/* ── Inner form (needs Stripe context) ── */
function TipForm({ creatorId, creatorName, onClose }: { creatorId: string; creatorName: string; onClose: () => void }) {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [selectedAmount, setSelectedAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [step, setStep] = useState<"amount" | "pay">("amount");

  const finalAmount = showCustom ? Math.round(parseFloat(customAmount || "0") * 100) : selectedAmount;

  const handleContinue = () => {
    if (finalAmount < 100) {
      toast.error("Minimum tip is $1.00");
      return;
    }
    setStep("pay");
  };

  const handlePay = async () => {
    if (!user || !stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setSending(true);
    try {
      // 1. Create PaymentIntent via edge function
      const { data, error } = await supabase.functions.invoke("create-tip-payment-intent", {
        body: {
          creator_id: creatorId,
          amount_cents: finalAmount,
          message: message || null,
          is_anonymous: isAnonymous,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // 2. Confirm payment in-app
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card },
      });

      if (stripeError) {
        toast.error(stripeError.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        toast.success(`Sent $${(finalAmount / 100).toFixed(2)} tip to ${creatorName}! 🎉`);
        onClose();
      } else {
        toast.error("Payment not completed");
      }
    } catch (err: any) {
      console.error("[TipSheet] Pay error:", err);
      toast.error(err?.message || "Payment failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Send a Tip</h3>
            <p className="text-xs text-muted-foreground">to {creatorName}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50">
          <X className="h-5 w-5" />
        </button>
      </div>

      {step === "amount" ? (
        <>
          {/* Amount Grid */}
          {!showCustom ? (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {TIP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                    selectedAmount === amt
                      ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                  }`}
                >
                  ${(amt / 100).toFixed(0)}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border/40 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
            </div>
          )}

          <button onClick={() => setShowCustom(!showCustom)} className="text-xs text-primary font-medium mb-4">
            {showCustom ? "← Choose preset amount" : "Enter custom amount →"}
          </button>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message (optional)"
            rows={2}
            maxLength={200}
            className="w-full p-3 rounded-xl bg-muted/30 border border-border/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
          />

          <label className="flex items-center gap-2 mb-5 cursor-pointer">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded border-border" />
            <span className="text-sm text-muted-foreground">Send anonymously</span>
          </label>

          <button
            onClick={handleContinue}
            disabled={finalAmount < 100}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
          >
            <CreditCard className="h-4 w-4" />
            Continue · ${(finalAmount / 100).toFixed(2)}
          </button>
        </>
      ) : (
        <>
          {/* Card step */}
          <div className="mb-2 text-sm text-muted-foreground flex items-center gap-1.5">
            <button onClick={() => setStep("amount")} className="text-primary text-xs font-medium">← Back</button>
            <span className="ml-auto font-semibold text-foreground">${(finalAmount / 100).toFixed(2)}</span>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-muted/20 mb-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#1a1a1a",
                    "::placeholder": { color: "#9ca3af" },
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>

          <button
            onClick={handlePay}
            disabled={sending || !stripe}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {sending ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Pay ${(finalAmount / 100).toFixed(2)}
              </>
            )}
          </button>
        </>
      )}

      <p className="text-[10px] text-muted-foreground text-center mt-3">
        Powered by Stripe · Secure payment
      </p>
    </div>
  );
}

/* ── Outer wrapper with Elements provider ── */
export default function TipSheet({ open, onClose, creatorId, creatorName, creatorAvatar }: TipSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-background rounded-t-3xl pb-8"
          >
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <Elements stripe={getStripe()}>
              <TipForm creatorId={creatorId} creatorName={creatorName} onClose={onClose} />
            </Elements>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
