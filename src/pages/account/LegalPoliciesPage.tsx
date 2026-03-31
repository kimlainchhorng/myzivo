import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, FileText, Scale, Cookie, Shield, Eye, Globe, Lock, Database, Plane, Undo2, XCircle, Car, Umbrella, AlertTriangle, Heart, CloudLightning, MessageSquare, Users, Landmark, UserX, Ban, Gavel, Share2, Siren, DollarSign, Brain, Copyright, Megaphone, Mail, RefreshCw, Link, Accessibility, BookOpen, Fingerprint, ShieldAlert, ShieldCheck, MapPin, Wifi, CreditCard, Baby, Clock, Headphones, Receipt, Truck, Building2, Languages, Smartphone, BadgeCheck, FileWarning, ScrollText, HandCoins, Waypoints, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const legalItems = [
  // Core Terms
  { icon: FileText, label: "Terms & Conditions", href: "/terms", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Scale, label: "Privacy Policy", href: "/privacy", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: Cookie, label: "Cookie Policy", href: "/cookies", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Shield, label: "Partner Disclosure", href: "/partner-disclosure", color: "bg-rose-500/15", iconColor: "text-rose-500" },

  // Privacy & Data
  { icon: Eye, label: "California Privacy (CCPA)", href: "/legal/california-privacy", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Globe, label: "GDPR Compliance", href: "/legal/gdpr", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Lock, label: "Do Not Sell My Info", href: "/legal/do-not-sell", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: Database, label: "Data Retention", href: "/legal/data-retention", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Fingerprint, label: "Biometric Data Policy", href: "/legal/biometric-data", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: MapPin, label: "Location Data Policy", href: "/legal/location-data", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Wifi, label: "Data Transfer & Cross-Border", href: "/legal/data-transfer", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },

  // Travel & Booking
  { icon: Plane, label: "Flight Booking Terms", href: "/legal/flight-terms", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Undo2, label: "Refund Policy", href: "/refunds", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: XCircle, label: "Cancellation Policy", href: "/legal/cancellation", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Globe, label: "Seller of Travel", href: "/legal/seller-of-travel", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Clock, label: "24-Hour Cancellation Rule", href: "/legal/24hr-cancellation", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Receipt, label: "Pricing & Fee Transparency", href: "/legal/pricing-transparency", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Building2, label: "Hotel Booking Terms", href: "/legal/hotel-terms", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // Marketplace & Services
  { icon: Car, label: "Car Rental Disclaimer", href: "/legal/car-rental-disclaimer", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Car, label: "Transportation Disclaimer", href: "/legal/transportation-disclaimer", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Umbrella, label: "Insurance Disclaimer", href: "/legal/insurance-disclaimer", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: AlertTriangle, label: "Damage Policy", href: "/legal/damage-policy", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Truck, label: "Delivery Service Terms", href: "/legal/delivery-terms", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Headphones, label: "Customer Support Policy", href: "/legal/support-policy", color: "bg-sky-500/15", iconColor: "text-sky-500" },

  // Liability & Protection
  { icon: AlertTriangle, label: "Limitation of Liability", href: "/legal/limitation-of-liability", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Shield, label: "Indemnification", href: "/legal/indemnification", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Ban, label: "No Guarantee Disclaimer", href: "/legal/no-guarantee", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: ShieldCheck, label: "Warranty Disclaimer", href: "/legal/warranty-disclaimer", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Heart, label: "Assumption of Risk", href: "/legal/assumption-of-risk", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: CloudLightning, label: "Force Majeure", href: "/legal/force-majeure", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: FileWarning, label: "Service Level Agreement", href: "/legal/sla", color: "bg-teal-500/15", iconColor: "text-teal-500" },

  // Dispute & Legal
  { icon: MessageSquare, label: "Dispute Resolution", href: "/legal/dispute-resolution", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Users, label: "Class Action & Jury Waiver", href: "/legal/class-action-waiver", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Landmark, label: "Governing Law & Jurisdiction", href: "/legal/governing-law", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: ScrollText, label: "Severability Clause", href: "/legal/severability", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: HandCoins, label: "Payment Terms & Conditions", href: "/legal/payment-terms", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },

  // User Policies
  { icon: UserX, label: "Age Restriction (18+)", href: "/legal/age-restriction", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Ban, label: "User Conduct Policy", href: "/legal/user-conduct", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Gavel, label: "Acceptable Use Policy", href: "/legal/acceptable-use", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Share2, label: "Social Media Policy", href: "/legal/social-media-policy", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Siren, label: "Account Termination", href: "/legal/account-termination", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Heart, label: "Non-Discrimination", href: "/legal/non-discrimination", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Baby, label: "Children's Privacy (COPPA)", href: "/legal/coppa", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Languages, label: "Language & Translation Policy", href: "/legal/language-policy", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },

  // Security & Fraud
  { icon: ShieldAlert, label: "Fraud Prevention", href: "/legal/fraud-prevention", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: DollarSign, label: "Anti-Money Laundering", href: "/legal/anti-money-laundering", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Shield, label: "Security Incident Response", href: "/legal/security-incident", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: CreditCard, label: "PCI-DSS Compliance", href: "/legal/pci-compliance", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: KeyRound, label: "Password & Authentication Policy", href: "/legal/password-policy", color: "bg-teal-500/15", iconColor: "text-teal-500" },

  // IP & Communications
  { icon: Brain, label: "Intellectual Property", href: "/legal/intellectual-property", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Copyright, label: "DMCA / Copyright", href: "/legal/dmca", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Megaphone, label: "Communication Consent", href: "/legal/communication-consent", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Mail, label: "Electronic Consent", href: "/legal/electronic-consent", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Smartphone, label: "Mobile App Terms", href: "/legal/mobile-app-terms", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },

  // Meta-Legal
  { icon: RefreshCw, label: "Modification of Terms", href: "/legal/modification-of-terms", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Link, label: "Third-Party Links", href: "/legal/third-party-links", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Accessibility, label: "Accessibility", href: "/legal/accessibility", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: BadgeCheck, label: "Sanctions & Export Controls", href: "/legal/sanctions", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Waypoints, label: "API & Developer Terms", href: "/legal/api-terms", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: BookOpen, label: "Compliance Center", href: "/compliance", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Fingerprint, label: "Partner Agreement", href: "/partner-agreement", color: "bg-slate-500/15", iconColor: "text-slate-500" },
];

export default function LegalPoliciesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Legal & Policies</h1>
            <p className="text-[11px] text-muted-foreground">{legalItems.length} documents</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="rounded-xl bg-card border border-border/30 divide-y divide-border/20">
          {legalItems.map((item) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
