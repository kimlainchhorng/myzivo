/**
 * Admin Beta Launch Module
 * Day-by-day checklist for safe, controlled beta launch
 */

import { useState } from "react";
import { 
  Rocket, CheckCircle2, Circle, Clock, AlertTriangle, Play, Pause, 
  ChevronDown, ChevronRight, CalendarCheck, Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  useBetaLaunchStatus,
  useBetaChecklist,
  useUpdateChecklistItem,
  useUpdateBetaStatus,
  getDayProgress,
  getOverallProgress,
} from "@/hooks/useBetaLaunchChecklist";
import { CHECKLIST_DAYS, BetaLaunchState, BetaChecklist } from "@/types/betaLaunch";

const STATUS_CONFIG: Record<BetaLaunchState, { label: string; color: string; icon: React.ReactNode }> = {
  not_ready: { 
    label: "Not Ready", 
    color: "bg-muted text-muted-foreground",
    icon: <Circle className="w-4 h-4" />
  },
  ready_for_beta: { 
    label: "Ready for Beta", 
    color: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    icon: <Clock className="w-4 h-4" />
  },
  beta_live: { 
    label: "Beta Live", 
    color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  paused: { 
    label: "Paused", 
    color: "bg-destructive/20 text-destructive border-destructive/30",
    icon: <AlertTriangle className="w-4 h-4" />
  },
};

export default function AdminBetaLaunchModule() {
  const { data: status, isLoading: statusLoading } = useBetaLaunchStatus();
  const { data: checklist, isLoading: checklistLoading } = useBetaChecklist();
  const updateItem = useUpdateChecklistItem();
  const updateStatus = useUpdateBetaStatus();
  
  const [pauseReason, setPauseReason] = useState("");

  const isLoading = statusLoading || checklistLoading;
  const overallProgress = getOverallProgress(checklist);
  const currentStatus = status?.status || "not_ready";
  const statusConfig = STATUS_CONFIG[currentStatus];

  const handleItemToggle = (key: string, currentValue: boolean) => {
    if (!checklist) return;
    updateItem.mutate({
      key,
      value: !currentValue,
      checklistId: checklist.id,
    });
  };

  const handleGoLive = () => {
    if (!status) return;
    updateStatus.mutate({
      status: "beta_live",
      statusId: status.id,
    });
  };

  const handlePause = () => {
    if (!status) return;
    updateStatus.mutate({
      status: "paused",
      notes: pauseReason || "Beta paused by admin",
      statusId: status.id,
    });
    setPauseReason("");
  };

  const handleResume = () => {
    if (!status) return;
    updateStatus.mutate({
      status: "beta_live",
      statusId: status.id,
    });
  };

  const handleReset = () => {
    if (!status) return;
    updateStatus.mutate({
      status: "not_ready",
      notes: "Reset by admin",
      statusId: status.id,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Beta Launch Checklist
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete all 7 days before going live with beta users
          </p>
        </div>
        <Badge className={cn("text-sm px-3 py-1.5 flex items-center gap-2", statusConfig.color)}>
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
      </div>

      {/* Status Banner */}
      <Card className={cn(
        "border-2",
        currentStatus === "beta_live" && "border-emerald-500/50 bg-emerald-500/5",
        currentStatus === "paused" && "border-destructive/50 bg-destructive/5",
        currentStatus === "ready_for_beta" && "border-amber-500/50 bg-amber-500/5"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Launch Status</CardTitle>
              <CardDescription>
                {overallProgress.daysComplete}/{overallProgress.totalDays} days complete • {overallProgress.percentage}% overall
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {currentStatus === "not_ready" && overallProgress.allDaysComplete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" className="gap-2">
                      <Play className="w-4 h-4" />
                      Mark Beta as LIVE
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Go Live with Beta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will activate beta mode. Real users will be able to make bookings.
                        Make sure all checklist items have been verified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleGoLive}>
                        Yes, Go Live
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {currentStatus === "beta_live" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Pause className="w-4 h-4" />
                      Pause Beta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Pause Beta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will immediately halt all new bookings. Existing bookings will not be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder="Reason for pausing (optional)..."
                        value={pauseReason}
                        onChange={(e) => setPauseReason(e.target.value)}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePause} className="bg-destructive hover:bg-destructive/90">
                        Pause Beta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {currentStatus === "paused" && (
                <>
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button variant="default" className="gap-2" onClick={handleResume}>
                    <Play className="w-4 h-4" />
                    Resume Beta
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress.percentage} className="h-3" />
          
          {status?.notes && currentStatus === "paused" && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium text-destructive">Pause Reason:</p>
              <p className="text-sm text-muted-foreground mt-1">{status.notes}</p>
              {status.paused_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Paused on {format(new Date(status.paused_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          )}

          {status?.activated_at && currentStatus === "beta_live" && (
            <p className="text-sm text-muted-foreground mt-3">
              <CalendarCheck className="w-4 h-4 inline mr-1" />
              Live since {format(new Date(status.activated_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Day-by-Day Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Day-by-Day Verification
          </CardTitle>
          <CardDescription>
            Complete each day's checklist to ensure a safe beta launch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {CHECKLIST_DAYS.map((dayConfig) => {
              const progress = getDayProgress(checklist, dayConfig.day);
              
              return (
                <AccordionItem
                  key={dayConfig.day}
                  value={`day-${dayConfig.day}`}
                  className={cn(
                    "border rounded-lg px-4",
                    progress.isComplete && "border-emerald-500/30 bg-emerald-500/5"
                  )}
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        progress.isComplete 
                          ? "bg-emerald-500 text-white" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {progress.isComplete ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          dayConfig.day
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">
                          Day {dayConfig.day}: {dayConfig.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {progress.completed}/{progress.total} items complete
                        </div>
                      </div>
                      {progress.isComplete && progress.completedAt && (
                        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                          Completed {format(new Date(progress.completedAt), "MMM d")}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {dayConfig.description}
                    </p>
                    <div className="space-y-3">
                      {dayConfig.items.map((item) => {
                        const isChecked = checklist?.[item.key as keyof BetaChecklist] === true;
                        
                        return (
                          <label
                            key={item.key}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                              isChecked 
                                ? "bg-emerald-500/5 border-emerald-500/30" 
                                : "bg-card hover:bg-muted/50"
                            )}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleItemToggle(item.key, isChecked)}
                              disabled={updateItem.isPending}
                            />
                            <div className="flex-1">
                              <div className={cn(
                                "font-medium text-sm",
                                isChecked && "text-emerald-600"
                              )}>
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{overallProgress.daysComplete}</div>
            <p className="text-sm text-muted-foreground">Days Complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{overallProgress.completed}</div>
            <p className="text-sm text-muted-foreground">Items Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{overallProgress.total - overallProgress.completed}</div>
            <p className="text-sm text-muted-foreground">Items Remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{overallProgress.percentage}%</div>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
