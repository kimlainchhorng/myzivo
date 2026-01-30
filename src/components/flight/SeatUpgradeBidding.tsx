import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Armchair,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Crown,
  Zap,
  Timer,
  DollarSign,
  Users,
  ArrowUp,
  Trophy,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UpgradeOption {
  id: string;
  name: string;
  cabinClass: "premium_economy" | "business" | "first";
  originalPrice: number;
  minimumBid: number;
  suggestedBid: number;
  currentHighBid: number;
  bidders: number;
  successProbability: number;
  features: string[];
  icon: typeof Armchair;
  available: number;
}

interface ActiveBid {
  id: string;
  optionId: string;
  amount: number;
  status: "pending" | "winning" | "outbid" | "accepted" | "declined";
  placedAt: Date;
  expiresAt: Date;
}

interface SeatUpgradeBiddingProps {
  flightNumber: string;
  departureDate: Date;
  currentCabinClass: string;
  onBidPlaced?: (optionId: string, amount: number) => void;
  onBidAccepted?: (optionId: string) => void;
}

const upgradeOptions: UpgradeOption[] = [
  {
    id: "upgrade_pe",
    name: "Premium Economy",
    cabinClass: "premium_economy",
    originalPrice: 450,
    minimumBid: 150,
    suggestedBid: 220,
    currentHighBid: 195,
    bidders: 8,
    successProbability: 75,
    available: 4,
    features: ["Extra legroom", "Priority boarding", "Enhanced meals", "Power outlets"],
    icon: Armchair,
  },
  {
    id: "upgrade_biz",
    name: "Business Class",
    cabinClass: "business",
    originalPrice: 1800,
    minimumBid: 450,
    suggestedBid: 680,
    currentHighBid: 520,
    bidders: 12,
    successProbability: 45,
    available: 2,
    features: ["Lie-flat seat", "Lounge access", "Gourmet dining", "Amenity kit", "Priority everything"],
    icon: Crown,
  },
  {
    id: "upgrade_first",
    name: "First Class",
    cabinClass: "first",
    originalPrice: 4500,
    minimumBid: 1200,
    suggestedBid: 1800,
    currentHighBid: 1450,
    bidders: 5,
    successProbability: 25,
    available: 1,
    features: ["Private suite", "Onboard shower", "Dom Pérignon", "Caviar service", "Chauffeur transfer"],
    icon: Trophy,
  },
];

