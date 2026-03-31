import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Globe, UserCheck, Bell, CreditCard, Gift, ChevronRight, UserPen, FileText, Scale, Cookie, Plane, Share2, Undo2, BookOpen, Gavel, Database, Copyright, MessageSquare, Accessibility, AlertTriangle, DollarSign, UserX, CloudLightning, Mail, Ban, Heart, Link, Brain, Users, RefreshCw, Landmark, Lock, Eye, Megaphone, Siren, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const settingsItems = [
  { icon: UserPen, label: "Profile Information", description: "Name, email & phone", href: "/account/profile-edit", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Shield, label: "Security", description: "Password & 2FA", href: "/account/security", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Globe, label: "Preferences", description: "Language & settings", href: "/account/preferences", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: UserCheck, label: "Account Status", description: "Manage your account", href: "/profile/delete-account", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Bell, label: "Notifications", description: "Preferences & alerts", href: "/account/notifications", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: CreditCard, label: "Payment Methods", description: "Manage cards & wallets", href: "/account/wallet", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: Gift, label: "Gift Cards", description: "Buy, send, or redeem", href: "/account/gift-cards", color: "bg-pink-500/15", iconColor: "text-pink-500" },
];

const legalItems = [
  { icon: FileText, label: "Terms & Conditions", description: "Our terms of service", href: "/terms", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Scale, label: "Privacy Policy", description: "How we handle your data", href: "/privacy", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: Eye, label: "California Privacy (CCPA)", description: "CCPA/CPRA consumer rights", href: "/legal/california-privacy", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Cookie, label: "Cookie Policy", description: "Cookie usage & preferences", href: "/cookies", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Shield, label: "Partner Disclosure", description: "Travel partner information", href: "/partner-disclosure", color: "bg-rose-500/15", iconColor: "text-rose-500" },
  { icon: Plane, label: "Flight Booking Terms", description: "Air travel rules & policies", href: "/legal/flight-terms", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Undo2, label: "Refund Policy", description: "Cancellations & refunds", href: "/refunds", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: XCircle, label: "Cancellation Policy", description: "How cancellations work", href: "/legal/cancellation", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Share2, label: "Social Media Policy", description: "Community & content guidelines", href: "/legal/social-media-policy", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Gavel, label: "Acceptable Use Policy", description: "Platform usage rules", href: "/legal/acceptable-use", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Ban, label: "User Conduct Policy", description: "Prohibited activities & rules", href: "/legal/user-conduct", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: BookOpen, label: "Compliance Center", description: "Licenses & regulations", href: "/compliance", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Database, label: "Data Retention", description: "How long we store your data", href: "/legal/data-retention", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Copyright, label: "DMCA / Copyright", description: "Copyright takedown & claims", href: "/legal/dmca", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Brain, label: "Intellectual Property", description: "IP rights, trademarks & patents", href: "/legal/intellectual-property", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: MessageSquare, label: "Dispute Resolution", description: "Arbitration & legal disputes", href: "/legal/dispute-resolution", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Users, label: "Class Action & Jury Waiver", description: "Class action & jury trial waiver", href: "/legal/class-action-waiver", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Accessibility, label: "Accessibility", description: "ADA compliance statement", href: "/legal/accessibility", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: AlertTriangle, label: "Limitation of Liability", description: "50 liability protections", href: "/legal/limitation-of-liability", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Shield, label: "Indemnification", description: "User indemnification terms", href: "/legal/indemnification", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: UserX, label: "Age Restriction (18+)", description: "Must be 18+ to use ZIVO", href: "/legal/age-restriction", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Heart, label: "Assumption of Risk", description: "Risk acknowledgment & disclosure", href: "/legal/assumption-of-risk", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Mail, label: "Electronic Consent", description: "E-SIGN Act compliance", href: "/legal/electronic-consent", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Megaphone, label: "Communication Consent", description: "TCPA & CAN-SPAM compliance", href: "/legal/communication-consent", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: CloudLightning, label: "Force Majeure", description: "Events beyond our control", href: "/legal/force-majeure", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: Ban, label: "No Guarantee Disclaimer", description: "Price, savings & outcome disclaimers", href: "/legal/no-guarantee", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Landmark, label: "Governing Law & Jurisdiction", description: "Delaware law & venue", href: "/legal/governing-law", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: RefreshCw, label: "Modification of Terms", description: "How we update our terms", href: "/legal/modification-of-terms", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Siren, label: "Account Termination", description: "Suspension & ban policy", href: "/legal/account-termination", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Link, label: "Third-Party Links", description: "External links disclaimer", href: "/legal/third-party-links", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: DollarSign, label: "Anti-Money Laundering", description: "BSA/AML & OFAC compliance", href: "/legal/anti-money-laundering", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Lock, label: "Do Not Sell My Info", description: "CCPA opt-out of data sales", href: "/legal/do-not-sell", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: Shield, label: "Security Incident Response", description: "How we handle data breaches", href: "/legal/security-incident", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Globe, label: "Seller of Travel", description: "Travel seller registration", href: "/legal/seller-of-travel", color: "bg-teal-500/15", iconColor: "text-teal-500" },
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

  const renderLegalItem = (item: typeof legalItems[0]) => (
    <button
      key={item.label}
      onClick={() => navigate(item.href)}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent/40 transition-colors text-left active:scale-[0.98]"
    >
      <div className={`h-7 w-7 min-w-7 rounded-full ${item.color} flex items-center justify-center`}>
        <item.icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
      </div>
      <p className="flex-1 text-[12px] font-medium text-muted-foreground">{item.label}</p>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
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

      <div className="px-3 pb-6">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 px-1">Legal & Policies ({legalItems.length})</p>
        <div className="rounded-xl bg-card border border-border/30 divide-y divide-border/20">
          {legalItems.map(renderLegalItem)}
        </div>
      </div>
    </div>
  );
}
