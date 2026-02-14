import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, Loader2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useGoogleMapsGeocode, Suggestion } from "@/hooks/useGoogleMapsGeocode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

export default function RequestRidePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCurrentLocation, reverseGeocode, isGettingLocation } = useCurrentLocation();

  // Pickup state
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const pickupGeocode = useGoogleMapsGeocode();

  // Dropoff state (optional)
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const dropoffGeocode = useGoogleMapsGeocode();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInput, setActiveInput] = useState<"pickup" | "dropoff" | null>(null);

  // Use current location for pickup
  const handleUseMyLocation = useCallback(async () => {
    try {
      const loc = await getCurrentLocation();
      setPickupCoords({ lat: loc.lat, lng: loc.lng });
      const addr = await reverseGeocode(loc.lat, loc.lng);
      setPickupAddress(addr);
      pickupGeocode.clearSuggestions();
      setActiveInput(null);
    } catch {
      toast.error("Could not get your location");
    }
  }, [getCurrentLocation, reverseGeocode, pickupGeocode]);

  // Select a suggestion
  const handleSelectSuggestion = (suggestion: Suggestion, field: "pickup" | "dropoff") => {
    if (field === "pickup") {
      setPickupAddress(suggestion.placeName);
      // For Google autocomplete we don't get coords directly — we'll geocode on submit
      setPickupCoords(null); // Will be resolved via place details or we require "Use my location"
      pickupGeocode.clearSuggestions();
    } else {
      setDropoffAddress(suggestion.placeName);
      setDropoffCoords(null);
      dropoffGeocode.clearSuggestions();
    }
    setActiveInput(null);
  };

  // Geocode an address to coordinates using the edge function
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/google-maps-proxy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token ?? ""}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI",
          },
          body: JSON.stringify({ action: "geocode", address }),
        }
      );
      const data = await res.json();
      if (data.results?.[0]?.geometry?.location) {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Submit ride request
  const handleRequestRide = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    if (!pickupAddress.trim()) {
      toast.error("Please enter a pickup address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Resolve pickup coords if not already set (from "Use my location")
      let finalPickup = pickupCoords;
      if (!finalPickup) {
        finalPickup = await geocodeAddress(pickupAddress);
        if (!finalPickup) {
          toast.error("Could not resolve pickup location. Try 'Use my location'.");
          setIsSubmitting(false);
          return;
        }
        setPickupCoords(finalPickup);
      }

      // Resolve dropoff coords if address provided
      let finalDropoff = dropoffCoords;
      if (dropoffAddress.trim() && !finalDropoff) {
        finalDropoff = await geocodeAddress(dropoffAddress);
        if (finalDropoff) setDropoffCoords(finalDropoff);
      }

      // 1) Insert job row
      const { data: job, error } = await supabase
        .from("jobs")
        .insert({
          customer_id: user.id,
          job_type: "ride",
          status: "requested",
          pickup_address: pickupAddress,
          pickup_lat: finalPickup.lat,
          pickup_lng: finalPickup.lng,
          dropoff_address: dropoffAddress || null,
          dropoff_lat: finalDropoff?.lat ?? null,
          dropoff_lng: finalDropoff?.lng ?? null,
        } as any)
        .select()
        .single();

      if (error || !job) {
        throw new Error(error?.message || "Failed to create ride request");
      }

      const jobId = (job as any).id;

      // 2) Dispatch via dispatch-start edge function (JWT attached)
      const { error: dispatchError } = await supabase.functions.invoke("dispatch-start", {
        body: { job_id: jobId, offer_ttl_seconds: 25 },
      });

      if (dispatchError) {
        console.error("[RequestRide] dispatch-start error:", dispatchError);
        // Don't fail the request — job is created, dispatch can retry
      }

      // 3) Navigate to trip status
      navigate(`/trip-status/${jobId}`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted transition">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Request a Ride</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 space-y-5 max-w-lg mx-auto w-full">
        {/* Pickup */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Pickup Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input
              placeholder="Enter pickup address"
              value={pickupAddress}
              onChange={(e) => {
                setPickupAddress(e.target.value);
                setPickupCoords(null);
                pickupGeocode.fetchSuggestions(e.target.value);
                setActiveInput("pickup");
              }}
              onFocus={() => setActiveInput("pickup")}
              className="pl-10"
            />
          </div>

          {/* Use my location button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseMyLocation}
            disabled={isGettingLocation}
            className="w-full gap-2"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            Use my location
          </Button>

          {/* Pickup suggestions */}
          {activeInput === "pickup" && pickupGeocode.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg shadow-md overflow-hidden"
            >
              {pickupGeocode.suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s, "pickup")}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition border-b border-border last:border-b-0 text-sm text-foreground"
                >
                  {s.placeName}
                </button>
              ))}
            </motion.div>
          )}

          {pickupCoords && (
            <p className="text-xs text-muted-foreground">
              📍 {pickupCoords.lat.toFixed(4)}, {pickupCoords.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Dropoff (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Dropoff Location <span className="text-muted-foreground">(optional)</span></label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
            <Input
              placeholder="Enter dropoff address"
              value={dropoffAddress}
              onChange={(e) => {
                setDropoffAddress(e.target.value);
                setDropoffCoords(null);
                dropoffGeocode.fetchSuggestions(e.target.value);
                setActiveInput("dropoff");
              }}
              onFocus={() => setActiveInput("dropoff")}
              className="pl-10"
            />
          </div>

          {/* Dropoff suggestions */}
          {activeInput === "dropoff" && dropoffGeocode.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg shadow-md overflow-hidden"
            >
              {dropoffGeocode.suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s, "dropoff")}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition border-b border-border last:border-b-0 text-sm text-foreground"
                >
                  {s.placeName}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Request Button */}
        <Button
          onClick={handleRequestRide}
          disabled={isSubmitting || !pickupAddress.trim()}
          className="w-full h-14 text-base font-semibold gap-2"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating ride…
            </>
          ) : (
            <>
              <Car className="w-5 h-5" />
              Request Ride
            </>
          )}
        </Button>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
