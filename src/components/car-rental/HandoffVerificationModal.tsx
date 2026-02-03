/**
 * Handoff Verification Modal
 * Driver uploads photos and gets confirmation from renter/owner
 */

import { useState } from "react";
import { Camera, Upload, Check, AlertTriangle, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCompleteHandoff } from "@/hooks/useVehicleDelivery";

interface HandoffVerificationModalProps {
  taskId: string;
  taskType: "delivery" | "pickup";
  isOpen: boolean;
  onClose: () => void;
}

export default function HandoffVerificationModal({
  taskId,
  taskType,
  isOpen,
  onClose,
}: HandoffVerificationModalProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [conditionNotes, setConditionNotes] = useState("");
  const [verificationPin, setVerificationPin] = useState("");
  const [step, setStep] = useState<"photos" | "verification">("photos");
  
  const completeHandoff = useCompleteHandoff();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In production, these would be uploaded to storage
    // For now, create local preview URLs
    const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    await completeHandoff.mutateAsync({
      taskId,
      photos,
      conditionNotes: conditionNotes || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {taskType === "delivery" ? "Delivery" : "Pickup"} Handoff
          </DialogTitle>
          <DialogDescription>
            {step === "photos"
              ? "Take photos of the vehicle to document its condition"
              : "Get verification from the customer"}
          </DialogDescription>
        </DialogHeader>

        {step === "photos" ? (
          <div className="space-y-4">
            {/* Photo upload */}
            <div className="space-y-2">
              <Label>Vehicle Photos (required)</Label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={photo} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Take photos of all sides, interior, and any existing damage
              </p>
            </div>

            {/* Condition notes */}
            <div className="space-y-2">
              <Label htmlFor="condition-notes">Condition Notes (optional)</Label>
              <Textarea
                id="condition-notes"
                placeholder="Note any scratches, dents, or other conditions..."
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Required photos warning */}
            {photos.length < 4 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-amber-700 dark:text-amber-400">
                  Take at least 4 photos (front, back, both sides)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* PIN verification */}
            <div className="space-y-2">
              <Label htmlFor="pin">Customer Verification PIN</Label>
              <Input
                id="pin"
                placeholder="Enter 4-digit PIN"
                value={verificationPin}
                onChange={(e) => setVerificationPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Ask the customer for their verification PIN shown in the app
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "photos" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep("verification")}
                disabled={photos.length < 4}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("photos")}>
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={completeHandoff.isPending}
                className="gap-2"
              >
                {completeHandoff.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Complete Handoff
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
