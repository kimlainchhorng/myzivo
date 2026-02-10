/**
 * SafetyCenterSheet — Bottom-sheet Safety Center for rides and deliveries
 * Provides Share Trip, Emergency Call, and Report Issue actions
 */

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Copy,
  Check,
  MessageCircle,
  Smartphone,
  Share2,
  Phone,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useTripSharing } from "@/hooks/useTripSharing";
import { useCreateRiderTicket } from "@/hooks/useRiderSupport";
import { toast } from "sonner";
import { ReactNode } from "react";

interface SafetyCenterSheetProps {
  tripId: string;
  tripType?: "ride" | "delivery";
  trigger?: ReactNode;
}

export function SafetyCenterSheet({
  tripId,
  tripType = "ride",
  trigger,
}: SafetyCenterSheetProps) {
  const [open, setOpen] = useState(false);
  const { shareTrip, copied } = useTripSharing({ tripId });
  const createTicket = useCreateRiderTicket();

  const handleEmergencyCall = () => {
    window.open("tel:911");
  };

  const handleZivoSupport = () => {
    window.open("tel:+18005551234");
  };

  const handleReportIssue = () => {
    createTicket.mutate(
      {
        category: "safety",
        subject: `Safety concern during ${tripType}`,
        message: `Safety issue reported during active ${tripType}. Trip ID: ${tripId}`,
        rideId: tripType === "ride" ? tripId : undefined,
      },
      {
        onSuccess: ({ ticketNumber }) => {
          toast.success(`Safety report ${ticketNumber} submitted`, {
            description: "Our safety team will review this immediately",
          });
          setOpen(false);
        },
      }
    );
  };

  const shareOptions = [
    {
      id: "copy",
      label: "Copy Link",
      icon: copied ? Check : Copy,
      className: copied
        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        : "bg-muted hover:bg-muted/80",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      className: "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20",
    },
    {
      id: "sms",
      label: "SMS",
      icon: Smartphone,
      className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    },
  ];

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
          >
            <Shield className="w-4 h-4" />
            Safety
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            Safety Center
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-5">
          {/* Share Trip Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Share Trip</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Send a live tracking link to someone you trust
            </p>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  onClick={() => shareTrip(option.id)}
                  className={`h-14 flex-col gap-1 border ${option.className}`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{option.label}</span>
                </Button>
              ))}
            </div>
            {hasNativeShare && (
              <Button
                variant="outline"
                onClick={() => shareTrip("native")}
                className="w-full h-10 gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                More Sharing Options
              </Button>
            )}
          </div>

          <Separator />

          {/* Emergency Call Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-destructive" />
              <span className="font-semibold text-sm">Emergency</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="destructive"
                onClick={handleEmergencyCall}
                className="h-14 flex-col gap-1"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs font-medium">Call 911</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleZivoSupport}
                className="h-14 flex-col gap-1"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs font-medium">ZIVO Support</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Report Issue Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm">Report Issue</span>
            </div>
            <Button
              variant="outline"
              onClick={handleReportIssue}
              disabled={createTicket.isPending}
              className="w-full h-12 gap-2 border-amber-500/20 text-amber-600 hover:bg-amber-500/10"
            >
              <AlertTriangle className="w-4 h-4" />
              {createTicket.isPending
                ? "Submitting..."
                : "Report a Safety Concern"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Our safety team reviews all reports immediately
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
