/**
 * PriceMismatchReport - Form to report price discrepancies
 */

import { useState } from "react";
import { AlertTriangle, Send, DollarSign, Building2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PriceMismatchReportProps {
  searchType?: "flights" | "hotels" | "cars";
  expectedPrice?: number;
  partnerName?: string;
  onSubmit?: (data: PriceMismatchData) => void;
  className?: string;
}

interface PriceMismatchData {
  expectedPrice: number;
  actualPrice: number;
  partnerName: string;
  searchType: string;
  details: string;
  email: string;
  screenshot?: File;
}

export function PriceMismatchReport({
  searchType = "flights",
  expectedPrice,
  partnerName,
  onSubmit,
  className,
}: PriceMismatchReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    expectedPrice: expectedPrice?.toString() || "",
    actualPrice: "",
    partnerName: partnerName || "",
    details: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: PriceMismatchData = {
        expectedPrice: parseFloat(formData.expectedPrice),
        actualPrice: parseFloat(formData.actualPrice),
        partnerName: formData.partnerName,
        searchType,
        details: formData.details,
        email: formData.email,
      };

      onSubmit?.(data);

      // In production, this would submit to database
      console.log("Price mismatch report:", data);

      toast({
        title: "Report submitted",
        description: "We'll investigate and get back to you within 24 hours.",
      });

      setIsOpen(false);
      setFormData({
        expectedPrice: "",
        actualPrice: "",
        partnerName: "",
        details: "",
        email: "",
      });
    } catch (error) {
      toast({
        title: "Failed to submit",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2 text-muted-foreground", className)}
        >
          <AlertTriangle className="w-4 h-4" />
          Report price mismatch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Report Price Mismatch
          </DialogTitle>
          <DialogDescription>
            Found a different price on the partner site? Let us know and we'll
            investigate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedPrice">Price shown on ZIVO</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="expectedPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.expectedPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expectedPrice: e.target.value }))
                  }
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualPrice">Price on partner site</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="actualPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.actualPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, actualPrice: e.target.value }))
                  }
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner">Partner / Provider</Label>
            <Select
              value={formData.partnerName}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, partnerName: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {searchType === "flights" && (
                  <>
                    <SelectItem value="duffel">Duffel</SelectItem>
                    <SelectItem value="skyscanner">Skyscanner</SelectItem>
                    <SelectItem value="kayak">Kayak</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                )}
                {searchType === "hotels" && (
                  <>
                    <SelectItem value="booking">Booking.com</SelectItem>
                    <SelectItem value="hotelbeds">Hotelbeds</SelectItem>
                    <SelectItem value="expedia">Expedia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                )}
                {searchType === "cars" && (
                  <>
                    <SelectItem value="hertz">Hertz</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="avis">Avis</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details</Label>
            <Textarea
              id="details"
              placeholder="Please describe what you saw..."
              value={formData.details}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, details: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your email (for follow-up)</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Send className="w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PriceMismatchReport;
