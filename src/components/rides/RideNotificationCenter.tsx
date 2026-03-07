/**
 * RideNotificationCenter — Notification preferences, ride reminders,
 * price drop alerts, and promo notifications
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, BellRing, Clock, DollarSign, Tag, Car, MapPin, Shield, Zap, CheckCircle, ChevronRight, Sparkles, TrendingDown, Calendar, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type NotifTab = "feed" | "prefs" | "alerts";

interface Notification {
  id: string;
  type: "promo" | "price_drop" | "reminder" | "safety" | "ride_update";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
}

const notifications: Notification[] = [
  { id: "1", type: "price_drop", title: "Price Drop Alert 📉", message: "Your commute route is 23% cheaper right now. Book within 10 min!", time: "2 min ago", read: false, actionLabel: "Book Now" },
  { id: "2", type: "promo", title: "Weekend Special 🎉", message: "Use code WEEKEND30 for 30% off your next 3 rides", time: "1 hr ago", read: false, actionLabel: "Apply Code" },
  { id: "3", type: "reminder", title: "Scheduled Ride ⏰", message: "Your ride to Airport Terminal B departs in 45 minutes", time: "3 hrs ago", read: true },
  { id: "4", type: "ride_update", title: "Trip Complete ✅", message: "Your ride to Midtown has been completed. Rate your driver!", time: "Yesterday", read: true, actionLabel: "Rate" },
  { id: "5", type: "safety", title: "Safety Update 🛡️", message: "Your trusted contacts have been notified about your recent trip", time: "Yesterday", read: true },
];

interface NotifPref {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const defaultPrefs: NotifPref[] = [
  { id: "ride_updates", label: "Ride Updates", description: "Driver assigned, arrival, trip status", icon: Car, enabled: true },
  { id: "price_drops", label: "Price Drop Alerts", description: "Get notified when fares decrease on saved routes", icon: TrendingDown, enabled: true },
  { id: "promos", label: "Promotions & Offers", description: "Promo codes, deals, and seasonal offers", icon: Tag, enabled: true },
  { id: "reminders", label: "Ride Reminders", description: "Reminders for scheduled and recurring rides", icon: Calendar, enabled: true },
  { id: "safety", label: "Safety Alerts", description: "Route deviations, emergency notifications", icon: Shield, enabled: true },
  { id: "surge", label: "Surge Notifications", description: "Alert when surge pricing starts or ends", icon: Zap, enabled: false },
  { id: "sounds", label: "Notification Sounds", description: "Play sounds for incoming notifications", icon: Volume2, enabled: true },
];

const typeIcons: Record<string, { icon: React.ElementType; color: string }> = {
  price_drop: { icon: TrendingDown, color: "text-emerald-500 bg-emerald-500/10" },
  promo: { icon: Tag, color: "text-primary bg-primary/10" },
  reminder: { icon: Clock, color: "text-amber-500 bg-amber-500/10" },
  ride_update: { icon: Car, color: "text-primary bg-primary/10" },
  safety: { icon: Shield, color: "text-violet-500 bg-violet-500/10" },
};

export default function RideNotificationCenter() {
  const [activeTab, setActiveTab] = useState<NotifTab>("feed");
  const [notifs, setNotifs] = useState(notifications);
  const [prefs, setPrefs] = useState(defaultPrefs);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const togglePref = (id: string) => {
    setPrefs(ps => ps.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const tabs = [
    { id: "feed" as const, label: "Feed", icon: BellRing, badge: unreadCount },
    { id: "prefs" as const, label: "Preferences", icon: Bell },
    { id: "alerts" as const, label: "Smart Alerts", icon: Zap },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            <p className="text-[10px] text-muted-foreground">{unreadCount} unread</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/30">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all relative", activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
              {tab.badge ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">{tab.badge}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {activeTab === "feed" && (
            <div className="space-y-2">
              {notifs.map((n, i) => {
                const { icon: TypeIcon, color } = typeIcons[n.type] || typeIcons.ride_update;
                return (
                  <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn("rounded-2xl border p-3.5 transition-all", n.read ? "bg-card border-border/30" : "bg-primary/[0.02] border-primary/20")}>
                    <div className="flex items-start gap-3">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", color)}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{n.title}</span>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                          {n.actionLabel && (
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-primary px-2" onClick={() => toast.success(`${n.actionLabel} action triggered`)}>
                              {n.actionLabel} <ChevronRight className="w-3 h-3 ml-0.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === "prefs" && (
            <div className="space-y-2">
              {prefs.map(pref => {
                const Icon = pref.icon;
                return (
                  <div key={pref.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", pref.enabled ? "bg-primary/10" : "bg-muted/40")}>
                      <Icon className={cn("w-4 h-4", pref.enabled ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-foreground">{pref.label}</span>
                      <p className="text-[10px] text-muted-foreground">{pref.description}</p>
                    </div>
                    <Switch checked={pref.enabled} onCheckedChange={() => togglePref(pref.id)} />
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-4">
              {/* Smart price alerts */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-foreground">Price Watch</h3>
                </div>
                <p className="text-xs text-muted-foreground">Set alerts for routes you ride frequently. We'll notify you when prices drop.</p>
                <div className="space-y-2">
                  {[
                    { route: "Home → Office", currentPrice: "$12-15", threshold: "$10", active: true },
                    { route: "Home → Airport", currentPrice: "$28-35", threshold: "$25", active: true },
                  ].map(alert => (
                    <div key={alert.route} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-foreground">{alert.route}</span>
                        <p className="text-[10px] text-muted-foreground">Alert below {alert.threshold} · Now {alert.currentPrice}</p>
                      </div>
                      <Switch defaultChecked={alert.active} />
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-bold" onClick={() => toast.info("Add route for price alerts")}>
                  <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Add Price Alert
                </Button>
              </div>

              {/* Smart reminders */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-foreground">Smart Reminders</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Pre-ride reminder", desc: "30 min before scheduled rides", enabled: true },
                    { label: "Weekly ride summary", desc: "Sunday evening spending recap", enabled: true },
                    { label: "Surge end alerts", desc: "Notify when surge pricing drops", enabled: false },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/20">
                      <div>
                        <span className="text-xs font-bold text-foreground">{r.label}</span>
                        <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                      </div>
                      <Switch defaultChecked={r.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
