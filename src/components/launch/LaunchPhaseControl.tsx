/**
 * Launch Phase Control
 * Manage launch phase transitions with blocker awareness
 */
import { useState } from "react";
import { Rocket, CheckCircle2, AlertTriangle, Pause, Play, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useLaunchStatus,
  useAdvanceLaunchPhase,
  usePauseLaunch,
  useResumeLaunch,
  useLaunchPhaseLogs,
  useLaunchReadiness,
} from "@/hooks/useProductionLaunch";
import type { LaunchPhase } from "@/types/productionLaunch";

const PHASE_CONFIG: Record<LaunchPhase, { label: string; description: string; icon: string }> = {
  pre_launch: { label: 'Pre-Launch', description: 'Final verification and testing', icon: '🔧' },
  soft_launch: { label: 'Soft Launch', description: 'Limited traffic (24-72h)', icon: '🚀' },
  full_launch: { label: 'Full Launch', description: 'Public + paid advertising', icon: '🎉' },
  scaling: { label: 'Scaling', description: 'Optimizing for growth', icon: '📈' },
};

const PHASE_ORDER: LaunchPhase[] = ['pre_launch', 'soft_launch', 'full_launch', 'scaling'];

export function LaunchPhaseControl() {
  const { data: status, isLoading: statusLoading } = useLaunchStatus();
  const { data: phaseLogs } = useLaunchPhaseLogs();
  const readiness = useLaunchReadiness();
  const advancePhase = useAdvanceLaunchPhase();
  const pauseLaunch = usePauseLaunch();
  const resumeLaunch = useResumeLaunch();

  const [pauseReason, setPauseReason] = useState('');
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [showBlockers, setShowBlockers] = useState(false);

  if (statusLoading || !status) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse text-muted-foreground">Loading launch status...</div>
        </CardContent>
      </Card>
    );
  }

  const currentPhaseIndex = PHASE_ORDER.indexOf(status.current_phase);
  const nextPhase = PHASE_ORDER[currentPhaseIndex + 1];
  const canAdvance = readiness?.criticalBlockers.length === 0 && nextPhase;

  const phaseProgress = ((currentPhaseIndex + 1) / PHASE_ORDER.length) * 100;

  return (
    <div className="space-y-6">
      {/* Pause Status Alert */}
      {status.is_paused && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pause className="h-6 w-6 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">Launch Paused</CardTitle>
                  <CardDescription>{status.pause_reason || 'No reason provided'}</CardDescription>
                </div>
              </div>
              <Button variant="default" onClick={() => resumeLaunch.mutate()}>
                <Play className="h-4 w-4 mr-2" />
                Resume Launch
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Current Phase Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{PHASE_CONFIG[status.current_phase].icon}</span>
                Current Phase: {PHASE_CONFIG[status.current_phase].label}
              </CardTitle>
              <CardDescription className="mt-1">
                {PHASE_CONFIG[status.current_phase].description}
                {status.phase_started_at && (
                  <span className="ml-2">
                    • Started {new Date(status.phase_started_at).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Launch Progress</div>
              <Progress value={phaseProgress} className="w-32 h-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Phase Timeline */}
          <div className="flex items-center justify-between mb-6">
            {PHASE_ORDER.map((phase, index) => {
              const config = PHASE_CONFIG[phase];
              const isPast = index < currentPhaseIndex;
              const isCurrent = index === currentPhaseIndex;
              const isFuture = index > currentPhaseIndex;

              return (
                <div key={phase} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        isPast
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="h-5 w-5" /> : config.icon}
                    </div>
                    <span className={`text-xs mt-1 ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                      {config.label}
                    </span>
                  </div>
                  {index < PHASE_ORDER.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        index < currentPhaseIndex ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Readiness Status */}
          {readiness && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Launch Readiness</span>
                <Badge variant={readiness.isReady ? "default" : "destructive"}>
                  {readiness.overallPercentage}% Complete
                </Badge>
              </div>
              <Progress value={readiness.overallPercentage} className="h-2" />
              {readiness.criticalBlockers.length > 0 && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setShowBlockers(!showBlockers)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {readiness.criticalBlockers.length} Critical Blocker(s)
                    <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showBlockers ? 'rotate-90' : ''}`} />
                  </Button>
                  {showBlockers && (
                    <div className="mt-2 space-y-2 pl-6">
                      {readiness.criticalBlockers.map((blocker) => (
                        <div
                          key={blocker.id}
                          className="text-sm p-2 rounded bg-destructive/10 border border-destructive/20"
                        >
                          {blocker.item_title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {/* Advance Phase Button */}
            {nextPhase && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={!canAdvance || status.is_paused}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Advance to {PHASE_CONFIG[nextPhase].label}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Advance to {PHASE_CONFIG[nextPhase].label}?</DialogTitle>
                    <DialogDescription>
                      This will transition the platform to the next launch phase.
                      {nextPhase === 'soft_launch' && ' Limited traffic monitoring will begin.'}
                      {nextPhase === 'full_launch' && ' The platform will be fully public with paid advertising enabled.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Add notes about this phase transition (optional)..."
                      value={advanceNotes}
                      onChange={(e) => setAdvanceNotes(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        advancePhase.mutate({ newPhase: nextPhase, notes: advanceNotes });
                        setAdvanceNotes('');
                      }}
                    >
                      Confirm Advance
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Pause Button */}
            {!status.is_paused && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Launch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pause Launch?</DialogTitle>
                    <DialogDescription>
                      This will pause all booking operations. Use this for emergencies only.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Reason for pausing (required)..."
                      value={pauseReason}
                      onChange={(e) => setPauseReason(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      disabled={!pauseReason.trim()}
                      onClick={() => {
                        pauseLaunch.mutate({ reason: pauseReason });
                        setPauseReason('');
                      }}
                    >
                      Confirm Pause
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phase History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Phase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!phaseLogs?.length ? (
            <p className="text-muted-foreground text-sm">No phase transitions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {phaseLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <span className="text-xl">{PHASE_CONFIG[log.phase].icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{PHASE_CONFIG[log.phase].label}</span>
                      {!log.completed_at && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Started: {new Date(log.started_at).toLocaleString()}
                      {log.completed_at && (
                        <> • Completed: {new Date(log.completed_at).toLocaleString()}</>
                      )}
                    </p>
                    {log.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">"{log.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
