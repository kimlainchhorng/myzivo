import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Globe, UserCheck, Bell, CreditCard, Gift, ChevronRight, UserPen, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const settingsItems = [
  { icon: UserPen, label: "Profile Information", description: "Name, email & phone", href: "/account/profile-edit", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Shield, label: "Security", description: "Password & 2FA", href: "/account/security", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Globe, label: "Preferences", description: "Language & settings", href: "/account/preferences", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: UserCheck, label: "Account Status", description: "Manage your account", href: "/profile/delete-account", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Bell, label: "Notifications", description: "Preferences & alerts", href: "/account/notifications", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: CreditCard, label: "Payment Methods", description: "Manage cards & wallets", href: "/account/wallet", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: Gift, label: "Gift Cards", description: "Buy, send, or redeem", href: "/account/gift-cards", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Scale, label: "Legal & Policies", description: "Terms, privacy & 120+ policies", href: "/account/legal", color: "bg-slate-500/15", iconColor: "text-slate-500" },
];

export default function AccountSettingsPage() {
  const navigate = useNavigate();

  const renderSettingItem = (item: typeof settingsItems[0]) => (
    <button
      key={item.label}
      onClick={() => navigate(item.href)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-colors text-left active:scale-[0.98]"
    >
      <div className={`h-9 w-9 min-w-9 rounded-full ${item.color} flex items-center justify-center`}>
        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">{item.label}</p>
        <p className="text-[11px] text-muted-foreground">{item.description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {settingsItems.map(renderSettingItem)}
      </div>
    </div>
  );
}
