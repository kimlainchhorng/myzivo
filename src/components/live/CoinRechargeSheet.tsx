/**
 * CoinRechargeSheet — Real Stripe-powered Z Coin top-up sheet.
 * Redirects the user to Stripe Checkout; coins are credited on the success page.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";
import { coinPackages, type CoinPackage } from "@/config/coinPackages";
import { supabase } from "@/integrations/supabase/client";

interface CoinRechargeSheetProps {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  /** Optional legacy hook — no longer used for the real Stripe flow. */
  onPurchase?: (coins: number) => Promise<void> | void;
}

export default function CoinRechargeSheet({ open, onClose, currentBalance }: CoinRechargeSheetProps) {
  const [selected, setSelected] = useState<CoinPackage | null>(null);
  const [step, setStep] = useState<"select" | "confirm" | "processing">("select");

  const handleSelect = useCallback((pkg: CoinPackage) => {
    setSelected(pkg);
    setStep("confirm");
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selected) return;
    setStep("processing");
    try {
      // Capture where to send the user back after payment.
      // If they're inside a live stream, return them to that exact stream.
      const returnTo = window.location.pathname + window.location.search;
      const { data, error } = await supabase.functions.invoke("create-coin-checkout", {
        body: { package_id: selected.id, return_to: returnTo },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (e: any) {
      setStep("confirm");
      toast.error("Couldn't start checkout", { description: e?.message ?? "Please try again." });
    }
  }, [selected]);

  const handleClose = useCallback(() => {
    if (step === "processing") return; // prevent close during processing
    setStep("select");
    setSelected(null);
    onClose();
  }, [step, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[201] bg-gradient-to-b from-gray-900 to-black rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {step === "select" && (
              <div className="px-4 pb-6">
                {/* Header */}
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

                {/* Packages grid */}
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

                {/* Trust badges */}
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
                <h3 className="text-white font-bold text-lg mb-6">Confirm Purchase</h3>

                <div className="w-full bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
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
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-transform"
                  >
                    Pay ${selected.price.toFixed(2)}
                  </button>
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="px-6 pb-12 flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-6" />
                <h3 className="text-white font-bold text-lg mb-1">Redirecting to checkout…</h3>
                <p className="text-white/40 text-sm text-center">Opening Stripe — your coins will land in your wallet right after payment.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
