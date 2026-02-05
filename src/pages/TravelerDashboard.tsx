/**
 * TravelerDashboard Page
 * Premium 2026-era traveler profile with holographic passport and trip timeline
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TravelerPassport, TripTimeline, AIConciergeTrigger, SavedForLater } from "@/components/profile";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

export default function TravelerDashboard() {
  const { user, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Main Content */}
      <div className="pt-20 px-6 pb-32">
        {/* Holographic Passport Header */}
        <TravelerPassport />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          {/* Main Column - Trip Timeline */}
          <div className="lg:col-span-8">
            <TripTimeline />
          </div>

          {/* Sidebar - Saved Items & Quick Actions */}
          <div className="lg:col-span-4">
            <SavedForLater />
          </div>
        </div>
      </div>

      {/* AI Concierge Widget */}
      <AIConciergeTrigger />

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  );
}