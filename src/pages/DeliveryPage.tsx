/**
 * DeliveryPage - Package delivery booking flow
 * Premium ZIVO super-app style with map, scheduling, and confirmation
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Package, Loader2, Clock, DollarSign, CreditCard, Shield, CheckCircle, Zap, Scale, Ruler, Box, Truck, Navigation, AlertTriangle, Calendar, Camera, PartyPopper, Phone, MessageSquare } from "lucide-react";
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
];

const deliverySpeed = [
  { id: "standard", name: "Standard", time: "2-4 hours", multiplier: 1.0, badge: null, icon: Truck },
  { id: "express", name: "Express", time: "60-90 min", multiplier: 1.5, badge: "Fast", icon: Zap },
  { id: "rush", name: "Rush", time: "30-45 min", multiplier: 2.2, badge: "Fastest", icon: AlertTriangle },
];

const scheduleTimes = [
  { id: "now", label: "Now", description: "ASAP delivery" },
  { id: "today-2pm", label: "Today 2 PM", description: "Scheduled" },
  { id: "today-5pm", label: "Today 5 PM", description: "Scheduled" },
  { id: "tomorrow-9am", label: "Tomorrow 9 AM", description: "Next day" },
];

export default function DeliveryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"address" | "package" | "review" | "confirmation">("address");

  // Address
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  // Package
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState("standard");
  const [packageDescription, setPackageDescription] = useState("");
  const [isFragile, setIsFragile] = useState(false);
  const [requireSignature, setRequireSignature] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("now");
  const [deliveryNote, setDeliveryNote] = useState("");

  const currentSize = packageSizes.find(s => s.id === selectedSize);
  const currentSpeed = deliverySpeed.find(s => s.id === selectedSpeed);
  const basePrice = currentSize?.price ?? 0;
  const speedMultiplier = currentSpeed?.multiplier ?? 1;
  const fragileFee = isFragile ? 2.99 : 0;
  const signatureFee = requireSignature ? 1.99 : 0;
  const totalPrice = basePrice * speedMultiplier + fragileFee + signatureFee;
  const insuranceFee = 1.99;

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map Preview (visible during address step) */}
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

      {/* Header (for non-address steps) */}
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

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Phone className="w-4 h-4 text-violet-500" /> Contact Details</h3>
                <Input placeholder="Sender name" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="h-12 rounded-xl" />
                <Input placeholder="Recipient name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="h-12 rounded-xl" />
                <Input placeholder="Recipient phone" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="h-12 rounded-xl" type="tel" />
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
                    <span className={cn("font-bold", selectedSize === size.id ? "text-violet-500" : "text-foreground")}>${size.price.toFixed(2)}</span>
                  </motion.button>
                ))}
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-violet-500" /> Delivery Speed</h3>
                <div className="flex gap-2">
                  {deliverySpeed.map(speed => {
                    const Icon = speed.icon;
                    return (
                      <button key={speed.id} onClick={() => setSelectedSpeed(speed.id)}
                        className={cn(
                          "flex-1 p-3 rounded-xl border text-center transition-all touch-manipulation active:scale-95",
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
              </div>

              {/* Description + delivery note */}
              <div className="space-y-3">
                <Input placeholder="What's inside? (optional)" value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} className="h-12 rounded-xl" />
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Delivery instructions (e.g., leave at door)" value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} className="h-10 rounded-xl text-sm" />
                </div>
              </div>

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
                      {senderName && <p className="text-xs text-muted-foreground">{senderName}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Delivery</p>
                      <p className="text-sm font-bold text-foreground truncate">{dropoffAddress}</p>
                      {recipientName && <p className="text-xs text-muted-foreground">{recipientName} · {recipientPhone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package info */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentSize?.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{currentSize?.name}</p>
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
                {/* Special handling badges */}
                <div className="flex gap-2 flex-wrap">
                  {isFragile && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Fragile
                    </span>
                  )}
                  {requireSignature && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Signature Required
                    </span>
                  )}
                  {deliveryNote && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                      <MessageSquare className="w-3 h-3" /> Note added
                    </span>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Base price ({currentSize?.name})</span><span className="font-bold">${basePrice.toFixed(2)}</span></div>
                {speedMultiplier !== 1 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">{currentSpeed?.name} speed ({speedMultiplier}x)</span><span className="font-bold">${(basePrice * speedMultiplier - basePrice).toFixed(2)}</span></div>
                )}
                {fragileFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Fragile handling</span><span className="font-bold">${fragileFee.toFixed(2)}</span></div>}
                {signatureFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Signature required</span><span className="font-bold">${signatureFee.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span className="font-bold">${insuranceFee.toFixed(2)}</span></div>
                <div className="flex justify-between pt-3 border-t border-border/30">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-xl text-violet-500">${(totalPrice + insuranceFee).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Shield className="w-3.5 h-3.5 text-violet-500/60" />
                <span>Package insured up to $500 · Secured by ZIVO</span>
              </div>

              <Button onClick={handlePlaceOrder} className="w-full h-14 text-base font-bold gap-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-500/90 hover:to-purple-600/90 text-white shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all" size="lg">
                <CheckCircle className="w-5 h-5" /> Confirm Delivery · ${(totalPrice + insuranceFee).toFixed(2)}
              </Button>
            </motion.div>
          )}

          {/* CONFIRMATION */}
          {step === "confirmation" && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center min-h-[60vh]">
              <div className="max-w-md w-full text-center space-y-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/30">
                  <PartyPopper className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Delivery Confirmed!</h1>
                  <p className="text-muted-foreground">A courier will be assigned shortly. Track your package in real-time.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="rounded-2xl bg-card border border-border/40 p-5 text-left space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><Package className="w-5 h-5 text-violet-500" /></div>
                    <div><p className="text-xs text-muted-foreground">{currentSize?.name} Package</p><p className="text-sm font-bold text-foreground">{packageDescription || "Package delivery"}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center"><Navigation className="w-5 h-5 text-orange-500" /></div>
                    <div><p className="text-xs text-muted-foreground">To</p><p className="text-sm font-bold text-foreground truncate">{recipientName} · {dropoffAddress}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-emerald-500" /></div>
                    <div><p className="text-xs text-muted-foreground">Total</p><p className="text-sm font-bold text-violet-500">${(totalPrice + insuranceFee).toFixed(2)}</p></div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate("/")} className="flex-1 h-12 rounded-xl font-bold">Back to Home</Button>
                  <Button onClick={() => navigate("/")} className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                    Track Package
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step !== "confirmation" && <ZivoMobileNav />}
    </div>
  );
}
