/**
 * Report Damage Page
 * Unified page for renters and owners to report damage
 */

import { useParams, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DamageReportForm from "@/components/damage/DamageReportForm";

interface ReportDamageProps {
  role?: "renter" | "owner";
}

export default function ReportDamage({ role: propRole }: ReportDamageProps) {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();

  // Determine role from prop or path
  const role = propRole || (location.pathname.includes("/owner/") ? "owner" : "renter");

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["booking-for-damage", bookingId],
    queryFn: async () => {
      if (!bookingId) return null;

      const { data, error } = await supabase
        .from("p2p_bookings")
        .select(`
          id,
          status,
          renter_id,
          owner_id,
          damage_report_id,
          vehicle:p2p_vehicles(id, make, model, year)
        `)
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId && !!user,
  });

  // Check if user has owner profile
  const { data: ownerProfile } = useQuery({
    queryKey: ["owner-profile-check", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("car_owner_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user && role === "owner",
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!bookingId || !booking) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the booking you're looking for.
        </p>
        <Button asChild>
          <Link to={role === "owner" ? "/owner" : "/trips"}>Return to Bookings</Link>
        </Button>
      </div>
    );
  }

  // Verify user has access to this booking
  const isRenter = booking.renter_id === user.id;
  const isOwner = ownerProfile && booking.owner_id === ownerProfile.id;

  if ((role === "renter" && !isRenter) || (role === "owner" && !isOwner)) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to report damage for this booking.
        </p>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  // Check if damage already reported
  if (booking.damage_report_id) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Damage Already Reported</h1>
        <p className="text-muted-foreground mb-6">
          A damage report has already been filed for this booking.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to={`/damage/${booking.damage_report_id}/status`}>View Report Status</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={role === "owner" ? "/owner" : "/trips"}>Return to Bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check booking status - should be completed or returned
  const allowedStatuses = ["completed", "returned"];
  if (!allowedStatuses.includes(booking.status)) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Cannot Report Damage</h1>
        <p className="text-muted-foreground mb-6">
          Damage can only be reported after the trip is completed.
        </p>
        <Button asChild>
          <Link to={role === "owner" ? "/owner" : "/trips"}>Return to Bookings</Link>
        </Button>
      </div>
    );
  }

  const vehicleInfo = booking.vehicle
    ? {
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Back button */}
        <Link
          to={role === "owner" ? "/owner" : "/trips"}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Report Vehicle Damage</h1>
          <p className="text-muted-foreground">
            {role === "owner"
              ? "Report damage discovered on your vehicle after the rental"
              : "Report any damage you noticed during or after your rental"}
          </p>
        </div>

        {/* Form */}
        <DamageReportForm
          bookingId={bookingId}
          reporterRole={role}
          vehicleInfo={vehicleInfo}
        />
      </div>
    </div>
  );
}
