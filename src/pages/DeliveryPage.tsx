/**
 * DeliveryPage - Package delivery booking flow
 * Premium ZIVO super-app style with map, scheduling, and confirmation
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Package, Loader2, Clock, DollarSign, CreditCard, Shield, CheckCircle, Zap, Scale, Ruler, Box, Truck, Navigation, AlertTriangle, Calendar, Camera, PartyPopper, Phone, MessageSquare, Gift, Tag, Copy, Share2, Star, RefreshCw, Bell, Users, RotateCcw, Percent, ThumbsUp, Award, ChevronRight, History, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import RideMap from "@/components/maps/RideMap";

const packageSizes = [
  { id: "envelope", name: "Envelope", description: "Documents, letters", icon: "📄", maxWeight: "0.5 lb", price: 5.99 },
  { id: "small", name: "Small Box", description: "Books, small items", icon: "📦", maxWeight: "5 lbs", price: 8.99 },
  { id: "medium", name: "Medium Box", description: "Clothing, electronics", icon: "📦", maxWeight: "20 lbs", price: 14.99 },
  { id: "large", name: "Large Box", description: "Furniture, large boxes", icon: "📦", maxWeight: "50 lbs", price: 24.99 },
  { id: "custom", name: "Custom", description: "Oversized or unusual", icon: "📐", maxWeight: "100+ lbs", price: 39.99 },
];

const deliverySpeed = [
  { id: "standard", name: "Standard", time: "2-4 hours", multiplier: 1.0, badge: null, icon: Truck },
  { id: "express", name: "Express", time: "60-90 min", multiplier: 1.5, badge: "Fast", icon: Zap },
  { id: "rush", name: "Rush", time: "30-45 min", multiplier: 2.2, badge: "Fastest", icon: AlertTriangle },
  { id: "same-day", name: "Same Day", time: "By 9 PM", multiplier: 1.2, badge: "Value", icon: Clock },
];

const scheduleTimes = [
  { id: "now", label: "Now", description: "ASAP delivery" },
  { id: "today-2pm", label: "Today 2 PM", description: "Scheduled" },
  { id: "today-5pm", label: "Today 5 PM", description: "Scheduled" },
  { id: "tomorrow-9am", label: "Tomorrow 9 AM", description: "Next day" },
  { id: "tomorrow-2pm", label: "Tomorrow 2 PM", description: "Next day" },
];

const previousDeliveries = [
  { id: "pd1", from: "123 Main St", to: "456 Oak Ave", pkg: "Small Box", date: "3 days ago", price: "$12.48" },
  { id: "pd2", from: "Office", to: "Home", pkg: "Envelope", date: "Last week", price: "$5.99" },
];

// Live delivery tracking timeline
function DeliveryTrackingTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setActiveStep(1), 2000),
      setTimeout(() => setActiveStep(2), 5000),
      setTimeout(() => setActiveStep(3), 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: "Order confirmed", icon: CheckCircle, time: "Just now" },
    { label: "Finding courier", icon: Navigation, time: "~2 min" },
    { label: "Courier en route to pickup", icon: Truck, time: "~10 min" },
    { label: "Package picked up & delivering", icon: Package, time: "~30 min" },
  ];

  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isDone = i <= activeStep;
        const isActive = i === activeStep;
        return (
          <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            className={cn("flex items-center gap-3 p-2.5 rounded-xl", isDone ? "opacity-100" : "opacity-40")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              isDone ? "bg-violet-500/10" : "bg-muted/30")}>
              <Icon className={cn("w-4 h-4", isDone ? "text-violet-500" : "text-muted-foreground", isActive && "animate-pulse")} />
            </div>
            <div className="flex-1">
              <p className={cn("text-xs font-bold", isDone ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.time}</p>
            </div>
            {isDone && i < activeStep && <CheckCircle className="w-3.5 h-3.5 text-violet-500" />}
            {isActive && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </motion.div>
        );
      })}
    </div>
  );
}

// Courier preview card
function CourierPreviewCard() {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 3000); return () => clearTimeout(t); }, []);
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-violet-500/20 p-4 space-y-3 shadow-lg shadow-violet-500/10">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-lg font-bold text-violet-500">J</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Jamie R.</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.95 · 1,204 deliveries
          </div>
        </div>
        <span className="text-[10px] font-bold text-violet-500 bg-violet-500/10 px-2 py-1 rounded-full animate-pulse">Assigning...</span>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 p-2 rounded-lg bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground">On-time</p>
          <p className="text-xs font-bold text-foreground">98%</p>
        </div>
        <div className="flex-1 p-2 rounded-lg bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground">Careful</p>
          <p className="text-xs font-bold text-foreground flex items-center justify-center gap-0.5"><ThumbsUp className="w-3 h-3 text-emerald-500" /> 99%</p>
        </div>
      </div>
    </motion.div>
  );
}

// Price estimate preview
function PriceEstimate({ basePrice, speed, fragile, signature, insurance, packages, promo }: {
  basePrice: number; speed: number; fragile: boolean; signature: boolean; insurance: boolean; packages: number; promo: boolean;
}) {
  const total = (basePrice * packages * speed) + (fragile ? 2.99 : 0) + (signature ? 1.99 : 0) + (insurance ? 1.99 * packages : 0);
  const discount = promo ? total * 0.1 : 0;
  const final = total - discount;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-violet-500" />
        <span className="text-xs font-bold text-foreground">Estimated total</span>
      </div>
      <span className="text-base font-bold text-violet-500">${final.toFixed(2)}</span>
    </motion.div>
  );
}

export default function DeliveryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"address" | "package" | "review" | "confirmation">("address");

  // Address
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [notifyRecipient, setNotifyRecipient] = useState(true);
  const [showPreviousDeliveries, setShowPreviousDeliveries] = useState(false);

  // Package
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState("standard");
  const [packageDescription, setPackageDescription] = useState("");
  const [isFragile, setIsFragile] = useState(false);
  const [requireSignature, setRequireSignature] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("now");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [packageWeight, setPackageWeight] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [packageCount, setPackageCount] = useState(1);
  const [priorityHandling, setPriorityHandling] = useState(false);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [rateDelivery, setRateDelivery] = useState<number | null>(null);
  const trackingId = `ZD-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  const currentSize = packageSizes.find(s => s.id === selectedSize);
  const currentSpeed = deliverySpeed.find(s => s.id === selectedSpeed);
  const basePrice = (currentSize?.price ?? 0) * packageCount;
  const speedMultiplier = currentSpeed?.multiplier ?? 1;
  const fragileFee = isFragile ? 2.99 : 0;
  const signatureFee = requireSignature ? 1.99 : 0;
  const insuranceFee = includeInsurance ? 1.99 * packageCount : 0;
  const priorityFee = priorityHandling ? 4.99 : 0;
  const subtotal = basePrice * speedMultiplier + fragileFee + signatureFee + insuranceFee + priorityFee;
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.15 * 100) / 100 : 0;
  const totalPrice = Math.round((subtotal - promoDiscount) * 100) / 100;

  const steps = ["address", "package", "review"] as const;
  const stepLabels = ["Route", "Package", "Review"];
  const currentStepIndex = step === "confirmation" ? 3 : steps.indexOf(step as any);

  const handleBack = () => {
    if (step === "confirmation") navigate("/");
    else if (step === "review") setStep("package");
    else if (step === "package") setStep("address");
    else navigate(-1);
  };

  const handleContinueToPackage = () => {
    if (!pickupAddress.trim()) { toast.error("Enter pickup address"); return; }
    if (!dropoffAddress.trim()) { toast.error("Enter delivery address"); return; }
    if (!recipientName.trim()) { toast.error("Enter recipient name"); return; }
    if (!recipientPhone.trim()) { toast.error("Enter recipient phone"); return; }
    setStep("package");
  };

  const handleContinueToReview = () => {
    if (!selectedSize) { toast.error("Select a package size"); return; }
    setStep("review");
  };

  const handlePlaceOrder = () => {
    setStep("confirmation");
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "DELIVER15") {
      setPromoApplied(true);
      toast.success("15% off applied!");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingId);
    toast.success("Tracking ID copied!");
  };

  const handleShareTracking = () => {
    if (navigator.share) {
      navigator.share({ title: "ZIVO Delivery", text: `Track my package: ${trackingId}`, url: window.location.href });
    } else {
      handleCopyTracking();
    }
  };

  const handleLoadPrevious = (d: typeof previousDeliveries[0]) => {
    setPickupAddress(d.from);
    setDropoffAddress(d.to);
    toast.success("Previous route loaded");
  };

  const handlePhotoUpload = () => {
    setPhotoAdded(true);
    toast.success("Photo added to package");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map Preview */}
      {step === "address" && (
        <div className="relative h-[25vh] min-h-[180px]">
          <RideMap pickupCoords={null} dropoffCoords={null} className="w-full h-full" />
          <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-3 safe-area-top">
            <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack}
              className="h-10 px-4 rounded-full bg-card/90 backdrop-blur-lg border border-border/40 flex items-center gap-2 touch-manipulation text-sm font-medium text-foreground shadow-lg">
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Header */}
      {step !== "address" && step !== "confirmation" && (
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
          <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
            <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack}
              className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">Send a Package</h1>
                <p className="text-[10px] text-muted-foreground">Fast & reliable delivery</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      {step !== "confirmation" && (
        <div className="px-4 pt-4 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300",
                    i <= currentStepIndex
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20"
                      : "bg-muted/50 text-muted-foreground border border-border/40"
                  )}>
                    {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn("text-[10px] font-bold", i <= currentStepIndex ? "text-violet-500" : "text-muted-foreground/50")}>
                    {stepLabels[i]}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("h-[2px] flex-1 rounded-full transition-all duration-300 -mt-5", i < currentStepIndex ? "bg-violet-500" : "bg-border/40")} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 py-6 space-y-5 max-w-lg mx-auto w-full pb-28">
        <AnimatePresence mode="wait">
          {/* ADDRESS STEP */}
          {step === "address" && (
            <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 -mt-4">
              <h2 className="text-xl font-bold text-foreground">Where to deliver?</h2>

              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border-2 border-violet-500 bg-violet-500/20 shrink-0" />
                  <Input placeholder="Pickup address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} className="h-11 border-0 bg-transparent px-0 text-sm font-medium focus-visible:ring-0 shadow-none" />
                </div>
                <div className="ml-1.5 border-l-2 border-dashed border-border/40 h-3" />
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border-2 border-orange-500 bg-orange-500/20 shrink-0" />
                  <Input placeholder="Delivery address" value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} className="h-11 border-0 bg-transparent px-0 text-sm font-medium focus-visible:ring-0 shadow-none" />
                </div>
              </div>

              {/* Previous deliveries */}
              <div className="space-y-2">
                <button onClick={() => setShowPreviousDeliveries(!showPreviousDeliveries)}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all touch-manipulation">
                  <History className="w-3.5 h-3.5" /> Recent Deliveries
                  <ChevronRight className={cn("w-3 h-3 transition-transform", showPreviousDeliveries && "rotate-90")} />
                </button>
                <AnimatePresence>
                  {showPreviousDeliveries && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden">
                      {previousDeliveries.map(d => (
                        <button key={d.id} onClick={() => handleLoadPrevious(d)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30 hover:border-violet-500/20 transition-all touch-manipulation active:scale-[0.98] text-left">
                          <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{d.from} → {d.to}</p>
                            <p className="text-[10px] text-muted-foreground">{d.date} · {d.pkg}</p>
                          </div>
                          <span className="text-xs font-bold text-foreground shrink-0">{d.price}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Phone className="w-4 h-4 text-violet-500" /> Contact Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Sender name" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="h-12 rounded-xl" />
                  <Input placeholder="Sender phone" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="h-12 rounded-xl" type="tel" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Recipient name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="h-12 rounded-xl" />
                  <Input placeholder="Recipient phone" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="h-12 rounded-xl" type="tel" />
                </div>
              </div>

              {/* Notify recipient toggle */}
              <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                <button onClick={() => setNotifyRecipient(!notifyRecipient)}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", notifyRecipient ? "bg-violet-500" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", notifyRecipient ? "left-[18px]" : "left-0.5")} />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-violet-500" /> Notify recipient</p>
                  <p className="text-[10px] text-muted-foreground">Send SMS updates to recipient</p>
                </div>
              </div>

              <Button onClick={handleContinueToPackage} className="w-full h-14 text-base font-bold gap-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-500/90 hover:to-purple-600/90 text-white shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all" size="lg">
                Continue <Zap className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* PACKAGE STEP */}
          {step === "package" && (
            <motion.div key="package" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">Package Details</h2>

              {/* Package count */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Number of Packages</h3>
                    <p className="text-[10px] text-muted-foreground">Same size & destination</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPackageCount(Math.max(1, packageCount - 1))}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-bold touch-manipulation active:scale-90">−</button>
                    <span className="text-lg font-bold w-6 text-center">{packageCount}</span>
                    <button onClick={() => setPackageCount(Math.min(10, packageCount + 1))}
                      className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold touch-manipulation active:scale-90">+</button>
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Box className="w-4 h-4 text-violet-500" /> Package Size</h3>
                {packageSizes.map((size, i) => (
                  <motion.button key={size.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedSize(size.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all touch-manipulation active:scale-[0.98]",
                      selectedSize === size.id ? "border-violet-500 bg-violet-500/5 shadow-sm shadow-violet-500/10" : "border-border/40 bg-card hover:border-violet-500/20"
                    )}>
                    <span className="text-2xl">{size.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-sm text-foreground">{size.name}</p>
                      <p className="text-xs text-muted-foreground">{size.description} · Up to {size.maxWeight}</p>
                    </div>
                    <span className={cn("font-bold", selectedSize === size.id ? "text-violet-500" : "text-foreground")}>${size.price.toFixed(2)}{packageCount > 1 && <span className="text-[10px] text-muted-foreground"> ×{packageCount}</span>}</span>
                  </motion.button>
                ))}
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-violet-500" /> Delivery Speed</h3>
                <div className="grid grid-cols-2 gap-2">
                  {deliverySpeed.map(speed => {
                    const Icon = speed.icon;
                    return (
                      <button key={speed.id} onClick={() => setSelectedSpeed(speed.id)}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all touch-manipulation active:scale-95",
                          selectedSpeed === speed.id ? "border-violet-500 bg-violet-500/5" : "border-border/40 bg-card hover:border-violet-500/20"
                        )}>
                        <Icon className={cn("w-4 h-4 mx-auto mb-1", selectedSpeed === speed.id ? "text-violet-500" : "text-muted-foreground")} />
                        <p className="font-bold text-xs text-foreground">{speed.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{speed.time}</p>
                        {speed.badge && <span className="text-[9px] font-bold text-violet-500 mt-1 inline-block">{speed.badge}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-violet-500" /> Schedule Delivery</h3>
                <div className="grid grid-cols-2 gap-2">
                  {scheduleTimes.map(time => (
                    <button key={time.id} onClick={() => setScheduledTime(time.id)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all touch-manipulation active:scale-95",
                        scheduledTime === time.id ? "border-violet-500 bg-violet-500/5" : "border-border/40 bg-card hover:border-violet-500/20"
                      )}>
                      <p className="font-bold text-xs text-foreground">{time.label}</p>
                      <p className="text-[10px] text-muted-foreground">{time.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special handling toggles */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-violet-500" /> Special Handling</h3>
                <div className="flex gap-2">
                  <button onClick={() => setIsFragile(!isFragile)}
                    className={cn(
                      "flex-1 flex items-center gap-2 p-3 rounded-xl border transition-all touch-manipulation active:scale-95",
                      isFragile ? "border-amber-500 bg-amber-500/5" : "border-border/40 bg-card"
                    )}>
                    <AlertTriangle className={cn("w-4 h-4", isFragile ? "text-amber-500" : "text-muted-foreground")} />
                    <div className="text-left">
                      <p className="font-bold text-xs">Fragile</p>
                      <p className="text-[10px] text-muted-foreground">+$2.99</p>
                    </div>
                  </button>
                  <button onClick={() => setRequireSignature(!requireSignature)}
                    className={cn(
                      "flex-1 flex items-center gap-2 p-3 rounded-xl border transition-all touch-manipulation active:scale-95",
                      requireSignature ? "border-violet-500 bg-violet-500/5" : "border-border/40 bg-card"
                    )}>
                    <CheckCircle className={cn("w-4 h-4", requireSignature ? "text-violet-500" : "text-muted-foreground")} />
                    <div className="text-left">
                      <p className="font-bold text-xs">Signature</p>
                      <p className="text-[10px] text-muted-foreground">+$1.99</p>
                    </div>
                  </button>
                </div>
                {/* Priority handling */}
                <button onClick={() => setPriorityHandling(!priorityHandling)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all touch-manipulation active:scale-95",
                    priorityHandling ? "border-violet-500 bg-violet-500/5" : "border-border/40 bg-card"
                  )}>
                  <Award className={cn("w-4 h-4", priorityHandling ? "text-violet-500" : "text-muted-foreground")} />
                  <div className="text-left flex-1">
                    <p className="font-bold text-xs">Priority Handling</p>
                    <p className="text-[10px] text-muted-foreground">Dedicated courier, real-time updates · +$4.99</p>
                  </div>
                  <div className={cn("w-10 h-6 rounded-full transition-all relative", priorityHandling ? "bg-violet-500" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", priorityHandling ? "left-[18px]" : "left-0.5")} />
                  </div>
                </button>
              </div>

              {/* Description, weight, photo, note */}
              <div className="space-y-3">
                <Input placeholder="What's inside? (optional)" value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} className="h-12 rounded-xl" />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Weight (lbs)" type="number" value={packageWeight} onChange={(e) => setPackageWeight(e.target.value)} className="h-12 rounded-xl pl-10" />
                  </div>
                  <button onClick={handlePhotoUpload}
                    className={cn("h-12 px-4 rounded-xl border flex items-center gap-2 text-xs font-medium touch-manipulation active:scale-95 transition-all",
                      photoAdded ? "border-violet-500 bg-violet-500/5 text-violet-500" : "border-dashed border-border/60 bg-card text-muted-foreground hover:border-violet-500/40 hover:text-violet-500"
                    )}>
                    <Camera className="w-4 h-4" /> {photoAdded ? "Photo ✓" : "Add Photo"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Delivery instructions (e.g., leave at door)" value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} className="h-10 rounded-xl text-sm" />
                </div>
              </div>

              {/* Insurance toggle */}
              <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                <button onClick={() => setIncludeInsurance(!includeInsurance)}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", includeInsurance ? "bg-violet-500" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", includeInsurance ? "left-[18px]" : "left-0.5")} />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-violet-500" /> Package Insurance</p>
                  <p className="text-[10px] text-muted-foreground">Cover up to $500 for +$1.99{packageCount > 1 ? `/pkg` : ""}</p>
                </div>
              </div>

              {/* Live price estimate */}
              {selectedSize && (
                <PriceEstimate basePrice={currentSize?.price ?? 0} speed={speedMultiplier} fragile={isFragile} signature={requireSignature} insurance={includeInsurance} packages={packageCount} promo={promoApplied} />
              )}

              <Button onClick={handleContinueToReview} disabled={!selectedSize} className="w-full h-14 text-base font-bold gap-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-500/90 hover:to-purple-600/90 text-white shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all" size="lg">
                Review Order <Zap className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* REVIEW STEP */}
          {step === "review" && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">Review & Confirm</h2>

              {/* Route */}
              <div className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-3 h-3 rounded-full bg-violet-500 shadow-sm" />
                    <div className="w-0.5 h-10 bg-gradient-to-b from-violet-500/40 to-orange-500/40" />
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Pickup</p>
                      <p className="text-sm font-bold text-foreground truncate">{pickupAddress}</p>
                      {senderName && <p className="text-xs text-muted-foreground">{senderName}{senderPhone ? ` · ${senderPhone}` : ""}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Delivery</p>
                      <p className="text-sm font-bold text-foreground truncate">{dropoffAddress}</p>
                      {recipientName && <p className="text-xs text-muted-foreground">{recipientName} · {recipientPhone}</p>}
                    </div>
                  </div>
                </div>
                {notifyRecipient && (
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-xs text-violet-500">
                    <Bell className="w-3 h-3" /> Recipient will receive SMS updates
                  </div>
                )}
              </div>

              {/* Package info */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentSize?.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{currentSize?.name}{packageCount > 1 ? ` × ${packageCount}` : ""}</p>
                    <p className="text-xs text-muted-foreground">{currentSize?.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-violet-500" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{currentSpeed?.name} Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      {scheduledTime === "now" ? `Est. ${currentSpeed?.time}` : scheduleTimes.find(t => t.id === scheduledTime)?.label}
                    </p>
                  </div>
                </div>
                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  {isFragile && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Fragile
                    </span>
                  )}
                  {requireSignature && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Signature
                    </span>
                  )}
                  {priorityHandling && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-full">
                      <Award className="w-3 h-3" /> Priority
                    </span>
                  )}
                  {photoAdded && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-full">
                      <Camera className="w-3 h-3" /> Photo
                    </span>
                  )}
                  {deliveryNote && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                      <MessageSquare className="w-3 h-3" /> Note
                    </span>
                  )}
                  {packageCount > 1 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-full">
                      <Package className="w-3 h-3" /> {packageCount} packages
                    </span>
                  )}
                </div>
              </div>

              {/* Promo code */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Gift className="w-3 h-3" /> Promo Code
                </h3>
                <div className="flex gap-2">
                  <Input placeholder="Enter code (try DELIVER15)" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied} className="h-10 rounded-xl flex-1 text-sm" />
                  <Button variant={promoApplied ? "outline" : "default"} size="sm" onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode.trim()} className="rounded-xl h-10 px-4 text-xs font-bold">
                    {promoApplied ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Applied</> : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Base price ({currentSize?.name}{packageCount > 1 ? ` ×${packageCount}` : ""})</span><span className="font-bold">${basePrice.toFixed(2)}</span></div>
                {speedMultiplier !== 1 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">{currentSpeed?.name} speed ({speedMultiplier}x)</span><span className="font-bold">${(basePrice * speedMultiplier - basePrice).toFixed(2)}</span></div>
                )}
                {fragileFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Fragile handling</span><span className="font-bold">${fragileFee.toFixed(2)}</span></div>}
                {signatureFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Signature required</span><span className="font-bold">${signatureFee.toFixed(2)}</span></div>}
                {includeInsurance && <div className="flex justify-between"><span className="text-muted-foreground">Insurance{packageCount > 1 ? ` (×${packageCount})` : ""}</span><span className="font-bold">${insuranceFee.toFixed(2)}</span></div>}
                {priorityFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Priority handling</span><span className="font-bold">${priorityFee.toFixed(2)}</span></div>}
                {promoDiscount > 0 && <div className="flex justify-between text-violet-500"><span className="font-bold flex items-center gap-1"><Tag className="w-3 h-3" /> DELIVER15</span><span className="font-bold">-${promoDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between pt-3 border-t border-border/30">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-xl text-violet-500">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Shield className="w-3.5 h-3.5 text-violet-500/60" />
                <span>{includeInsurance ? "Package insured up to $500" : "No insurance"} · Secured by ZIVO</span>
              </div>

              <Button onClick={handlePlaceOrder} className="w-full h-14 text-base font-bold gap-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-500/90 hover:to-purple-600/90 text-white shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all" size="lg">
                <CheckCircle className="w-5 h-5" /> Confirm Delivery · ${totalPrice.toFixed(2)}
              </Button>
            </motion.div>
          )}

          {/* CONFIRMATION */}
          {step === "confirmation" && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="max-w-md w-full text-center space-y-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/30">
                  <PartyPopper className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Delivery Confirmed! 📦</h1>
                  <p className="text-muted-foreground">A courier will be assigned shortly.</p>
                  <button onClick={handleCopyTracking}
                    className="text-xs font-mono text-violet-500/80 mt-2 bg-violet-500/5 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 hover:bg-violet-500/10 transition-all touch-manipulation">
                    Tracking: {trackingId} <Copy className="w-3 h-3" />
                  </button>
                </motion.div>

                {/* Live tracking */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="rounded-2xl bg-card border border-border/40 p-4 text-left">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Navigation className="w-4 h-4 text-violet-500" /> Live Tracking</h3>
                  <DeliveryTrackingTimeline />
                </motion.div>

                {/* Courier preview */}
                <CourierPreviewCard />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="rounded-2xl bg-card border border-border/40 p-5 text-left space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><Package className="w-5 h-5 text-violet-500" /></div>
                    <div><p className="text-xs text-muted-foreground">{currentSize?.name}{packageCount > 1 ? ` × ${packageCount}` : ""}</p><p className="text-sm font-bold text-foreground">{packageDescription || "Package delivery"}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center"><Navigation className="w-5 h-5 text-orange-500" /></div>
                    <div><p className="text-xs text-muted-foreground">To</p><p className="text-sm font-bold text-foreground truncate">{recipientName} · {dropoffAddress}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-emerald-500" /></div>
                    <div><p className="text-xs text-muted-foreground">Total</p><p className="text-sm font-bold text-violet-500">${totalPrice.toFixed(2)}</p></div>
                  </div>
                  {notifyRecipient && (
                    <div className="pt-2 border-t border-border/30 flex items-center gap-2 text-xs text-violet-500">
                      <Bell className="w-3 h-3" /> Recipient notified via SMS
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Photo proof of delivery will appear here</span>
                    </div>
                  </div>
                </motion.div>

                {/* Rate delivery */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  className="rounded-2xl bg-card border border-border/40 p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Rate this delivery</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => { setRateDelivery(s); toast.success(`Rated ${s} stars!`); }}
                        className="touch-manipulation active:scale-90 transition-transform">
                        <Star className={cn("w-8 h-8 transition-all", rateDelivery && s <= rateDelivery ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3">
                  <Button variant="outline" onClick={handleShareTracking} className="flex-1 h-12 rounded-xl font-bold gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                  <Button onClick={() => navigate("/")} className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-2">
                    <Navigation className="w-4 h-4" /> Track Live
                  </Button>
                </motion.div>
                <Button variant="ghost" onClick={() => navigate("/")} className="text-sm text-muted-foreground">
                  Back to Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step !== "confirmation" && <ZivoMobileNav />}
    </div>
  );
}
