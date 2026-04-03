/**
 * MorePage - Full More screen with profile, quick access, travel extras,
 * support, contact, legal, and sign out.
 * Combines Quick Access from Profile + AppMore content.
 */
import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Car, Ticket, Smartphone, Briefcase, Scale, HelpCircle,
  Mail, FileText, Users, ChevronRight, LogOut, User,
  Award, Crown, Settings, ShoppingBag, Wallet, MapPin, Handshake,
  Sparkles, Wrench, UtensilsCrossed, Building2, Truck, Store,
  ExternalLink, Bell,
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import { useAffiliateAttribution } from "@/hooks/useAffiliateAttribution";
import { MERCHANT_APP_URL } from "@/lib/eatsTables";
import { openExternalUrl } from "@/lib/openExternalUrl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

// Travel Extras
const travelExtras = [
  { id: "transfers", name: "Airport Transfers", icon: Car, description: "KiwiTaxi, GetTransfer", color: "text-sky-500", bg: "bg-gradient-to-br from-sky-500/15 to-sky-500/5", borderColor: "border-sky-500/10" },
  { id: "activities", name: "Activities & Tours", icon: Ticket, description: "Klook, Tiqets, WeGoTrip", color: "text-pink-500", bg: "bg-gradient-to-br from-pink-500/15 to-pink-500/5", borderColor: "border-pink-500/10" },
  { id: "esim", name: "Travel eSIM", icon: Smartphone, description: "Airalo, Yesim, Drimsim", color: "text-violet-500", bg: "bg-gradient-to-br from-violet-500/15 to-violet-500/5", borderColor: "border-violet-500/10" },
  { id: "luggage", name: "Luggage Storage", icon: Briefcase, description: "Radical Storage", color: "text-amber-500", bg: "bg-gradient-to-br from-amber-500/15 to-amber-500/5", borderColor: "border-amber-500/10" },
  { id: "compensation", name: "Flight Comp.", icon: Scale, description: "AirHelp, Compensair", color: "text-emerald-500", bg: "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5", borderColor: "border-emerald-500/10" },
];

const supportItems = [
  { id: "help", name: "Help Center", icon: HelpCircle, href: "/help", desc: "Browse FAQs & guides" },
  { id: "contact", name: "Contact Us", icon: Mail, href: "/contact", desc: "Get in touch" },
  { id: "how", name: "How It Works", icon: Award, href: "/how-it-works", desc: "Learn about ZIVO" },
  { id: "partners", name: "Partners", icon: Users, href: "/partners", desc: "Our trusted partners" },
  { id: "creators", name: "Creator Program", icon: Crown, href: "/creators", desc: "Earn with ZIVO" },
];

