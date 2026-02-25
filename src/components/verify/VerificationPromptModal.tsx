/**
 * Verification Prompt Modal
 * Shown when an unverified user attempts to book
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck } from "lucide-react";

interface VerificationPromptModalProps {
  open: boolean;
  onClose: () => void;
  onStartVerification: () => void;
}

export default function VerificationPromptModal({
  open,
  onClose,
  onStartVerification,
}: VerificationPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Verification Required
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-2">
            <p>
              To keep our community safe, we need to verify your driver's license
              before you can book a car.
            </p>
            <p className="text-sm text-muted-foreground">
              This helps protect both renters and vehicle owners on our platform.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Quick 2-minute verification process</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Your data is encrypted and secure</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onStartVerification} className="w-full h-12 rounded-xl font-semibold shadow-md active:scale-[0.97] transition-all duration-200 touch-manipulation">
            Start Verification
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full h-11 rounded-xl active:scale-[0.97] transition-all duration-200 touch-manipulation">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
