import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Clock,
  Shield,
  CheckCircle,
  Timer,
  DollarSign,
  Calendar,
  Zap,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LockOption {
  id: string;
  duration: string;
  hours: number;
  price: number;
  description: string;
  popular?: boolean;
}

interface PriceLockProps {
  className?: string;
  flightPrice?: number;
  route?: { from: string; to: string };
}

export const PriceLock = ({ 
  className, 
  flightPrice = 649,
  route = { from: 'JFK', to: 'LHR' }
}: PriceLockProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('48h');
  const [isLocked, setIsLocked] = useState(false);

  const lockOptions: LockOption[] = [
    { id: '24h', duration: '24 Hours', hours: 24, price: 9.99, description: 'Perfect for quick decisions' },
    { id: '48h', duration: '48 Hours', hours: 48, price: 14.99, description: 'Most popular choice', popular: true },
    { id: '72h', duration: '72 Hours', hours: 72, price: 19.99, description: 'Extra time to plan' },
    { id: '7d', duration: '7 Days', hours: 168, price: 29.99, description: 'Maximum flexibility' },
  ];

  const selectedLockOption = lockOptions.find(o => o.id === selectedOption);

  const handleLockPrice = () => {
    setIsLocked(true);
  };

  if (isLocked) {
    return (
      <Card className={cn("overflow-hidden border-emerald-500/50 bg-card/50 backdrop-blur", className)}>
        <CardContent className="p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Price Locked!</h3>
            <p className="text-muted-foreground mb-4">
              Your price of ${flightPrice} is guaranteed for {selectedLockOption?.hours} hours
            </p>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Route</span>
                <span className="font-medium">{route.from} → {route.to}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Locked Price</span>
                <span className="font-bold text-emerald-400">${flightPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className="font-medium">
                  {new Date(Date.now() + (selectedLockOption?.hours || 48) * 60 * 60 * 1000).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" size="lg">
                Book Now at ${flightPrice}
              </Button>
              <Button variant="outline" onClick={() => setIsLocked(false)}>
                View Details
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Price Lock</CardTitle>
              <p className="text-sm text-muted-foreground">
                Hold this price with a small deposit
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Current Price */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-b border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-3xl font-bold">${flightPrice}</p>
              <p className="text-sm text-muted-foreground">{route.from} → {route.to}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Prices rising</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+$45 in last 24h</p>
            </div>
          </div>
        </div>

        {/* Lock Options */}
        <div className="p-4">
          <h4 className="font-medium mb-3">Choose lock duration</h4>
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-2">
            {lockOptions.map((option, i) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Label
                  htmlFor={option.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                    selectedOption === option.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/50 hover:border-border bg-muted/30"
                  )}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.duration}</span>
                      {option.popular && (
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs">Popular</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">${option.price}</p>
                    <p className="text-xs text-muted-foreground">deposit</p>
                  </div>
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        </div>

        {/* How it Works */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <h4 className="font-medium mb-3">How Price Lock Works</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Pay small deposit to lock price</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-xs text-muted-foreground">Price guaranteed for duration</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-muted-foreground">Deposit applied to booking</p>
            </div>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Deposit is non-refundable if you don't complete booking. 
              If price drops, you'll get the lower price.
            </p>
          </div>

          <Button className="w-full" size="lg" onClick={handleLockPrice}>
            <Lock className="w-4 h-4 mr-2" />
            Lock Price for ${selectedLockOption?.price}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceLock;
