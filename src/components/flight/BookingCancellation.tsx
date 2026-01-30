import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle, XCircle, RefreshCw, Calendar, CreditCard,
  Plane, Clock, ArrowRight, Check, Loader2, Shield, Info,
  CalendarDays, DollarSign, Wallet, ArrowLeftRight
} from 'lucide-react';
import { format, addDays, differenceInHours } from 'date-fns';
import { toast } from 'sonner';

interface BookingData {
  bookingRef: string;
  route: {
    origin: string;
    originCode: string;
    destination: string;
    destCode: string;
  };
  departureDate: Date;
  returnDate?: Date;
  airline: string;
  flightNumber: string;
  passengers: number;
  totalAmount: number;
  fareClass: 'economy' | 'premium' | 'business' | 'first';
  isRefundable: boolean;
}

interface BookingCancellationProps {
  booking: BookingData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (result: { type: 'cancel' | 'change'; refundAmount?: number }) => void;
}

type ActionType = 'cancel' | 'change' | null;
type CancellationReason = 'schedule' | 'personal' | 'health' | 'weather' | 'other';
type RefundMethod = 'original' | 'credit' | 'miles';

const cancellationReasons = [
  { value: 'schedule', label: 'Schedule conflict', icon: Calendar },
  { value: 'personal', label: 'Personal reasons', icon: Info },
  { value: 'health', label: 'Health / Medical', icon: Shield },
  { value: 'weather', label: 'Weather concerns', icon: AlertTriangle },
  { value: 'other', label: 'Other reason', icon: Info },
];

const fareClassConfig = {
  economy: { changeFee: 75, cancelFee: 100, refundPercent: 0 },
  premium: { changeFee: 50, cancelFee: 75, refundPercent: 50 },
  business: { changeFee: 0, cancelFee: 50, refundPercent: 80 },
  first: { changeFee: 0, cancelFee: 0, refundPercent: 100 },
};

