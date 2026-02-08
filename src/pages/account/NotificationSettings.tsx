/**
 * NotificationSettings Page
 * User notification preferences and controls
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Info,
  Package,
  MessageSquare,
  Tag,
  Gift,
  AlertCircle,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useWebPush } from "@/hooks/useWebPush";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultEnabled: boolean;
}

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: "order_updates",
    label: "Order Updates",
    description: "Status changes, delivery tracking, and confirmations",
    icon: Package,
    defaultEnabled: true,
  },
  {
    id: "chat_messages",
    label: "Chat & Support",
    description: "Replies to your support tickets and chat messages",
    icon: MessageSquare,
    defaultEnabled: true,
  },
  {
    id: "price_alerts",
    label: "Price Alerts",
    description: "Notifications when tracked prices drop",
    icon: Tag,
    defaultEnabled: true,
  },
  {
    id: "promotions",
    label: "Deals & Promotions",
    description: "Exclusive offers, flash sales, and seasonal deals",
    icon: Gift,
    defaultEnabled: false,
  },
];

const PREFS_KEY = "zivo_notification_prefs";

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isSupported,
    permission,
    isConfigured,
    subscription,
    subscribe,
    unsubscribe,
    sendTestNotification,
    isLoading,
    error,
  } = useWebPush();

  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return NOTIFICATION_CATEGORIES.reduce((acc, cat) => {
      acc[cat.id] = cat.defaultEnabled;
      return acc;
    }, {} as Record<string, boolean>);
  });

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const handleToggleCategory = (id: string) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [id]: !prev[id] };
      toast.success(
        newPrefs[id] ? "Notification enabled" : "Notification disabled"
      );
      return newPrefs;
    });
  };

  const handleEnableNotifications = async () => {
    const result = await subscribe();
    if (result) {
      toast.success("Push notifications enabled! 🔔");
    }
  };

  const handleDisableNotifications = async () => {
    const result = await unsubscribe();
    if (result) {
      toast.success("Push notifications disabled");
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
    toast.success("Test notification sent!");
  };

  const getPermissionBadge = () => {
    if (!isSupported) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          Not Supported
        </Badge>
      );
    }

    switch (permission) {
      case "granted":
        return (
          <Badge className="gap-1 bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3" />
            Enabled
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive" className="gap-1">
            <BellOff className="w-3 h-3" />
            Blocked
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Bell className="w-3 h-3" />
            Not Set
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Permission Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">Push Notifications</h3>
                      {getPermissionBadge()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {permission === "granted"
                        ? "You'll receive push notifications on this device"
                        : permission === "denied"
                        ? "Notifications are blocked in your browser settings"
                        : "Enable to receive real-time updates"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {permission !== "granted" && isSupported && (
                  <Button
                    onClick={handleEnableNotifications}
                    disabled={isLoading || !isConfigured}
                    size="sm"
                  >
                    <BellRing className="w-4 h-4 mr-2" />
                    {isLoading ? "Enabling..." : "Enable Notifications"}
                  </Button>
                )}

                {permission === "granted" && subscription && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleTestNotification}
                      size="sm"
                    >
                      Send Test
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDisableNotifications}
                      disabled={isLoading}
                      size="sm"
                    >
                      <BellOff className="w-4 h-4 mr-2" />
                      Disable
                    </Button>
                  </>
                )}

                {permission === "denied" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info(
                        "Open your browser settings to allow notifications for this site"
                      );
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Browser Settings
                  </Button>
                )}
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-destructive mt-3">{error}</p>
              )}

              {/* Not configured message */}
              {!isConfigured && isSupported && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-amber-500/10 rounded-lg text-sm">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700 dark:text-amber-400">
                    Push notifications are being set up. This feature will be
                    available soon.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
            Notification Types
          </h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {NOTIFICATION_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label
                          htmlFor={category.id}
                          className="font-medium cursor-pointer"
                        >
                          {category.label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={category.id}
                      checked={preferences[category.id]}
                      onCheckedChange={() => handleToggleCategory(category.id)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile App Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Get the hiZIVO App</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Install our app for the best notification experience with
                    instant alerts and background updates.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate("/install")}
                  >
                    Install App
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Text */}
        <div className="px-1">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Notification preferences are saved locally on this device. To
              manage notifications on other devices, visit this page on each
              device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