const SeatUpgradeBidding = ({
  flightNumber,
  departureDate,
  currentCabinClass,
  onBidPlaced,
  onBidAccepted,
}: SeatUpgradeBiddingProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Calculate time until bidding closes (24h before departure)
  useEffect(() => {
    const biddingCloses = new Date(departureDate);
    biddingCloses.setHours(biddingCloses.getHours() - 24);
    
    const updateTimer = () => {
      const now = new Date();
      const diff = biddingCloses.getTime() - now.getTime();
      setTimeRemaining(Math.max(0, diff));
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [departureDate]);

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleSelectOption = (option: UpgradeOption) => {
    setSelectedOption(option.id);
    setBidAmount(option.suggestedBid);
  };

  const getBidStatus = (amount: number, option: UpgradeOption) => {
    if (amount < option.minimumBid) return { status: "below", color: "text-red-500" };
    if (amount < option.currentHighBid) return { status: "low", color: "text-amber-500" };
    if (amount < option.suggestedBid) return { status: "competitive", color: "text-emerald-500" };
    return { status: "strong", color: "text-primary" };
  };

  const handlePlaceBid = () => {
    if (!selectedOption) return;
    
    const option = upgradeOptions.find((o) => o.id === selectedOption);
    if (!option || bidAmount < option.minimumBid) return;

    const newBid: ActiveBid = {
      id: `bid_${Date.now()}`,
      optionId: selectedOption,
      amount: bidAmount,
      status: bidAmount > option.currentHighBid ? "winning" : "pending",
      placedAt: new Date(),
      expiresAt: new Date(departureDate.getTime() - 24 * 60 * 60 * 1000),
    };

    setActiveBids((prev) => [...prev.filter((b) => b.optionId !== selectedOption), newBid]);
    setShowConfirmation(true);
    onBidPlaced?.(selectedOption, bidAmount);
    
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const getActiveBidForOption = (optionId: string) => {
    return activeBids.find((b) => b.optionId === optionId);
  };

  const selectedUpgrade = selectedOption
    ? upgradeOptions.find((o) => o.id === selectedOption)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Bid for an Upgrade
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Flight {flightNumber} • Currently in {currentCabinClass}
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 animate-pulse">
          <Timer className="h-3 w-3" />
          {formatTimeRemaining(timeRemaining)}
        </Badge>
      </div>

      {/* How it works */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">How Upgrade Bidding Works</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Place a bid below the retail price. If seats are available and your bid is competitive, 
                you'll receive confirmation 24 hours before departure. Only pay if upgraded!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <div className="grid gap-4">
        {upgradeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOption === option.id;
          const activeBid = getActiveBidForOption(option.id);
          const savings = Math.round(((option.originalPrice - option.suggestedBid) / option.originalPrice) * 100);

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:shadow-md hover:border-primary/30"
                } ${activeBid ? "border-emerald-500/50" : ""}`}
                onClick={() => handleSelectOption(option)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-xl ${
                        option.cabinClass === "first"
                          ? "bg-gradient-to-br from-amber-500/20 to-amber-600/20"
                          : option.cabinClass === "business"
                          ? "bg-gradient-to-br from-purple-500/20 to-purple-600/20"
                          : "bg-gradient-to-br from-blue-500/20 to-blue-600/20"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          option.cabinClass === "first"
                            ? "text-amber-500"
                            : option.cabinClass === "business"
                            ? "text-purple-500"
                            : "text-blue-500"
                        }`}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{option.name}</h3>
                          <Badge variant="secondary" className="text-[10px]">
                            {option.available} seat{option.available !== 1 && "s"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground line-through">
                            ${option.originalPrice}
                          </p>
                          <p className="font-bold text-lg">
                            ${option.suggestedBid}
                            <span className="text-xs text-emerald-500 ml-1">-{savings}%</span>
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {option.features.slice(0, 4).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-[10px]">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      {/* Bid Stats */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {option.bidders} bidders
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Min: ${option.minimumBid}
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          High: ${option.currentHighBid}
                        </span>
                      </div>

                      {/* Success Probability */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Success probability</span>
                          <span className="font-medium">{option.successProbability}%</span>
                        </div>
                        <Progress value={option.successProbability} className="h-1.5" />
                      </div>

                      {/* Active Bid Status */}
                      {activeBid && (
                        <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Your bid: ${activeBid.amount}
                            </span>
                            <Badge
                              variant={activeBid.status === "winning" ? "default" : "secondary"}
                              className="text-[10px]"
                            >
                              {activeBid.status === "winning" ? "Leading" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bid Placement Panel */}
      <AnimatePresence>
        {selectedUpgrade && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Place Your Bid for {selectedUpgrade.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bid Amount Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Your bid amount</span>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-24 h-8 text-right font-bold"
                        min={selectedUpgrade.minimumBid}
                        max={selectedUpgrade.originalPrice}
                      />
                    </div>
                  </div>
                  <Slider
                    value={[bidAmount]}
                    onValueChange={([value]) => setBidAmount(value)}
                    min={selectedUpgrade.minimumBid}
                    max={selectedUpgrade.originalPrice}
                    step={10}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: ${selectedUpgrade.minimumBid}</span>
                    <span>Suggested: ${selectedUpgrade.suggestedBid}</span>
                    <span>Retail: ${selectedUpgrade.originalPrice}</span>
                  </div>
                </div>

                {/* Bid Status Indicator */}
                {(() => {
                  const status = getBidStatus(bidAmount, selectedUpgrade);
                  return (
                    <div className={`p-3 rounded-lg border ${status.color} bg-opacity-10`}>
                      <div className="flex items-center gap-2">
                        {status.status === "below" && <AlertCircle className="h-4 w-4 text-red-500" />}
                        {status.status === "low" && <Clock className="h-4 w-4 text-amber-500" />}
                        {status.status === "competitive" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                        {status.status === "strong" && <Star className="h-4 w-4 text-primary" />}
                        <span className="text-sm font-medium">
                          {status.status === "below" && "Below minimum bid"}
                          {status.status === "low" && "Below current high bid"}
                          {status.status === "competitive" && "Competitive bid!"}
                          {status.status === "strong" && "Strong bid - high chance of success!"}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Savings Summary */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Your savings vs retail</span>
                  <span className="font-bold text-emerald-600">
                    ${selectedUpgrade.originalPrice - bidAmount} (
                    {Math.round(((selectedUpgrade.originalPrice - bidAmount) / selectedUpgrade.originalPrice) * 100)}%)
                  </span>
                </div>

                {/* Place Bid Button */}
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handlePlaceBid}
                  disabled={bidAmount < selectedUpgrade.minimumBid}
                >
                  <Sparkles className="h-4 w-4" />
                  Place Bid for ${bidAmount}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You won't be charged unless your upgrade is confirmed
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Toast */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="bg-emerald-500 text-white border-0 shadow-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Bid placed successfully! We'll notify you 24h before departure.</span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatUpgradeBidding;
