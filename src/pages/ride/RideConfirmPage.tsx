import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Send, Clock, CreditCard, Wallet, Banknote, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RideOption } from "@/components/ride/RideCard";
import RideBottomNav from "@/components/ride/RideBottomNav";
import { toast } from "sonner";

interface LocationState {
  ride: RideOption;
  pickup: string;
  destination: string;
}

type PaymentMethod = "card" | "apple" | "cash";

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard; sublabel: string }[] = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, sublabel: "Visa •••• 4242" },
  { id: "apple", label: "Apple Pay", icon: Wallet, sublabel: "Fastest checkout" },
  { id: "cash", label: "Cash", icon: Banknote, sublabel: "Pay driver directly" },
];

const RideConfirmPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("card");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle missing state
  if (!state?.ride) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white/60 mb-4">No ride selected.</p>
          <button
            onClick={() => navigate("/ride")}
            className="px-6 py-3 bg-primary rounded-full text-sm font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { ride, pickup, destination } = state;

  const handleConfirm = () => {
    setIsLoading(true);

    // Simulate finding driver
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      toast.success("Driver found! Your ride is on the way.", {
        duration: 4000,
      });

      // Navigate back after delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-4 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Confirm Ride</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Trip Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* Ride Image */}
          <div className="relative h-32">
            <img
              src={ride.image}
              alt={ride.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="font-bold text-lg">{ride.name}</h3>
              <p className="text-sm text-white/60">{ride.subtitle}</p>
            </div>
          </div>

          {/* Location Details */}
          <div className="p-4 space-y-3">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/50">Pickup</p>
                <p className="text-sm text-white/90">{pickup || "Not specified"}</p>
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/50">Destination</p>
                <p className="text-sm text-white/90">{destination || "Not specified"}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 my-3" />

            {/* Price & ETA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{ride.eta} min away</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                ${ride.price.toFixed(2)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold mb-3">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPayment === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-primary/20" : "bg-white/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isSelected ? "text-primary" : "text-white/60"
                    )} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{method.label}</p>
                    <p className="text-xs text-white/50">{method.sublabel}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Confirm Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={isLoading || showSuccess}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-sm transition-all",
            isLoading || showSuccess
              ? "bg-white/20 text-white/50"
              : "bg-primary text-white hover:bg-primary/90"
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Finding driver...
            </span>
          ) : showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Driver Found!
            </span>
          ) : (
            "CONFIRM RIDE"
          )}
        </motion.button>
      </div>

      {/* Loading Modal */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl p-8 text-center max-w-xs w-full"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-bold mb-2">Finding your driver</h3>
              <p className="text-sm text-white/60">
                Please wait while we connect you with a nearby driver...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RideConfirmPage;
