/**
 * Launch Day Runbook
 * Step-by-step procedures for launching ZIVO
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  Rocket, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  Activity,
  Shield,
  Mail,
  MessageSquare,
  ExternalLink,
  FileText,
  Users,
  Pause,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RunbookStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  duration?: string;
  critical?: boolean;
  link?: string;
}

const runbookSteps: RunbookStep[] = [
  // Pre-Launch Phase
  {
    id: "verify-checklist",
    phase: "Pre-Launch",
    title: "Verify Go-Live Checklist",
    description: "Ensure all 10 categories show green/pass status",
    duration: "5 min",
    critical: true,
    link: "/admin/go-live",
  },
  {
    id: "test-search",
    phase: "Pre-Launch",
    title: "Run search flow tests",
    description: "Execute automated tests for JFK→LAX, ORD→SFO, international routes",
    duration: "10 min",
    critical: true,
  },
  {
    id: "mobile-check",
    phase: "Pre-Launch",
    title: "Complete mobile testing",
    description: "Test on iPhone and Android devices, verify touch targets",
    duration: "15 min",
    critical: true,
  },
  {
    id: "verify-legal",
    phase: "Pre-Launch",
    title: "Verify legal pages accessible",
    description: "Click through all footer links, confirm no 404s",
    duration: "5 min",
    critical: true,
  },
  {
    id: "backup-db",
    phase: "Pre-Launch",
    title: "Create database backup",
    description: "Run Supabase backup before launch",
    duration: "2 min",
  },

  // Launch Phase
  {
    id: "enable-banner",
    phase: "Launch",
    title: "Enable announcement banner",
    description: "Set banner text: 'ZIVO is live. Compare prices from trusted travel partners.'",
    duration: "1 min",
    link: "/admin/launch",
  },
  {
    id: "verify-dns",
    phase: "Launch",
    title: "Verify DNS and SSL",
    description: "Confirm hizivo.com loads with valid certificate",
    duration: "2 min",
    critical: true,
  },
  {
    id: "test-booking",
    phase: "Launch",
    title: "Complete test booking flow",
    description: "Full search → checkout flow (do not confirm payment)",
    duration: "5 min",
    critical: true,
  },
  {
    id: "monitor-first-10",
    phase: "Launch",
    title: "Monitor first 10 user sessions",
    description: "Watch analytics for errors, drop-offs, or issues",
    duration: "30 min",
    critical: true,
    link: "/admin/launch",
  },

  // Post-Launch Phase (First Hour)
  {
    id: "check-errors",
    phase: "First Hour",
    title: "Check error rates",
    description: "Verify <5% error rate on all endpoints",
    duration: "5 min",
    link: "/admin/flights/status",
  },
  {
    id: "verify-tracking",
    phase: "First Hour",
    title: "Verify affiliate tracking",
    description: "Check partner_redirect_logs for outbound clicks",
    duration: "5 min",
  },
  {
    id: "check-payments",
    phase: "First Hour",
    title: "Verify payment processing",
    description: "Confirm Stripe is receiving events (if any bookings)",
    duration: "5 min",
  },
  {
    id: "support-ready",
    phase: "First Hour",
    title: "Confirm support channels active",
    description: "Verify support@hizivo.com receiving messages",
    duration: "2 min",
  },

  // Post-Launch Phase (24 Hours)
  {
    id: "hourly-checks",
    phase: "24 Hour Monitoring",
    title: "Hourly status checks",
    description: "Check dashboard every hour for the first 24 hours",
    duration: "24 hours",
    critical: true,
    link: "/admin/launch",
  },
  {
    id: "alert-thresholds",
    phase: "24 Hour Monitoring",
    title: "Set alert thresholds",
    description: "Configure alerts for: >5% error rate, >3 failed bookings",
    duration: "5 min",
  },
  {
    id: "team-standby",
    phase: "24 Hour Monitoring",
    title: "Team on standby",
    description: "Ensure emergency contacts available for first 24 hours",
  },
  {
    id: "social-monitor",
    phase: "24 Hour Monitoring",
    title: "Monitor social mentions",
    description: "Watch for @hizivo mentions, respond to issues promptly",
  },
];

export default function LaunchDayRunbook() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const phases = [...new Set(runbookSteps.map((s) => s.phase))];
  const completedCount = Object.values(completed).filter(Boolean).length;
  const criticalSteps = runbookSteps.filter((s) => s.critical);
  const completedCritical = criticalSteps.filter((s) => completed[s.id]).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Launch Day Runbook</h1>
              <p className="text-muted-foreground">Step-by-step procedure for going live</p>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-primary">{completedCount}/{runbookSteps.length}</div>
                <p className="text-sm text-muted-foreground">Steps completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-amber-500">{completedCritical}/{criticalSteps.length}</div>
                <p className="text-sm text-muted-foreground">Critical steps done</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/go-live">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go-Live Checklist
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Actions */}
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <AlertDescription>
            <strong>Emergency Pause:</strong> If critical issues occur, immediately pause bookings via{" "}
            <Link to="/admin/launch" className="underline font-medium">
              Launch Dashboard
            </Link>
            . This stops new bookings while you investigate.
          </AlertDescription>
        </Alert>

        {/* Runbook Steps by Phase */}
        <div className="space-y-8">
          {phases.map((phase) => {
            const phaseSteps = runbookSteps.filter((s) => s.phase === phase);
            const phaseCompleted = phaseSteps.filter((s) => completed[s.id]).length;
            const phaseComplete = phaseCompleted === phaseSteps.length;

            return (
              <Card key={phase} className={cn(phaseComplete && "border-emerald-500/30")}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {phase === "Pre-Launch" && <Clock className="w-5 h-5 text-muted-foreground" />}
                      {phase === "Launch" && <Rocket className="w-5 h-5 text-primary" />}
                      {phase === "First Hour" && <Activity className="w-5 h-5 text-amber-500" />}
                      {phase === "24 Hour Monitoring" && <Shield className="w-5 h-5 text-emerald-500" />}
                      <div>
                        <CardTitle>{phase}</CardTitle>
                        <CardDescription>
                          {phaseCompleted}/{phaseSteps.length} steps completed
                        </CardDescription>
                      </div>
                    </div>
                    {phaseComplete && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {phaseSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                          completed[step.id]
                            ? "bg-emerald-500/5 border-emerald-500/30"
                            : "bg-muted/30 border-transparent hover:bg-muted/50"
                        )}
                        onClick={() => toggleStep(step.id)}
                      >
                        <Checkbox
                          checked={completed[step.id] || false}
                          onCheckedChange={() => toggleStep(step.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono">
                              {index + 1}.
                            </span>
                            <span className={cn(
                              "font-medium",
                              completed[step.id] && "line-through text-muted-foreground"
                            )}>
                              {step.title}
                            </span>
                            {step.critical && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Critical
                              </Badge>
                            )}
                            {step.duration && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {step.duration}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        </div>
                        {step.link && (
                          <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                            <Link to={step.link}>
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key Contacts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Key Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Technical Support</p>
                <p className="text-sm text-muted-foreground">support@hizivo.com</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Business Inquiries</p>
                <p className="text-sm text-muted-foreground">kimlain@hizivo.com</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Press</p>
                <p className="text-sm text-muted-foreground">press@hizivo.com</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Emergency (24/7)</p>
                <p className="text-sm text-muted-foreground">kimlain@hizivo.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
