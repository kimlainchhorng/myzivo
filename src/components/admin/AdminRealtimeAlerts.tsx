import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Bell, 
  XCircle, 
  CheckCircle2, 
  Info,
  Radio,
  Volume2,
  VolumeX,
  Maximize2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RealtimeAlert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
}

// TODO: Subscribe to real-time alerts from database/websocket

const AdminRealtimeAlerts = () => {
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "critical":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-500", pulse: true };
      case "warning":
        return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500", pulse: false };
      case "info":
        return { icon: Info, color: "text-blue-500", bg: "bg-blue-500", pulse: false };
      case "success":
        return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500", pulse: false };
      default:
        return { icon: Bell, color: "text-muted-foreground", bg: "bg-muted", pulse: false };
    }
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleClearAll = () => {
    setAlerts([]);
  };

  const criticalCount = alerts.filter(a => a.type === "critical").length;

  return (
    <Card className={cn(
      "border-0 bg-card/50 backdrop-blur-xl transition-all duration-300",
      isExpanded && "fixed inset-4 z-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary animate-pulse" />
            Live Alerts
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} Critical
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <Radio className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Radio className="h-4 w-4 text-green-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <X className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={cn(
          "space-y-2 overflow-y-auto",
          isExpanded ? "max-h-[calc(100vh-200px)]" : "max-h-[300px]"
        )}>
          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => {
              const typeConfig = getTypeConfig(alert.type);
              const Icon = typeConfig.icon;
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all group",
                    alert.type === "critical" && "bg-red-500/5 border-red-500/20",
                    alert.type === "warning" && "bg-amber-500/5 border-amber-500/20",
                    alert.type === "info" && "bg-blue-500/5 border-blue-500/20",
                    alert.type === "success" && "bg-green-500/5 border-green-500/20"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    typeConfig.bg,
                    typeConfig.pulse && "animate-pulse"
                  )} />
                  
                  <Icon className={cn("h-4 w-4 shrink-0", typeConfig.color)} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                  </div>
                  
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {alerts.length === 0 && (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No recent alerts</p>
            </div>
          )}
        </div>

        {alerts.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {alerts.length} alerts
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRealtimeAlerts;
