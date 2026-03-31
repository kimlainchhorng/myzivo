import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, FileText, Scale, Cookie, Shield, Eye, Globe, Lock, Database, Plane, Undo2, XCircle, Car, Umbrella, AlertTriangle, Heart, CloudLightning, MessageSquare, Users, Landmark, UserX, Ban, Gavel, Share2, Siren, DollarSign, Brain, Copyright, Megaphone, Mail, RefreshCw, Link, Accessibility, BookOpen, Fingerprint, ShieldAlert, ShieldCheck, MapPin, Wifi, CreditCard, Baby, Clock, Headphones, Receipt, Truck, Building2, Languages, Smartphone, BadgeCheck, FileWarning, ScrollText, HandCoins, Waypoints, KeyRound, Cpu, Zap, CircleDollarSign, Monitor, BarChart3, UserCog, Mic, Camera, Activity, FileCheck, Scale3d, Radar, Flame, Sparkles, ShieldQuestion, GitBranch, ListChecks, Hash, PenTool, Podcast, Newspaper, RadioTower, BellRing, MailWarning, UserMinus, Glasses, Archive, Layers, ScanFace, Network, Server, HardDrive, CircleAlert, FileLock2, Ratio, Wrench, Gauge, TreePine, Flag, ShoppingBag, Coins, LockKeyhole, TabletSmartphone, Blocks, FileSearch, BriefcaseBusiness, ClipboardCheck, CircleX, AlarmClock, Orbit, Vault, PiggyBank, Banknote, Target, Unplug, SquareStack, PackageCheck, Gem, Crown, Handshake, FileCode, Route, Ticket, PlaneTakeoff, PlaneLanding, Luggage, Map, Compass, Anchor, Ship, Train, Bus, Bike, Utensils, Wine, Coffee, Store, Home, Tent, Mountain, Palmtree, Sunset, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

