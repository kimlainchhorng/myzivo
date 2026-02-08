/**
 * Delivery PIN Dialog
 * Driver enters customer's 4-digit PIN to confirm delivery
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertTriangle, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useDeliveryPin } from "@/hooks/useDeliveryPin";

interface DeliveryPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  driverId: string;
  onSuccess: () => void;
}

export function DeliveryPinDialog({
  open,
  onOpenChange,
  orderId,
  driverId,
  onSuccess,
}: DeliveryPinDialogProps) {
  const [pin, setPin] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { verifyPin } = useDeliveryPin();

  const handleVerify = async () => {
    if (pin.length !== 4) return;

    setErrorMessage(null);

    try {
      const result = await verifyPin.mutateAsync({
        orderId,
        driverId,
        pin,
      });

      if (result.success) {
        onSuccess();
        onOpenChange(false);
        setPin("");
      } else {
        setErrorMessage(result.error_message);
        setAttemptsRemaining(result.attempts_remaining);
        setPin("");
        
        if (result.attempts_remaining <= 0) {
          setIsLocked(true);
        }
      }
    } catch (error) {
      setErrorMessage("Failed to verify PIN. Please try again.");
      setPin("");
    }
  };

  const handleClose = () => {
    setPin("");
    setErrorMessage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" />
            Enter Delivery PIN
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Ask the customer for their 4-digit PIN to confirm delivery
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {isLocked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="text-red-400 font-medium">Too Many Attempts</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Please contact support to complete this delivery
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full border-zinc-700"
                onClick={() => window.open("tel:+1-support", "_blank")}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </motion.div>
          ) : (
            <>
              {/* PIN Input */}
              <div className="flex justify-center">
                <InputOTP
                  value={pin}
                  onChange={(value) => setPin(value)}
                  maxLength={4}
                  disabled={verifyPin.isPending}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="w-14 h-14 text-2xl bg-zinc-800 border-zinc-700 text-white"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-14 h-14 text-2xl bg-zinc-800 border-zinc-700 text-white"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-14 h-14 text-2xl bg-zinc-800 border-zinc-700 text-white"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-14 h-14 text-2xl bg-zinc-800 border-zinc-700 text-white"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining
                  </p>
                </motion.div>
              )}

              {/* Attempts Indicator */}
              {!errorMessage && attemptsRemaining < 3 && (
                <div className="text-center">
                  <p className="text-yellow-400 text-sm">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining
                  </p>
                </div>
              )}

              {/* Verify Button */}
              <Button
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
                onClick={handleVerify}
                disabled={pin.length !== 4 || verifyPin.isPending}
              >
                {verifyPin.isPending ? (
                  "Verifying..."
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Confirm Delivery
                  </>
                )}
              </Button>

              <p className="text-xs text-zinc-500 text-center">
                Customer will show you their PIN from the order screen
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
