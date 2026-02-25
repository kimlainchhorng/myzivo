/**
 * Smart Alert Timing Component
 * Optimized price alert notifications
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ALERT_TIMING_CONFIG, ALERT_COPY, AI_DISCLAIMERS } from "@/config/aiPersonalization";
import { cn } from "@/lib/utils";

interface PriceAlert {
  id: string;
  route: string;
  origin: string;
  destination: string;
  currentPrice: number;
  alertPrice?: number;
  type: "drop" | "rise" | "low_stock";
  changePercent?: number;
  createdAt: string;
  isActive: boolean;
}

interface SmartAlertTimingProps {
  alerts?: PriceAlert[];
  onToggleAlert?: (id: string, active: boolean) => void;
  onDismissAlert?: (id: string) => void;
  className?: string;
}

// Alerts loaded from user preferences — no hardcoded data

export function SmartAlertTiming({
  alerts = [],
  onToggleAlert,
  onDismissAlert,
  className,
}: SmartAlertTimingProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    priceDrops: true,
    lowStock: true,
    priceRise: false,
    groupAlerts: ALERT_TIMING_CONFIG.groupAlerts,
    maxPerDay: ALERT_TIMING_CONFIG.maxAlertsPerDay,
  });

  const handleToggle = (id: string, active: boolean) => {
    onToggleAlert?.(id, active);
    toast.success(active ? "Alert enabled" : "Alert paused");
  };

  const getAlertIcon = (type: PriceAlert["type"]) => {
    switch (type) {
      case "drop":
        return <TrendingDown className="w-4 h-4 text-emerald-500" />;
      case "rise":
        return <TrendingUp className="w-4 h-4 text-amber-500" />;
      case "low_stock":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getAlertMessage = (alert: PriceAlert) => {
    switch (alert.type) {
      case "drop":
        return `Price dropped ${Math.abs(alert.changePercent || 0)}% on ${alert.route}`;
      case "rise":
        return `Prices rising on ${alert.route} — book soon`;
      case "low_stock":
        return `Only a few seats left at this price for ${alert.route}`;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                Smart Price Alerts
                <Badge className="bg-violet-500/20 text-violet-400 text-xs">AI</Badge>
              </h4>
              <p className="text-xs text-muted-foreground">
                {ALERT_COPY.notification}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? "Done" : "Settings"}
          </Button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price-drops" className="text-sm">
                    Price drop alerts
                  </Label>
                  <Switch
                    id="price-drops"
                    checked={settings.priceDrops}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, priceDrops: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="low-stock" className="text-sm">
                    Low availability alerts
                  </Label>
                  <Switch
                    id="low-stock"
                    checked={settings.lowStock}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, lowStock: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="price-rise" className="text-sm">
                    Price increase warnings
                  </Label>
                  <Switch
                    id="price-rise"
                    checked={settings.priceRise}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, priceRise: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="group-alerts" className="text-sm">
                    Group similar alerts
                  </Label>
                  <Switch
                    id="group-alerts"
                    checked={settings.groupAlerts}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, groupAlerts: v })
                    }
                  />
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Max {ALERT_TIMING_CONFIG.maxAlertsPerDay} alerts per day •{" "}
                    Minimum {ALERT_TIMING_CONFIG.minPriceDropPercent}% price drop to notify
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Alerts */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active price alerts</p>
              <p className="text-xs">Search for flights to set alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "relative p-3 rounded-xl border transition-all duration-200 group",
                  alert.type === "drop" && "border-emerald-500/20 bg-emerald-500/5",
                  alert.type === "low_stock" && "border-red-500/20 bg-red-500/5",
                  alert.type === "rise" && "border-amber-500/20 bg-amber-500/5"
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismissAlert?.(alert.id)}
                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </Button>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{getAlertMessage(alert)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold">
                        ${alert.currentPrice}
                      </span>
                      {alert.alertPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${alert.alertPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" className="h-7 text-xs gap-1">
                        <Check className="w-3 h-3" />
                        Book Now
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleToggle(alert.id, !alert.isActive)}
                      >
                        {alert.isActive ? "Pause" : "Resume"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground text-center">
            {AI_DISCLAIMERS.general}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SmartAlertTiming;
