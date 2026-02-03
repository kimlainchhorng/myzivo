/**
 * Renter Verification Gate
 * Blocks booking if renter is not verified
 */

import { Link } from "react-router-dom";
import { Shield, AlertCircle, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRenterProfile } from "@/hooks/useRenterVerification";
import { useAuth } from "@/contexts/AuthContext";

interface RenterVerificationGateProps {
  children: React.ReactNode;
  onVerificationNeeded?: () => void;
}

export default function RenterVerificationGate({
  children,
  onVerificationNeeded,
}: RenterVerificationGateProps) {
  const { user } = useAuth();
  const { data: renterProfile, isLoading } = useRenterProfile();

  // Not logged in - show login prompt
  if (!user) {
    return (
      <Card className="border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please sign in to book this vehicle.
          </p>
          <Button asChild>
            <Link to="/auth?redirect=/cars">Sign In to Continue</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // No profile - needs to complete verification
  if (!renterProfile) {
    return (
      <Card className="border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-amber-500" />
            Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Before you can book a car on ZIVO, we need to verify your driver's license. This helps keep our community safe.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Quick 2-minute verification</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Only verify once for all future bookings</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Your information is encrypted and secure</span>
            </div>
          </div>

          <Button asChild className="w-full gap-2">
            <Link to="/renter/verify">
              Start Verification
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Pending verification
  if (renterProfile.verification_status === "pending") {
    return (
      <Card className="border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-amber-500 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Verification Pending</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We're reviewing your documents. This usually takes 1-2 business days.
          </p>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            Under Review
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // Rejected verification
  if (renterProfile.verification_status === "rejected") {
    return (
      <Card className="border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Verification Rejected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {renterProfile.rejection_reason || "Your verification was not approved. Please try again with valid documents."}
          </p>
          <Button asChild variant="destructive">
            <Link to="/renter/verify">Resubmit Verification</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Suspended
  if (renterProfile.verification_status === "suspended") {
    return (
      <Card className="border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Account Suspended</h3>
          <p className="text-sm text-muted-foreground">
            Your renter account has been suspended. Please contact support for assistance.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Approved - show children
  return <>{children}</>;
}
