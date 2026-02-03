/**
 * Flights Launch Control - Admin Dashboard
 * 3-Phase Launch System: Internal Test → Private Beta → Public Live
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useFlightsLaunchSettings, 
  useUpdateLaunchPhase,
  useEmergencyPause,
  useUpdateChecklistItem,
  useUpdateLaunchAnnouncement,
  useFlightsBetaInvites,
  validateLaunchChecklist 
} from "@/hooks/useFlightsLaunchStatus";
import { LAUNCH_PHASE_CONFIG, type FlightsLaunchPhase, type FlightsLaunchChecklist } from "@/types/flightsLaunch";
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
  Users,
  Megaphone,
  Mail,
  Copy,
  Trash2,
  RefreshCw,
  BarChart3,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FlightsLaunchControl = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading, refetch } = useFlightsLaunchSettings();
  const updatePhase = useUpdateLaunchPhase();
  const emergencyPause = useEmergencyPause();
  const updateChecklist = useUpdateChecklistItem();
  const updateAnnouncement = useUpdateLaunchAnnouncement();
  const { invites, createInvite, revokeInvite, isLoading: invitesLoading } = useFlightsBetaInvites();
  
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [targetPhase, setTargetPhase] = useState<FlightsLaunchPhase>('internal_test');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  
  // Fetch live stats for monitoring
  const { data: liveStats } = useQuery({
    queryKey: ['flights-live-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Today's bookings
      const { data: todayBookings } = await supabase
        .from('flight_bookings')
        .select('id, total_amount, ticketing_status, payment_status')
        .gte('created_at', today.toISOString());
      
      // Week's bookings
      const { data: weekBookings } = await supabase
        .from('flight_bookings')
        .select('id, total_amount, ticketing_status, payment_status')
        .gte('created_at', weekAgo.toISOString());
      
      // Active alerts
      const { data: alerts } = await supabase
        .from('flight_admin_alerts')
        .select('id')
        .eq('resolved', false);
      
      const todayCount = todayBookings?.length || 0;
      const todayRevenue = todayBookings
        ?.filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const todayFailed = todayBookings?.filter(b => b.ticketing_status === 'failed').length || 0;
      
      const weekCount = weekBookings?.length || 0;
      const weekRevenue = weekBookings
        ?.filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      
      return {
        todayBookings: todayCount,
        todayRevenue,
        todayFailed,
        weekBookings: weekCount,
        weekRevenue,
        activeAlerts: alerts?.length || 0,
      };
    },
    refetchInterval: 60 * 1000, // Refresh every minute
    enabled: settings?.launch_phase !== 'internal_test',
  });
  
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

  const currentPhase = settings?.launch_phase || 'internal_test';
  const isPaused = settings?.emergency_pause;
  const { ready, checklist, blockers } = validateLaunchChecklist(settings, targetPhase);
  const phaseConfig = LAUNCH_PHASE_CONFIG[currentPhase];

  const handlePhaseChange = async () => {
    if (!settings?.id) return;
    await updatePhase.mutateAsync({ settingsId: settings.id, phase: targetPhase });
    setShowPhaseModal(false);
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
    if (!settings?.id) return;
    await updateChecklist.mutateAsync({
      settingsId: settings.id,
      key,
      value: !currentValue,
    });
  };

  const handleCreateInvite = async () => {
    if (!newInviteEmail.trim()) return;
    await createInvite.mutateAsync(newInviteEmail.trim());
    setNewInviteEmail("");
  };

  const handleAnnouncementToggle = async (enabled: boolean) => {
    if (!settings?.id) return;
    await updateAnnouncement.mutateAsync({
      settingsId: settings.id,
      enabled,
      text: enabled ? (announcementText || settings.launch_announcement_text || "ZIVO Flights is now live ✈️ Book flights directly on ZIVO.") : undefined,
    });
  };

  const handleAnnouncementSave = async () => {
    if (!settings?.id || !announcementText.trim()) return;
    await updateAnnouncement.mutateAsync({
      settingsId: settings.id,
      enabled: settings.launch_announcement_enabled,
      text: announcementText,
    });
    toast.success("Announcement updated");
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  };

  const openPhaseModal = (phase: FlightsLaunchPhase) => {
    setTargetPhase(phase);
    setShowPhaseModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Flights Launch Control | Admin" 
        description="Manage ZIVO Flights launch phases." 
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
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
                <p className="text-muted-foreground">3-Phase Launch: Internal Test → Private Beta → Public Live</p>
              </div>
              <Badge 
                variant="outline"
                className={cn("text-base px-4 py-1", phaseConfig.color)}
              >
                {phaseConfig.icon} {phaseConfig.label}
              </Badge>
            </div>
          </div>

          {/* Emergency Pause Banner */}
          {isPaused && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>🚨 Emergency Pause Active:</strong>{" "}
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

          {/* Phase Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Launch Phase</CardTitle>
              <CardDescription>{phaseConfig.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {(Object.entries(LAUNCH_PHASE_CONFIG) as [FlightsLaunchPhase, typeof phaseConfig][]).map(([phase, config]) => {
                  const isActive = currentPhase === phase;
                  const { ready: canSwitchTo } = validateLaunchChecklist(settings, phase);
                  
                  return (
                    <div 
                      key={phase}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all",
                        isActive ? `${config.color} border-current` : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{config.icon}</span>
                        {isActive && <Badge variant="outline" className="text-xs">Active</Badge>}
                      </div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{config.description}</p>
                      
                      {!isActive && (
                        <Button
                          size="sm"
                          variant={phase === 'public_live' ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => openPhaseModal(phase)}
                          disabled={!canSwitchTo && phase !== 'internal_test'}
                        >
                          {phase === 'internal_test' ? 'Switch' : canSwitchTo ? 'Activate' : 'Checklist Required'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="checklist" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="checklist">Pre-Launch Checklist</TabsTrigger>
              <TabsTrigger value="beta">Beta Invites</TabsTrigger>
              <TabsTrigger value="announcement">Announcement</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            {/* Pre-Launch Checklist */}
            <TabsContent value="checklist">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Pre-Launch Checklist
                  </CardTitle>
                  <CardDescription>
                    Required items before activating each phase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {checklist.map((item) => (
                      <div 
                        key={item.key} 
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border",
                          item.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.done}
                            onCheckedChange={() => handleChecklistToggle(item.key, item.done)}
                            disabled={updateChecklist.isPending}
                          />
                          <div>
                            <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                              {item.item}
                            </span>
                            <div className="flex gap-1 mt-1">
                              {item.requiredFor.map(phase => (
                                <Badge key={phase} variant="outline" className="text-xs">
                                  {LAUNCH_PHASE_CONFIG[phase].label}
                                </Badge>
                              ))}
                            </div>
                          </div>
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
                        All requirements met — Ready for all phases
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {blockers.length} item{blockers.length > 1 ? 's' : ''} remaining for Public Live
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Beta Invites */}
            <TabsContent value="beta">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Private Beta Invites
                  </CardTitle>
                  <CardDescription>
                    Manage beta access for invited users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Create Invite */}
                  <div className="flex gap-2 mb-6">
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleCreateInvite} 
                      disabled={createInvite.isPending || !newInviteEmail.trim()}
                      className="gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Invite
                    </Button>
                  </div>

                  {/* Invites Table */}
                  {invitesLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : invites.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      No beta invites yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Invite Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Invited</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invites.map((invite) => (
                          <TableRow key={invite.id}>
                            <TableCell className="font-medium">{invite.email}</TableCell>
                            <TableCell>
                              <code className="bg-muted px-2 py-1 rounded text-xs">{invite.invite_code}</code>
                            </TableCell>
                            <TableCell>
                              {invite.accepted_at ? (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">Accepted</Badge>
                              ) : invite.is_active ? (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Pending</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted">Revoked</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(invite.invited_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyInviteCode(invite.invite_code)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                {invite.is_active && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => revokeInvite.mutate(invite.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcement */}
            <TabsContent value="announcement">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Launch Announcement Banner
                  </CardTitle>
                  <CardDescription>
                    Optional site-wide banner for launch announcement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Label className="font-medium">Enable Announcement</Label>
                      <p className="text-sm text-muted-foreground">Show banner on flights pages</p>
                    </div>
                    <Switch
                      checked={settings?.launch_announcement_enabled || false}
                      onCheckedChange={handleAnnouncementToggle}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Announcement Text</Label>
                    <Textarea
                      placeholder="ZIVO Flights is now live ✈️ Book flights directly on ZIVO."
                      value={announcementText || settings?.launch_announcement_text || ""}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      rows={2}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAnnouncementSave}
                      disabled={!announcementText.trim()}
                    >
                      Save Text
                    </Button>
                  </div>

                  {settings?.launch_announcement_enabled && (
                    <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Megaphone className="w-4 h-4" />
                        {settings.launch_announcement_text || "ZIVO Flights is now live ✈️ Book flights directly on ZIVO."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring */}
            <TabsContent value="monitoring">
              <div className="space-y-6">
                {/* Live Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Today's Bookings</p>
                          <p className="text-2xl font-bold">{liveStats?.todayBookings || 0}</p>
                        </div>
                        <Plane className="w-8 h-8 text-primary opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Today's Revenue</p>
                          <p className="text-2xl font-bold text-emerald-500">
                            ${(liveStats?.todayRevenue || 0).toLocaleString()}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-emerald-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Failed Today</p>
                          <p className="text-2xl font-bold text-destructive">{liveStats?.todayFailed || 0}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-destructive opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Week Revenue</p>
                          <p className="text-2xl font-bold text-primary">
                            ${(liveStats?.weekRevenue || 0).toLocaleString()}
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-primary opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Emergency Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-destructive" />
                      Emergency Controls
                    </CardTitle>
                    <CardDescription>
                      Instantly pause or resume all flight bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="lg"
                      variant={isPaused ? "default" : "destructive"}
                      className="w-full gap-2 h-14"
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

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" asChild className="flex-1 gap-2">
                        <Link to="/admin/flights/analytics">
                          <BarChart3 className="w-4 h-4" />
                          View Analytics
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="flex-1 gap-2">
                        <Link to="/admin/flights/refunds">
                          <RefreshCw className="w-4 h-4" />
                          View Refunds
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Phase Change Modal */}
      <Dialog open={showPhaseModal} onOpenChange={setShowPhaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {LAUNCH_PHASE_CONFIG[targetPhase].icon} Switch to {LAUNCH_PHASE_CONFIG[targetPhase].label}
            </DialogTitle>
            <DialogDescription>
              {LAUNCH_PHASE_CONFIG[targetPhase].description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {targetPhase === 'public_live' && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will enable real bookings for all users. 
                  Real payments and real tickets will be issued.
                </AlertDescription>
              </Alert>
            )}

            {targetPhase !== 'internal_test' && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border">
                <Checkbox
                  id="confirm-phase"
                  checked={confirmChecked}
                  onCheckedChange={(checked) => setConfirmChecked(checked === true)}
                />
                <Label htmlFor="confirm-phase" className="leading-relaxed cursor-pointer text-sm">
                  I have verified all checklist items and understand the implications of this phase change.
                </Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowPhaseModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePhaseChange}
              disabled={(targetPhase !== 'internal_test' && !confirmChecked) || updatePhase.isPending}
              className="gap-2"
            >
              {updatePhase.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Confirm
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
              <Label>Reason for pause</Label>
              <Textarea
                placeholder="Describe why bookings are being paused..."
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