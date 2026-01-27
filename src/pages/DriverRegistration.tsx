import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  User, 
  Car, 
  FileText, 
  CheckCircle,
  Upload,
  X,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import ZivoLogo from "@/components/ZivoLogo";

const personalInfoSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  license_number: z.string().trim().min(5, "Please enter a valid license number").max(50),
});

const vehicleInfoSchema = z.object({
  vehicle_type: z.enum(["economy", "comfort", "premium", "xl"], {
    required_error: "Please select a vehicle type",
  }),
  vehicle_model: z.string().trim().min(2, "Please enter your vehicle model").max(100),
  vehicle_plate: z.string().trim().min(2, "Please enter your license plate").max(20),
});

type PersonalInfo = z.infer<typeof personalInfoSchema>;
type VehicleInfo = z.infer<typeof vehicleInfoSchema>;

type DocumentType = "license" | "insurance" | "registration" | "profile_photo";

interface UploadedDocument {
  type: DocumentType;
  file: File;
  preview?: string;
}

const requiredDocuments: { type: DocumentType; label: string; description: string }[] = [
  { type: "license", label: "Driver's License", description: "Front of your valid driver's license" },
  { type: "insurance", label: "Vehicle Insurance", description: "Proof of vehicle insurance" },
  { type: "registration", label: "Vehicle Registration", description: "Vehicle registration document" },
  { type: "profile_photo", label: "Profile Photo", description: "Clear photo of yourself" },
];

const DriverRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: "",
      email: user?.email || "",
      phone: "",
      license_number: "",
    },
  });

  const vehicleForm = useForm<VehicleInfo>({
    resolver: zodResolver(vehicleInfoSchema),
    defaultValues: {
      vehicle_type: undefined,
      vehicle_model: "",
      vehicle_plate: "",
    },
  });

  const handlePersonalSubmit = (data: PersonalInfo) => {
    setPersonalInfo(data);
    setStep(2);
  };

  const handleVehicleSubmit = (data: VehicleInfo) => {
    setVehicleInfo(data);
    setStep(3);
  };

  const handleDocumentUpload = async (type: DocumentType, file: File) => {
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WebP, or PDF file");
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    // Update documents list
    setDocuments(prev => {
      const filtered = prev.filter(d => d.type !== type);
      return [...filtered, { type, file, preview }];
    });
  };

  const removeDocument = (type: DocumentType) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.type === type);
      if (doc?.preview) {
        URL.revokeObjectURL(doc.preview);
      }
      return prev.filter(d => d.type !== type);
    });
  };

  const handleFinalSubmit = async () => {
    if (!user || !personalInfo || !vehicleInfo) {
      toast.error("Please complete all steps");
      return;
    }

    if (documents.length < requiredDocuments.length) {
      toast.error("Please upload all required documents");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create driver record
      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .insert({
          user_id: user.id,
          full_name: personalInfo.full_name,
          email: personalInfo.email,
          phone: personalInfo.phone,
          license_number: personalInfo.license_number,
          vehicle_type: vehicleInfo.vehicle_type,
          vehicle_model: vehicleInfo.vehicle_model,
          vehicle_plate: vehicleInfo.vehicle_plate,
          status: "pending",
          documents_verified: false,
        })
        .select()
        .single();

      if (driverError) throw driverError;

      // 2. Upload documents to storage
      for (const doc of documents) {
        setUploadingDoc(doc.type);
        
        const fileExt = doc.file.name.split(".").pop();
        const filePath = `${user.id}/${doc.type}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("driver-documents")
          .upload(filePath, doc.file);

        if (uploadError) throw uploadError;

        // 3. Create document record
        const { error: docError } = await supabase
          .from("driver_documents")
          .insert({
            driver_id: driver.id,
            document_type: doc.type,
            file_name: doc.file.name,
            file_path: filePath,
            file_size: doc.file.size,
            mime_type: doc.file.type,
            status: "pending",
          });

        if (docError) throw docError;
      }

      setUploadingDoc(null);
      setStep(4);
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
      setUploadingDoc(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to be logged in to register as a driver</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-8 px-4">
      {/* Enhanced Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/12 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/20 to-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-emerald-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Floating emojis */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-32 right-[10%] text-5xl hidden lg:block opacity-30 pointer-events-none"
      >
        🚗
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-32 left-[8%] text-4xl hidden lg:block opacity-25 pointer-events-none"
      >
        🔑
      </motion.div>
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => step === 1 ? navigate("/") : setStep(step - 1)} className="mb-4 rounded-xl hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? "Home" : "Back"}
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <ZivoLogo size="sm" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-2">
                Become a Driver
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Sparkles className="h-6 w-6 text-primary" />
                </motion.div>
              </h1>
              <p className="text-muted-foreground">Complete your application to start earning</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Step {step} of 4</span>
              <span className="font-semibold text-primary">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {[
              { icon: User, label: "Personal" },
              { icon: Car, label: "Vehicle" },
              { icon: FileText, label: "Documents" },
              { icon: CheckCircle, label: "Complete" },
            ].map((s, i) => (
              <div key={i} className={`flex flex-col items-center gap-1 ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  i + 1 < step ? "bg-primary border-primary text-primary-foreground" :
                  i + 1 === step ? "border-primary" : "border-muted"
                }`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-xs hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <Card>
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
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <FormField
                    control={personalForm.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver's License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="DL123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Vehicle Info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Information
              </CardTitle>
              <CardDescription>Tell us about your vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...vehicleForm}>
                <form onSubmit={vehicleForm.handleSubmit(handleVehicleSubmit)} className="space-y-4">
                  <FormField
                    control={vehicleForm.control}
                    name="vehicle_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="economy">Economy - Standard sedan (4 passengers)</SelectItem>
                            <SelectItem value="comfort">Comfort - Mid-size sedan with extra legroom</SelectItem>
                            <SelectItem value="premium">Premium - Luxury vehicles</SelectItem>
                            <SelectItem value="xl">XL - SUV or minivan (6 passengers)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose the category that best fits your vehicle</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vehicleForm.control}
                    name="vehicle_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Make & Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Toyota Camry 2022" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vehicleForm.control}
                    name="vehicle_plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>Upload the required documents for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredDocuments.map((docType) => {
                const uploaded = documents.find(d => d.type === docType.type);
                const isUploading = uploadingDoc === docType.type;

                return (
                  <div key={docType.type} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{docType.label}</h4>
                        <p className="text-sm text-muted-foreground">{docType.description}</p>
                      </div>
                      
                      {uploaded ? (
                        <div className="flex items-center gap-2">
                          {uploaded.preview && (
                            <img 
                              src={uploaded.preview} 
                              alt={docType.label}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Uploaded
                            </p>
                            <button
                              type="button"
                              onClick={() => removeDocument(docType.type)}
                              className="text-xs text-muted-foreground hover:text-destructive"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload(docType.type, file);
                            }}
                            disabled={isUploading}
                          />
                          <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:border-primary hover:bg-muted/50 transition-colors">
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-sm">Upload</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={handleFinalSubmit}
                  disabled={documents.length < requiredDocuments.length || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                {documents.length < requiredDocuments.length && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Please upload all {requiredDocuments.length} required documents
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription className="text-base">
                Thank you for applying to become a driver. We'll review your documents and get back to you within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    Our team will review your documents
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    You'll receive an email once approved
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    Download the driver app and start earning!
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                  Go Home
                </Button>
                <Button className="flex-1" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverRegistration;
