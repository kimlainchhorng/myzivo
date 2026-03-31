import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Globe, UserCheck, Bell, CreditCard, Gift, ChevronRight, UserPen, FileText, Scale, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const settingsItems = [
  {
    icon: UserPen,
    label: "Profile Information",
    description: "Name, email & phone",
    href: "/account/profile-edit",
    color: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
  },
  {
    icon: Shield,
    label: "Security",
    description: "Password & 2FA",
    href: "/account/security",
    color: "bg-teal-500/15",
    iconColor: "text-teal-500",
  },
  {
    icon: Globe,
    label: "Preferences",
    description: "Language & settings",
    href: "/account/preferences",
    color: "bg-indigo-500/15",
    iconColor: "text-indigo-500",
  },
  {
    icon: UserCheck,
    label: "Account Status",
    description: "Manage your account",
    href: "/profile/delete-account",
    color: "bg-orange-500/15",
    iconColor: "text-orange-500",
  },
  {
    icon: Bell,
    label: "Notifications",
    description: "Preferences & alerts",
    href: "/account/notifications",
    color: "bg-sky-500/15",
    iconColor: "text-sky-500",
  },
  {
    icon: CreditCard,
    label: "Payment Methods",
    description: "Manage cards & wallets",
    href: "/account/wallet",
    color: "bg-purple-500/15",
    iconColor: "text-purple-500",
  },
  {
    icon: Gift,
    label: "Gift Cards",
    description: "Buy, send, or redeem",
    href: "/account/gift-cards",
    color: "bg-pink-500/15",
    iconColor: "text-pink-500",
  },
];

const legalItems = [
  {
    icon: FileText,
    label: "Terms & Conditions",
    description: "Our terms of service",
    href: "/terms",
    color: "bg-slate-500/15",
    iconColor: "text-slate-500",
  },
  {
    icon: Scale,
    label: "Privacy Policy",
    description: "How we handle your data",
    href: "/privacy",
    color: "bg-cyan-500/15",
    iconColor: "text-cyan-500",
  },
  {
    icon: Cookie,
    label: "Cookie Policy",
    description: "Cookie usage & preferences",
    href: "/cookies",
    color: "bg-amber-500/15",
    iconColor: "text-amber-500",
  },
  {
    icon: Shield,
    label: "Partner Disclosure",
    description: "Travel partner information",
    href: "/partner-disclosure",
    color: "bg-rose-500/15",
    iconColor: "text-rose-500",
  },
];

export default function AccountSettingsPage() {
  const navigate = useNavigate();

  const renderItem = (item: typeof settingsItems[0]) => (
    <button
      key={item.label}
      onClick={() => navigate(item.href)}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:bg-accent/50 transition-colors text-left active:scale-[0.98]"
    >
      <div className={`h-12 w-12 min-w-12 rounded-full ${item.color} flex items-center justify-center`}>
        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{item.label}</p>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      {/* Settings List */}
      <div className="p-4 space-y-3">
        {settingsItems.map(renderItem)}
      </div>

      {/* Legal Section */}
      <div className="px-4 pb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Legal & Policies</p>
        <div className="space-y-3">
          {legalItems.map(renderItem)}
        </div>
      </div>
    </div>
  );
}
