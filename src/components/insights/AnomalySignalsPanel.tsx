/**
 * Anomaly Signals Panel
 * Displays recent risk events and fraud signals
 */

import { motion } from "framer-motion";
import { AlertTriangle, Shield, User, Truck, Clock, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAnomalySignals } from "@/hooks/useInsights";
import type { AnomalySignal } from "@/lib/insights";

const severityColors: Record<number, string> = {
  1: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  3: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  4: "bg-red-500/20 text-red-400 border-red-500/30",
  5: "bg-destructive/20 text-destructive border-destructive/30",
};

const severityLabels: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
  5: "Severe",
};

const eventTypeIcons: Record<string, typeof AlertTriangle> = {
  refund_abuse: Shield,
  cancel_abuse: AlertTriangle,
  velocity_spike: Clock,
  suspicious_booking: AlertTriangle,
  payment_fraud: Shield,
  account_takeover: User,
};

interface AnomalySignalsPanelProps {
  compact?: boolean;
  limit?: number;
}

const AnomalySignalsPanel = ({ compact = false, limit = 10 }: AnomalySignalsPanelProps) => {
  const { data: signals, isLoading } = useAnomalySignals(limit);

  const unresolvedSignals = signals?.filter((s) => !s.isResolved) || [];
  const criticalCount = unresolvedSignals.filter((s) => s.severity >= 4).length;

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40 bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/10" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-white/60">Anomaly Alerts</p>
              <p className="text-xl font-bold text-white">{unresolvedSignals.length} unresolved</p>
            </div>
          </div>
          <p className="text-sm text-white/60">
            <span className="text-destructive font-medium">{criticalCount} critical</span> alerts
          </p>
          <Link to="/admin/fraud">
            <Button variant="link" className="p-0 h-auto text-primary mt-2">
              View Signals <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/80 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-destructive" />
          Anomaly Signals
          {unresolvedSignals.length > 0 && (
            <Badge variant="destructive">{unresolvedSignals.length}</Badge>
          )}
        </CardTitle>
        <p className="text-sm text-white/40">Recent risk events and fraud signals</p>
      </CardHeader>
      <CardContent>
        {!signals || signals.length === 0 ? (
          <div className="text-center py-6 text-white/40">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No anomalies detected</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-3">
              {signals.map((signal, index) => (
                <SignalItem key={signal.id} signal={signal} index={index} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

const SignalItem = ({ signal, index }: { signal: AnomalySignal; index: number }) => {
  const Icon = eventTypeIcons[signal.eventType] || AlertTriangle;
  const severityClass = severityColors[signal.severity] || severityColors[1];
  const severityLabel = severityLabels[signal.severity] || "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`p-3 rounded-lg border ${severityClass.split(" ")[2]} bg-white/5 ${
        signal.isResolved ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded ${severityClass.split(" ")[0]}`}>
          <Icon className={`h-4 w-4 ${severityClass.split(" ")[1]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm">
              {signal.eventType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
            <Badge className={`text-xs ${severityClass}`}>{severityLabel}</Badge>
            {signal.isResolved && (
              <Badge className="bg-green-500/20 text-green-400 text-xs">Resolved</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
            {signal.userId && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                User
              </span>
            )}
            {signal.driverId && (
              <span className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                Driver
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(signal.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white">{signal.score}</p>
          <p className="text-xs text-white/40">score</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AnomalySignalsPanel;
