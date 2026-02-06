import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Send, Clock, CreditCard, Wallet, Banknote, Check, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { RideOption } from "@/components/ride/RideCard";
import RideBottomNav from "@/components/ride/RideBottomNav";
import { TripDetails, calculateRidePrice } from "@/lib/tripCalculator";

interface LocationState {
  ride: RideOption;
  pickup: string;
  destination: string;
  tripDetails?: TripDetails;
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

  const { ride, pickup, destination, tripDetails } = state;

  // Calculate dynamic price
  const displayPrice = tripDetails
    ? calculateRidePrice(ride.id, tripDetails.distance, tripDetails.duration)
    : ride.price;

  const handleConfirm = () => {
    // Save trip to localStorage for persistence
    const tripState = {
      ride: { ...ride, price: displayPrice },
      pickup,
      destination,
      paymentMethod: selectedPayment,
      tripDetails,
    };
    try {
      localStorage.setItem("zivo_active_ride", JSON.stringify({ ...tripState, startedAt: Date.now() }));
    } catch {}
    
    navigate("/ride/searching", {
      state: tripState,
    });
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

            {/* Trip Estimate */}
            {tripDetails && (
              <>
                <div className="h-px bg-white/10 my-3" />
                <div className="flex items-center justify-center gap-2 py-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-white/80">
                    {tripDetails.distance} miles • {tripDetails.duration} min
                  </span>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="h-px bg-white/10 my-3" />

            {/* Price & ETA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{ride.eta} min away</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                ${displayPrice.toFixed(2)}
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
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all bg-primary text-primary-foreground hover:bg-primary/90"
        >
          PAY ${displayPrice.toFixed(2)} & REQUEST
        </motion.button>
      </div>

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RideConfirmPage;
