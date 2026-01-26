import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LocationSearchInput from "@/components/rider/LocationSearchInput";
import VehicleSelector from "@/components/rider/VehicleSelector";
import BookingMap from "@/components/rider/BookingMap";
import SavedLocationsPanel from "@/components/rider/SavedLocationsPanel";
import QuickLocationPicker from "@/components/rider/QuickLocationPicker";
import TripTracker from "@/components/rider/TripTracker";
import {
  Location,
  FareEstimate,
  useRouteCalculation,
  useFareEstimation,
  useCreateTrip,
} from "@/hooks/useRiderBooking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/hooks/useTrips";
import { useRiderTripRealtime } from "@/hooks/useTripRealtime";

type BookingStep = "location" | "vehicle" | "confirm" | "tracking";

const RiderApp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<BookingStep>("location");
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [fareEstimates, setFareEstimates] = useState<FareEstimate[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  const { calculateRoute, isCalculating } = useRouteCalculation();
  const { calculateFares } = useFareEstimation();
  const createTrip = useCreateTrip();

  // Enable realtime subscriptions for trip updates
  useRiderTripRealtime(user?.id);

  // Check for active trip
  const { data: activeTrip, isLoading: tripLoading } = useQuery({
    queryKey: ["active-rider-trip", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          driver:drivers(full_name, email)
        `)
        .eq("rider_id", user.id)
        .in("status", ["requested", "accepted", "en_route", "arrived", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Trip | null;
    },
    enabled: !!user,
    // Reduced polling since we have realtime now
    refetchInterval: 30000,
  });

  // Calculate route when both locations are set
  useEffect(() => {
    const fetchRoute = async () => {
      if (pickup && dropoff) {
        const route = await calculateRoute(pickup, dropoff);
        if (route) {
          setRouteGeometry(route.geometry);
          setRouteInfo({ distance: route.distance, duration: route.duration });
          const fares = calculateFares(route.distance, route.duration);
          setFareEstimates(fares);
          if (fares.length > 0 && !selectedVehicle) {
            setSelectedVehicle(fares[0].vehicleType);
          }
          setStep("vehicle");
        }
      }
    };

    fetchRoute();
  }, [pickup, dropoff]);

  // Switch to tracking if there's an active trip
  useEffect(() => {
    if (activeTrip) {
      setStep("tracking");
    }
  }, [activeTrip]);

  const handleConfirmBooking = async () => {
    if (!pickup || !dropoff || !selectedVehicle || !routeInfo) return;

    const selectedFare = fareEstimates.find(f => f.vehicleType === selectedVehicle);
    if (!selectedFare) return;

    await createTrip.mutateAsync({
      pickup,
      dropoff,
      fareAmount: selectedFare.totalFare,
      distanceKm: routeInfo.distance,
      durationMinutes: routeInfo.duration,
    });
  };

  const handleCancelTrip = async () => {
    if (!activeTrip) return;
    
    const { error } = await supabase
      .from("trips")
      .update({ status: "cancelled" })
      .eq("id", activeTrip.id);

    if (!error) {
      setStep("location");
      setPickup(null);
      setDropoff(null);
      setSelectedVehicle(null);
      setFareEstimates([]);
      setRouteGeometry(null);
      setRouteInfo(null);
    }
  };

  const handleReset = () => {
    setStep("location");
    setPickup(null);
    setDropoff(null);
    setSelectedVehicle(null);
    setFareEstimates([]);
    setRouteGeometry(null);
    setRouteInfo(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign in to book a ride</h2>
            <p className="text-muted-foreground mb-4">You need to be logged in to request trips</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
              <Button onClick={() => navigate("/login")}>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-[300px] w-full rounded-xl mb-4" />
        <Skeleton className="h-20 w-full rounded-xl mb-2" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  // Show trip tracking if there's an active trip
  if (activeTrip && step === "tracking") {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-lg">Your Trip</h1>
          </div>
        </div>
        <div className="p-4">
          <TripTracker trip={activeTrip} onCancel={handleCancelTrip} />
        </div>
      </div>
    );
  }

  const selectedFare = fareEstimates.find(f => f.vehicleType === selectedVehicle);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => step === "location" ? navigate("/") : handleReset()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">
            {step === "location" && "Where to?"}
            {step === "vehicle" && "Choose a ride"}
            {step === "confirm" && "Confirm booking"}
          </h1>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <BookingMap
          pickup={pickup}
          dropoff={dropoff}
          routeGeometry={routeGeometry}
          className="absolute inset-0"
        />

        {isCalculating && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculating route...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card border-t rounded-t-3xl shadow-lg">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3" />
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Location Step */}
          {step === "location" && (
            <div className="space-y-4">
              {/* Quick Location Picker */}
              <QuickLocationPicker
                userId={user?.id}
                onSelect={(location) => {
                  if (!pickup) {
                    setPickup(location);
                  } else {
                    setDropoff(location);
                  }
                }}
              />

              <div className="space-y-3">
                <LocationSearchInput
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={setPickup}
                  icon="pickup"
                />
                <LocationSearchInput
                  placeholder="Where to?"
                  value={dropoff}
                  onChange={setDropoff}
                  icon="dropoff"
                />
              </div>

              {/* Saved Locations */}
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-3">Saved Places</p>
                <SavedLocationsPanel
                  userId={user?.id}
                  onSelect={(location) => {
                    if (!pickup) {
                      setPickup(location);
                    } else {
                      setDropoff(location);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Vehicle Selection Step */}
          {step === "vehicle" && fareEstimates.length > 0 && (
            <div className="space-y-4">
              <VehicleSelector
                fareEstimates={fareEstimates}
                selectedVehicle={selectedVehicle}
                onSelect={setSelectedVehicle}
              />
              
              <Button
                variant="rides"
                size="lg"
                className="w-full"
                disabled={!selectedVehicle || createTrip.isPending}
                onClick={handleConfirmBooking}
              >
                {createTrip.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Requesting...
                  </>
                ) : (
                  <>
                    Confirm {selectedFare && `$${selectedFare.totalFare.toFixed(2)}`}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderApp;
