import { useState } from "react";
import { ArrowLeft, Bell, MapPin, Shield, Eye, Moon, Smartphone, Globe, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SETTINGS_KEY = "zivo_personal_settings";

const DEFAULT_SETTINGS = {
  push_notifications: true,
  email_notifications: true,
  ride_updates: true,
  promo_emails: false,
  location_always: false,
  location_while_using: true,
  share_trip_data: false,
  two_factor: false,
  dark_mode: false,
  language: "English",
};

type SettingsKey = keyof typeof DEFAULT_SETTINGS;

export default function PersonalSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<typeof DEFAULT_SETTINGS>(() => {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; }
    catch { return DEFAULT_SETTINGS; }
  });

  const toggle = (key: SettingsKey) => {
    if (typeof settings[key] !== "boolean") return;
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
    toast.success("Setting updated");
  };

  const groups = [
    {
      title: "Notifications",
      icon: Bell,
      color: "text-blue-500",
      items: [
        { key: "push_notifications" as SettingsKey, label: "Push Notifications", desc: "Ride updates and alerts" },
        { key: "email_notifications" as SettingsKey, label: "Email Notifications", desc: "Receipts and account activity" },
        { key: "ride_updates" as SettingsKey, label: "Ride Status Updates", desc: "Driver arrival, trip progress" },
        { key: "promo_emails" as SettingsKey, label: "Promotions & Offers", desc: "Deals and discount codes" },
      ],
    },
    {
      title: "Location",
      icon: MapPin,
      color: "text-emerald-500",
      items: [
        { key: "location_always" as SettingsKey, label: "Always Allow Location", desc: "Background location access" },
        { key: "location_while_using" as SettingsKey, label: "Location While Using", desc: "Only while app is open" },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      color: "text-violet-500",
      items: [
        { key: "share_trip_data" as SettingsKey, label: "Share Trip Analytics", desc: "Help improve the service" },
        { key: "two_factor" as SettingsKey, label: "Two-Factor Auth", desc: "Extra security for your account" },
      ],
    },
    {
      title: "Display",
      icon: Eye,
      color: "text-amber-500",
      items: [
        { key: "dark_mode" as SettingsKey, label: "Dark Mode", desc: "Switch to dark theme" },
      ],
    },
  ];

  return (
    <AppLayout title="Settings" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24 space-y-4">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-[17px]">Settings</h1>
        </div>

        {groups.map(group => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="rounded-2xl bg-card border border-border/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
                <Icon className={cn("w-4 h-4", group.color)} />
                <span className="text-[12px] font-bold text-foreground">{group.title}</span>
              </div>
              {group.items.map((item, i) => (
                <div key={item.key} className={cn("flex items-center justify-between px-4 py-3.5", i > 0 && "border-t border-border/20")}>
                  <div className="flex-1 mr-4">
                    <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={settings[item.key] as boolean} onCheckedChange={() => toggle(item.key)} />
                </div>
              ))}
            </div>
          );
        })}

        {/* Language / Account links */}
        <div className="rounded-2xl bg-card border border-border/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-500" />
            <span className="text-[12px] font-bold text-foreground">Account</span>
          </div>
          {[
            { label: "Language", value: settings.language, href: "/settings" },
            { label: "Change Password", value: "", href: "/account/security" },
            { label: "Delete Account", value: "", href: "/profile/delete-account", danger: true },
          ].map((row, i) => (
            <button key={row.label} onClick={() => navigate(row.href)}
              className={cn("w-full flex items-center justify-between px-4 py-3.5 active:bg-muted/30 transition-colors", i > 0 && "border-t border-border/20")}>
              <span className={cn("text-[13px] font-semibold", row.danger ? "text-red-500" : "text-foreground")}>{row.label}</span>
              <div className="flex items-center gap-1">
                {row.value && <span className="text-[12px] text-muted-foreground">{row.value}</span>}
                <ChevronRight className={cn("w-4 h-4", row.danger ? "text-red-400/60" : "text-muted-foreground/50")} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
