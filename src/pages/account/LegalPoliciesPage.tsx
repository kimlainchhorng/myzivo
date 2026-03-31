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
  { icon: Waves, label: "Carbon Offset Disclosure", href: "/legal/carbon-offset", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Mountain, label: "Sustainable Tourism Policy", href: "/legal/sustainable-tourism", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Palmtree, label: "Eco-Friendly Travel Commitment", href: "/legal/eco-travel", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Heart, label: "Human Rights Policy", href: "/legal/human-rights", color: "bg-rose-500/15", iconColor: "text-rose-500" },
  { icon: Users, label: "Diversity & Inclusion Policy", href: "/legal/diversity-inclusion", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Sunset, label: "Community Impact Statement", href: "/legal/community-impact", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // ═══════════════════════════════════════════
  // SECTION 12: INTERNATIONAL COMPLIANCE
  // ═══════════════════════════════════════════
  { icon: Globe, label: "Brazil LGPD Compliance", href: "/legal/lgpd", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Globe, label: "Canada PIPEDA Compliance", href: "/legal/pipeda", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Globe, label: "Australia Privacy Act", href: "/legal/australia-privacy", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Globe, label: "Japan APPI Compliance", href: "/legal/appi", color: "bg-rose-500/15", iconColor: "text-rose-500" },
  { icon: Globe, label: "South Korea PIPA", href: "/legal/pipa", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Globe, label: "India DPDP Act Compliance", href: "/legal/dpdp", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Globe, label: "UK Data Protection Act", href: "/legal/uk-dpa", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Globe, label: "Singapore PDPA Compliance", href: "/legal/pdpa", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Globe, label: "China PIPL Compliance", href: "/legal/pipl", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Globe, label: "UAE Data Protection Law", href: "/legal/uae-data", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Globe, label: "EU Digital Services Act (DSA)", href: "/legal/eu-dsa", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Globe, label: "EU Digital Markets Act (DMA)", href: "/legal/eu-dma", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Globe, label: "EU AI Act Compliance", href: "/legal/eu-ai-act", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Landmark, label: "US State Privacy Laws (50-State)", href: "/legal/us-state-privacy", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Landmark, label: "Virginia VCDPA Compliance", href: "/legal/vcdpa", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Landmark, label: "Colorado CPA Compliance", href: "/legal/colorado-cpa", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Landmark, label: "Connecticut CTDPA Compliance", href: "/legal/ctdpa", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Landmark, label: "Texas TDPSA Compliance", href: "/legal/tdpsa", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: BadgeCheck, label: "Illinois BIPA Compliance", href: "/legal/bipa", color: "bg-purple-500/15", iconColor: "text-purple-500" },

  // ═══════════════════════════════════════════
  // SECTION 13: TRANSPORT & MOBILITY SPECIFIC
  // ═══════════════════════════════════════════
  { icon: Ship, label: "Cruise & Maritime Terms", href: "/legal/cruise-terms", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Train, label: "Rail & Train Booking Terms", href: "/legal/rail-terms", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Bus, label: "Bus & Coach Terms", href: "/legal/bus-terms", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Bike, label: "Micro-Mobility Terms", href: "/legal/micro-mobility", color: "bg-lime-500/15", iconColor: "text-lime-500" },
  { icon: Anchor, label: "Ferry & Water Transport Terms", href: "/legal/ferry-terms", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: PlaneLanding, label: "Airport Transfer Terms", href: "/legal/airport-transfer", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Car, label: "Ride-Hailing Passenger Agreement", href: "/legal/ridehail-agreement", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Car, label: "Driver Partner Agreement", href: "/legal/driver-agreement", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: MapPin, label: "Geofencing & Zone Policy", href: "/legal/geofencing", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Zap, label: "Surge & Peak Pricing Policy", href: "/legal/surge-pricing", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Clock, label: "Wait Time & No-Show Policy", href: "/legal/wait-time", color: "bg-orange-500/15", iconColor: "text-orange-500" },

  // ═══════════════════════════════════════════
  // SECTION 14: FOOD & DELIVERY SPECIFIC
  // ═══════════════════════════════════════════
  { icon: Utensils, label: "Restaurant Partner Agreement", href: "/legal/restaurant-agreement", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Truck, label: "Delivery Partner Terms", href: "/legal/delivery-partner", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Wine, label: "Alcohol Delivery Policy", href: "/legal/alcohol-delivery", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: Coffee, label: "Food Quality Disclaimer", href: "/legal/food-quality", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Activity, label: "Nutritional Information Disclaimer", href: "/legal/nutritional-info", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Flame, label: "Food Handling & Safety Standards", href: "/legal/food-handling", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Receipt, label: "Menu Pricing Accuracy", href: "/legal/menu-pricing", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },

  // ═══════════════════════════════════════════
  // SECTION 15: ACCOMMODATION SPECIFIC
  // ═══════════════════════════════════════════
  { icon: Home, label: "Vacation Rental Terms", href: "/legal/vacation-rental", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Tent, label: "Experience & Activity Waiver", href: "/legal/experience-waiver", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Building2, label: "Property Host Agreement", href: "/legal/host-agreement", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Building2, label: "Guest Behavior Policy", href: "/legal/guest-behavior", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Shield, label: "Property Damage Protection", href: "/legal/property-damage", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Lock, label: "Check-In & Check-Out Policy", href: "/legal/check-in-out", color: "bg-slate-500/15", iconColor: "text-slate-500" },

  // ═══════════════════════════════════════════
  // SECTION 16: ADVANCED SECURITY & COMPLIANCE
  // ═══════════════════════════════════════════
  { icon: Shield, label: "SOC 2 Type II Compliance", href: "/legal/soc2", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Shield, label: "ISO 27001 Statement", href: "/legal/iso27001", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Shield, label: "HIPAA Compliance Notice", href: "/legal/hipaa", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Shield, label: "FedRAMP Readiness", href: "/legal/fedramp", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Server, label: "Cloud Security Policy", href: "/legal/cloud-security", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Network, label: "Network Security Policy", href: "/legal/network-security", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: KeyRound, label: "Encryption Key Management", href: "/legal/key-management", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: ScanFace, label: "Identity Verification Policy", href: "/legal/identity-verification", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: ShieldAlert, label: "Vulnerability Disclosure Program", href: "/legal/vulnerability-disclosure", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Radar, label: "Penetration Testing Policy", href: "/legal/pen-testing", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: HardDrive, label: "Data Destruction Policy", href: "/legal/data-destruction", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: FileLock2, label: "Zero-Trust Security Framework", href: "/legal/zero-trust", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },

  // ═══════════════════════════════════════════
  // SECTION 17: ADVERTISING & MONETIZATION
  // ═══════════════════════════════════════════
  { icon: Megaphone, label: "Advertising Policy", href: "/legal/advertising-policy", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Target, label: "Targeted Advertising Disclosure", href: "/legal/targeted-ads", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: BarChart3, label: "Ad Performance & Metrics Policy", href: "/legal/ad-metrics", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: CircleDollarSign, label: "Affiliate & Referral Program Terms", href: "/legal/affiliate-terms", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Sparkles, label: "Sponsored Content Policy", href: "/legal/sponsored-content", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Eye, label: "Ad Transparency & Labeling", href: "/legal/ad-transparency", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // ═══════════════════════════════════════════
  // SECTION 18: INSURANCE & FINANCIAL PRODUCTS
  // ═══════════════════════════════════════════
  { icon: Umbrella, label: "Travel Insurance Terms", href: "/legal/travel-insurance", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Shield, label: "Trip Protection Policy", href: "/legal/trip-protection", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: CreditCard, label: "Buy Now Pay Later Terms", href: "/legal/bnpl-terms", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: Banknote, label: "Wallet & Stored Value Terms", href: "/legal/wallet-terms", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: HandCoins, label: "Gift Card Terms & Conditions", href: "/legal/gift-card-terms", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: DollarSign, label: "Credit & Voucher Policy", href: "/legal/credit-voucher", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },

  // ═══════════════════════════════════════════
  // SECTION 19: ENTERPRISE & B2B
  // ═══════════════════════════════════════════
  { icon: BriefcaseBusiness, label: "Enterprise Service Agreement", href: "/legal/enterprise-agreement", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Building2, label: "Corporate Travel Policy", href: "/legal/corporate-travel", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: ClipboardCheck, label: "Vendor Code of Conduct", href: "/legal/vendor-code", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: FileCheck, label: "Data Processing Agreement (DPA)", href: "/legal/dpa", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Handshake, label: "Non-Disclosure Agreement (NDA)", href: "/legal/nda", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Scale3d, label: "Master Service Agreement (MSA)", href: "/legal/msa", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },

  // ═══════════════════════════════════════════
  // SECTION 20: META-LEGAL & COMPLIANCE
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
  { icon: Gauge, label: "Uptime & Availability Policy", href: "/legal/uptime-policy", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Archive, label: "Record Keeping Policy", href: "/legal/record-keeping", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: ListChecks, label: "Audit & Inspection Rights", href: "/legal/audit-rights", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Ratio, label: "Assignment & Transfer Clause", href: "/legal/assignment-transfer", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Flag, label: "Whistleblower Protection", href: "/legal/whistleblower", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: ScrollText, label: "Survival Clause", href: "/legal/survival-clause", color: "bg-slate-500/15", iconColor: "text-slate-500" },

  // ═══════════════════════════════════════════
  // SECTION 21: ANTI-HARASSMENT & SAFETY
  // ═══════════════════════════════════════════
  { icon: ShieldAlert, label: "Anti-Harassment Policy", href: "/legal/anti-harassment", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Ban, label: "Anti-Bullying Policy", href: "/legal/anti-bullying", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Siren, label: "Hate Speech Policy", href: "/legal/hate-speech", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: ShieldCheck, label: "Sexual Harassment Policy", href: "/legal/sexual-harassment", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: AlertTriangle, label: "Violence & Threats Policy", href: "/legal/violence-threats", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: UserX, label: "Stalking & Doxxing Policy", href: "/legal/stalking-doxxing", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Shield, label: "Self-Harm & Suicide Prevention", href: "/legal/self-harm-prevention", color: "bg-rose-500/15", iconColor: "text-rose-500" },
  { icon: Baby, label: "Child Sexual Exploitation Policy", href: "/legal/csam-policy", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Flame, label: "Terrorism & Extremism Policy", href: "/legal/terrorism-policy", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Eye, label: "Dangerous Organizations Policy", href: "/legal/dangerous-orgs", color: "bg-red-500/15", iconColor: "text-red-500" },

  // ═══════════════════════════════════════════
  // SECTION 22: ELECTION & POLITICAL
  // ═══════════════════════════════════════════
  { icon: Landmark, label: "Political Advertising Policy", href: "/legal/political-ads", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Flag, label: "Election Integrity Policy", href: "/legal/election-integrity", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: ShieldQuestion, label: "Deepfake & Synthetic Media Policy", href: "/legal/deepfake-policy", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Newspaper, label: "News Integrity Policy", href: "/legal/news-integrity", color: "bg-sky-500/15", iconColor: "text-sky-500" },

  // ═══════════════════════════════════════════
  // SECTION 23: HEALTH & WELLNESS
  // ═══════════════════════════════════════════
  { icon: Activity, label: "Telehealth Disclaimer", href: "/legal/telehealth", color: "bg-rose-500/15", iconColor: "text-rose-500" },
  { icon: Heart, label: "Wellness Product Disclaimer", href: "/legal/wellness-disclaimer", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: CircleAlert, label: "Pharmaceutical Disclaimer", href: "/legal/pharmaceutical", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Ban, label: "Controlled Substances Policy", href: "/legal/controlled-substances", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: ShieldCheck, label: "COVID-19 Policy", href: "/legal/covid-policy", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Activity, label: "Fitness & Activity Waiver", href: "/legal/fitness-waiver", color: "bg-orange-500/15", iconColor: "text-orange-500" },

  // ═══════════════════════════════════════════
  // SECTION 24: GAMBLING, CONTESTS & PROMOTIONS
  // ═══════════════════════════════════════════
  { icon: Sparkles, label: "Sweepstakes & Contest Rules", href: "/legal/sweepstakes", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Ticket, label: "Promotional Offer Terms", href: "/legal/promo-terms", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Coins, label: "Gambling & Betting Disclaimer", href: "/legal/gambling-disclaimer", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Crown, label: "VIP & Premium Tier Terms", href: "/legal/vip-terms", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Gem, label: "Subscription Auto-Renewal Terms", href: "/legal/auto-renewal", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: HandCoins, label: "Cashback & Rewards Policy", href: "/legal/cashback-policy", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },

  // ═══════════════════════════════════════════
  // SECTION 25: REAL ESTATE & PROPERTY
  // ═══════════════════════════════════════════
  { icon: Home, label: "Real Estate Listing Disclaimer", href: "/legal/real-estate", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Building2, label: "Short-Term Rental Regulations", href: "/legal/short-term-rental", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Map, label: "Zoning & Occupancy Compliance", href: "/legal/zoning-compliance", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Lock, label: "Tenant & Landlord Disclosure", href: "/legal/tenant-landlord", color: "bg-slate-500/15", iconColor: "text-slate-500" },

  // ═══════════════════════════════════════════
  // SECTION 26: ACCESSIBILITY & DISABILITY
  // ═══════════════════════════════════════════
  { icon: Accessibility, label: "WCAG 2.2 Compliance", href: "/legal/wcag", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Accessibility, label: "ADA Title III Compliance", href: "/legal/ada-title-iii", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Accessibility, label: "European Accessibility Act", href: "/legal/eaa", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Glasses, label: "Screen Reader Compatibility", href: "/legal/screen-reader", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Languages, label: "Sign Language Interpretation", href: "/legal/sign-language", color: "bg-violet-500/15", iconColor: "text-violet-500" },

  // ═══════════════════════════════════════════
  // SECTION 27: CRYPTO, WEB3 & BLOCKCHAIN
  // ═══════════════════════════════════════════
  { icon: Coins, label: "Cryptocurrency Payment Terms", href: "/legal/crypto-payments", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Blocks, label: "Blockchain Data Policy", href: "/legal/blockchain-data", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Vault, label: "Digital Wallet Security", href: "/legal/digital-wallet-security", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Hash, label: "NFT & Digital Asset Terms", href: "/legal/nft-terms", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: Network, label: "DeFi Disclaimer", href: "/legal/defi-disclaimer", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // ═══════════════════════════════════════════
  // SECTION 28: IOT, HARDWARE & DEVICES
  // ═══════════════════════════════════════════
  { icon: Smartphone, label: "Wearable Device Policy", href: "/legal/wearable-policy", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Wifi, label: "IoT Data Collection Policy", href: "/legal/iot-data", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Monitor, label: "Smart Display & TV Terms", href: "/legal/smart-display", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Car, label: "Connected Vehicle Data Policy", href: "/legal/connected-vehicle", color: "bg-blue-500/15", iconColor: "text-blue-500" },

  // ═══════════════════════════════════════════
  // SECTION 29: EDUCATION & RESEARCH
  // ═══════════════════════════════════════════
  { icon: BookOpen, label: "Educational Content Disclaimer", href: "/legal/education-disclaimer", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: FileSearch, label: "Research Data Usage Policy", href: "/legal/research-data", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Brain, label: "Academic Partnership Terms", href: "/legal/academic-terms", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Database, label: "FERPA Compliance Notice", href: "/legal/ferpa", color: "bg-blue-500/15", iconColor: "text-blue-500" },

  // ═══════════════════════════════════════════
  // SECTION 30: TELECOMMUNICATIONS
  // ═══════════════════════════════════════════
  { icon: RadioTower, label: "VoIP & Calling Terms", href: "/legal/voip-terms", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: MessageSquare, label: "In-App Messaging Policy", href: "/legal/messaging-policy", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Mic, label: "Call Recording Disclosure", href: "/legal/call-recording", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Mail, label: "Transactional Email Policy", href: "/legal/transactional-email", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: BellRing, label: "SMS & MMS Terms", href: "/legal/sms-terms", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },

  // ═══════════════════════════════════════════
  // SECTION 31: GOVERNMENT & PUBLIC SECTOR
  // ═══════════════════════════════════════════
  { icon: Landmark, label: "Government Use Terms", href: "/legal/government-use", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Shield, label: "ITAR Compliance", href: "/legal/itar", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Flag, label: "FOIA Response Policy", href: "/legal/foia", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: BadgeCheck, label: "Section 508 Compliance", href: "/legal/section-508", color: "bg-green-500/15", iconColor: "text-green-500" },

  // ═══════════════════════════════════════════
  // SECTION 32: DISPUTE PREVENTION & RESOLUTION
  // ═══════════════════════════════════════════
  { icon: MessageSquare, label: "Mediation Process", href: "/legal/mediation", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Scale, label: "Small Claims Procedure", href: "/legal/small-claims", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Gavel, label: "Expert Determination Clause", href: "/legal/expert-determination", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Users, label: "Multi-Party Dispute Resolution", href: "/legal/multi-party-dispute", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Globe, label: "Cross-Border Dispute Policy", href: "/legal/cross-border-dispute", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: DollarSign, label: "Fee-Shifting & Cost Allocation", href: "/legal/fee-shifting", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // ═══════════════════════════════════════════
  // SECTION 33: ANTI-COMPETITIVE & TRADE
  // ═══════════════════════════════════════════
  { icon: Ban, label: "Antitrust & Competition Policy", href: "/legal/antitrust", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Handshake, label: "Fair Trade Practices", href: "/legal/fair-trade", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: ShieldAlert, label: "Price-Fixing Prohibition", href: "/legal/price-fixing", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Scale3d, label: "Market Dominance Disclosure", href: "/legal/market-dominance", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: ListChecks, label: "Non-Compete Clause", href: "/legal/non-compete", color: "bg-slate-500/15", iconColor: "text-slate-500" },

  // ═══════════════════════════════════════════
  // SECTION 34: LABOR & EMPLOYMENT
  // ═══════════════════════════════════════════
  { icon: Users, label: "Independent Contractor Terms", href: "/legal/contractor-terms", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Gavel, label: "Worker Classification Policy", href: "/legal/worker-classification", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: DollarSign, label: "Minimum Earnings Guarantee", href: "/legal/minimum-earnings", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: Clock, label: "Working Hours & Breaks Policy", href: "/legal/working-hours", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Shield, label: "Worker Safety Standards", href: "/legal/worker-safety", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Heart, label: "Benefits & Compensation Policy", href: "/legal/benefits-policy", color: "bg-pink-500/15", iconColor: "text-pink-500" },

  // ═══════════════════════════════════════════
  // SECTION 35: ANTI-TRAFFICKING & EXPLOITATION
  // ═══════════════════════════════════════════
  { icon: Shield, label: "Anti-Human Trafficking Policy", href: "/legal/anti-trafficking", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Ban, label: "Forced Labor Prohibition", href: "/legal/forced-labor", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Eye, label: "Supply Chain Transparency", href: "/legal/supply-chain", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Heart, label: "Conflict Minerals Statement", href: "/legal/conflict-minerals", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // ═══════════════════════════════════════════
  // SECTION 36: MEDIA & ENTERTAINMENT
  // ═══════════════════════════════════════════
  { icon: Camera, label: "Photography & Filming Policy", href: "/legal/photography-policy", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Podcast, label: "Podcast & Audio Content Terms", href: "/legal/podcast-terms", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Monitor, label: "Video Streaming Terms", href: "/legal/streaming-terms", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Newspaper, label: "Press & Media Relations", href: "/legal/press-policy", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Copyright, label: "Music Licensing Disclaimer", href: "/legal/music-licensing", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: PenTool, label: "Trademark Usage Guidelines", href: "/legal/trademark-guidelines", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // ═══════════════════════════════════════════
  // SECTION 37: MARKETPLACE INTEGRITY
  // ═══════════════════════════════════════════
  { icon: ShieldCheck, label: "Counterfeit Goods Policy", href: "/legal/counterfeit-policy", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Glasses, label: "Product Authenticity Guarantee", href: "/legal/authenticity", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: AlertTriangle, label: "Recall & Safety Notices", href: "/legal/recall-notices", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Scale, label: "Fair Pricing Commitment", href: "/legal/fair-pricing", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: ListChecks, label: "Quality Assurance Standards", href: "/legal/quality-assurance", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: Radar, label: "Fake Review Detection Policy", href: "/legal/fake-reviews", color: "bg-red-500/15", iconColor: "text-red-500" },

  // ═══════════════════════════════════════════
  // SECTION 38: EMERGENCY & CRISIS
  // ═══════════════════════════════════════════
  { icon: Siren, label: "Emergency Response Protocol", href: "/legal/emergency-response", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Flame, label: "Natural Disaster Response", href: "/legal/disaster-response", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Activity, label: "Crisis Communication Policy", href: "/legal/crisis-communication", color: "bg-orange-500/15", iconColor: "text-orange-500" },
  { icon: Shield, label: "Business Continuity Plan", href: "/legal/business-continuity", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Headphones, label: "Emergency Support Escalation", href: "/legal/emergency-escalation", color: "bg-red-500/15", iconColor: "text-red-500" },

  // ═══════════════════════════════════════════
  // SECTION 39: INTELLECTUAL PROPERTY EXTENDED
  // ═══════════════════════════════════════════
  { icon: Brain, label: "Patent Policy", href: "/legal/patent-policy", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Copyright, label: "Trade Secret Protection", href: "/legal/trade-secrets", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: PenTool, label: "Brand Guidelines & Usage", href: "/legal/brand-guidelines", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: FileCode, label: "Software License Agreement", href: "/legal/software-license", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Blocks, label: "Font & Typography Licensing", href: "/legal/font-licensing", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Camera, label: "Image & Asset Licensing", href: "/legal/image-licensing", color: "bg-pink-500/15", iconColor: "text-pink-500" },

  // ═══════════════════════════════════════════
  // SECTION 40: COMPLIANCE CERTIFICATIONS
  // ═══════════════════════════════════════════
  { icon: BadgeCheck, label: "GDPR Data Protection Officer", href: "/legal/dpo-disclosure", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: ClipboardCheck, label: "Annual Compliance Report", href: "/legal/annual-compliance", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: FileSearch, label: "Third-Party Audit Results", href: "/legal/audit-results", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Shield, label: "Privacy Impact Assessment", href: "/legal/privacy-impact", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Scale3d, label: "Regulatory Filing Disclosure", href: "/legal/regulatory-filings", color: "bg-slate-500/15", iconColor: "text-slate-500" },

  // ═══════════════════════════════════════════
  // SECTION 41: SOCIAL RESPONSIBILITY
  // ═══════════════════════════════════════════
  { icon: Heart, label: "Charitable Giving Policy", href: "/legal/charitable-giving", color: "bg-pink-500/15", iconColor: "text-pink-500" },
  { icon: Users, label: "Volunteer & Pro Bono Terms", href: "/legal/volunteer-terms", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: TreePine, label: "Net Zero Commitment", href: "/legal/net-zero", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Globe, label: "UN Global Compact Adherence", href: "/legal/un-global-compact", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Gem, label: "ESG Disclosure Statement", href: "/legal/esg-disclosure", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },

  // ═══════════════════════════════════════════
  // SECTION 42: ADVANCED PRIVACY CONTROLS
  // ═══════════════════════════════════════════
  { icon: Lock, label: "Privacy by Design Framework", href: "/legal/privacy-by-design", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Eye, label: "Consent Management Policy", href: "/legal/consent-management", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { icon: Database, label: "Data Minimization Principles", href: "/legal/data-minimization", color: "bg-teal-500/15", iconColor: "text-teal-500" },
  { icon: UserMinus, label: "Account Deletion Guarantee", href: "/legal/deletion-guarantee", color: "bg-red-500/15", iconColor: "text-red-500" },
  { icon: Archive, label: "Data Subject Access Request (DSAR)", href: "/legal/dsar", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Hash, label: "Pseudonymization Policy", href: "/legal/pseudonymization", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: FileLock2, label: "End-to-End Encryption Policy", href: "/legal/e2e-encryption", color: "bg-violet-500/15", iconColor: "text-violet-500" },

  // ═══════════════════════════════════════════
  // SECTION 43: FINANCIAL SERVICES REGULATION
  // ═══════════════════════════════════════════
  { icon: Landmark, label: "FinCEN Registration Disclosure", href: "/legal/fincen", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: DollarSign, label: "Consumer Financial Protection", href: "/legal/cfpb-compliance", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
  { icon: CreditCard, label: "Electronic Fund Transfer Act", href: "/legal/efta", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Banknote, label: "Truth in Lending Disclosure", href: "/legal/tila", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: Shield, label: "Dodd-Frank Compliance", href: "/legal/dodd-frank", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: PiggyBank, label: "FDIC & Deposit Disclaimer", href: "/legal/fdic-disclaimer", color: "bg-blue-500/15", iconColor: "text-blue-500" },

  // ═══════════════════════════════════════════
  // SECTION 44: AUTOMOTIVE & VEHICLE
  // ═══════════════════════════════════════════
  { icon: Car, label: "Vehicle Inspection Standards", href: "/legal/vehicle-inspection", color: "bg-violet-500/15", iconColor: "text-violet-500" },
  { icon: Car, label: "EV Charging Terms", href: "/legal/ev-charging", color: "bg-green-500/15", iconColor: "text-green-500" },
  { icon: Shield, label: "Autonomous Vehicle Disclaimer", href: "/legal/autonomous-vehicle", color: "bg-purple-500/15", iconColor: "text-purple-500" },
  { icon: AlertTriangle, label: "Roadside Assistance Terms", href: "/legal/roadside-assistance", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: MapPin, label: "Tolling & Parking Policy", href: "/legal/tolling-parking", color: "bg-slate-500/15", iconColor: "text-slate-500" },
  { icon: Flame, label: "Vehicle Recall Notification", href: "/legal/vehicle-recall", color: "bg-red-500/15", iconColor: "text-red-500" },

  // ═══════════════════════════════════════════
  // SECTION 45: AVIATION REGULATORY
  // ═══════════════════════════════════════════
  { icon: Plane, label: "DOT Passenger Protection", href: "/legal/dot-passenger", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: PlaneTakeoff, label: "Tarmac Delay Contingency", href: "/legal/tarmac-delay", color: "bg-sky-500/15", iconColor: "text-sky-500" },
  { icon: Luggage, label: "Denied Boarding Compensation", href: "/legal/denied-boarding", color: "bg-amber-500/15", iconColor: "text-amber-500" },
  { icon: PlaneLanding, label: "EU261 Flight Compensation", href: "/legal/eu261", color: "bg-blue-500/15", iconColor: "text-blue-500" },
  { icon: Plane, label: "Montreal Convention Notice", href: "/legal/montreal-convention", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Globe, label: "Warsaw Convention Disclosure", href: "/legal/warsaw-convention", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
  { icon: Receipt, label: "Airline Ancillary Fee Disclosure", href: "/legal/ancillary-fees", color: "bg-amber-500/15", iconColor: "text-amber-500" },

  // ═══════════════════════════════════════════
  // SECTION 46: FINAL & CLOSING
  // ═══════════════════════════════════════════
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
