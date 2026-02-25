import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Wallet,
  Shield,
  Check,
  Loader2,
  LockKeyhole,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  serviceName: string;
  serviceDetails: string;
  onConfirm: () => void;
  isProcessing?: boolean;
  accentColor?: "primary" | "eats" | "sky" | "amber" | "rides";
}

const colorClasses = {
  primary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30",
  eats: "bg-gradient-to-r from-eats to-eats/80 hover:from-eats/90 hover:to-eats/70 shadow-lg shadow-eats/30",
  sky: "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-500/30",
  amber: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/30",
  rides: "bg-gradient-to-r from-rides to-rides/80 hover:from-rides/90 hover:to-rides/70 shadow-lg shadow-rides/30",
};

const lightAccentClasses = {
  primary: "from-primary/20 to-primary/5",
  eats: "from-eats/20 to-eats/5",
  sky: "from-sky-500/20 to-sky-500/5",
  amber: "from-amber-500/20 to-amber-500/5",
  rides: "from-rides/20 to-rides/5",
};

export const CheckoutModal = ({
  open,
  onOpenChange,
  amount,
  serviceName,
  serviceDetails,
  onConfirm,
  isProcessing = false,
  accentColor = "primary",
}: CheckoutModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ").substring(0, 19) : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const isFormValid =
    paymentMethod === "wallet" ||
    (cardNumber.length >= 19 && expiry.length === 5 && cvv.length >= 3 && name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <LockKeyhole className="w-4 h-4 text-emerald-500" />
            </div>
            <span>Secure Checkout</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl p-4 bg-gradient-to-br border border-border/50",
              lightAccentClasses[accentColor]
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold">{serviceName}</p>
                <p className="text-sm text-muted-foreground">{serviceDetails}</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            </div>
            <Separator className="my-3 bg-border/50" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total Amount</span>
              <div className="text-right">
                <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Method Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <Label className="text-sm font-medium">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <RadioGroupItem
                  value="card"
                  id="card"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="card"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 bg-card/50 p-4 cursor-pointer transition-all",
                    "hover:bg-muted/50 hover:border-primary/30",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  )}
                >
                   <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2 peer-data-[state=checked]:bg-primary/10">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Card</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="wallet"
                  id="wallet"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="wallet"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 bg-card/50 p-4 cursor-pointer transition-all",
                    "hover:bg-muted/50 hover:border-primary/30",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2 peer-data-[state=checked]:bg-primary/10">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Wallet</span>
                </Label>
              </div>
            </RadioGroup>
          </motion.div>

          <AnimatePresence mode="wait">
            {paymentMethod === "card" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {paymentMethod === "wallet" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted/50 rounded-xl p-4 text-center"
              >
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
                    Pay
                  </div>
                  <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    G Pay
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to complete payment
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              className={cn("w-full h-12 text-white rounded-xl font-semibold", colorClasses[accentColor])}
              onClick={onConfirm}
              disabled={!isFormValid || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Pay ${amount.toFixed(2)}
                </>
              )}
            </Button>
          </motion.div>

          {/* Security Notice */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl py-2"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit SSL encrypted • PCI compliant</span>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
