/**
 * Verification Status Page
 * Shows current verification status and allows resubmission if rejected
 */

import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Car,
  Shield,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRenterProfile, useRenterDocuments } from "@/hooks/useRenterVerification";
import { format, parseISO, differenceInDays } from "date-fns";

export default function VerificationStatus() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useRenterProfile();
  const { data: documents = [] } = useRenterDocuments(profile?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  // No profile - redirect to verification
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">No Verification Found</h1>
            <p className="text-muted-foreground mb-6">
              You haven't started the verification process yet.
            </p>
            <Button onClick={() => navigate("/verify/driver")}>
              Start Verification
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = profile.verification_status;
  const licenseExpiresSoon =
    profile.license_expiration &&
    differenceInDays(parseISO(profile.license_expiration), new Date()) <= 30;
  const licenseExpired =
    profile.license_expiration &&
    new Date(profile.license_expiration) < new Date();

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      title: "Verification In Progress",
      description: "Your documents are being reviewed. This usually takes 1-2 business hours.",
      badge: "Pending Review",
      badgeVariant: "secondary" as const,
    },
    approved: {
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      title: "You're Verified!",
      description: "Your driver's license has been verified. You can now book cars.",
      badge: "Verified",
      badgeVariant: "default" as const,
    },
    rejected: {
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      title: "Verification Rejected",
      description: profile.rejection_reason || "Your verification was not approved. Please resubmit your documents.",
      badge: "Rejected",
      badgeVariant: "destructive" as const,
    },
    suspended: {
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      title: "Account Suspended",
      description: "Your account has been suspended. Please contact support for assistance.",
      badge: "Suspended",
      badgeVariant: "destructive" as const,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Verification Status | ZIVO"
        description="Check your driver verification status on ZIVO"
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-6`}>
                <StatusIcon className={`w-10 h-10 ${config.color}`} />
              </div>
              
              <Badge variant={config.badgeVariant} className="mb-4">
                {config.badge}
              </Badge>
              
              <h1 className="text-2xl font-bold mb-2">{config.title}</h1>
              <p className="text-muted-foreground mb-6">{config.description}</p>

              {/* License Expiration Warning */}
              {status === "approved" && licenseExpired && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">License Expired</p>
                      <p className="text-sm text-muted-foreground">
                        Your license expired on {format(parseISO(profile.license_expiration), "MMM d, yyyy")}.
                        Please update your verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === "approved" && licenseExpiresSoon && !licenseExpired && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-600">License Expiring Soon</p>
                      <p className="text-sm text-muted-foreground">
                        Your license expires on {format(parseISO(profile.license_expiration), "MMM d, yyyy")}.
                        Consider updating your documents.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Summary */}
              {status === "approved" && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{profile.full_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">License</span>
                    <span className="font-medium">{profile.license_state} ****{profile.license_number.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">
                      {format(parseISO(profile.license_expiration), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              )}

              {/* Documents Summary */}
              {status === "pending" && documents.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium mb-2">Documents Submitted</p>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{doc.document_type.replace("_", " ")}</span>
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {status === "approved" && !licenseExpired && (
                  <Button onClick={() => navigate("/p2p/search")} className="w-full">
                    <Car className="w-4 h-4 mr-2" />
                    Browse Cars
                  </Button>
                )}

                {(status === "rejected" || licenseExpired) && (
                  <Button onClick={() => navigate("/verify/driver")} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resubmit Verification
                  </Button>
                )}

                {status === "suspended" && (
                  <Button variant="outline" onClick={() => navigate("/help")} className="w-full">
                    Contact Support
                  </Button>
                )}

                {status === "pending" && (
                  <Button variant="outline" onClick={() => navigate("/p2p/search")} className="w-full">
                    Browse Cars While Waiting
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
