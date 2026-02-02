/**
 * Owner Application Page
 * Multi-step wizard for becoming a car host
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useCarOwnerProfile, useCreateOwnerProfile, useUploadOwnerDocument, useOwnerDocuments } from "@/hooks/useCarOwner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, ArrowRight, Loader2, User, FileText, CheckCircle, Shield, AlertCircle, Sparkles, Car
} from "lucide-react";
import { toast } from "sonner";
import ZivoLogo from "@/components/ZivoLogo";
import OwnerDocumentUpload from "@/components/owner/OwnerDocumentUpload";
import type { CarOwnerInsuranceOption, CarOwnerDocumentType } from "@/types/p2p";

// Calculate age from date
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Step 1: Personal Information
const personalInfoSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  date_of_birth: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && calculateAge(date) >= 21;
  }, "You must be at least 21 years old"),
  address: z.string().trim().min(5, "Please enter your street address"),
  city: z.string().trim().min(2, "Please enter your city"),
  state: z.string().length(2, "Please enter 2-letter state code (e.g., CA)"),
  zip_code: z.string().regex(/^\d{5}$/, "Please enter a valid 5-digit ZIP code"),
});

// Step 2: Verification
const verificationSchema = z.object({
  ssn_last_four: z.string().length(4, "Enter last 4 digits of SSN").regex(/^\d{4}$/, "Must be 4 digits"),
  insurance_option: z.enum(["platform", "own", "none"] as const),
});

type PersonalInfo = z.infer<typeof personalInfoSchema>;
type VerificationInfo = z.infer<typeof verificationSchema>;

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function OwnerApply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<CarOwnerDocumentType | null>(null);
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);

  const { data: existingProfile, isLoading: loadingProfile } = useCarOwnerProfile();
  const { data: documents = [] } = useOwnerDocuments(createdProfileId || existingProfile?.id);
  const createProfile = useCreateOwnerProfile();
  const uploadDocument = useUploadOwnerDocument();

  // Redirect if user already has a profile
  useEffect(() => {
    if (existingProfile) {
      navigate("/owner/dashboard");
    }
  }, [existingProfile, navigate]);

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: "",
      email: user?.email || "",
      phone: "",
      date_of_birth: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
    },
  });

  const verificationForm = useForm<VerificationInfo>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      ssn_last_four: "",
      insurance_option: "platform",
    },
  });

  const handlePersonalSubmit = (data: PersonalInfo) => {
    setPersonalInfo(data);
    setStep(2);
  };

  const handleVerificationSubmit = async (data: VerificationInfo) => {
    if (!personalInfo) return;
    
    setVerificationInfo(data);
    
    try {
      const profile = await createProfile.mutateAsync({
        full_name: personalInfo.full_name,
        email: personalInfo.email,
        phone: personalInfo.phone,
        date_of_birth: personalInfo.date_of_birth,
        address: personalInfo.address,
        city: personalInfo.city,
        state: personalInfo.state,
        zip_code: personalInfo.zip_code,
        ssn_last_four: data.ssn_last_four,
        insurance_option: data.insurance_option as CarOwnerInsuranceOption,
      });
      
      setCreatedProfileId(profile.id);
      setStep(3);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDocumentUpload = async (type: CarOwnerDocumentType, file: File) => {
    const profileId = createdProfileId || existingProfile?.id;
    if (!profileId) {
      toast.error("Please complete the previous steps first");
      return;
    }

    setUploadingDoc(type);
    try {
      await uploadDocument.mutateAsync({
        ownerId: profileId,
        documentType: type,
        file,
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleComplete = () => {
    setStep(4);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to be logged in to become a host</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
            <Button onClick={() => navigate("/login", { state: { from: { pathname: "/owner/apply" } } })}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-6 sm:py-8 px-4 safe-area-top safe-area-bottom">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/12 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-bl from-primary/20 to-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-tr from-violet-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <Button 
            variant="ghost" 
            onClick={() => step === 1 ? navigate("/list-your-car") : setStep(step - 1)} 
            className="mb-3 sm:mb-4 rounded-xl hover:bg-primary/10"
            disabled={createProfile.isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? "Back" : "Previous"}
          </Button>
          
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <ZivoLogo size="sm" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
                Become a Host
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">Start earning with your car</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Step {step} of 4</span>
              <span className="font-semibold text-primary">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {[
              { icon: User, label: "Personal" },
              { icon: Shield, label: "Verify" },
              { icon: FileText, label: "Documents" },
              { icon: CheckCircle, label: "Complete" },
            ].map((s, i) => (
              <div key={i} className={`flex flex-col items-center gap-1 ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  i + 1 < step ? "bg-primary border-primary text-primary-foreground" :
                  i + 1 === step ? "border-primary" : "border-muted"
                }`}>
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(handlePersonalSubmit)} className="space-y-4">
                  <FormField
                    control={personalForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Legal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={personalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={personalForm.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>You must be at least 21 years old</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField
                      control={personalForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Los Angeles" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="State" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {US_STATES.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="90001" maxLength={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Verification */}
        {step === 2 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verification Details
              </CardTitle>
              <CardDescription>Required for secure payments and identity verification</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...verificationForm}>
                <form onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)} className="space-y-6">
                  <FormField
                    control={verificationForm.control}
                    name="ssn_last_four"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last 4 Digits of SSN</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="XXXX" 
                            maxLength={4} 
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                              field.onChange(val);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Required for Stripe Connect payouts. Encrypted and secure.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={verificationForm.control}
                    name="insurance_option"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Option</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="platform" id="platform" className="mt-1" />
                              <Label htmlFor="platform" className="flex-1 cursor-pointer">
                                <div className="font-medium">Platform Insurance (Recommended)</div>
                                <div className="text-sm text-muted-foreground">
                                  ZIVO provides $1M liability coverage for all trips. No additional action required.
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="own" id="own" className="mt-1" />
                              <Label htmlFor="own" className="flex-1 cursor-pointer">
                                <div className="font-medium">Use My Own Insurance</div>
                                <div className="text-sm text-muted-foreground">
                                  You'll need to upload proof of commercial/rideshare coverage.
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="none" id="none" className="mt-1" />
                              <Label htmlFor="none" className="flex-1 cursor-pointer">
                                <div className="font-medium">Decline Insurance</div>
                                <div className="text-sm text-muted-foreground text-amber-600">
                                  Not recommended. You'll be responsible for any damages.
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createProfile.isPending}>
                    {createProfile.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>Upload required documents for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <OwnerDocumentUpload
                existingDocuments={documents}
                onUpload={handleDocumentUpload}
                uploading={uploadingDoc}
                showInsurance={verificationInfo?.insurance_option === "own"}
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleComplete()} className="flex-1">
                  Skip for Now
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription className="text-base">
                Thank you for applying to become a ZIVO host
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">1.</span>
                    Our team will review your application (typically 1-2 business days)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">2.</span>
                    You'll receive an email once your account is verified
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">3.</span>
                    After approval, you can add your first vehicle and start earning
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                  Return Home
                </Button>
                <Button onClick={() => navigate("/owner/dashboard")} className="flex-1">
                  <Car className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
