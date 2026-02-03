/**
 * Fleet Owner Onboarding
 * Multi-step form to apply for fleet account
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  MapPin,
  FileText,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateFleetProfile } from "@/hooks/useFleetManagement";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Contact", icon: User },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Review", icon: FileText },
];

const businessTypes = [
  { value: "sole_proprietor", label: "Sole Proprietor" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
];

export default function FleetOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const createFleet = useCreateFleetProfile();

  const [form, setForm] = useState({
    business_name: "",
    business_type: "llc" as const,
    tax_id: "",
    business_license: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.business_name && form.business_type;
      case 2:
        return form.contact_name && form.contact_email;
      case 3:
        return form.city && form.state;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    await createFleet.mutateAsync(form);
    navigate("/fleet/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Become a Fleet Owner</h1>
            <p className="text-sm text-muted-foreground">
              Step {step} of {steps.length}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => {
            const isActive = s.id === step;
            const isCompleted = s.id < step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-2 hidden md:block",
                      isActive ? "font-medium" : "text-muted-foreground"
                    )}
                  >
                    {s.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Business Information"}
              {step === 2 && "Contact Details"}
              {step === 3 && "Business Location"}
              {step === 4 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your rental business"}
              {step === 2 && "How can we reach you?"}
              {step === 3 && "Where is your business located?"}
              {step === 4 && "Review your application before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Business Info */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    placeholder="Your Company Name"
                    value={form.business_name}
                    onChange={(e) => updateForm("business_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Type *</Label>
                  <Select
                    value={form.business_type}
                    onValueChange={(v) => updateForm("business_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">Tax ID / EIN</Label>
                    <Input
                      id="tax_id"
                      placeholder="XX-XXXXXXX"
                      value={form.tax_id}
                      onChange={(e) => updateForm("tax_id", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_license">Business License</Label>
                    <Input
                      id="business_license"
                      placeholder="License number"
                      value={form.business_license}
                      onChange={(e) => updateForm("business_license", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    placeholder="Full name"
                    value={form.contact_name}
                    onChange={(e) => updateForm("contact_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email Address *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.contact_email}
                    onChange={(e) => updateForm("contact_email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={form.contact_phone}
                    onChange={(e) => updateForm("contact_phone", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St"
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      value={form.state}
                      onChange={(e) => updateForm("state", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    placeholder="12345"
                    value={form.zip_code}
                    onChange={(e) => updateForm("zip_code", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Name</span>
                    <span className="font-medium">{form.business_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Type</span>
                    <span className="font-medium capitalize">
                      {form.business_type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-medium">{form.contact_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{form.contact_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">
                      {form.city}, {form.state}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                  <p className="text-amber-700 dark:text-amber-400">
                    Your application will be reviewed within 1-2 business days.
                    You'll receive an email notification once approved.
                  </p>
                </div>

                <div className="text-xs text-muted-foreground">
                  By submitting, you agree that fleet owners operate independently
                  and are responsible for their vehicles. ZIVO facilitates booking,
                  payment, and logistics and earns a service commission.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createFleet.isPending}
            >
              {createFleet.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Submit Application
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
