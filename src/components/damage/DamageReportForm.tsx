/**
 * Damage Report Form Component
 * Multi-step form for submitting damage reports
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, AlertTriangle, Camera, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCreateDamageReport, useUploadDamageEvidence } from "@/hooks/useDamageReport";
import DamageEvidenceUpload from "./DamageEvidenceUpload";

interface DamageReportFormProps {
  bookingId: string;
  reporterRole: "renter" | "owner";
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
  };
}

type Step = "description" | "photos" | "review" | "complete";

export default function DamageReportForm({
  bookingId,
  reporterRole,
  vehicleInfo,
}: DamageReportFormProps) {
  const navigate = useNavigate();
  const createReport = useCreateDamageReport();
  const uploadEvidence = useUploadDamageEvidence();

  const [step, setStep] = useState<Step>("description");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  // Form data
  const [description, setDescription] = useState("");
  const [dateNoticed, setDateNoticed] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [estimatedCost, setEstimatedCost] = useState("");
  const [damagePhotos, setDamagePhotos] = useState<{ file: File; caption: string }[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<{ file: File; caption: string }[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<{ file: File; caption: string }[]>([]);

  const steps: { id: Step; label: string }[] = [
    { id: "description", label: "Details" },
    { id: "photos", label: "Photos" },
    { id: "review", label: "Review" },
    { id: "complete", label: "Done" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceedFromDescription = description.trim().length >= 10;
  const canProceedFromPhotos = damagePhotos.length > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create the damage report
      const report = await createReport.mutateAsync({
        booking_id: bookingId,
        reporter_role: reporterRole,
        description,
        date_noticed: dateNoticed,
        estimated_repair_cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      });

      setCreatedReportId(report.id);

      // Upload all photos
      const allPhotos = [
        ...damagePhotos.map((p) => ({ ...p, type: "damage" as const })),
        ...beforePhotos.map((p) => ({ ...p, type: "before" as const })),
        ...afterPhotos.map((p) => ({ ...p, type: "after" as const })),
      ];

      for (const photo of allPhotos) {
        await uploadEvidence.mutateAsync({
          damageReportId: report.id,
          file: photo.file,
          imageType: photo.type,
          caption: photo.caption,
        });
      }

      setStep("complete");
    } catch (error) {
      console.error("Failed to submit damage report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={i <= currentStepIndex ? "text-primary font-medium" : "text-muted-foreground"}
            >
              {s.label}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      {step === "description" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Describe the Damage
            </CardTitle>
            <CardDescription>
              Provide details about the damage you're reporting
              {vehicleInfo && (
                <span className="block mt-1 font-medium text-foreground">
                  {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                Damage Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the damage in detail. Include location on the vehicle, size/extent, and any relevant circumstances..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters ({description.length}/10)
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateNoticed" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  When did you notice this?
                </Label>
                <Input
                  id="dateNoticed"
                  type="datetime-local"
                  value={dateNoticed}
                  onChange={(e) => setDateNoticed(e.target.value)}
                />
              </div>

              {reporterRole === "owner" && (
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Repair Cost</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="estimatedCost"
                      type="number"
                      placeholder="0.00"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      className="pl-7"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep("photos")}
                disabled={!canProceedFromDescription}
              >
                Continue to Photos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "photos" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Upload Photos
            </CardTitle>
            <CardDescription>
              Clear photos help us review and resolve your report faster
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DamageEvidenceUpload
              imageType="damage"
              onFilesSelected={setDamagePhotos}
              maxFiles={10}
              required
            />

            {reporterRole === "owner" && (
              <>
                <div className="border-t pt-6">
                  <DamageEvidenceUpload
                    imageType="before"
                    onFilesSelected={setBeforePhotos}
                    maxFiles={5}
                  />
                </div>
                <div className="border-t pt-6">
                  <DamageEvidenceUpload
                    imageType="after"
                    onFilesSelected={setAfterPhotos}
                    maxFiles={5}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("description")}>
                Back
              </Button>
              <Button
                onClick={() => setStep("review")}
                disabled={!canProceedFromPhotos}
              >
                Review Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Report</CardTitle>
            <CardDescription>
              Please review the details before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                <p className="mt-1">{description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Date Noticed</h4>
                  <p className="mt-1">{format(new Date(dateNoticed), "PPp")}</p>
                </div>
                {estimatedCost && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Estimated Cost</h4>
                    <p className="mt-1">${parseFloat(estimatedCost).toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Photos</h4>
                <p className="mt-1 text-sm">
                  {damagePhotos.length} damage photo{damagePhotos.length !== 1 ? "s" : ""}
                  {beforePhotos.length > 0 && `, ${beforePhotos.length} before`}
                  {afterPhotos.length > 0 && `, ${afterPhotos.length} after`}
                </p>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="py-3 text-sm">
                <p className="font-medium">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                  <li>Your report will be reviewed by our team</li>
                  <li>The owner's payout will be held pending resolution</li>
                  <li>We may contact you for additional information</li>
                  <li>You'll be notified of the resolution via email</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("photos")}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "complete" && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Report Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your report. Our team will review it and get back to you shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {createdReportId && (
                <Button onClick={() => navigate(`/damage/${createdReportId}/status`)}>
                  View Report Status
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate(-1)}>
                Return to Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
