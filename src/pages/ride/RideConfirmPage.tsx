import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Send, Clock, CreditCard, Wallet, Banknote, Check, Navigation, AlertCircle, RefreshCw, WifiOff, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RideOption } from "@/components/ride/RideCard";
import RideBottomNav from "@/components/ride/RideBottomNav";
import { TripDetails, calculateRidePrice } from "@/lib/tripCalculator";
import { useRideStore } from "@/stores/rideStore";
import { createRideInDb, SupabaseErrorInfo, categorizeError } from "@/lib/supabaseRide";
import { toast } from "sonner";
import { useLocalPaymentMethods } from "@/hooks/useLocalPaymentMethods";
import { useAvailableDriversCount } from "@/hooks/useAvailableDrivers";
import { NoDriversAvailable } from "@/components/ride/NoDriversAvailable";

interface LocationState {
  ride: RideOption;
  pickup: string;
  destination: string;
  tripDetails?: TripDetails;
  routeCoordinates?: [number, number][];
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
}

type PaymentMethod = "card" | "apple" | "cash";

// Fallback payment methods when no saved cards
const fallbackPaymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard; sublabel: string }[] = [
  { id: "apple", label: "Apple Pay", icon: Wallet, sublabel: "Fastest checkout" },
  { id: "cash", label: "Cash", icon: Banknote, sublabel: "Pay driver directly" },
];

const RideConfirmPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const { createRide, setTripId } = useRideStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<SupabaseErrorInfo | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showNoDrivers, setShowNoDrivers] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const { getDefault, methods } = useLocalPaymentMethods();
  const defaultCard = getDefault();
  const { refetch: checkAvailableDrivers } = useAvailableDriversCount();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(
    defaultCard ? "card" : "apple"
  );

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

  const { ride, pickup, destination, tripDetails, routeCoordinates, pickupCoords, dropoffCoords } = state;

  // Calculate dynamic price
  const displayPrice = tripDetails
    ? calculateRidePrice(ride.id, tripDetails.distance, tripDetails.duration)
    : ride.price;

  const handleConfirm = async () => {
    if (isSubmitting || isCheckingAvailability) return;
    setError(null);
    setShowNoDrivers(false);
    
    // Check driver availability first
    setIsCheckingAvailability(true);
    try {
      const { data: availableDrivers } = await checkAvailableDrivers();
      if (!availableDrivers || availableDrivers.length === 0) {
        setShowNoDrivers(true);
        setIsCheckingAvailability(false);
        return;
      }
    } catch (err) {
      // If check fails, proceed anyway - let the search handle it
      console.warn("[RideConfirm] Availability check failed, proceeding:", err);
    }
    setIsCheckingAvailability(false);
    
    setIsSubmitting(true);

    try {
      // Create ride in the central store first
      createRide({
        pickup,
        destination,
        rideType: ride.id,
        rideName: ride.name,
        rideImage: ride.image,
        price: displayPrice,
        distance: tripDetails?.distance || 0,
        duration: tripDetails?.duration || 0,
        paymentMethod: selectedPayment,
        pickupCoords,
        dropoffCoords,
        routeCoordinates,
      });

      // Try to insert into database with retry logic
      const result = await createRideInDb(
        {
          pickup,
          destination,
          pickupCoords,
          dropoffCoords,
          rideType: ride.id,
          price: displayPrice,
          distance: tripDetails?.distance || 0,
          duration: tripDetails?.duration || 0,
        },
        {
          enableRetry: true,
          maxAttempts: 3,
          onRetry: (attempt, retryError) => {
            console.log(`[RideConfirm] Retry attempt ${attempt}:`, retryError.message);
          },
        }
      );

      if (result.tripId) {
        // Success - store tripId and navigate
        setTripId(result.tripId);
        console.log("[RideConfirm] Trip created in database:", result.tripId, "attempts:", result.attempts);
        navigate("/ride/searching");
      } else if (result.error) {
        // Failed after retries - show error UI
        console.error("[RideConfirm] Failed to create trip:", result.error.message, "attempts:", result.attempts);
        setError(result.error);
        setRetryCount((prev) => prev + 1);

        // Show toast based on error type
        if (result.error.type === "network") {
          toast.error("Connection failed", {
            description: result.error.userMessage,
          });
        } else if (result.error.type === "auth") {
          toast.error("Authentication required", {
            description: result.error.userMessage,
          });
        } else {
          toast.error(result.error.userMessage);
        }

        setIsSubmitting(false);
      }
    } catch (err) {
      // Unexpected error
      console.error("[RideConfirm] Unexpected error:", err);
      const errorInfo = categorizeError(err);
      setError(errorInfo);
      toast.error(errorInfo.userMessage);
      setIsSubmitting(false);
    }
  };

  const handleRetryAvailability = async () => {
    setIsCheckingAvailability(true);
    try {
      const { data: availableDrivers } = await checkAvailableDrivers();
      if (availableDrivers && availableDrivers.length > 0) {
        setShowNoDrivers(false);
      }
    } catch (err) {
      console.warn("[RideConfirm] Retry availability check failed:", err);
    }
    setIsCheckingAvailability(false);
  };

  // Continue in demo mode (bypass database)
  const handleContinueDemo = () => {
    setError(null);
    toast.info("Continuing in demo mode", {
      description: "Your ride won't be saved to the server",
    });
    navigate("/ride/searching");
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Payment Method</h3>
            <Link 
              to="/payment-methods" 
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {/* Saved Card (if exists) */}
            {defaultCard && (
              <button
                onClick={() => setSelectedPayment("card")}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                  selectedPayment === "card"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  selectedPayment === "card" ? "bg-primary/20" : "bg-white/10"
                )}>
                  <CreditCard className={cn(
                    "w-5 h-5",
                    selectedPayment === "card" ? "text-primary" : "text-white/60"
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{defaultCard.brand} •••• {defaultCard.last4}</p>
                  <p className="text-xs text-white/50">Default card</p>
                </div>
                {selectedPayment === "card" && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            )}

            {/* Fallback payment options */}
            {fallbackPaymentMethods.map((method) => {
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

            {/* Add Card prompt if no saved cards */}
            {!defaultCard && (
              <Link
                to="/payment-methods"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 transition-colors"
              >
                <div className="p-2 rounded-lg bg-white/10">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Add a payment card</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            )}
          </div>
        </motion.div>

        {/* No Drivers Available Message */}
        <AnimatePresence>
          {showNoDrivers && (
            <NoDriversAvailable
              onRetry={handleRetryAvailability}
              onCancel={() => navigate("/ride")}
              isRetrying={isCheckingAvailability}
            />
          )}
        </AnimatePresence>

        {/* Confirm Button */}
        {!showNoDrivers && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={isSubmitting || isCheckingAvailability}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingAvailability ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                CHECKING DRIVERS...
              </>
            ) : isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                REQUESTING...
              </>
            ) : (
              `PAY $${displayPrice.toFixed(2)} & REQUEST`
            )}
          </motion.button>
        )}

        {/* Error Panel */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              {error.type === "network" ? (
                <WifiOff className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium">
                  {error.userMessage}
                </p>
                {retryCount > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Failed {retryCount} times
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  {error.isRetryable && (
                    <button
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-destructive text-white rounded-lg text-xs font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        "Try Again"
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleContinueDemo}
                    className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"
                  >
                    Continue Offline
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RideConfirmPage;
