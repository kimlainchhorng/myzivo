import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  ShieldCheck, 
  ShieldPlus, 
  Heart, 
  Plane, 
  Briefcase, 
  AlertTriangle,
  CheckCircle2,
  X,
  Info,
  Clock,
  DollarSign,
  FileText,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InsurancePlan {
  id: string;
  name: string;
  icon: typeof Shield;
  price: number;
  pricePerDay: number;
  color: string;
  badge?: string;
  coverage: {
    tripCancellation: number;
    medicalExpenses: number;
    baggageLoss: number;
    flightDelay: number;
    missedConnection: number;
  };
  features: string[];
  excluded: string[];
}

interface TravelInsuranceSelectorProps {
  tripDuration: number;
  tripCost: number;
  passengers: number;
  onSelect: (plan: InsurancePlan | null, addons: string[]) => void;
  selectedPlan?: string;
}

const insurancePlans: InsurancePlan[] = [
  {
    id: "basic",
    name: "Basic Protection",
    icon: Shield,
    price: 29,
    pricePerDay: 4.14,
    color: "from-slate-500 to-slate-600",
    coverage: {
      tripCancellation: 1000,
      medicalExpenses: 10000,
      baggageLoss: 500,
      flightDelay: 100,
      missedConnection: 200,
    },
    features: [
      "Trip cancellation coverage",
      "Emergency medical expenses",
      "24/7 assistance hotline",
      "Basic baggage protection",
    ],
    excluded: [
      "Pre-existing conditions",
      "Adventure sports",
      "Cancel for any reason",
    ],
  },
  {
    id: "standard",
    name: "Standard Coverage",
    icon: ShieldCheck,
    price: 59,
    pricePerDay: 8.43,
    color: "from-sky-500 to-blue-600",
    badge: "Popular",
    coverage: {
      tripCancellation: 5000,
      medicalExpenses: 50000,
      baggageLoss: 1500,
      flightDelay: 300,
      missedConnection: 500,
    },
    features: [
      "Enhanced trip cancellation",
      "Comprehensive medical coverage",
      "24/7 priority assistance",
      "Full baggage protection",
      "Flight delay compensation",
      "Missed connection coverage",
    ],
    excluded: [
      "Pre-existing conditions",
      "Extreme sports",
    ],
  },
  {
    id: "premium",
    name: "Premium Shield",
    icon: ShieldPlus,
    price: 99,
    pricePerDay: 14.14,
    color: "from-amber-500 to-orange-600",
    badge: "Best Value",
    coverage: {
      tripCancellation: 10000,
      medicalExpenses: 100000,
      baggageLoss: 3000,
      flightDelay: 500,
      missedConnection: 1000,
    },
    features: [
      "Cancel for any reason (75% refund)",
      "Unlimited medical coverage",
      "Concierge assistance",
      "Premium baggage protection",
      "Flight delay from 2 hours",
      "Missed connection full coverage",
      "Pre-existing conditions included",
      "Adventure sports coverage",
    ],
    excluded: [],
  },
];

const addons = [
  { id: "rental_car", name: "Rental Car Damage", price: 15, icon: "car" },
  { id: "electronics", name: "Electronics Protection", price: 25, icon: "smartphone" },
  { id: "sports", name: "Adventure Sports", price: 35, icon: "mountain-snow" },
  { id: "pet", name: "Pet Care Coverage", price: 20, icon: "dog" },
];

