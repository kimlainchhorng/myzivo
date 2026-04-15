/**
 * CoinRechargeSheet — Bottom sheet for purchasing Z Coins (simulated demo)
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";
import { coinPackages, type CoinPackage } from "@/config/coinPackages";

interface CoinRechargeSheetProps {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  onPurchase: (coins: number) => void;
}

export default function CoinRechargeSheet({ open, onClose, currentBalance, onPurchase }: CoinRechargeSheetProps) {
  const [selected, setSelected] = useState<CoinPackage | null>(null);
  const [step, setStep] = useState<"select" | "confirm" | "processing" | "success">("select");

  const handleSelect = useCallback((pkg: CoinPackage) => {
    setSelected(pkg);
    setStep("confirm");
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    setStep("processing");
    // Simulate payment processing
    setTimeout(() => {
      const totalCoins = selected.coins + (selected.bonus || 0);
      onPurchase(totalCoins);
      setStep("success");
      // Auto-close after success
      setTimeout(() => {
        setStep("select");
        setSelected(null);
        onClose();
        toast.success(`${totalCoins.toLocaleString()} Z Coins added!`, {
          description: "Your balance has been updated.",
        });
      }, 1800);
    }, 1500);
  }, [selected, onPurchase, onClose]);

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
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-400 animate-spin mb-6" />
                <h3 className="text-white font-bold text-lg mb-1">Processing Payment</h3>
                <p className="text-white/40 text-sm">Please wait...</p>
              </div>
            )}

            {step === "success" && selected && (
              <div className="px-6 pb-12 flex flex-col items-center justify-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border-2 border-green-400/40"
                >
                  <Check className="w-10 h-10 text-green-400" />
                </motion.div>
                <h3 className="text-white font-bold text-lg mb-1">Purchase Successful!</h3>
                <div className="flex items-center gap-2 mt-2">
                  <img src={goldCoinIcon} alt="" className="w-6 h-6" />
                  <span className="text-amber-300 font-bold text-2xl">
                    +{(selected.coins + (selected.bonus || 0)).toLocaleString()}
                  </span>
                </div>
                <p className="text-white/40 text-xs mt-2">Coins added to your balance</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
