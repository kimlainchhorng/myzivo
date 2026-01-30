import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Coins,
  Sparkles,
  TrendingUp,
  Info,
  CheckCircle2,
  ArrowRight,
  Zap,
  Gift,
  Crown,
  Calculator,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface LoyaltyRedemptionProps {
  totalPrice: number;
  availableMiles: number;
  tierStatus: "bronze" | "silver" | "gold" | "platinum";
  onRedemptionChange: (milesUsed: number, cashDiscount: number) => void;
}

const tierBonuses = {
  bronze: { multiplier: 1.0, label: "Bronze", color: "from-amber-700 to-amber-800", icon: "🥉" },
  silver: { multiplier: 1.15, label: "Silver", color: "from-slate-400 to-slate-500", icon: "🥈" },
  gold: { multiplier: 1.25, label: "Gold", color: "from-amber-400 to-amber-500", icon: "🥇" },
  platinum: { multiplier: 1.5, label: "Platinum", color: "from-violet-400 to-violet-500", icon: "💎" },
};

const redemptionRates = {
  flights: { rate: 0.012, label: "Flights", bonus: "Best Value" },
  upgrades: { rate: 0.01, label: "Seat Upgrades", bonus: null },
  baggage: { rate: 0.008, label: "Extra Baggage", bonus: null },
  insurance: { rate: 0.008, label: "Travel Insurance", bonus: null },
};

const quickRedemptions = [
  { percent: 25, label: "25%" },
  { percent: 50, label: "50%" },
  { percent: 75, label: "75%" },
  { percent: 100, label: "100%" },
];

const LoyaltyRedemption = ({
  totalPrice,
  availableMiles,
  tierStatus,
  onRedemptionChange,
}: LoyaltyRedemptionProps) => {
  const [useMiles, setUseMiles] = useState(false);
  const [milesPercentage, setMilesPercentage] = useState([0]);
  const [redemptionType, setRedemptionType] = useState<keyof typeof redemptionRates>("flights");
  const [showHistory, setShowHistory] = useState(false);

  const tier = tierBonuses[tierStatus];
  const rate = redemptionRates[redemptionType];
  const effectiveRate = rate.rate * tier.multiplier;

  // Calculate maximum miles that can be used (capped at total price)
  const maxMilesValue = Math.min(availableMiles * effectiveRate, totalPrice);
  const maxMilesUsable = Math.floor(maxMilesValue / effectiveRate);

  // Calculate current redemption
  const milesUsed = Math.floor((milesPercentage[0] / 100) * maxMilesUsable);
  const cashDiscount = milesUsed * effectiveRate;
  const remainingBalance = totalPrice - cashDiscount;
  const milesAfterRedemption = availableMiles - milesUsed;

  // Calculate miles earned from remaining cash payment
  const milesEarned = Math.floor(remainingBalance * 2);

  useEffect(() => {
    if (useMiles) {
      onRedemptionChange(milesUsed, cashDiscount);
    } else {
      onRedemptionChange(0, 0);
    }
  }, [useMiles, milesUsed, cashDiscount, onRedemptionChange]);

  const handleQuickRedemption = (percent: number) => {
    setMilesPercentage([percent]);
  };

  // Mock redemption history
  const redemptionHistory = [
    { date: "Dec 15, 2024", miles: 15000, value: 180, type: "Flight" },
    { date: "Nov 3, 2024", miles: 5000, value: 50, type: "Upgrade" },
    { date: "Oct 22, 2024", miles: 8000, value: 80, type: "Baggage" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Balance */}
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                  <Coins className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="absolute -top-1 -right-1 text-lg">{tier.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">ZIVO Miles Balance</p>
                  <Badge variant="outline" className={`bg-gradient-to-r ${tier.color} text-white border-0`}>
                    {tier.label}
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{availableMiles.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  Worth up to <span className="font-semibold text-emerald-600">${maxMilesValue.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span>{tier.multiplier}x value</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tier.label} members get {((tier.multiplier - 1) * 100).toFixed(0)}% bonus value on redemptions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 gap-1"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4" />
                History
              </Button>
            </div>
          </div>

          {/* Redemption History */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <h4 className="text-sm font-medium mb-3">Recent Redemptions</h4>
                <div className="space-y-2">
                  {redemptionHistory.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-amber-600">-{item.miles.toLocaleString()} miles</p>
                        <p className="text-xs text-muted-foreground">${item.value} value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Use Miles Toggle */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="font-semibold">Pay with ZIVO Miles</Label>
                <p className="text-sm text-muted-foreground">
                  Redeem miles to reduce your total
                </p>
              </div>
            </div>
            <Switch
              checked={useMiles}
              onCheckedChange={setUseMiles}
            />
          </div>
        </CardContent>
      </Card>

      {/* Redemption Controls */}
      <AnimatePresence>
        {useMiles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Redemption Type */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  Apply Miles To
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(redemptionRates).map(([key, value]) => (
                    <Button
                      key={key}
                      variant={redemptionType === key ? "default" : "outline"}
                      className="relative h-auto py-3 flex-col"
                      onClick={() => setRedemptionType(key as keyof typeof redemptionRates)}
                    >
                      <span>{value.label}</span>
                      <span className="text-xs opacity-70">
                        ${(value.rate * tier.multiplier * 100).toFixed(1)}¢/mile
                      </span>
                      {value.bonus && (
                        <Badge className="absolute -top-2 -right-2 text-[10px] bg-emerald-500">
                          {value.bonus}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Slider Control */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Redemption Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Selection */}
                <div className="flex gap-2">
                  {quickRedemptions.map((option) => (
                    <Button
                      key={option.percent}
                      variant={milesPercentage[0] === option.percent ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleQuickRedemption(option.percent)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <Slider
                    value={milesPercentage}
                    onValueChange={setMilesPercentage}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 miles</span>
                    <span>{maxMilesUsable.toLocaleString()} miles (max)</span>
                  </div>
                </div>

                {/* Redemption Preview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-muted-foreground">Miles Used</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">
                      {milesUsed.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-muted-foreground">Discount</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">
                      -${cashDiscount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-muted-foreground">Original Price</span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Coins className="h-4 w-4 text-amber-500" />
                      Miles Discount
                    </span>
                    <span className="font-medium text-emerald-600">-${cashDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-semibold">Amount to Pay</span>
                    <span className="text-2xl font-bold">${remainingBalance.toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Miles after booking
                      </span>
                      <span className="font-medium">{milesAfterRedemption.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-sky-500" />
                        Miles earned on cash
                      </span>
                      <span className="font-medium text-sky-600">+{milesEarned.toLocaleString()}</span>
                    </div>
                  </div>

                  <Progress 
                    value={(milesUsed / availableMiles) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    Using {((milesUsed / availableMiles) * 100).toFixed(1)}% of your available miles
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not Using Miles - Earn Miles Message */}
      <AnimatePresence>
        {!useMiles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-sky-500/10">
                    <TrendingUp className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-medium">Earn {Math.floor(totalPrice * 2).toLocaleString()} ZIVO Miles</p>
                    <p className="text-sm text-muted-foreground">
                      Complete this booking to earn miles on your purchase
                    </p>
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

export default LoyaltyRedemption;
