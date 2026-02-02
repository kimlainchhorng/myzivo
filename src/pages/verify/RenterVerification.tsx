/**
 * Renter Verification Page
 * Multi-step wizard for driver license verification
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, differenceInYears } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  User,
  FileImage,
  Camera,
  CheckCircle,
  Loader2,
  Shield,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRenterProfile, useCreateRenterProfile } from "@/hooks/useRenterVerification";
import RenterDocumentUpload from "@/components/verify/RenterDocumentUpload";
import { US_STATES } from "@/types/renter";
import type { RenterDocument } from "@/types/renter";

// Validation schema for driver info
const driverInfoSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  date_of_birth: z.string().refine((val) => {
    const age = differenceInYears(new Date(), parseISO(val));
    return age >= 21;
  }, "You must be at least 21 years old"),
  license_number: z.string().min(4, "Invalid license number").max(20),
  license_state: z.string().length(2, "Please select a state"),
  license_expiration: z.string().refine((val) => {
    return new Date(val) > new Date();
  }, "License must not be expired"),
});

type DriverInfoForm = z.infer<typeof driverInfoSchema>;

const STEPS = [
  { id: 1, title: "Driver Information", icon: User },
  { id: 2, title: "License Upload", icon: FileImage },
  { id: 3, title: "Selfie Verification", icon: Camera },
  { id: 4, title: "Complete", icon: CheckCircle },
];

export default function RenterVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: existingProfile, isLoading: loadingProfile } = useRenterProfile();
  const createProfile = useCreateRenterProfile();

  const [step, setStep] = useState(1);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<{
    license_front?: RenterDocument;
    license_back?: RenterDocument;
    selfie?: RenterDocument;
  }>({});

  const form = useForm<DriverInfoForm>({
    resolver: zodResolver(driverInfoSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      license_number: "",
      license_state: "",
      license_expiration: "",
    },
  });

  // If already verified, redirect to status
  useEffect(() => {
    if (existingProfile?.verification_status === "approved") {
      navigate("/verify/status");
    } else if (existingProfile) {
      // Pre-fill form with existing data
      setProfileId(existingProfile.id);
      form.reset({
        full_name: existingProfile.full_name || "",
        date_of_birth: existingProfile.date_of_birth || "",
        license_number: existingProfile.license_number || "",
        license_state: existingProfile.license_state || "",
        license_expiration: existingProfile.license_expiration || "",
      });
    }
  }, [existingProfile, navigate, form]);

  const handleStep1Submit = async (data: DriverInfoForm) => {
    if (!profileId) {
      try {
        const profile = await createProfile.mutateAsync(data);
        setProfileId(profile.id);
        setStep(2);
      } catch {
        // Error handled by hook
      }
    } else {
      setStep(2);
    }
  };

  const handleDocumentUploaded = (type: "license_front" | "license_back" | "selfie") => (doc: RenterDocument) => {
    setUploadedDocs((prev) => ({ ...prev, [type]: doc }));
  };

  const canProceedFromStep2 = uploadedDocs.license_front && uploadedDocs.license_back;
  const canProceedFromStep3 = uploadedDocs.selfie;

  const progress = (step / STEPS.length) * 100;

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Driver Verification | ZIVO"
        description="Verify your driver's license to book cars on ZIVO P2P Car Rental"
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Driver Verification</h1>
            <p className="text-muted-foreground">
              Complete verification to start booking cars
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-3">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    step >= s.id ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      step >= s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {step > s.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Driver Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Driver Information</CardTitle>
                <CardDescription>
                  Enter your details exactly as they appear on your license
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Legal Name</Label>
                    <Input
                      id="full_name"
                      placeholder="John Doe"
                      {...form.register("full_name")}
                    />
                    {form.formState.errors.full_name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      {...form.register("date_of_birth")}
                    />
                    {form.formState.errors.date_of_birth && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.date_of_birth.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_number">Driver License Number</Label>
                    <Input
                      id="license_number"
                      placeholder="DL123456789"
                      {...form.register("license_number")}
                    />
                    {form.formState.errors.license_number && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.license_number.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>License State</Label>
                    <Select
                      value={form.watch("license_state")}
                      onValueChange={(v) => form.setValue("license_state", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.license_state && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.license_state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_expiration">License Expiration Date</Label>
                    <Input
                      id="license_expiration"
                      type="date"
                      {...form.register("license_expiration")}
                    />
                    {form.formState.errors.license_expiration && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.license_expiration.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createProfile.isPending}
                  >
                    {createProfile.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: License Upload */}
          {step === 2 && profileId && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Driver's License</CardTitle>
                <CardDescription>
                  Upload clear photos of the front and back of your license
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RenterDocumentUpload
                  renterId={profileId}
                  documentType="license_front"
                  label="License Front"
                  description="Photo of the front of your driver's license"
                  existingDocument={uploadedDocs.license_front}
                  onUploaded={handleDocumentUploaded("license_front")}
                />

                <RenterDocumentUpload
                  renterId={profileId}
                  documentType="license_back"
                  label="License Back"
                  description="Photo of the back of your driver's license"
                  existingDocument={uploadedDocs.license_back}
                  onUploaded={handleDocumentUploaded("license_back")}
                />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedFromStep2}
                    className="flex-1"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Selfie */}
          {step === 3 && profileId && (
            <Card>
              <CardHeader>
                <CardTitle>Selfie Verification</CardTitle>
                <CardDescription>
                  Take a selfie to verify your identity matches your license
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium">Tips for a good selfie:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Face the camera directly</li>
                    <li>Ensure good lighting</li>
                    <li>Remove hats or sunglasses</li>
                    <li>Keep a neutral expression</li>
                  </ul>
                </div>

                <RenterDocumentUpload
                  renterId={profileId}
                  documentType="selfie"
                  label="Selfie Photo"
                  description="Take a clear photo of your face"
                  existingDocument={uploadedDocs.selfie}
                  onUploaded={handleDocumentUploaded("selfie")}
                />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!canProceedFromStep3}
                    className="flex-1"
                  >
                    Submit
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verification Submitted!</h2>
                <p className="text-muted-foreground mb-6">
                  Your documents are being reviewed. This usually takes 1-2 business hours.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => navigate("/verify/status")} className="w-full">
                    Check Status
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/p2p/search")} className="w-full">
                    Browse Cars
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
