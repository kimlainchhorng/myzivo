/**
 * Flights Launch Control - Admin Dashboard
 * Manage TEST → LIVE transition with pre-launch checklist
 */

import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useFlightsLaunchSettings, 
  useGoLive, 
  useEmergencyPause,
  useUpdateChecklistItem,
  validateLaunchChecklist 
} from "@/hooks/useFlightsLaunchStatus";
import type { FlightsLaunchChecklist } from "@/types/flightsLaunch";
import {
  Plane,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Rocket,
  Pause,
  Play,
  Loader2,
  ArrowLeft,
  Calendar,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

const FlightsLaunchControl = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading } = useFlightsLaunchSettings();
  const goLive = useGoLive();
  const emergencyPause = useEmergencyPause();
  const updateChecklist = useUpdateChecklistItem();
  
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  
  // Redirect non-admins
  if (!authLoading && !isAdmin) {
    return <Navigate to="/flights" replace />;
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { ready, checklist, blockers } = validateLaunchChecklist(settings);
  const isLive = settings?.status === 'live';
  const isPaused = settings?.emergency_pause;

  const handleGoLive = async () => {
    if (!settings?.id || !ready) return;
    await goLive.mutateAsync(settings.id);
    setShowGoLiveModal(false);
    setConfirmChecked(false);
  };

  const handlePause = async () => {
    if (!settings?.id) return;
    await emergencyPause.mutateAsync({
      settingsId: settings.id,
      pause: true,
      reason: pauseReason || "Emergency pause activated by admin",
    });
    setShowPauseModal(false);
    setPauseReason("");
  };

  const handleResume = async () => {
    if (!settings?.id) return;
    await emergencyPause.mutateAsync({
      settingsId: settings.id,
      pause: false,
    });
  };

  const handleChecklistToggle = async (key: keyof FlightsLaunchChecklist, currentValue: boolean) => {
    if (!settings?.id || isLive) return; // Can't change checklist after going live
    await updateChecklist.mutateAsync({
      settingsId: settings.id,
      key,
      value: !currentValue,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Flights Launch Control | Admin" 
        description="Manage ZIVO Flights TEST/LIVE status." 
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 gap-2">
              <Link to="/admin/flights/status">
                <ArrowLeft className="w-4 h-4" />
                Back to Status
              </Link>
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Plane className="w-6 h-6 text-primary" />
                  Flights Launch Control
                </h1>
                <p className="text-muted-foreground">Manage TEST → LIVE transition</p>
              </div>
              <Badge 
                variant={isLive ? "default" : "outline"}
                className={isLive 
                  ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-base px-4 py-1" 
                  : "bg-amber-500/20 text-amber-600 border-amber-500/30 text-base px-4 py-1"
                }
              >
                {isLive ? '🟢 LIVE' : '🟡 TEST MODE'}
              </Badge>
            </div>
          </div>

          {/* Emergency Pause Banner */}
          {isPaused && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>Emergency Pause Active:</strong>{" "}
                  {settings?.emergency_pause_reason || "Bookings are paused"}
                  {settings?.emergency_pause_at && (
                    <span className="text-xs ml-2 opacity-70">
                      (since {format(new Date(settings.emergency_pause_at), 'MMM d, HH:mm')})
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResume}
                  disabled={emergencyPause.isPending}
                  className="ml-4 gap-1"
                >
                  <Play className="w-3 h-3" />
                  Resume
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Current Status Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-xl font-bold flex items-center gap-2">
                    {isLive ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        LIVE
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5 text-amber-500" />
                        TEST
                      </>
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Last Changed</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {settings?.status_changed_at 
                      ? format(new Date(settings.status_changed_at), 'MMM d, yyyy HH:mm')
                      : 'Never'}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Public Booking</p>
                  <p className={`text-xl font-bold ${isLive && !isPaused ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {isLive && !isPaused ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Admin Testing</p>
                  <p className="text-xl font-bold text-emerald-500">
                    {isPaused ? 'Paused' : 'Enabled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post-Launch Stats (only shown when LIVE) */}
          {isLive && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Post-Launch Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">First Booking</p>
                    <p className="font-medium">
                      {settings?.first_booking_at 
                        ? format(new Date(settings.first_booking_at), 'MMM d, HH:mm')
                        : '—'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">First Ticket Issued</p>
                    <p className="font-medium">
                      {settings?.first_ticket_issued_at 
                        ? format(new Date(settings.first_ticket_issued_at), 'MMM d, HH:mm')
                        : '—'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">First Failure</p>
                    <p className="font-medium text-destructive">
                      {settings?.first_failure_at 
                        ? format(new Date(settings.first_failure_at), 'MMM d, HH:mm')
                        : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pre-Launch Checklist */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Pre-Launch Checklist
              </CardTitle>
              <CardDescription>
                {isLive 
                  ? "Checklist was completed before going LIVE"
                  : "All items must be verified before going LIVE"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div 
                    key={item.key} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      item.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={() => handleChecklistToggle(item.key, item.done)}
                        disabled={isLive || updateChecklist.isPending}
                      />
                      <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                        {item.item}
                      </span>
                    </div>
                    {item.done ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {ready ? (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    All requirements met {isLive ? '' : '— Ready for LIVE'}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {blockers.length} item{blockers.length > 1 ? 's' : ''} remaining before LIVE
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6 space-y-4">
              {!isLive ? (
                <Button 
                  size="lg" 
                  className="w-full gap-2 h-14 text-lg"
                  onClick={() => setShowGoLiveModal(true)}
                  disabled={!ready}
                >
                  <Rocket className="w-5 h-5" />
                  Go LIVE
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant={isPaused ? "default" : "destructive"}
                  className="w-full gap-2 h-14 text-lg"
                  onClick={isPaused ? handleResume : () => setShowPauseModal(true)}
                  disabled={emergencyPause.isPending}
                >
                  {emergencyPause.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      Resume Bookings
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      Emergency Pause
                    </>
                  )}
                </Button>
              )}

              {!isLive && (
                <p className="text-xs text-center text-muted-foreground">
                  {ready 
                    ? "When you're ready, click above to enable public flight bookings"
                    : "Complete all checklist items to enable the Go LIVE button"
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Go LIVE Confirmation Modal */}
      <Dialog open={showGoLiveModal} onOpenChange={setShowGoLiveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Go LIVE Confirmation
            </DialogTitle>
            <DialogDescription>
              This will enable real airline bookings and real payments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. Real customers will be able 
                to book flights and pay with real money.
              </AlertDescription>
            </Alert>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border">
              <Checkbox
                id="confirm-live"
                checked={confirmChecked}
                onCheckedChange={(checked) => setConfirmChecked(checked === true)}
              />
              <Label htmlFor="confirm-live" className="leading-relaxed cursor-pointer text-sm">
                I understand this will enable real bookings, real payments, and real airline 
                ticket issuance. I have verified all checklist items.
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowGoLiveModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGoLive}
              disabled={!confirmChecked || goLive.isPending}
              className="gap-2"
            >
              {goLive.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Going LIVE...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Confirm Go LIVE
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Pause Modal */}
      <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pause className="w-5 h-5 text-destructive" />
              Emergency Pause
            </DialogTitle>
            <DialogDescription>
              This will immediately stop all new flight bookings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Existing bookings will not be affected. You can resume bookings at any time.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="pause-reason">Reason (optional, shown to users)</Label>
              <Textarea
                id="pause-reason"
                placeholder="e.g., Temporary maintenance, investigating issues..."
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowPauseModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handlePause}
              disabled={emergencyPause.isPending}
              className="gap-2"
            >
              {emergencyPause.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pausing...
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Bookings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FlightsLaunchControl;
