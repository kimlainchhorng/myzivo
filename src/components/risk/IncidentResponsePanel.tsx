/**
 * Incident Response Panel
 * Admin tool for managing security incidents
 */

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Pause,
  Play,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { INCIDENT_RESPONSE } from "@/config/riskManagement";
import { cn } from "@/lib/utils";

interface Incident {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  detectedAt: Date;
  status: "new" | "investigating" | "contained" | "resolved";
  currentStep: number;
  notes: string[];
  trafficPaused: boolean;
  partnerNotified: boolean;
}

interface IncidentResponsePanelProps {
  incident?: Incident;
  onStatusChange?: (status: string) => void;
  onPauseTraffic?: () => void;
  onResumeTraffic?: () => void;
  onNotifyPartner?: () => void;
  onAddNote?: (note: string) => void;
  className?: string;
}

const MOCK_INCIDENT: Incident = {
  id: "INC-001",
  type: "fraud_spike",
  severity: "high",
  title: "Unusual Fraud Pattern Detected",
  description: "Multiple failed payment attempts from same IP range",
  detectedAt: new Date(Date.now() - 30 * 60000),
  status: "investigating",
  currentStep: 3,
  notes: [
    "Initial investigation started at 10:45 AM",
    "Identified IP range: 192.168.x.x",
    "Blocked 15 suspicious accounts",
  ],
  trafficPaused: false,
  partnerNotified: false,
};

export function IncidentResponsePanel({
  incident = MOCK_INCIDENT,
  onStatusChange,
  onPauseTraffic,
  onResumeTraffic,
  onNotifyPartner,
  onAddNote,
  className,
}: IncidentResponsePanelProps) {
  const [newNote, setNewNote] = useState("");

  const severityConfig = INCIDENT_RESPONSE.severityLevels[incident.severity];
  const progress = (incident.currentStep / INCIDENT_RESPONSE.steps.length) * 100;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-amber-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return AlertTriangle;
      case "investigating": return Clock;
      case "contained": return Shield;
      case "resolved": return CheckCircle2;
      default: return AlertTriangle;
    }
  };

  const StatusIcon = getStatusIcon(incident.status);
  const elapsedMinutes = Math.floor((Date.now() - incident.detectedAt.getTime()) / 60000);

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-white", getSeverityColor(incident.severity))}>
                {incident.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <StatusIcon className="w-3 h-3" />
                {incident.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {incident.id}
              </span>
            </div>
            <CardTitle className="text-lg">{incident.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {incident.description}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Detected</p>
            <p className="text-sm font-medium">{elapsedMinutes} min ago</p>
            <p className="text-xs text-muted-foreground mt-1">
              Response time: {severityConfig.responseTime} min
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SLA Alert */}
        {elapsedMinutes > severityConfig.responseTime && (
          <Alert variant="destructive" className="border-red-500/20">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Response time SLA exceeded by {elapsedMinutes - severityConfig.responseTime} minutes
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Response Progress</span>
            <span className="font-medium">Step {incident.currentStep} of {INCIDENT_RESPONSE.steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Response Steps */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Response Steps</p>
          <div className="grid grid-cols-3 gap-2">
            {INCIDENT_RESPONSE.steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "p-2 rounded-lg text-xs text-center border",
                  index < incident.currentStep
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                    : index === incident.currentStep
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                    : "bg-muted/30 border-border/50 text-muted-foreground"
                )}
              >
                <p className="font-medium">{index + 1}. {step.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={incident.status}
            onValueChange={(value) => onStatusChange?.(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="contained">Contained</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {incident.trafficPaused ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-emerald-600"
              onClick={onResumeTraffic}
            >
              <Play className="w-4 h-4" />
              Resume Traffic
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600"
              onClick={onPauseTraffic}
            >
              <Pause className="w-4 h-4" />
              Pause Traffic
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onNotifyPartner}
            disabled={incident.partnerNotified}
          >
            <Users className="w-4 h-4" />
            {incident.partnerNotified ? "Partner Notified" : "Notify Partner"}
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Incident Notes
          </p>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {incident.notes.map((note, i) => (
              <div key={i} className="text-xs p-2 rounded bg-muted/30 text-muted-foreground">
                {note}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="text-sm min-h-[60px]"
            />
            <Button
              size="sm"
              onClick={() => {
                if (newNote.trim()) {
                  onAddNote?.(newNote);
                  setNewNote("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground text-center">
          Incident type: {incident.type} · Recommended action: {severityConfig.trafficAction}
        </div>
      </CardContent>
    </Card>
  );
}

export default IncidentResponsePanel;