const legalItems = [
  { id: "privacy", name: "Privacy Policy", href: "/privacy" },
  { id: "terms", name: "Terms of Service", href: "/terms" },
  { id: "affiliate", name: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { id: "partner-disc", name: "Partner Disclosure", href: "/partner-disclosure" },
];

const contactEmails = [
  { label: "General", email: "info@hizivo.com" },
  { label: "Payments", email: "payment@hizivo.com" },
  { label: "Support", email: "kimlain@hizivo.com" },
];

const partnerOptions = [
  { icon: Car, label: "Become a Driver", description: "Earn money driving with ZIVO", href: "/partner-with-zivo?type=driver", color: "from-blue-500 to-blue-600" },
  { icon: UtensilsCrossed, label: "Become a Restaurant Partner", description: "List your restaurant on ZIVO", href: "/partner-with-zivo?type=restaurant", color: "from-orange-500 to-amber-500" },
  { icon: Store, label: "Become a Shop Partner", description: "Sell products through ZIVO", href: "/partner-with-zivo?type=store", color: "from-emerald-500 to-green-500" },
  { icon: Wrench, label: "Become an Auto Repair Partner", description: "Offer repair services on ZIVO", href: "/partner-with-zivo?type=auto-repair", color: "from-slate-500 to-slate-600" },
  { icon: Building2, label: "Become a Hotel Partner", description: "List your property on ZIVO", href: "/partner-with-zivo?type=hotel", color: "from-purple-500 to-purple-600" },
  { icon: Truck, label: "Become a Delivery Partner", description: "Deliver food & packages", href: "/partner-with-zivo?type=delivery", color: "from-rose-500 to-pink-500" },
];

export default function MorePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: merchantData } = useMerchantRole();
  const affiliateAttribution = useAffiliateAttribution();
  const [showPartnerSheet, setShowPartnerSheet] = useState(false);

  const quickLinks = [
    { icon: Settings, label: "Settings", href: "/account/settings", description: "App settings & preferences", color: "from-gray-500/15 to-gray-600/10", iconColor: "text-muted-foreground" },
    { icon: ShoppingBag, label: t("profile.my_orders"), href: "/grocery/orders", description: t("profile.orders_desc"), color: "from-blue-500/15 to-blue-600/10", iconColor: "text-blue-500" },
    { icon: Wallet, label: t("profile.wallet"), href: "/wallet", description: t("profile.wallet_desc"), color: "from-emerald-500/15 to-emerald-600/10", iconColor: "text-emerald-500" },
    { icon: Sparkles, label: t("profile.loyalty"), href: "/account/loyalty", description: t("profile.loyalty_desc"), color: "from-amber-500/15 to-amber-600/10", iconColor: "text-amber-500" },
    { icon: MapPin, label: t("profile.saved_addresses"), href: "/account/addresses", description: t("profile.addresses_desc"), color: "from-rose-500/15 to-rose-600/10", iconColor: "text-rose-500" },
    { icon: Handshake, label: "Become Partner", href: "#partner", description: "Join ZIVO as partner", color: "from-violet-500/15 to-violet-600/10", iconColor: "text-violet-500" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-area-top safe-area-bottom">
      <SEOHead title="More – ZIVO" description="Quick access to ZIVO settings and features." noIndex />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">Z</span>
            </div>
            <span className="font-display font-bold text-sm text-foreground">ZIVO</span>
          </div>
          <h1 className="font-display font-bold text-lg">More</h1>
          <button
            onClick={() => navigate("/notifications")}
            className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
          >
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto px-4 py-4 pb-28 space-y-6">

        {/* ── User Account Card ── */}
        {user ? (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-primary/8 border border-primary/15 flex items-center gap-3 shadow-sm">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center shadow-inner">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{user.email?.split("@")[0]}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold touch-manipulation active:scale-95 transition-transform"
              >
                Edit
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-5 rounded-2xl bg-card border border-border/40 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-bold">Sign in to ZIVO</p>
                <p className="text-xs text-muted-foreground">Save your preferences</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 touch-manipulation active:scale-95 transition-transform"
              >
                Sign In
              </button>
            </div>
          </motion.section>
        )}

        {/* ── Travel Extras ── */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5 text-primary" />
            </div>
            Travel Extras
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {travelExtras.map((extra, i) => (
              <motion.button
                key={extra.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                onClick={() => navigate("/extras")}
                className={cn(
                  "p-4 rounded-2xl border text-left touch-manipulation active:scale-[0.97] transition-all duration-200 hover:shadow-md",
                  extra.bg, extra.borderColor
                )}
              >
                <div className="w-11 h-11 rounded-xl bg-card/60 backdrop-blur-sm flex items-center justify-center mb-2.5 shadow-sm">
                  <extra.icon className={cn("w-5 h-5", extra.color)} />
                </div>
                <h3 className="font-bold text-xs">{extra.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{extra.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── Support ── */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
            </div>
            Support
          </h2>
          <div className="space-y-1.5">
            {supportItems.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 text-left touch-manipulation active:scale-[0.99] transition-all hover:border-primary/15 hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm block">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── Quick Access ── */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-primary" />
            </div>
            {t("profile.quick_access")}
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {quickLinks.map((link, i) => {
              const isPartner = link.href === "#partner";
              const content = (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.03, duration: 0.35 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={isPartner ? () => setShowPartnerSheet(true) : undefined}
                  className={cn(
                    "rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-300",
                    isPartner && "cursor-pointer"
                  )}
                >
                  <div className="px-3 py-3 flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0`}>
                      <link.icon className={`w-4.5 h-4.5 ${link.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] leading-tight truncate">{link.label}</p>
                      <p className="text-[10px] text-muted-foreground/70 truncate leading-tight mt-0.5">{link.description}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  </div>
                </motion.div>
              );

              if (isPartner) return <Fragment key={link.label}>{content}</Fragment>;
              return <Link key={link.label} to={link.href}>{content}</Link>;
            })}
          </div>
        </motion.section>

        {/* ── Merchant Dashboard ── */}
        {merchantData?.isMerchant && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => void openExternalUrl(MERCHANT_APP_URL)}
              className="block w-full text-left"
            >
              <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-md p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/25">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t("profile.merchant_dashboard")}</p>
                      <p className="text-xs text-muted-foreground">{t("profile.merchant_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500/12 text-orange-500 border-orange-500/20 font-semibold text-xs rounded-full">{t("profile.partner")}</Badge>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </motion.button>
          </motion.section>
        )}

        {/* ── Contact Emails ── */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-primary" />
            </div>
            Contact Us
          </h2>
          <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-3">
            {contactEmails.map((contact) => (
              <div key={contact.email} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs font-medium">{contact.label}</span>
                <a href={`mailto:${contact.email}`} className="text-primary font-bold text-xs hover:underline">
                  {contact.email}
                </a>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Legal ── */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-primary" />
            </div>
            Legal
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {legalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.href)}
                className="p-3.5 rounded-2xl bg-card border border-border/40 text-left touch-manipulation active:scale-[0.97] transition-all hover:border-primary/15"
              >
                <span className="text-xs font-bold">{item.name}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── Sign Out ── */}
        {user && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pb-4">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-destructive/20 text-destructive font-bold touch-manipulation active:scale-[0.98] transition-all hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.section>
        )}

        {/* App Version */}
        <div className="text-center text-[10px] text-muted-foreground/50 pb-4 space-y-0.5">
          <p className="font-bold">ZIVO v1.0.4</p>
          <p>© 2026 ZIVO. All rights reserved.</p>
        </div>
      </main>

      {/* Partner Sheet */}
      <Sheet open={showPartnerSheet} onOpenChange={setShowPartnerSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85dvh] overflow-auto pb-10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-display">Become a Partner</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {partnerOptions.map((opt) => (
              <Link
                key={opt.label}
                to={opt.href}
                onClick={() => setShowPartnerSheet(false)}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border/30 bg-card/60 hover:bg-card/90 transition-colors touch-manipulation active:scale-[0.98]"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center shadow-lg`}>
                  <opt.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <ZivoMobileNav />
    </div>
  );
}
