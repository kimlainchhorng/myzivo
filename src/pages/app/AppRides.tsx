/**
 * App Rides Screen
 * MVP flow: Request ride -> Select option -> Confirm -> Submitted
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, Car, Clock, Users, Shield, Star, CheckCircle2, 
  ChevronRight, ArrowRight, Phone, Mail, User
} from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RideStep = "request" | "options" | "confirm" | "submitted";

const rideOptions = [
  { id: "standard", name: "Standard", icon: "🚗", price: "~$15-20", eta: "4 min", seats: 4, description: "Affordable everyday rides" },
  { id: "xl", name: "XL", icon: "🚙", price: "~$25-35", eta: "6 min", seats: 6, description: "Extra space for groups" },
  { id: "premium", name: "Premium", icon: "🚘", price: "~$40-55", eta: "8 min", seats: 4, description: "High-end vehicles" },
];

const AppRides = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<RideStep>("request");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFindRides = () => {
    if (pickup && dropoff) {
      setStep("options");
    }
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.phone) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep("submitted");
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setStep("request");
    setPickup("");
    setDropoff("");
    setSelectedOption("");
    setContactInfo({ name: "", phone: "", email: "", notes: "" });
  };

  return (
    <AppLayout 
      title="Rides" 
      showBack={step !== "request"} 
      onBack={() => {
        if (step === "options") setStep("request");
        else if (step === "confirm") setStep("options");
        else if (step === "submitted") handleReset();
      }}
    >
      <div className="p-4 space-y-4">
        {/* Step: Request */}
        {step === "request" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero */}
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">Request a Ride</h1>
              <p className="text-muted-foreground text-sm">
                Enter your pickup and drop-off locations
              </p>
            </div>

            {/* Location Inputs */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                <Input
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-eats rounded-full" />
                <Input
                  placeholder="Drop-off location"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-40 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Map view coming soon</p>
              </div>
            </div>

            <Button
              onClick={handleFindRides}
              disabled={!pickup || !dropoff}
              className="w-full h-12 rounded-xl font-bold gap-2 bg-rides hover:bg-rides/90"
            >
              Find Rides
              <ArrowRight className="w-5 h-5" />
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: Clock, label: "Quick Response" },
                { icon: Shield, label: "Safe & Reliable" },
                { icon: Star, label: "Top Rated" },
              ].map((feature) => (
                <div key={feature.label} className="text-center p-3 rounded-xl bg-muted/30">
                  <feature.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-[10px] text-muted-foreground">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Options */}
        {step === "options" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="flex-1 truncate">{pickup}</span>
              </div>
              <div className="w-px h-3 bg-border ml-1 my-1" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-eats rounded-full" />
                <span className="flex-1 truncate">{dropoff}</span>
              </div>
            </div>

            <h2 className="font-display font-bold text-lg">Choose your ride</h2>

            <div className="space-y-3">
              {rideOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-4 text-left touch-manipulation active:scale-[0.99] transition-transform hover:border-primary/30"
                >
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{option.name}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />{option.seats}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {option.eta} away
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{option.price}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl">
                  {rideOptions.find(o => o.id === selectedOption)?.icon}
                </div>
                <div>
                  <h3 className="font-bold">{rideOptions.find(o => o.id === selectedOption)?.name}</h3>
                  <p className="text-sm text-muted-foreground">{rideOptions.find(o => o.id === selectedOption)?.price}</p>
                </div>
              </div>
            </div>

            <h2 className="font-display font-bold text-lg">Contact Information</h2>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm">Email (optional)</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests..."
                  value={contactInfo.notes}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!contactInfo.name || !contactInfo.phone || isSubmitting}
              className="w-full h-12 rounded-xl font-bold gap-2 bg-rides hover:bg-rides/90"
            >
              {isSubmitting ? "Submitting..." : "Request Ride"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By requesting, you agree to our Terms of Service.
            </p>
          </div>
        )}

        {/* Step: Submitted */}
        {step === "submitted" && (
          <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Request Received!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Request received. We'll confirm availability shortly.
              </p>
            </div>
            <div className="py-4 px-6 rounded-2xl bg-muted/30 border border-border/50 max-w-sm mx-auto">
              <p className="text-sm text-muted-foreground mb-2">What happens next?</p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  We'll match you with a driver
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  You'll receive a confirmation call/text
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Pay your driver directly
                </li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={handleReset}
              className="rounded-xl"
            >
              Request Another Ride
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppRides;
