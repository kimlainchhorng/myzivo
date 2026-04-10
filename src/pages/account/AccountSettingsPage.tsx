import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Globe, UserCheck, Bell, CreditCard, Gift, ChevronRight,
  UserPen, Scale, BarChart3, ShieldCheck, Download, Clock, Search, X,
  Smartphone, Heart, Users, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface SettingItem {
  icon: typeof Shield;
  label: string;
  description: string;
  href: string;
  color: string;
  iconColor: string;
}

interface SettingsGroup {
  title: string;
  items: SettingItem[];
}

const settingsGroups: SettingsGroup[] = [
  {
    title: "Account",
    items: [
      { icon: UserPen, label: "Profile Information", description: "Name, email & phone", href: "/account/profile-edit", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
      { icon: Shield, label: "Security", description: "Password & 2FA", href: "/account/security", color: "bg-teal-500/15", iconColor: "text-teal-500" },
      { icon: UserCheck, label: "Account Status", description: "Manage your account", href: "/profile/delete-account", color: "bg-orange-500/15", iconColor: "text-orange-500" },
      { icon: ShieldCheck, label: "Verification", description: "Request verified badge", href: "/account/verification", color: "bg-blue-500/15", iconColor: "text-blue-500" },
    ],
  },
  {
    title: "Privacy & Notifications",
    items: [
      { icon: Shield, label: "Privacy & Safety", description: "Blocks, mutes & visibility", href: "/account/privacy", color: "bg-rose-500/15", iconColor: "text-rose-500" },
      { icon: Bell, label: "Notifications", description: "Preferences & alerts", href: "/account/notifications", color: "bg-sky-500/15", iconColor: "text-sky-500" },
      { icon: Globe, label: "Preferences", description: "Language & settings", href: "/account/preferences", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
    ],
  },
  {
    title: "Payments & Rewards",
    items: [
      { icon: CreditCard, label: "Payment Methods", description: "Manage cards & wallets", href: "/account/wallet", color: "bg-purple-500/15", iconColor: "text-purple-500" },
      { icon: Gift, label: "Gift Cards", description: "Buy, send, or redeem", href: "/account/gift-cards", color: "bg-pink-500/15", iconColor: "text-pink-500" },
      { icon: Heart, label: "Favorites", description: "Saved items & places", href: "/account/favorites", color: "bg-red-500/15", iconColor: "text-red-500" },
    ],
  },
  {
    title: "Data & Activity",
    items: [
      { icon: BarChart3, label: "Analytics", description: "Profile stats & insights", href: "/account/analytics", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
      { icon: Download, label: "Export Data", description: "Download your data", href: "/account/export", color: "bg-green-500/15", iconColor: "text-green-500" },
      { icon: Clock, label: "Activity Log", description: "Login & action history", href: "/account/activity-log", color: "bg-amber-500/15", iconColor: "text-amber-500" },
      { icon: Scale, label: "Legal & Policies", description: "Terms, privacy & policies", href: "/account/legal", color: "bg-slate-500/15", iconColor: "text-slate-500" },
    ],
  },
];

const allItems = settingsGroups.flatMap(g => g.items);

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allItems.filter(
      i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    );
  }, [search]);

  const renderItem = (item: SettingItem, index: number) => (
    <motion.button
      key={item.label}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => navigate(item.href)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-all text-left active:scale-[0.98]"
    >
      <div className={`h-9 w-9 min-w-9 rounded-full ${item.color} flex items-center justify-center`}>
        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">{item.label}</p>
        <p className="text-[11px] text-muted-foreground">{item.description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 safe-area-top z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate("/more")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-xl bg-muted/50 border-border/40 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-5">
        <AnimatePresence mode="wait">
          {filtered ? (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No settings found for "{search}"</p>
              ) : (
                filtered.map((item, i) => renderItem(item, i))
              )}
            </motion.div>
          ) : (
            <motion.div key="groups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {settingsGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                    {group.title}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item, i) => renderItem(item, i))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
