/**
 * RideTrackingPage - Live driver en-route tracking with real-time location
 * Also broadcasts customer's live GPS so the driver can see pickup location
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import DriverEnRouteTracker from "@/components/rides/DriverEnRouteTracker";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerLocationBroadcast } from "@/hooks/useCustomerLocationBroadcast";

export default function RideTrackingPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState<any>(null);

  // Broadcast customer's live GPS to the driver while ride is active
  const isRideActive = tripData?.status && ["driver_assigned", "en_route", "arrived", "in_progress"].includes(tripData.status);
  useCustomerLocationBroadcast({
    tripId: isRideActive ? tripId ?? null : null,
    enabled: Boolean(isRideActive),
  });

  useEffect(() => {
    if (!tripId) return;

    const fetchTrip = async () => {
      const { data } = await supabase
        .from("ride_requests")
        .select("id, status, assigned_driver_id, pickup_address, dropoff_address, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng")
        .eq("id", tripId)
        .maybeSingle();

      if (data) {
        setTripData(data);

        // Fetch driver info if assigned
        if (data.assigned_driver_id) {
          const { data: driver } = await supabase
            .from("drivers")
            .select("full_name, rating, total_trips, vehicle_plate, vehicle_model, vehicle_color, phone")
            .eq("id", data.assigned_driver_id)
            .maybeSingle();

          if (driver) {
            setTripData((prev: any) => ({ ...prev, driver }));
          }
        }
      }
    };

    fetchTrip();

    // Subscribe to ride_requests changes
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "ride_requests",
        filter: `id=eq.${tripId}`,
      }, (payload) => {
        setTripData((prev: any) => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId]);

  const statusMap: Record<string, "arriving" | "waiting" | "in_transit" | "almost_there"> = {
    driver_assigned: "arriving",
    en_route: "arriving",
    arrived: "waiting",
    in_progress: "in_transit",
    completing: "almost_there",
  };

  const driverInfo = tripData?.driver
    ? {
        name: tripData.driver.full_name || "",
        rating: tripData.driver.rating || 0,
        trips: tripData.driver.total_trips || 0,
        plate: tripData.driver.vehicle_plate || "",
        vehicle: tripData.driver.vehicle_model || "",
        vehicleColor: tripData.driver.vehicle_color || "",
        phone: tripData.driver.phone || "",
      }
    : undefined;

  return (
    <AppLayout title="Live Tracking" showBack onBack={() => navigate("/rides")} hideNav>
      <div className="p-4 space-y-4">
        <DriverEnRouteTracker
          tripId={tripId || ""}
          driverId={tripData?.assigned_driver_id}
          driver={driverInfo}
          etaMinutes={5}
          pickupAddress={tripData?.pickup_address || ""}
          dropoffAddress={tripData?.dropoff_address || ""}
          pickupCoords={tripData?.pickup_lat ? { lat: tripData.pickup_lat, lng: tripData.pickup_lng } : null}
          dropoffCoords={tripData?.dropoff_lat ? { lat: tripData.dropoff_lat, lng: tripData.dropoff_lng } : null}
          status={statusMap[tripData?.status] || "arriving"}
          onContact={(type) => toast.info(type === "call" ? "Calling driver..." : "Opening chat...")}
          onShare={() => toast.success("Trip link copied!")}
          onCancel={() => toast.info("Safety center opened")}
        />
      </div>
    </AppLayout>
  );
}
