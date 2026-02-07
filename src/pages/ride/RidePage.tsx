import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";
import RideAppBar from "@/components/ride/RideAppBar";
import RideLocationCard from "@/components/ride/RideLocationCard";
import RideSegmentTabs, { RideCategory } from "@/components/ride/RideSegmentTabs";
import RideGrid from "@/components/ride/RideGrid";
import RideStickyCTA from "@/components/ride/RideStickyCTA";
import RideBottomNav from "@/components/ride/RideBottomNav";
import { RideOption } from "@/components/ride/RideCard";
import { rideOptions } from "@/components/ride/rideData";
import { useServerRoute } from "@/hooks/useServerRoute";
import { calculateMockTrip, type TripDetails } from "@/lib/tripCalculator";

const CITY_BG = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&h=1080&fit=crop";

interface LocationCoords {
  lat: number;
  lng: number;
}

const RidePage = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("109 Hickory Street, Denha…");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState<LocationCoords | undefined>();
  const [dropoffCoords, setDropoffCoords] = useState<LocationCoords | undefined>();
  const [activeTab, setActiveTab] = useState<RideCategory>("economy");
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [routePolyline, setRoutePolyline] = useState<string | null>(null);

  const { fetchRoute, isLoading: isRouteLoading } = useServerRoute();

  // Handle pickup change with optional coordinates
  const handlePickupChange = useCallback((value: string, coords?: LocationCoords) => {
    setPickup(value);
    if (coords) {
      setPickupCoords(coords);
    } else if (!value.trim()) {
      setPickupCoords(undefined);
    }
  }, []);

  // Handle destination change with optional coordinates
  const handleDestinationChange = useCallback((value: string, coords?: LocationCoords) => {
    setDestination(value);
    if (coords) {
      setDropoffCoords(coords);
    } else if (!value.trim()) {
      setDropoffCoords(undefined);
    }
  }, []);

  // Calculate route when both coordinates are available
  useEffect(() => {
    const calculateRoute = async () => {
      if (pickupCoords && dropoffCoords) {
        console.log("[RidePage] Calculating route with server API");
        const route = await fetchRoute(pickupCoords, dropoffCoords, pickup, destination);
        
        if (route) {
          setTripDetails({
            distance: route.distance,
            duration: route.duration,
          });
          setRoutePolyline(route.polyline);
        }
      } else if (pickup.trim() && destination.trim()) {
        // Fallback to mock calculation if no coordinates
        console.log("[RidePage] Using mock route calculation");
        const trip = calculateMockTrip(pickup, destination);
        setTripDetails(trip);
        setRoutePolyline(null);
      } else {
        setTripDetails(null);
        setRoutePolyline(null);
      }
    };

    calculateRoute();
  }, [pickupCoords, dropoffCoords, pickup, destination, fetchRoute]);

  const handleConfirm = () => {
    if (selectedRide) {
      navigate("/ride/confirm", {
        state: {
          ride: selectedRide,
          pickup,
          destination,
          tripDetails,
          pickupCoords,
          dropoffCoords,
          routePolyline,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={CITY_BG}
          alt="City skyline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-zinc-950" />
      </div>

      {/* App Bar */}
      <RideAppBar />

      {/* Content */}
      <div className="relative z-10 pt-20 px-4 pb-36">
        {/* Drivers Nearby Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-white/80">
              35 DRIVERS NEARBY
            </span>
          </div>
        </motion.div>

        {/* Where to? Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-4"
        >
          Where to?
        </motion.h1>

        {/* Location Card */}
        <div className="mb-6">
          <RideLocationCard
            pickup={pickup}
            destination={destination}
            onPickupChange={handlePickupChange}
            onDestinationChange={handleDestinationChange}
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
          />
        </div>

        {/* Choose Your Ride Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-3 text-center">
            Choose Your <span className="text-primary">Ride</span>
          </h2>

          {/* Segment Tabs */}
          <div className="mb-4">
            <RideSegmentTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSelectedRide(null);
              }}
            />
          </div>

          {/* Ride Grid */}
          <RideGrid
            rides={rideOptions[activeTab]}
            selectedRideId={selectedRide?.id || null}
            onSelectRide={setSelectedRide}
            tripDetails={tripDetails}
          />

          {/* Trip Info Pill */}
          {(tripDetails || isRouteLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10">
                {isRouteLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    <span className="text-xs font-semibold tracking-wide text-white/80">
                      Calculating route...
                    </span>
                  </>
                ) : tripDetails ? (
                  <>
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold tracking-wide text-white/80">
                      {tripDetails.distance} miles • {tripDetails.duration} min estimated
                    </span>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <RideStickyCTA 
        selectedRide={selectedRide} 
        pickup={pickup}
        destination={destination}
        tripDetails={tripDetails}
        onConfirm={handleConfirm} 
      />

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RidePage;
