/**
 * App Move Screen
 * Package Delivery MVP flow: Request → Quote → Payment → Success
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Package, MapPin, Clock, Shield, Star, CheckCircle2, 
  ChevronRight, ArrowRight, Phone, Mail, User, CreditCard, Loader2,
  Scale, Truck, Zap
} from "lucide-react";
import ZivoSuperAppLayout from "@/components/app/ZivoSuperAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type MoveStep = "request" | "options" | "confirm" | "processing" | "success";

interface DeliveryOption {
  id: string;
  name: string;
  icon: typeof Package;
  description: string;
  basePrice: number;
  eta: string;
}

const deliveryOptions: DeliveryOption[] = [
  { 
    id: "express", 
    name: "Express", 
    icon: Zap, 
    description: "Same-day delivery", 
    basePrice: 15.99, 
    eta: "2-4 hours" 
  },
  { 
    id: "standard", 
    name: "Standard", 
    icon: Truck, 
    description: "Next-day delivery", 
    basePrice: 9.99, 
    eta: "12-24 hours" 
  },
  { 
    id: "economy", 
    name: "Economy", 
    icon: Package, 
    description: "2-3 day delivery", 
    basePrice: 5.99, 
    eta: "2-3 days" 
  },
];

const packageSizes = [
  { id: "small", name: "Small", description: "Envelope or small box", multiplier: 1.0 },
  { id: "medium", name: "Medium", description: "Shoebox size", multiplier: 1.5 },
  { id: "large", name: "Large", description: "Moving box", multiplier: 2.0 },
  { id: "xlarge", name: "XL", description: "Furniture piece", multiplier: 3.0 },
];

const AppMove = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<MoveStep>("request");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(null);
  const [selectedSize, setSelectedSize] = useState("small");
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", notes: "" });
  const [recipientInfo, setRecipientInfo] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  // Check for success return from Stripe
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const reqId = searchParams.get("request_id");
    if (sessionId && reqId) {
      setRequestId(reqId);
      setStep("success");
    }
    
    if (searchParams.get("cancelled")) {
      toast.error("Payment was cancelled");
    }
  }, [searchParams]);

  const getPrice = (option: DeliveryOption) => {
    const sizeMultiplier = packageSizes.find(s => s.id === selectedSize)?.multiplier || 1;
    return (option.basePrice * sizeMultiplier).toFixed(2);
  };

  const handleFindOptions = () => {
    if (pickup && dropoff) {
      setStep("options");
    }
  };

  const handleSelectOption = (option: DeliveryOption) => {
    setSelectedOption(option);
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.phone || !recipientInfo.name || !recipientInfo.phone || !selectedOption) return;
    
    setStep("processing");
    setIsSubmitting(true);

    try {
      const totalPrice = parseFloat(getPrice(selectedOption));

      const { data, error } = await supabase.functions.invoke("create-move-checkout", {
        body: {
          sender_name: contactInfo.name,
          sender_phone: contactInfo.phone,
          sender_email: contactInfo.email || undefined,
          recipient_name: recipientInfo.name,
          recipient_phone: recipientInfo.phone,
          pickup_address: pickup,
          dropoff_address: dropoff,
          delivery_type: selectedOption.id,
          package_size: selectedSize,
          notes: contactInfo.notes || undefined,
          total_price: totalPrice,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to start payment. Please try again.");
      setStep("confirm");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("request");
    setPickup("");
    setDropoff("");
    setSelectedOption(null);
    setSelectedSize("small");
    setContactInfo({ name: "", phone: "", email: "", notes: "" });
    setRecipientInfo({ name: "", phone: "" });
    setRequestId(null);
    navigate("/move", { replace: true });
  };

  return (
    <ZivoSuperAppLayout 
      title="Move" 
      showBack={step !== "request" && step !== "success"} 
      onBack={() => {
        if (step === "options") setStep("request");
        else if (step === "confirm") setStep("options");
        else if (step === "processing") setStep("confirm");
      }}
    >
      {/* Hero Section - only show on request step */}
      {step === "request" && (
        <div className="relative h-32 bg-gradient-to-br from-amber-500 to-orange-600 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-16 h-16 text-white/20" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <h1 className="text-white font-bold text-xl">Send a Package</h1>
            <p className="text-white/80 text-sm">Fast, reliable delivery</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Step: Request */}
        {step === "request" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500 rounded-full" />
                <Input
                  placeholder="Pickup address"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
                <Input
                  placeholder="Delivery address"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Package Size */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Package Size</Label>
              <div className="grid grid-cols-4 gap-2">
                {packageSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={cn(
                      "p-3 rounded-xl border text-center touch-manipulation transition-all",
                      selectedSize === size.id 
                        ? "border-amber-500 bg-amber-500/10 text-amber-700" 
                        : "border-border bg-card"
                    )}
                  >
                    <Scale className={cn(
                      "w-5 h-5 mx-auto mb-1",
                      selectedSize === size.id ? "text-amber-500" : "text-muted-foreground"
                    )} />
                    <span className="text-xs font-medium block">{size.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleFindOptions}
              disabled={!pickup || !dropoff}
              className="w-full h-12 rounded-xl font-bold gap-2 bg-amber-500 hover:bg-amber-600"
            >
              Get Quote
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: Shield, label: "Insured" },
                { icon: Clock, label: "Tracked" },
                { icon: Star, label: "Rated" },
              ].map((feature) => (
                <div key={feature.label} className="text-center p-3 rounded-xl bg-muted/30">
                  <feature.icon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
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
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="flex-1 truncate">{pickup}</span>
              </div>
              <div className="w-px h-3 bg-border ml-1 my-1" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="flex-1 truncate">{dropoff}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <span>Size: {packageSizes.find(s => s.id === selectedSize)?.name}</span>
              </div>
            </div>

            <h2 className="font-display font-bold text-lg">Choose delivery speed</h2>

            <div className="space-y-3">
              {deliveryOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-4 text-left touch-manipulation active:scale-[0.99] transition-transform hover:border-amber-500/30"
                >
                  <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <option.icon className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{option.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {option.eta}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">${getPrice(option)}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && selectedOption && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <selectedOption.icon className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{selectedOption.name} Delivery</h3>
                  <p className="text-sm text-muted-foreground">{selectedOption.eta}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-amber-600">
                    ${getPrice(selectedOption)}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="font-display font-bold text-lg">Sender Information</h2>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm">Your Name *</Label>
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
                <Label htmlFor="phone" className="text-sm">Your Phone *</Label>
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
                <Label htmlFor="email" className="text-sm">Email (for tracking)</Label>
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
            </div>

            <h2 className="font-display font-bold text-lg pt-2">Recipient Information</h2>

            <div className="space-y-3">
              <div>
                <Label htmlFor="recipientName" className="text-sm">Recipient Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recipientName"
                    placeholder="Recipient name"
                    value={recipientInfo.name}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recipientPhone" className="text-sm">Recipient Phone *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recipientPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={recipientInfo.phone}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">Package Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Fragile, handle with care..."
                  value={contactInfo.notes}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!contactInfo.name || !contactInfo.phone || !recipientInfo.name || !recipientInfo.phone || isSubmitting}
              className="w-full h-12 rounded-xl font-bold gap-2 bg-amber-500 hover:bg-amber-600"
            >
              <CreditCard className="w-5 h-5" />
              Pay ${getPrice(selectedOption)} & Send
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment via Stripe. Package is insured up to $100.
            </p>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="py-20 text-center space-y-6 animate-in fade-in duration-200">
            <Loader2 className="w-12 h-12 mx-auto text-amber-500 animate-spin" />
            <div>
              <h2 className="font-display text-xl font-bold mb-2">Redirecting to Payment...</h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we set up your secure checkout.
              </p>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-amber-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Package Scheduled!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Your delivery has been confirmed. We'll notify you when a driver picks it up.
              </p>
            </div>
            {requestId && (
              <div className="py-3 px-4 rounded-xl bg-muted/30 border border-border/50 inline-block">
                <p className="text-xs text-muted-foreground mb-1">Tracking ID</p>
                <p className="font-mono font-bold text-sm">{requestId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}
            <div className="py-4 px-6 rounded-2xl bg-muted/30 border border-border/50 max-w-sm mx-auto text-left">
              <p className="text-sm text-muted-foreground mb-2">What's next:</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Driver will pick up your package
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Live tracking via SMS
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Photo proof of delivery
                </li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={handleReset}
              className="rounded-xl"
            >
              Send Another Package
            </Button>
          </div>
        )}
      </div>
    </ZivoSuperAppLayout>
  );
};

export default AppMove;