export default function BookingCancellation({
  booking,
  open,
  onOpenChange,
  onComplete,
}: BookingCancellationProps) {
  const [step, setStep] = useState(1);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [reason, setReason] = useState<CancellationReason>('schedule');
  const [otherReason, setOtherReason] = useState('');
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('original');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const hoursUntilDeparture = differenceInHours(booking.departureDate, new Date());
  const isWithin24Hours = hoursUntilDeparture <= 24;
  const fareConfig = fareClassConfig[booking.fareClass];

  // Calculate fees and refunds
  const calculateRefund = () => {
    if (actionType === 'change') {
      return {
        fee: fareConfig.changeFee,
        refund: 0,
        credit: 0,
      };
    }

    const baseFee = fareConfig.cancelFee;
    const lateFee = isWithin24Hours ? 50 : 0;
    const totalFee = baseFee + lateFee;

    const refundPercent = booking.isRefundable ? 100 : fareConfig.refundPercent;
    const baseRefund = Math.round((booking.totalAmount * refundPercent) / 100);
    const actualRefund = Math.max(0, baseRefund - totalFee);

    const creditBonus = refundMethod === 'credit' ? Math.round(actualRefund * 0.1) : 0;
    const milesBonus = refundMethod === 'miles' ? Math.round(actualRefund * 1.5) : 0;

    return {
      fee: totalFee,
      refund: refundMethod === 'original' ? actualRefund : 0,
      credit: refundMethod === 'credit' ? actualRefund + creditBonus : 0,
      creditBonus,
      miles: refundMethod === 'miles' ? milesBonus : 0,
    };
  };

  const refundInfo = calculateRefund();

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setStep(4); // Success step
    
    onComplete?.({
      type: actionType!,
      refundAmount: refundInfo.refund || refundInfo.credit,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setStep(1);
      setActionType(null);
      setReason('schedule');
      setOtherReason('');
      setRefundMethod('original');
      setAcceptedTerms(false);
    }, 300);
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground">
          What would you like to do with your booking?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            actionType === 'change' && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => setActionType('change')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-sky-500" />
            </div>
            <h3 className="font-semibold">Change Flight</h3>
            <p className="text-sm text-muted-foreground">
              Modify dates, times, or route
            </p>
            <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/30">
              {fareConfig.changeFee === 0 ? 'Free changes' : `$${fareConfig.changeFee} fee`}
            </Badge>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-destructive/50",
            actionType === 'cancel' && "border-destructive ring-2 ring-destructive/20"
          )}
          onClick={() => setActionType('cancel')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold">Cancel Booking</h3>
            <p className="text-sm text-muted-foreground">
              Cancel and request refund
            </p>
            <Badge variant="outline" className={cn(
              booking.isRefundable 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-500 border-amber-500/30"
            )}>
              {booking.isRefundable ? 'Fully refundable' : `${fareConfig.refundPercent}% refundable`}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {isWithin24Hours && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-500">Less than 24 hours to departure</p>
            <p className="text-xs text-muted-foreground mt-1">
              Additional late cancellation fees may apply.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center pb-2">
        <p className="text-sm text-muted-foreground">
          {actionType === 'cancel' ? 'Please select a reason for cancellation' : 'Select change options'}
        </p>
      </div>

      {actionType === 'cancel' ? (
        <>
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as CancellationReason)}>
            <div className="space-y-3">
              {cancellationReasons.map((item) => (
                <div
                  key={item.value}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    reason === item.value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border"
                  )}
                  onClick={() => setReason(item.value as CancellationReason)}
                >
                  <RadioGroupItem value={item.value} id={item.value} />
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <Label htmlFor={item.value} className="flex-1 cursor-pointer font-medium">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {reason === 'other' && (
            <Textarea
              placeholder="Please describe your reason..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="min-h-[100px]"
            />
          )}

          <Separator />

          <div>
            <p className="text-sm font-medium mb-4">Refund method</p>
            <RadioGroup value={refundMethod} onValueChange={(v) => setRefundMethod(v as RefundMethod)}>
              <div className="space-y-3">
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    refundMethod === 'original' && "border-primary bg-primary/5"
                  )}
                  onClick={() => setRefundMethod('original')}
                >
                  <RadioGroupItem value="original" id="original" />
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label htmlFor="original" className="cursor-pointer font-medium">Original payment method</Label>
                    <p className="text-xs text-muted-foreground">Refund to your card (5-10 business days)</p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    refundMethod === 'credit' && "border-primary bg-primary/5"
                  )}
                  onClick={() => setRefundMethod('credit')}
                >
                  <RadioGroupItem value="credit" id="credit" />
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label htmlFor="credit" className="cursor-pointer font-medium">ZIVO Travel Credit</Label>
                    <p className="text-xs text-muted-foreground">Instant + 10% bonus credit</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">+10%</Badge>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    refundMethod === 'miles' && "border-primary bg-primary/5"
                  )}
                  onClick={() => setRefundMethod('miles')}
                >
                  <RadioGroupItem value="miles" id="miles" />
                  <Plane className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label htmlFor="miles" className="cursor-pointer font-medium">ZIVO Miles</Label>
                    <p className="text-xs text-muted-foreground">Convert to 1.5x miles value</p>
                  </div>
                  <Badge className="bg-sky-500/20 text-sky-400 border-0">1.5x</Badge>
                </div>
              </div>
            </RadioGroup>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="w-5 h-5 text-sky-500" />
                <span className="font-medium">New Travel Dates</span>
              </div>
              <p className="text-sm text-muted-foreground">
                After confirming, you'll be redirected to select new dates and flights.
              </p>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-muted/30">
            <p className="text-sm">
              <strong>Change fee:</strong> ${fareConfig.changeFee}
              {fareConfig.changeFee === 0 && (
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-0">Free</Badge>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Any fare difference will be calculated at checkout.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="font-bold">{booking.route.originCode}</p>
                <p className="text-xs text-muted-foreground">{booking.route.origin}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="text-center">
                <p className="font-bold">{booking.route.destCode}</p>
                <p className="text-xs text-muted-foreground">{booking.route.destination}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm">{format(booking.departureDate, 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">{booking.flightNumber}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original amount</span>
              <span>${booking.totalAmount.toLocaleString()}</span>
            </div>
            
            {actionType === 'cancel' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cancellation fee</span>
                  <span className="text-red-400">-${refundInfo.fee}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold">
                  <span>
                    {refundMethod === 'original' && 'Refund amount'}
                    {refundMethod === 'credit' && 'Travel credit'}
                    {refundMethod === 'miles' && 'ZIVO Miles'}
                  </span>
                  <span className="text-emerald-400">
                    {refundMethod === 'original' && `$${refundInfo.refund.toLocaleString()}`}
                    {refundMethod === 'credit' && `$${refundInfo.credit.toLocaleString()}`}
                    {refundMethod === 'miles' && `${refundInfo.miles?.toLocaleString()} miles`}
                  </span>
                </div>

                {refundMethod === 'credit' && refundInfo.creditBonus > 0 && (
                  <p className="text-xs text-emerald-400">
                    Includes ${refundInfo.creditBonus} bonus credit!
                  </p>
                )}
              </>
            )}

            {actionType === 'change' && (
              <div className="flex justify-between font-semibold">
                <span>Change fee</span>
                <span>{fareConfig.changeFee === 0 ? 'Free' : `$${fareConfig.changeFee}`}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
        />
        <Label htmlFor="terms" className="text-sm leading-relaxed">
          I understand and agree to the{' '}
          <a href="#" className="text-primary underline">cancellation policy</a> and{' '}
          <a href="#" className="text-primary underline">terms of service</a>.
          {actionType === 'cancel' && ' This action cannot be undone.'}
        </Label>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8 space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center"
      >
        <Check className="w-10 h-10 text-emerald-500" />
      </motion.div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          {actionType === 'cancel' ? 'Booking Cancelled' : 'Change Initiated'}
        </h3>
        <p className="text-muted-foreground">
          {actionType === 'cancel'
            ? 'Your refund will be processed within 5-10 business days.'
            : 'You can now select new flight options.'}
        </p>
      </div>

      {actionType === 'cancel' && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Refund amount</span>
              <span className="text-xl font-bold text-emerald-400">
                {refundMethod === 'original' && `$${refundInfo.refund.toLocaleString()}`}
                {refundMethod === 'credit' && `$${refundInfo.credit.toLocaleString()} credit`}
                {refundMethod === 'miles' && `${refundInfo.miles?.toLocaleString()} miles`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleClose} className="w-full">
        Done
      </Button>
    </motion.div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step < 4 ? (
              <>
                {actionType === 'cancel' ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : actionType === 'change' ? (
                  <RefreshCw className="w-5 h-5 text-sky-500" />
                ) : (
                  <Plane className="w-5 h-5 text-primary" />
                )}
                {step === 1 && 'Manage Booking'}
                {step === 2 && (actionType === 'cancel' ? 'Cancellation Details' : 'Change Options')}
                {step === 3 && 'Confirm'}
              </>
            ) : (
              'Complete'
            )}
          </DialogTitle>
          <DialogDescription>
            Booking Reference: <span className="font-mono font-semibold">{booking.bookingRef}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  s === step ? "w-6 bg-primary" : s < step ? "bg-primary/50" : "bg-muted"
                )}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </AnimatePresence>

        {step < 4 && (
          <DialogFooter className="gap-2 sm:gap-0">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button
              onClick={() => {
                if (step === 3) {
                  handleConfirm();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={(step === 1 && !actionType) || (step === 3 && !acceptedTerms) || isProcessing}
              className={cn(
                step === 3 && actionType === 'cancel' && "bg-red-500 hover:bg-red-600"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : step === 3 ? (
                actionType === 'cancel' ? 'Confirm Cancellation' : 'Confirm Change'
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
