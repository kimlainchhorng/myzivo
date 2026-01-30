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
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreditCard,
  Wallet,
  Shield,
  Loader2,
  LockKeyhole,
  Sparkles,
  CheckCircle2,
  Plane,
  Users,
  Calendar,
  AlertCircle,
  Banknote,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { GeneratedFlight } from "@/data/flightGenerator";
import type { Passenger } from "./PassengerForm";

interface FlightPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outboundFlight?: GeneratedFlight;
  returnFlight?: GeneratedFlight;
  passengers: Passenger[];
  totalAmount: number;
  taxes: number;
  fareClass: string;
  onConfirm: () => void;
  isProcessing?: boolean;
}

type PaymentMethod = 'card' | 'apple-pay' | 'google-pay' | 'paypal' | 'bank';

interface CardErrors {
  number?: string;
  expiry?: string;
  cvv?: string;
  name?: string;
}

export const FlightPaymentModal = ({
  open,
  onOpenChange,
  outboundFlight,
  returnFlight,
  passengers,
  totalAmount,
  taxes,
  fareClass,
  onConfirm,
  isProcessing = false,
}: FlightPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  // Card validation
  const validateCard = () => {
    const errors: CardErrors = {};
    
    // Luhn algorithm for card number
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      errors.number = 'Invalid card number';
    } else {
      let sum = 0;
      let isEven = false;
      for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i], 10);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }
      if (sum % 10 !== 0) {
        errors.number = 'Invalid card number';
      }
    }

    // Expiry validation
    if (expiry.length !== 5) {
      errors.expiry = 'Invalid expiry';
    } else {
      const [month, year] = expiry.split('/');
      const now = new Date();
      const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expDate < now) {
        errors.expiry = 'Card expired';
      }
    }

    // CVV validation
    if (cvv.length < 3) {
      errors.cvv = 'Invalid CVV';
    }

    // Name validation
    if (!name.trim() || name.trim().split(' ').length < 2) {
      errors.name = 'Enter full name';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return null;
  };

  const cardType = getCardType(cardNumber);

  const isFormValid =
    paymentMethod !== "card" ||
    (cardNumber.length >= 19 && expiry.length === 5 && cvv.length >= 3 && name.trim().length > 2);

  const handleConfirm = () => {
    if (paymentMethod === 'card' && !validateCard()) {
      return;
    }
    onConfirm();
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    if (paymentMethod === 'card') {
      validateCard();
    }
  };

  const subtotal = totalAmount - taxes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-0 bg-card/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <LockKeyhole className="w-4 h-4 text-emerald-500" />
            </div>
            <span>Secure Flight Payment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Flight Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 bg-gradient-to-br from-sky-500/10 to-sky-500/5 border border-sky-500/30"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-sky-500" />
              </div>
              <div className="flex-1">
                {outboundFlight && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{outboundFlight.departure.code}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold">{outboundFlight.arrival.code}</span>
                    <Badge variant="outline" className="text-[10px] capitalize ml-auto">
                      {fareClass.replace('-', ' ')}
                    </Badge>
                  </div>
                )}
                {returnFlight && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{returnFlight.departure.code}</span>
                    <span>→</span>
                    <span>{returnFlight.arrival.code}</span>
                    <span className="text-xs">(Return)</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{passengers.length} passenger{passengers.length > 1 ? 's' : ''}</span>
              </div>
              {outboundFlight && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{outboundFlight.airline}</span>
                </div>
              )}
            </div>

            <Separator className="my-3 bg-sky-500/20" />
            
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span>${taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-sky-500/20">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-sky-500">${totalAmount.toLocaleString()}</span>
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
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              className="grid grid-cols-5 gap-2"
            >
              {[
                { value: 'card', label: 'Card', icon: CreditCard },
                { value: 'apple-pay', label: 'Apple', icon: Wallet },
                { value: 'google-pay', label: 'Google', icon: Wallet },
                { value: 'paypal', label: 'PayPal', icon: Banknote },
                { value: 'bank', label: 'Bank', icon: Building2 },
              ].map(({ value, label, icon: Icon }) => (
                <div key={value}>
                  <RadioGroupItem value={value} id={value} className="peer sr-only" />
                  <Label
                    htmlFor={value}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border-2 bg-card/50 p-3 cursor-pointer transition-all",
                      "hover:bg-muted/50 hover:border-primary/30",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    )}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-[10px] font-medium">{label}</span>
                  </Label>
                </div>
              ))}
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
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="flex items-center justify-between">
                    <span>Card Number</span>
                    {cardType && (
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {cardType}
                      </Badge>
                    )}
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      onBlur={() => handleBlur('number')}
                      maxLength={19}
                      className={cn(
                        "pl-10 h-12",
                        touched.number && cardErrors.number && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                  {touched.number && cardErrors.number && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {cardErrors.number}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      onBlur={() => handleBlur('expiry')}
                      maxLength={5}
                      className={cn(
                        "h-12",
                        touched.expiry && cardErrors.expiry && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {touched.expiry && cardErrors.expiry && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {cardErrors.expiry}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onBlur={() => handleBlur('cvv')}
                      maxLength={4}
                      type="password"
                      className={cn(
                        "h-12",
                        touched.cvv && cardErrors.cvv && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {touched.cvv && cardErrors.cvv && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {cardErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={cn(
                      "h-12",
                      touched.name && cardErrors.name && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {touched.name && cardErrors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {cardErrors.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="save-card" 
                    checked={saveCard}
                    onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                  />
                  <Label htmlFor="save-card" className="text-sm text-muted-foreground cursor-pointer">
                    Save card for future bookings
                  </Label>
                </div>
              </motion.div>
            )}

            {paymentMethod !== "card" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted/50 rounded-lg p-4 text-center"
              >
                <div className="flex items-center justify-center gap-4 mb-2">
                  {paymentMethod === 'apple-pay' && (
                    <div className="w-16 h-10 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      Pay
                    </div>
                  )}
                  {paymentMethod === 'google-pay' && (
                    <div className="w-16 h-10 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      G Pay
                    </div>
                  )}
                  {paymentMethod === 'paypal' && (
                    <div className="w-16 h-10 bg-[#003087] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      PayPal
                    </div>
                  )}
                  {paymentMethod === 'bank' && (
                    <div className="w-16 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {paymentMethod === 'bank' 
                    ? "You'll be redirected to your bank's secure portal"
                    : "You'll be redirected to complete payment"
                  }
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
              className="w-full h-12 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/30"
              onClick={handleConfirm}
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
                  Pay ${totalAmount.toLocaleString()}
                </>
              )}
            </Button>
          </motion.div>

          {/* Security Notice */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg py-2"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit SSL encrypted • PCI DSS compliant • Verified by Visa</span>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightPaymentModal;