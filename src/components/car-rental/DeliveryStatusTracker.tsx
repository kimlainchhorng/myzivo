/**
 * Delivery Status Tracker
 * Shows real-time delivery/pickup status to renters
 */

import { format } from "date-fns";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  User,
  Navigation,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeliveryTask } from "@/hooks/useVehicleDelivery";

interface DeliveryStatusTrackerProps {
  task: DeliveryTask;
  verificationPin?: string;
  className?: string;
}

const statusSteps = [
  { status: "pending", label: "Pending", icon: Clock },
  { status: "assigned", label: "Driver Assigned", icon: User },
  { status: "en_route", label: "On the Way", icon: Navigation },
  { status: "arrived", label: "Driver Arrived", icon: MapPin },
  { status: "completed", label: "Completed", icon: CheckCircle },
];

export default function DeliveryStatusTracker({
  task,
  verificationPin,
  className,
}: DeliveryStatusTrackerProps) {
  const isDelivery = task.task_type === "delivery";
  const currentStepIndex = statusSteps.findIndex((s) => s.status === task.status);

  // For accepted status, show as assigned
  const adjustedIndex = task.status === "accepted" ? 1 : currentStepIndex;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className={cn("w-4 h-4", isDelivery ? "text-blue-500" : "text-violet-500")} />
          {isDelivery ? "Vehicle Delivery" : "Vehicle Pickup"} Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Steps */}
        <div className="relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= adjustedIndex;
            const isCurrent = index === adjustedIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.status} className="flex items-start gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-6 mt-1",
                        isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && task.status !== "completed" && (
                    <p className="text-xs text-muted-foreground mt-0.5">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ETA or completion time */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {task.status === "completed" ? (
            <span className="text-sm">
              Completed at {task.completed_at && format(new Date(task.completed_at), "h:mm a")}
            </span>
          ) : (
            <span className="text-sm">
              Scheduled for {format(new Date(task.scheduled_at), "MMM d, h:mm a")}
            </span>
          )}
        </div>

        {/* Verification PIN (show when driver is on the way or arrived) */}
        {verificationPin && ["en_route", "arrived"].includes(task.status) && (
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Your Verification PIN</p>
            <p className="text-3xl font-bold tracking-widest text-primary">{verificationPin}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Share this PIN with the driver to confirm handoff
            </p>
          </div>
        )}

        {/* Driver contact (when assigned) */}
        {task.driver_id && task.status !== "completed" && task.status !== "pending" && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2">
              <Phone className="w-4 h-4" />
              Call Driver
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          </div>
        )}

        {/* Dropoff location */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-muted-foreground">
              {isDelivery ? "Delivery" : "Pickup"} location
            </p>
            <p className="font-medium">{task.dropoff_address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
