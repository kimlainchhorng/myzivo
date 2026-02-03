/**
 * Rental Completion Form
 * Owner uses this to mark rental as complete or report damage
 */

import { useState } from "react";
import { CheckCircle, AlertTriangle, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RentalCompletionFormProps {
  bookingId: string;
  vehicleName: string;
  onComplete?: () => void;
}

type CompletionType = "no_issues" | "report_damage";

export default function RentalCompletionForm({
  bookingId,
  vehicleName,
  onComplete,
}: RentalCompletionFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [completionType, setCompletionType] = useState<CompletionType>("no_issues");
  const [notes, setNotes] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const completeRental = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      if (completionType === "no_issues") {
        // Mark as complete with no issues - release deposit
        const { error } = await supabase
          .from("p2p_bookings")
          .update({
            status: "completed",
            rental_completed_at: new Date().toISOString(),
            rental_completed_by: "owner",
            rental_completion_notes: notes || null,
            deposit_status: "released",
            deposit_released_at: new Date().toISOString(),
          })
          .eq("id", bookingId);

        if (error) throw error;

        // Log deposit release
        await supabase.from("p2p_deposit_events").insert({
          booking_id: bookingId,
          event_type: "released",
          amount: 0,
          reason: "Rental completed with no issues",
          created_by: user.id,
        });

        return { type: "completed" };
      } else {
        // Report damage - create damage report
        const { data: report, error: reportError } = await supabase
          .from("p2p_damage_reports")
          .insert({
            booking_id: bookingId,
            reported_by: user.id,
            reporter_role: "owner",
            description: damageDescription,
            date_noticed: new Date().toISOString().split("T")[0],
            estimated_repair_cost: estimatedCost ? parseFloat(estimatedCost) : null,
            status: "reported",
            priority: "high",
          })
          .select()
          .single();

        if (reportError) throw reportError;

        // Update booking - hold payout and keep deposit authorized
        await supabase
          .from("p2p_bookings")
          .update({
            status: "completed",
            rental_completed_at: new Date().toISOString(),
            rental_completed_by: "owner",
            rental_completion_notes: "Damage reported - pending review",
            damage_report_id: report.id,
            payout_hold_reason: "damage_report_pending",
            payout_held_at: new Date().toISOString(),
          })
          .eq("id", bookingId);

        return { type: "damage_reported", reportId: report.id };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookingDetail", bookingId] });
      setOpen(false);
      
      if (result.type === "completed") {
        toast.success("Rental completed! Deposit released to renter.");
      } else {
        toast.success("Damage report submitted. Our team will review it shortly.");
      }
      
      onComplete?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete rental");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CheckCircle className="w-4 h-4" />
          Complete Rental
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Rental</DialogTitle>
          <DialogDescription>
            {vehicleName} - Review the vehicle condition and complete this rental.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup
            value={completionType}
            onValueChange={(v) => setCompletionType(v as CompletionType)}
          >
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-transparent hover:bg-muted/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <RadioGroupItem value="no_issues" id="no_issues" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="no_issues" className="flex items-center gap-2 font-medium cursor-pointer">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  No Issues - Complete Rental
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Vehicle returned in good condition. Deposit will be released to renter.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-transparent hover:bg-muted/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <RadioGroupItem value="report_damage" id="report_damage" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="report_damage" className="flex items-center gap-2 font-medium cursor-pointer">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Report Damage
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Vehicle has damage. Your payout will be held pending review.
                </p>
              </div>
            </div>
          </RadioGroup>

          {completionType === "no_issues" && (
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any notes about the rental..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {completionType === "report_damage" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Damage Description *</Label>
                <Textarea
                  placeholder="Describe the damage in detail..."
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Repair Cost ($)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Camera className="w-4 h-4" />
                <p>You can upload photos after submitting this report.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => completeRental.mutate()}
            disabled={
              completeRental.isPending ||
              (completionType === "report_damage" && !damageDescription.trim())
            }
          >
            {completeRental.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {completionType === "no_issues" ? "Complete & Release Deposit" : "Submit Damage Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