const TravelInsuranceSelector = ({
  tripDuration,
  tripCost,
  passengers,
  onSelect,
  selectedPlan: initialPlan,
}: TravelInsuranceSelectorProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(initialPlan || null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  const getPlan = (id: string) => insurancePlans.find((p) => p.id === id);
  const currentPlan = selectedPlan ? getPlan(selectedPlan) : null;

  const calculateTotal = () => {
    let total = 0;
    if (currentPlan) {
      total += currentPlan.price * passengers;
    }
    selectedAddons.forEach((addonId) => {
      const addon = addons.find((a) => a.id === addonId);
      if (addon) total += addon.price * passengers;
    });
    return total;
  };

  const handlePlanSelect = (planId: string) => {
    const newPlan = planId === selectedPlan ? null : planId;
    setSelectedPlan(newPlan);
    onSelect(newPlan ? getPlan(newPlan)! : null, selectedAddons);
  };

  const handleAddonToggle = (addonId: string) => {
    const newAddons = selectedAddons.includes(addonId)
      ? selectedAddons.filter((id) => id !== addonId)
      : [...selectedAddons, addonId];
    setSelectedAddons(newAddons);
    onSelect(currentPlan, newAddons);
  };

  const coverageComparison = [
    { label: "Trip Cancellation", key: "tripCancellation", icon: X },
    { label: "Medical Expenses", key: "medicalExpenses", icon: Heart },
    { label: "Baggage Loss", key: "baggageLoss", icon: Briefcase },
    { label: "Flight Delay", key: "flightDelay", icon: Clock },
    { label: "Missed Connection", key: "missedConnection", icon: Plane },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Travel Insurance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Protect your trip for {tripDuration} days • {passengers} passenger{passengers > 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              How Claims Work
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Instant Claims Process</DialogTitle>
              <DialogDescription>
                Get your claims processed within 24-48 hours
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Submit Online</p>
                  <p className="text-sm text-muted-foreground">
                    File your claim through our app or website with supporting documents
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Quick Review</p>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your claim within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Get Paid</p>
                  <p className="text-sm text-muted-foreground">
                    Approved claims are paid directly to your account
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>24/7 Emergency Line: +1-800-ZIVO-SOS</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan Selection */}
      <RadioGroup value={selectedPlan || ""} className="grid gap-4 md:grid-cols-3">
        {insurancePlans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:shadow-md border-muted"
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.badge && (
                  <Badge className={`absolute top-3 right-3 bg-gradient-to-r ${plan.color}`}>
                    {plan.badge}
                  </Badge>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                        <Label htmlFor={plan.id} className="font-semibold cursor-pointer">
                          {plan.name}
                        </Label>
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/person</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <p className="text-xs text-muted-foreground pl-5">
                        +{plan.features.length - 4} more benefits
                      </p>
                    )}
                  </div>

                  {plan.excluded.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Not covered: {plan.excluded.slice(0, 2).join(", ")}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </RadioGroup>

      {/* No Insurance Option */}
      <Button
        variant={selectedPlan === null ? "default" : "outline"}
        className="w-full"
        onClick={() => {
          setSelectedPlan(null);
          setSelectedAddons([]);
          onSelect(null, []);
        }}
      >
        <X className="h-4 w-4 mr-2" />
        Continue without insurance
      </Button>

      {/* Coverage Comparison */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Coverage Limits
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? "Hide" : "Show"} Details
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {coverageComparison.map((item) => {
                    const Icon = item.icon;
                    const value = currentPlan?.coverage[item.key as keyof typeof currentPlan.coverage] || 0;
                    return (
                      <TooltipProvider key={item.key}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center p-3 rounded-xl bg-muted/50 cursor-help">
                              <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{item.label}</p>
                              <p className="font-bold text-lg">${value.toLocaleString()}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Maximum coverage for {item.label.toLowerCase()}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>

                {showDetails && currentPlan && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 rounded-xl bg-muted/30"
                  >
                    <h4 className="font-medium mb-3">What's Covered</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {currentPlan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    {currentPlan.excluded.length > 0 && (
                      <>
                        <h4 className="font-medium mt-4 mb-3">What's Not Covered</h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {currentPlan.excluded.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <X className="h-4 w-4 text-red-400" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add-ons */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldPlus className="h-4 w-4 text-primary" />
                  Optional Add-ons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {addons.map((addon) => {
                    const isAddonSelected = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isAddonSelected
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/30"
                        }`}
                        onClick={() => handleAddonToggle(addon.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isAddonSelected}
                            className="pointer-events-none"
                          />
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Info className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{addon.name}</span>
                        </div>
                        <span className="font-semibold">+${addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Insurance Total</p>
                    <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentPlan?.name} × {passengers} passenger{passengers > 1 ? "s" : ""}
                      {selectedAddons.length > 0 && ` + ${selectedAddons.length} add-on${selectedAddons.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Protected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TravelInsuranceSelector;
export type { InsurancePlan };
