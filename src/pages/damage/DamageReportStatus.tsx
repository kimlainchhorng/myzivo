/**
 * Damage Report Status Page
 * View status and details of a damage report
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  Car,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useDamageReport, useDamageEvidence } from "@/hooks/useDamageReport";
import DamageStatusBadge from "@/components/damage/DamageStatusBadge";
import DamageTimeline from "@/components/damage/DamageTimeline";

export default function DamageReportStatus() {
  const { reportId } = useParams<{ reportId: string }>();
  const { user, isLoading: authLoading } = useAuth();

  const { data: report, isLoading, error } = useDamageReport(reportId);
  const { data: evidence } = useDamageEvidence(reportId);

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

  if (!report) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the damage report you're looking for.
        </p>
        <Button asChild>
          <Link to="/trips">Return to Trips</Link>
        </Button>
      </div>
    );
  }

  const isResolved = [
    "resolved_owner_paid",
    "resolved_renter_charged",
    "closed_no_action",
  ].includes(report.status);

  const damagePhotos = evidence?.filter((e) => e.image_type === "damage") || [];
  const beforePhotos = evidence?.filter((e) => e.image_type === "before") || [];
  const afterPhotos = evidence?.filter((e) => e.image_type === "after") || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        {/* Back button */}
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Trips
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Damage Report</h1>
            <p className="text-muted-foreground">
              Report #{report.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <DamageStatusBadge status={report.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Damage Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">{report.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Noticed: {format(new Date(report.date_noticed), "PPp")}
                  </div>
                  {report.estimated_repair_cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Est. Cost: ${report.estimated_repair_cost.toFixed(2)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Evidence Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {damagePhotos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      Damage Photos ({damagePhotos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {damagePhotos.map((photo) => (
                        <a
                          key={photo.id}
                          href={photo.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border hover:ring-2 ring-primary transition-all"
                        >
                          <img
                            src={photo.image_url}
                            alt={photo.caption || "Damage photo"}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {beforePhotos.length > 0 && (
                  <div>
                    <Separator className="mb-6" />
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      Before Photos ({beforePhotos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {beforePhotos.map((photo) => (
                        <a
                          key={photo.id}
                          href={photo.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border hover:ring-2 ring-primary transition-all"
                        >
                          <img
                            src={photo.image_url}
                            alt={photo.caption || "Before photo"}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {afterPhotos.length > 0 && (
                  <div>
                    <Separator className="mb-6" />
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      After Photos ({afterPhotos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {afterPhotos.map((photo) => (
                        <a
                          key={photo.id}
                          href={photo.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border hover:ring-2 ring-primary transition-all"
                        >
                          <img
                            src={photo.image_url}
                            alt={photo.caption || "After photo"}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {damagePhotos.length === 0 && beforePhotos.length === 0 && afterPhotos.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No photos uploaded
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Resolution Details */}
            {isResolved && report.resolution && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Resolution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Decision</h4>
                      <p className="mt-1 capitalize">
                        {report.resolution.decision.replace(/_/g, " ")}
                      </p>
                    </div>
                    {report.resolution.owner_payout_adjustment !== 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Payout Adjustment
                        </h4>
                        <p className="mt-1">
                          {report.resolution.owner_payout_adjustment > 0 ? "+" : ""}
                          ${report.resolution.owner_payout_adjustment.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                  {report.resolution.admin_notes && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Notes</h4>
                      <p className="mt-1 text-muted-foreground">
                        {report.resolution.admin_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Info */}
            {report.booking && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.booking.vehicle && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Vehicle</h4>
                      <p className="mt-1">
                        {report.booking.vehicle.year} {report.booking.vehicle.make}{" "}
                        {report.booking.vehicle.model}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Rental Period</h4>
                    <p className="mt-1 text-sm">
                      {format(new Date(report.booking.pickup_date), "MMM d")} -{" "}
                      {format(new Date(report.booking.return_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Total Amount</h4>
                    <p className="mt-1">${report.booking.total_amount.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardContent className="pt-6">
                <DamageTimeline
                  currentStatus={report.status}
                  createdAt={report.created_at}
                  updatedAt={report.updated_at}
                  resolution={report.resolution}
                />
              </CardContent>
            </Card>

            {/* Next Steps */}
            {!isResolved && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">What's Next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {report.status === "reported" && (
                      <>
                        <li>• Your report is awaiting review</li>
                        <li>• Our team will examine the evidence</li>
                        <li>• You'll be notified of any updates</li>
                      </>
                    )}
                    {report.status === "under_review" && (
                      <>
                        <li>• Our team is reviewing your report</li>
                        <li>• We may contact you for more details</li>
                        <li>• Resolution typically takes 3-5 days</li>
                      </>
                    )}
                    {report.status === "info_requested" && (
                      <>
                        <li>• Additional information is needed</li>
                        <li>• Please check your email for details</li>
                        <li>• Respond promptly to avoid delays</li>
                      </>
                    )}
                    {report.status === "insurance_claim_submitted" && (
                      <>
                        <li>• An insurance claim has been filed</li>
                        <li>• This may take additional time</li>
                        <li>• We'll update you on the outcome</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
