/**
 * Admin Public Launch Module
 * Unified launch control for Beta → Live transition
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Rocket,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Megaphone,
  Settings,
  Play,
  Pause,
  Globe,
  Lock,
  Users,
  Car,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useLaunchSettings,
  useUpdateLaunchMode,
  useEmergencyPause,
  useUpdateAnnouncementSettings,
  useUpdateBookingLimits,
  useLaunchReadinessCheck,
} from "@/hooks/useLaunchSettings";
import PostLaunchMonitoringPanel from "@/components/admin/PostLaunchMonitoringPanel";
import type { GlobalLaunchMode } from "@/types/launchSettings";

function LaunchModeBanner() {
  const { data: settings, isLoading } = useLaunchSettings();
  const { data: readiness } = useLaunchReadinessCheck();
  const updateMode = useUpdateLaunchMode();
  const [showConfirm, setShowConfirm] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  const mode = settings?.global_mode || "beta";
  const isLive = mode === "live";
  const canGoLive = readiness?.canGoLive || false;

  const handleModeSwitch = () => {
    const newMode: GlobalLaunchMode = isLive ? "beta" : "live";
    updateMode.mutate(newMode);
    setShowConfirm(false);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        isLive
          ? "border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5"
          : "border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {isLive ? (
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-amber-600" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {isLive ? "PUBLIC LIVE" : "PRIVATE BETA"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isLive
                    ? "ZIVO is open to the public"
                    : "Invite-only access enabled"}
                </p>
              </div>
            </div>

            {settings?.mode_changed_at && (
              <p className="text-xs text-muted-foreground">
                Switched{" "}
                {new Date(settings.mode_changed_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  !isLive ? "text-amber-600" : "text-muted-foreground"
                )}
              >
                Beta
              </span>
              <Switch
                checked={isLive}
                onCheckedChange={() => setShowConfirm(true)}
                disabled={!isLive && !canGoLive}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isLive ? "text-green-600" : "text-muted-foreground"
                )}
              >
                Live
              </span>
            </div>

            {!isLive && !canGoLive && (
              <p className="text-xs text-muted-foreground max-w-[200px] text-right">
                Complete all readiness checks to enable
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isLive ? "Switch to Private Beta?" : "Go Live?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isLive
                ? "This will restrict access to invited users only. Public signups will be disabled."
                : "This will open ZIVO to the public. Make sure all readiness checks are complete."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleModeSwitch}
              className={isLive ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {isLive ? "Switch to Beta" : "🚀 Go Live"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function EmergencyPausePanel() {
  const { data: settings, isLoading } = useLaunchSettings();
  const emergencyPause = useEmergencyPause();
  const [reason, setReason] = useState("");
  const [showPauseDialog, setShowPauseDialog] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  const isPaused = settings?.emergency_pause || false;

  const handlePause = () => {
    emergencyPause.mutate({
      emergency_pause: true,
      emergency_pause_reason: reason,
    });
    setShowPauseDialog(false);
    setReason("");
  };

  const handleResume = () => {
    emergencyPause.mutate({ emergency_pause: false });
  };

  return (
    <Card
      className={cn(
        isPaused && "border-destructive/50 bg-destructive/5"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-5 h-5" />
          Emergency Controls
        </CardTitle>
        <CardDescription>
          Instantly pause all new bookings if needed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                isPaused ? "bg-destructive animate-pulse" : "bg-green-500"
              )}
            />
            <span className="font-medium">
              {isPaused ? "BOOKINGS PAUSED" : "Normal Operations"}
            </span>
          </div>

          {isPaused ? (
            <Button
              variant="outline"
              onClick={handleResume}
              disabled={emergencyPause.isPending}
            >
              <Play className="w-4 h-4 mr-2" />
              Resume Bookings
            </Button>
          ) : (
            <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause All Bookings
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Pause All Bookings?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately block all new booking attempts. Existing
                    active trips will continue normally.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label htmlFor="pause-reason">Reason (optional)</Label>
                  <Textarea
                    id="pause-reason"
                    placeholder="Why are bookings being paused?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePause}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Pause Bookings
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {isPaused && settings?.emergency_pause_reason && (
          <div className="p-3 bg-destructive/10 rounded-lg text-sm">
            <p className="font-medium text-destructive">Reason:</p>
            <p className="text-muted-foreground">{settings.emergency_pause_reason}</p>
            {settings.emergency_pause_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Paused at{" "}
                {new Date(settings.emergency_pause_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReadinessCheckPanel() {
  const { data: readiness, isLoading } = useLaunchReadinessCheck();

  if (isLoading) {
    return <Skeleton className="h-60 w-full" />;
  }

  if (!readiness) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="w-5 h-5" />
          Launch Readiness
        </CardTitle>
        <CardDescription>
          Requirements before switching to Public Live
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Checklist Status */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {readiness.betaChecklistComplete ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-muted-foreground" />
            )}
            <span>Beta Checklist Complete</span>
          </div>
          <Badge
            variant={readiness.betaChecklistComplete ? "default" : "secondary"}
          >
            {readiness.betaChecklistComplete ? "Done" : "Incomplete"}
          </Badge>
        </div>

        <Separator />

        {/* Live Cities */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {readiness.liveCitiesCount > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-muted-foreground" />
            )}
            <span>Cities Marked Live</span>
          </div>
          <Badge
            variant={readiness.liveCitiesCount > 0 ? "default" : "secondary"}
          >
            {readiness.liveCitiesCount} cities
          </Badge>
        </div>

        <Separator />

        {/* Supply Minimums */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {readiness.allCitiesMeetMinimums ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-muted-foreground" />
            )}
            <span>Supply Minimums Met</span>
          </div>

          {readiness.citiesReady.length > 0 && (
            <div className="pl-7 space-y-2">
              {readiness.citiesReady.map((city) => (
                <div
                  key={city.cityId}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {city.cityName}, {city.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={cn(
                        city.ownersMet ? "text-green-600" : "text-amber-600"
                      )}
                    >
                      <Users className="w-3 h-3 inline mr-1" />
                      {city.approvedOwners}/{city.minOwners}
                    </span>
                    <span
                      className={cn(
                        city.vehiclesMet ? "text-green-600" : "text-amber-600"
                      )}
                    >
                      <Car className="w-3 h-3 inline mr-1" />
                      {city.approvedVehicles}/{city.minVehicles}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blockers */}
        {readiness.blockers.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-600">Blockers:</p>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                {readiness.blockers.map((blocker, i) => (
                  <li key={i} className="list-disc">
                    {blocker}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Overall Status */}
        <div
          className={cn(
            "mt-4 p-3 rounded-lg text-center",
            readiness.canGoLive
              ? "bg-green-500/10 text-green-700"
              : "bg-amber-500/10 text-amber-700"
          )}
        >
          {readiness.canGoLive
            ? "✅ Ready to go live!"
            : "⏳ Not ready - resolve blockers above"}
        </div>
      </CardContent>
    </Card>
  );
}

function AnnouncementSettingsPanel() {
  const { data: settings, isLoading } = useLaunchSettings();
  const updateAnnouncement = useUpdateAnnouncementSettings();
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);

  // Sync local state with server data
  useState(() => {
    if (settings) {
      setText(settings.announcement_text || "");
      setEnabled(settings.announcement_enabled);
    }
  });

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  const handleSave = () => {
    updateAnnouncement.mutate({
      announcement_enabled: enabled,
      announcement_text: text,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="w-5 h-5" />
          Site Announcement
        </CardTitle>
        <CardDescription>
          Display a banner across the site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="announcement-enabled">Enable Banner</Label>
          <Switch
            id="announcement-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="announcement-text">Banner Text</Label>
          <Input
            id="announcement-text"
            placeholder="We're live in Miami! 🎉"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={updateAnnouncement.isPending}
          className="w-full"
        >
          Save Announcement
        </Button>
      </CardContent>
    </Card>
  );
}

function BookingLimitsPanel() {
  const { data: settings, isLoading } = useLaunchSettings();
  const updateLimits = useUpdateBookingLimits();
  const [dailyLimit, setDailyLimit] = useState(20);
  const [minOwners, setMinOwners] = useState(5);
  const [minVehicles, setMinVehicles] = useState(10);
  const [enforceMinimum, setEnforceMinimum] = useState(true);

  // Sync local state
  useState(() => {
    if (settings) {
      setDailyLimit(settings.daily_booking_limit_per_city);
      setMinOwners(settings.min_owners_for_launch);
      setMinVehicles(settings.min_vehicles_for_launch);
      setEnforceMinimum(settings.enforce_supply_minimum);
    }
  });

  if (isLoading) {
    return <Skeleton className="h-60 w-full" />;
  }

  const handleSave = () => {
    updateLimits.mutate({
      daily_booking_limit_per_city: dailyLimit,
      enforce_supply_minimum: enforceMinimum,
      min_owners_for_launch: minOwners,
      min_vehicles_for_launch: minVehicles,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="w-5 h-5" />
          Booking & Supply Limits
        </CardTitle>
        <CardDescription>
          Configure safety limits for launch
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="daily-limit">Daily Booking Limit (per city)</Label>
          <Input
            id="daily-limit"
            type="number"
            min={1}
            value={dailyLimit}
            onChange={(e) => setDailyLimit(parseInt(e.target.value) || 20)}
          />
          <p className="text-xs text-muted-foreground">
            Max new bookings per city per day
          </p>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label>Enforce Supply Minimum</Label>
            <p className="text-xs text-muted-foreground">
              Block launch if minimums not met
            </p>
          </div>
          <Switch checked={enforceMinimum} onCheckedChange={setEnforceMinimum} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-owners">Min Owners</Label>
            <Input
              id="min-owners"
              type="number"
              min={1}
              value={minOwners}
              onChange={(e) => setMinOwners(parseInt(e.target.value) || 5)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-vehicles">Min Vehicles</Label>
            <Input
              id="min-vehicles"
              type="number"
              min={1}
              value={minVehicles}
              onChange={(e) => setMinVehicles(parseInt(e.target.value) || 10)}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateLimits.isPending}
          className="w-full"
        >
          Save Limits
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminPublicLaunchModule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Public Launch</h1>
        <p className="text-muted-foreground">
          Manage the transition from Private Beta to Public Live
        </p>
      </div>

      {/* Launch Mode Banner */}
      <LaunchModeBanner />

      {/* Emergency Pause */}
      <EmergencyPausePanel />

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ReadinessCheckPanel />
          <AnnouncementSettingsPanel />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <BookingLimitsPanel />
        </div>
      </div>

      <Separator />

      {/* Post-Launch Monitoring */}
      <PostLaunchMonitoringPanel />
    </div>
  );
}
