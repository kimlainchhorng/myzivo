import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Hotel, 
  Car, 
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Globe,
  Mountain,
  Palmtree,
  Landmark,
  Heart,
  Baby,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TripPlannerWizardProps {
  className?: string;
}

const destinations = [
  { id: "paris", name: "Paris", icon: Globe, popular: true },
  { id: "tokyo", name: "Tokyo", icon: Globe, popular: true },
  { id: "nyc", name: "New York", icon: Landmark, popular: true },
  { id: "bali", name: "Bali", icon: Palmtree, popular: false },
  { id: "dubai", name: "Dubai", icon: Globe, popular: false },
  { id: "rome", name: "Rome", icon: Landmark, popular: false },
];

const tripTypes = [
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "relaxation", label: "Relaxation", icon: Palmtree },
  { id: "cultural", label: "Cultural", icon: Landmark },
  { id: "romantic", label: "Romantic", icon: Heart },
  { id: "family", label: "Family", icon: Baby },
  { id: "business", label: "Business", icon: Briefcase },
];

const TripPlannerWizard = ({ className }: TripPlannerWizardProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedTripType, setSelectedTripType] = useState<string | null>(null);
  const [services, setServices] = useState({
    flight: true,
    hotel: true,
    car: false,
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete wizard and navigate
      if (services.flight) {
        navigate("/book-flight");
      } else if (services.hotel) {
        navigate("/book-hotel");
      } else {
        navigate("/rent-car");
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleService = (service: keyof typeof services) => {
    setServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 via-teal-500/5 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Trip Planner</CardTitle>
              <p className="text-sm text-muted-foreground">Plan your perfect getaway</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Step {step}/{totalSteps}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1 mt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                i < step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {/* Step 1: Destination */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Where do you want to go?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {destinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => setSelectedDestination(dest.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    selectedDestination === dest.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <dest.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">{dest.name}</span>
                  {dest.popular && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-auto">
                      Popular
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Trip Type */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              What kind of trip?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tripTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedTripType(type.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    selectedTripType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <type.icon className="w-6 h-6 text-primary" />
                  <span className="font-medium text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              What do you need?
            </h3>
            <div className="space-y-2">
              {[
                { key: "flight" as const, icon: Plane, label: "Flight", color: "sky" },
                { key: "hotel" as const, icon: Hotel, label: "Hotel", color: "amber" },
                { key: "car" as const, icon: Car, label: "Car Rental", color: "emerald" },
              ].map((service) => (
                <button
                  key={service.key}
                  onClick={() => toggleService(service.key)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    services[service.key]
                      ? `border-${service.color}-500 bg-${service.color}-500/10`
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0",
                    services[service.key] ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}>
                    {services[service.key] && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className={cn(
                    "p-2 rounded-xl",
                    `bg-${service.color}-500/10`
                  )}>
                    <service.icon className={cn("w-5 h-5", `text-${service.color}-500`)} />
                  </div>
                  <span className="font-semibold">{service.label}</span>
                </button>
              ))}
            </div>

            {/* Bundle Savings */}
            {Object.values(services).filter(Boolean).length > 1 && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-teal-500/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    Bundle & save up to 25% on your trip!
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-teal-500"
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedDestination) ||
              (step === 2 && !selectedTripType) ||
              (step === 3 && !Object.values(services).some(Boolean))
            }
          >
            {step === totalSteps ? "Start Booking" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripPlannerWizard;