const legalItems = [
  // ═══════════════════════════════════════════
  // SECTION 1: CORE TERMS & AGREEMENTS
  // ═══════════════════════════════════════════
  { icon: FileText, label: "Terms & Conditions", href: "/terms", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Scale, label: "Privacy Policy", href: "/privacy", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: Cookie, label: "Cookie Policy", href: "/cookies", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Shield, label: "Partner Disclosure", href: "/partner-disclosure", color: "bg-rose-500/15", iconColor: "text-rose-500" },
  { icon: FileCheck, label: "User Agreement", href: "/legal/user-agreement", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Handshake, label: "Community Guidelines", href: "/legal/community-guidelines", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: ListChecks, label: "Platform Rules", href: "/legal/platform-rules", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },

  // ═══════════════════════════════════════════
  // SECTION 2: PRIVACY, DATA & SURVEILLANCE
  // ═══════════════════════════════════════════
  { icon: Eye, label: "California Privacy (CCPA)", href: "/legal/california-privacy", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Globe, label: "GDPR Compliance", href: "/legal/gdpr", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Lock, label: "Do Not Sell My Info", href: "/legal/do-not-sell", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: Database, label: "Data Retention", href: "/legal/data-retention", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Fingerprint, label: "Biometric Data Policy", href: "/legal/biometric-data", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: MapPin, label: "Location Data Policy", href: "/legal/location-data", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Wifi, label: "Data Transfer & Cross-Border", href: "/legal/data-transfer", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: ScanFace, label: "Facial Recognition Policy", href: "/legal/facial-recognition", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: Radar, label: "Tracking & Profiling Disclosure", href: "/legal/tracking-profiling", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Camera, label: "Photo & Video Data Policy", href: "/legal/photo-video-data", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Mic, label: "Voice & Audio Data Policy", href: "/legal/voice-audio-data", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Archive, label: "Data Portability & Export", href: "/legal/data-portability", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: UserMinus, label: "Right to Be Forgotten", href: "/legal/right-to-be-forgotten", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: FileLock2, label: "Data Encryption Standards", href: "/legal/encryption-standards", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Network, label: "Third-Party Data Sharing", href: "/legal/third-party-data-sharing", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Hash, label: "Anonymization & De-Identification", href: "/legal/anonymization", color: "bg-slate-500/15", iconColor: "text-slate-500" },

  // ═══════════════════════════════════════════
  // SECTION 3: AI, ALGORITHMS & AUTOMATION
  // ═══════════════════════════════════════════
  { icon: Cpu, label: "AI & Machine Learning Policy", href: "/legal/ai-policy", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Sparkles, label: "Automated Decision-Making", href: "/legal/automated-decisions", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: GitBranch, label: "Algorithm Transparency", href: "/legal/algorithm-transparency", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Zap, label: "Dynamic Pricing Disclosure", href: "/legal/dynamic-pricing", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: BarChart3, label: "Personalization & Recommendations", href: "/legal/personalization", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Target, label: "Behavioral Targeting Policy", href: "/legal/behavioral-targeting", color: "bg-red-500/15", iconColor: "text-red-500" },

  // ═══════════════════════════════════════════
  // SECTION 4: TRAVEL & BOOKING
  // ═══════════════════════════════════════════
  { icon: Plane, label: "Flight Booking Terms", href: "/legal/flight-terms", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Undo2, label: "Refund Policy", href: "/refunds", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: XCircle, label: "Cancellation Policy", href: "/legal/cancellation", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Globe, label: "Seller of Travel", href: "/legal/seller-of-travel", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Clock, label: "24-Hour Cancellation Rule", href: "/legal/24hr-cancellation", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Receipt, label: "Pricing & Fee Transparency", href: "/legal/pricing-transparency", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Building2, label: "Hotel Booking Terms", href: "/legal/hotel-terms", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: PlaneTakeoff, label: "Airline Passenger Rights", href: "/legal/passenger-rights", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Luggage, label: "Baggage & Lost Items Policy", href: "/legal/baggage-policy", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Route, label: "Itinerary Change Policy", href: "/legal/itinerary-changes", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Ticket, label: "Loyalty & Rewards Terms", href: "/legal/loyalty-terms", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Compass, label: "Travel Advisory Disclaimer", href: "/legal/travel-advisory", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Map, label: "Visa & Passport Disclaimer", href: "/legal/visa-passport", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },

  // ═══════════════════════════════════════════
  // SECTION 5: MARKETPLACE & SERVICES
  // ═══════════════════════════════════════════
  { icon: Car, label: "Car Rental Disclaimer", href: "/legal/car-rental-disclaimer", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Car, label: "Transportation Disclaimer", href: "/legal/transportation-disclaimer", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Umbrella, label: "Insurance Disclaimer", href: "/legal/insurance-disclaimer", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: AlertTriangle, label: "Damage Policy", href: "/legal/damage-policy", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Truck, label: "Delivery Service Terms", href: "/legal/delivery-terms", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Headphones, label: "Customer Support Policy", href: "/legal/support-policy", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Utensils, label: "Food Safety & Allergen Disclaimer", href: "/legal/food-safety", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Store, label: "Merchant Terms of Service", href: "/legal/merchant-terms", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: PackageCheck, label: "Service Guarantee Terms", href: "/legal/service-guarantee", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },

  // ═══════════════════════════════════════════
  // SECTION 6: LIABILITY & PROTECTION
  // ═══════════════════════════════════════════
  { icon: AlertTriangle, label: "Limitation of Liability", href: "/legal/limitation-of-liability", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Shield, label: "Indemnification", href: "/legal/indemnification", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Ban, label: "No Guarantee Disclaimer", href: "/legal/no-guarantee", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: ShieldCheck, label: "Warranty Disclaimer", href: "/legal/warranty-disclaimer", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Heart, label: "Assumption of Risk", href: "/legal/assumption-of-risk", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: CloudLightning, label: "Force Majeure", href: "/legal/force-majeure", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: FileWarning, label: "Service Level Agreement", href: "/legal/sla", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: CircleAlert, label: "Epidemic & Pandemic Policy", href: "/legal/pandemic-policy", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Flame, label: "Safety & Emergency Disclaimer", href: "/legal/safety-emergency", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Activity, label: "Health & Medical Disclaimer", href: "/legal/health-disclaimer", color: "bg-rose-500/15", iconColor: "text-rose-500" },
  { icon: Wrench, label: "Maintenance & Downtime Policy", href: "/legal/maintenance-policy", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Gauge, label: "Performance Disclaimer", href: "/legal/performance-disclaimer", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // ═══════════════════════════════════════════
  // SECTION 7: DISPUTE, LEGAL & GOVERNANCE
  // ═══════════════════════════════════════════
  { icon: MessageSquare, label: "Dispute Resolution", href: "/legal/dispute-resolution", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Users, label: "Class Action & Jury Waiver", href: "/legal/class-action-waiver", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Landmark, label: "Governing Law & Jurisdiction", href: "/legal/governing-law", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: ScrollText, label: "Severability Clause", href: "/legal/severability", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: HandCoins, label: "Payment Terms & Conditions", href: "/legal/payment-terms", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Scale3d, label: "Binding Arbitration Agreement", href: "/legal/binding-arbitration", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Ratio, label: "Entire Agreement Clause", href: "/legal/entire-agreement", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Flag, label: "Waiver of Rights", href: "/legal/waiver-of-rights", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: ClipboardCheck, label: "Regulatory Compliance", href: "/legal/regulatory-compliance", color: "bg-teal-500/15", iconColor: "text-teal-500" },

  // ═══════════════════════════════════════════
  // SECTION 8: USER POLICIES & CONDUCT
  // ═══════════════════════════════════════════
  { icon: UserX, label: "Age Restriction (18+)", href: "/legal/age-restriction", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Ban, label: "User Conduct Policy", href: "/legal/user-conduct", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Gavel, label: "Acceptable Use Policy", href: "/legal/acceptable-use", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Share2, label: "Social Media Policy", href: "/legal/social-media-policy", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Siren, label: "Account Termination", href: "/legal/account-termination", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Heart, label: "Non-Discrimination", href: "/legal/non-discrimination", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Baby, label: "Children's Privacy (COPPA)", href: "/legal/coppa", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Languages, label: "Language & Translation Policy", href: "/legal/language-policy", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: UserCog, label: "Account Verification Policy", href: "/legal/account-verification", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: CircleX, label: "Prohibited Content Policy", href: "/legal/prohibited-content", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: PenTool, label: "User-Generated Content Policy", href: "/legal/ugc-policy", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Glasses, label: "Review & Rating Guidelines", href: "/legal/review-guidelines", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Newspaper, label: "Content Moderation Policy", href: "/legal/content-moderation", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: ShieldQuestion, label: "Misinformation Policy", href: "/legal/misinformation", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Podcast, label: "Influencer & Creator Policy", href: "/legal/influencer-policy", color: "bg-pink-500/15", iconColor: "text-pink-500" },

  // ═══════════════════════════════════════════
  // SECTION 9: SECURITY, FRAUD & FINANCIAL
  // ═══════════════════════════════════════════
  { icon: ShieldAlert, label: "Fraud Prevention", href: "/legal/fraud-prevention", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: DollarSign, label: "Anti-Money Laundering", href: "/legal/anti-money-laundering", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Shield, label: "Security Incident Response", href: "/legal/security-incident", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: CreditCard, label: "PCI-DSS Compliance", href: "/legal/pci-compliance", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: KeyRound, label: "Password & Authentication Policy", href: "/legal/password-policy", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Vault, label: "Anti-Bribery & Corruption", href: "/legal/anti-bribery", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Banknote, label: "Currency & Exchange Rate Disclaimer", href: "/legal/currency-disclaimer", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: PiggyBank, label: "Chargeback & Dispute Policy", href: "/legal/chargeback-policy", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: CircleDollarSign, label: "Tax Compliance Disclosure", href: "/legal/tax-compliance", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: LockKeyhole, label: "Multi-Factor Authentication Policy", href: "/legal/mfa-policy", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Server, label: "Infrastructure Security Policy", href: "/legal/infra-security", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: HardDrive, label: "Backup & Disaster Recovery", href: "/legal/disaster-recovery", color: "bg-slate-500/15", iconColor: "text-slate-500" },

  // ═══════════════════════════════════════════
  // SECTION 10: IP, COMMUNICATIONS & TECH
  // ═══════════════════════════════════════════
  { icon: Brain, label: "Intellectual Property", href: "/legal/intellectual-property", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Copyright, label: "DMCA / Copyright", href: "/legal/dmca", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Megaphone, label: "Communication Consent", href: "/legal/communication-consent", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Mail, label: "Electronic Consent", href: "/legal/electronic-consent", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Smartphone, label: "Mobile App Terms", href: "/legal/mobile-app-terms", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: RadioTower, label: "Push Notification Policy", href: "/legal/push-notification", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: BellRing, label: "Marketing & Promotional Terms", href: "/legal/marketing-terms", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: MailWarning, label: "Anti-Spam Policy", href: "/legal/anti-spam", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: TabletSmartphone, label: "Cross-Device Tracking Policy", href: "/legal/cross-device-tracking", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Blocks, label: "SDK & Third-Party Integration", href: "/legal/sdk-integration", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Monitor, label: "Open Source Licenses", href: "/legal/open-source", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: FileCode, label: "Embedded Content Policy", href: "/legal/embedded-content", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },

  // ═══════════════════════════════════════════
  // SECTION 11: ENVIRONMENTAL & SOCIAL
  // ═══════════════════════════════════════════
  { icon: TreePine, label: "Environmental & Sustainability", href: "/legal/sustainability", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Gem, label: "Ethical Business Standards", href: "/legal/ethics", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Crown, label: "Modern Slavery Statement", href: "/legal/modern-slavery", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Coins, label: "Tipping & Gratuity Policy", href: "/legal/tipping-policy", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: ShoppingBag, label: "Consumer Protection Notice", href: "/legal/consumer-protection", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },

  // ═══════════════════════════════════════════
  // SECTION 12: META-LEGAL & COMPLIANCE
  // ═══════════════════════════════════════════
  { icon: RefreshCw, label: "Modification of Terms", href: "/legal/modification-of-terms", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Link, label: "Third-Party Links", href: "/legal/third-party-links", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Accessibility, label: "Accessibility", href: "/legal/accessibility", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: BadgeCheck, label: "Sanctions & Export Controls", href: "/legal/sanctions", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Waypoints, label: "API & Developer Terms", href: "/legal/api-terms", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Orbit, label: "Beta & Experimental Features", href: "/legal/beta-terms", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: AlarmClock, label: "Statute of Limitations Notice", href: "/legal/statute-of-limitations", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Unplug, label: "Account Inactivity Policy", href: "/legal/inactivity-policy", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: SquareStack, label: "Multi-Tenant Data Isolation", href: "/legal/data-isolation", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Layers, label: "Subprocessor List", href: "/legal/subprocessors", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: FileSearch, label: "Transparency Report", href: "/legal/transparency-report", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: BriefcaseBusiness, label: "Government Data Requests", href: "/legal/government-requests", color: "bg-red-500/15", iconColor: "text-red-500" },
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
