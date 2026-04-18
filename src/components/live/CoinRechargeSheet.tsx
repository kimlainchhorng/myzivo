import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { X, ShieldCheck, Sparkles, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";
import { coinPackages, type CoinPackage } from "@/config/coinPackages";
import { supabase } from "@/integrations/supabase/client";
import { getStripe } from "@/lib/stripe";
import { useAuth } from "@/contexts/AuthContext";

interface CoinRechargeSheetProps {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  onPurchase?: (coins: number) => Promise<void> | void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "rgba(255,255,255,0.92)",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": { color: "rgba(255,255,255,0.35)" },
      iconColor: "rgba(255,255,255,0.72)",
    },
    invalid: { color: "#ef4444" },
  },
  hidePostalCode: false,
};

function CoinRechargeSheetInner({ open, onClose, currentBalance }: CoinRechargeSheetProps) {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selected, setSelected] = useState<CoinPackage | null>(null);
  const [step, setStep] = useState<"select" | "confirm" | "processing">("select");

  const handleSelect = useCallback((pkg: CoinPackage) => {
    setSelected(pkg);
    setStep("confirm");
  }, []);

  const handleClose = useCallback(() => {
    if (step === "processing") return;
    setStep("select");
    setSelected(null);
    onClose();
  }, [step, onClose]);

  const handleConfirm = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to buy coins");
      return;
    }
    if (!selected) return;
    if (!stripe || !elements) {
      toast.error("Payment form is still loading");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card form not ready");
      return;
    }

    setStep("processing");
    try {
      const { data, error } = await supabase.functions.invoke("create-coin-payment-intent", {
        body: { package_id: selected.id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Failed to start payment");
      if (!data?.client_secret) throw new Error("No payment secret returned");

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: cardElement },
      });
      if (confirmError) throw new Error(confirmError.message || "Payment failed");
      if (!paymentIntent?.id) throw new Error("Payment confirmation failed");

      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-coin-purchase", {
        body: { payment_intent_id: paymentIntent.id },
      });
      if (verifyError) throw new Error(verifyError.message);
      if (verifyData?.error) throw new Error(verifyData.error);
      if (!verifyData?.credited) throw new Error("Payment received, but coins are still processing");

      queryClient.invalidateQueries();
      toast.success("Coins added", {
        description: `+${(verifyData.coins ?? (selected.coins + (selected.bonus || 0))).toLocaleString()} Z Coins`,
      });
      handleClose();
    } catch (e: any) {
      setStep("confirm");
      toast.error("Couldn't complete payment", { description: e?.message ?? "Please try again." });
    }
  }, [user, selected, stripe, elements, queryClient, handleClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[201] bg-gradient-to-b from-gray-900 to-black rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {step === "select" && (
              <div className="px-4 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src={goldCoinIcon} alt="" className="w-6 h-6" />
                    <div>
                      <h3 className="text-white font-bold text-base">Get Z Coins</h3>
                      <p className="text-white/40 text-[10px]">Balance: {currentBalance.toLocaleString()} coins</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {coinPackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleSelect(pkg)}
                      className={`relative rounded-2xl border p-3 text-left transition-all active:scale-[0.97] ${
                        pkg.popular
                          ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      {pkg.badge && (
                        <span className={`absolute -top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          pkg.popular
                            ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black"
                            : "bg-white/15 text-white/70"
                        }`}>
                          {pkg.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <img src={goldCoinIcon} alt="" className="w-5 h-5" />
                        <span className="text-amber-300 font-bold text-lg">{pkg.coins.toLocaleString()}</span>
                      </div>
                      {pkg.bonus ? (
                        <p className="text-green-400 text-[10px] font-semibold mb-1.5">
                          +{pkg.bonus.toLocaleString()} bonus
                        </p>
                      ) : (
                        <p className="text-white/30 text-[10px] mb-1.5">&nbsp;</p>
                      )}
                      <div className="bg-white/10 rounded-xl py-1.5 text-center">
                        <span className="text-white font-bold text-sm">${pkg.price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 text-white/30">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[9px]">Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[9px]">Instant delivery</span>
                  </div>
                </div>
              </div>
            )}

            {step === "confirm" && selected && (
              <div className="px-6 pb-8 flex flex-col items-center">
                <h3 className="text-white font-bold text-lg mb-6">Pay in Live</h3>

                <div className="w-full bg-white/5 rounded-2xl p-5 border border-white/10 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-sm">Coins</span>
                    <div className="flex items-center gap-1.5">
                      <img src={goldCoinIcon} alt="" className="w-4 h-4" />
                      <span className="text-amber-300 font-bold">{selected.coins.toLocaleString()}</span>
                    </div>
                  </div>
                  {selected.bonus && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/50 text-sm">Bonus</span>
                      <span className="text-green-400 font-bold">+{selected.bonus.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                    <span className="text-white/50 text-sm">Total Coins</span>
                    <span className="text-white font-bold text-lg">
                      {(selected.coins + (selected.bonus || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-white/70" />
                    <span className="text-sm font-semibold text-white">Card Details</span>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3 bg-white/5">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-[10px] text-white/45">
                    <ShieldCheck className="w-3 h-3" />
                    Your payment stays inside live and is processed by Stripe.
                  </div>
                </div>

                <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 flex items-center justify-between">
                  <span className="text-white/60 text-sm">Amount</span>
                  <span className="text-white font-bold text-xl">${selected.price.toFixed(2)}</span>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { setStep("select"); setSelected(null); }}
                    className="flex-1 py-3 rounded-2xl bg-white/10 text-white/60 font-semibold text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!stripe}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-transform disabled:opacity-60"
                  >
                    Pay ${selected.price.toFixed(2)}
                  </button>
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="px-6 pb-12 flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-6" />
                <h3 className="text-white font-bold text-lg mb-1">Processing payment…</h3>
                <p className="text-white/40 text-sm text-center">Stay here — we’ll add your coins right inside the live.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CoinRechargeSheet(props: CoinRechargeSheetProps) {
  return (
    <Elements stripe={getStripe()}>
      <CoinRechargeSheetInner {...props} />
    </Elements>
  );
}
