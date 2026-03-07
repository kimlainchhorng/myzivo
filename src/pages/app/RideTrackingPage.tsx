/**
 * RideTrackingPage - Live driver en-route tracking with full-screen map experience
 */
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import DriverEnRouteTracker from "@/components/rides/DriverEnRouteTracker";
import { toast } from "sonner";

export default function RideTrackingPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  return (
    <AppLayout title="Live Tracking" showBack onBack={() => navigate("/rides")} hideNav>
      <div className="p-4 space-y-4">
        <DriverEnRouteTracker
          tripId={tripId || "demo"}
          onContact={(type) => toast.info(type === "call" ? "Calling driver..." : "Opening chat...")}
          onShare={() => toast.success("Trip link copied!")}
          onCancel={() => toast.info("Safety center opened")}
        />
      </div>
    </AppLayout>
  );
}
