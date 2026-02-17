import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  X,
  Bell,
  Shield,
  Server,
  Wifi,
  Database,
  Clock,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SystemAlert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  category: "security" | "performance" | "system" | "network" | "database";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

const alertTypeConfig = {
  critical: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    badge: "bg-destructive text-destructive-foreground",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    badge: "bg-amber-500 text-white",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    badge: "bg-blue-500 text-white",
  },
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    badge: "bg-green-500 text-white",
  },
};

const categoryIcons = {
  security: Shield,
  performance: Clock,
  system: Server,
  network: Wifi,
  database: Database,
};

const AdminAlertCenter = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.type === "critical" && !a.isRead).length;

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") return true;
    if (filter === "unread") return !alert.isRead;
    return alert.type === filter;
  });

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, isRead: true } : a
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            Alert Center
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-2 animate-pulse">
                {criticalCount} Critical
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
            Mark all read
          </Button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {["all", "unread", "critical", "warning", "info"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(
                "text-xs capitalize h-7 px-2.5",
                filter === f && "shadow-sm"
              )}
            >
              {f}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-[320px] pr-3">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mb-3 text-green-500/50" />
                <p className="text-sm">No alerts to display</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAlerts.map((alert, index) => {
                  const config = alertTypeConfig[alert.type];
                  const Icon = config.icon;
                  const CategoryIcon = categoryIcons[alert.category];
                  
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative p-3 rounded-xl border transition-all cursor-pointer",
                        config.bg,
                        config.border,
                        !alert.isRead && "ring-1 ring-primary/20"
                      )}
                      onClick={() => markAsRead(alert.id)}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "p-2 rounded-lg shrink-0",
                          config.bg
                        )}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h4 className={cn(
                                "font-medium text-sm",
                                !alert.isRead && "text-foreground"
                              )}>
                                {alert.title}
                              </h4>
                              {!alert.isRead && (
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissAlert(alert.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <CategoryIcon className="h-3 w-3" />
                              <span className="capitalize">{alert.category}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminAlertCenter;
