import { useState, useEffect } from "react";
import { 
  Radio, 
  Plane, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RealTimeStatusWidgetProps {
  className?: string;
}

interface StatusUpdate {
  id: string;
  type: "flight" | "gate" | "delay" | "boarding";
  message: string;
  time: string;
  status: "info" | "warning" | "success";
}

const mockUpdates: StatusUpdate[] = [
  { id: "1", type: "flight", message: "Flight AA123 is on time", time: "2 min ago", status: "success" },
  { id: "2", type: "gate", message: "Gate changed to B24", time: "5 min ago", status: "warning" },
  { id: "3", type: "boarding", message: "Boarding begins in 45 min", time: "10 min ago", status: "info" },
];

const statusColors = {
  info: "text-sky-400 bg-sky-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  success: "text-emerald-400 bg-emerald-500/10",
};

const statusIcons = {
  flight: Plane,
  gate: ArrowRight,
  delay: AlertTriangle,
  boarding: CheckCircle2,
};

const RealTimeStatusWidget = ({ className }: RealTimeStatusWidgetProps) => {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("Just now");

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate("Just now");
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("p-4 rounded-xl bg-card/60 backdrop-blur-xl border border-border/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-primary" />
            {isLive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </div>
          <h3 className="font-semibold text-sm">Live Updates</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          {lastUpdate}
        </div>
      </div>

      {/* Flight Status Bar */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">AA123</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400">On Time</Badge>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>JFK</span>
          <ArrowRight className="w-3 h-3" />
          <span>CDG</span>
          <span className="ml-auto">Departs 10:30 AM</span>
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-2">
        {mockUpdates.map((update) => {
          const Icon = statusIcons[update.type];
          return (
            <div
              key={update.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className={cn("p-1.5 rounded-lg", statusColors[update.status])}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{update.message}</p>
                <p className="text-xs text-muted-foreground">{update.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enable Notifications */}
      <button className="w-full mt-4 p-2 rounded-lg border border-dashed border-primary/30 text-xs text-primary hover:bg-primary/5 transition-colors">
        Enable push notifications
      </button>
    </div>
  );
};

export default RealTimeStatusWidget;
