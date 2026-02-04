/**
 * PushNotificationPreferences Component
 * UI for managing push notification settings
 */

import { Bell, BellRing, Plane, Tag, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultEnabled: boolean;
}

const NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    id: "price_drops",
    label: "Price Drop Alerts",
    description: "Get notified when tracked prices drop",
    icon: Tag,
    defaultEnabled: true,
  },
  {
    id: "booking_reminders",
    label: "Booking Reminders",
    description: "Check-in reminders, departure alerts, travel updates",
    icon: Plane,
    defaultEnabled: true,
  },
  {
    id: "deals_promos",
    label: "Deals & Promotions",
    description: "Exclusive offers, flash sales, and seasonal deals",
    icon: BellRing,
    defaultEnabled: false,
  },
];

interface PushNotificationPreferencesProps {
  className?: string;
  onSave?: (preferences: Record<string, boolean>) => void;
}

export function PushNotificationPreferences({
  className,
  onSave,
}: PushNotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() =>
    NOTIFICATION_PREFERENCES.reduce((acc, pref) => {
      acc[pref.id] = pref.defaultEnabled;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleToggle = (id: string) => {
    const newPrefs = { ...preferences, [id]: !preferences[id] };
    setPreferences(newPrefs);
    onSave?.(newPrefs);
    
    toast.success(
      newPrefs[id] 
        ? "Notification enabled" 
        : "Notification disabled"
    );
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Manage your notification preferences
          </p>
        </div>
      </div>

      {/* Preferences */}
      <div className="divide-y divide-border">
        {NOTIFICATION_PREFERENCES.map((pref) => {
          const Icon = pref.icon;
          return (
            <div
              key={pref.id}
              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <Label htmlFor={pref.id} className="font-medium cursor-pointer">
                    {pref.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pref.description}
                  </p>
                </div>
              </div>
              <Switch
                id={pref.id}
                checked={preferences[pref.id]}
                onCheckedChange={() => handleToggle(pref.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Notice */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Push notifications are available on the ZIVO mobile app. 
            Download the app to receive real-time alerts on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
