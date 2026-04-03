/**
 * MorePage - Dedicated page for Quick Access menu items
 * Navigated to from the Profile "More" button
 */
import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import { useAffiliateAttribution } from "@/hooks/useAffiliateAttribution";
import { MERCHANT_APP_URL } from "@/lib/eatsTables";
import { openExternalUrl } from "@/lib/openExternalUrl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import {
  ArrowLeft, Settings, ShoppingBag, Wallet, MapPin, Handshake,
  Car, Wrench, UtensilsCrossed, Building2, Truck, Store,
  ExternalLink, Users, ChevronRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

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

  const partnerOptions = [
    { icon: Car, label: "Become a Driver", description: "Earn money driving with ZIVO", href: "/partner-with-zivo?type=driver", color: "from-blue-500 to-blue-600" },
    { icon: UtensilsCrossed, label: "Become a Restaurant Partner", description: "List your restaurant on ZIVO", href: "/partner-with-zivo?type=restaurant", color: "from-orange-500 to-amber-500" },
    { icon: Store, label: "Become a Shop Partner", description: "Sell products through ZIVO", href: "/partner-with-zivo?type=store", color: "from-emerald-500 to-green-500" },
    { icon: Wrench, label: "Become an Auto Repair Partner", description: "Offer repair services on ZIVO", href: "/partner-with-zivo?type=auto-repair", color: "from-slate-500 to-slate-600" },
    { icon: Building2, label: "Become a Hotel Partner", description: "List your property on ZIVO", href: "/partner-with-zivo?type=hotel", color: "from-purple-500 to-purple-600" },
    { icon: Truck, label: "Become a Delivery Partner", description: "Deliver food & packages", href: "/partner-with-zivo?type=delivery", color: "from-rose-500 to-pink-500" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-area-top safe-area-bottom">
      <SEOHead title="More – ZIVO" description="Quick access to ZIVO settings and features." noIndex />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display font-bold text-lg">{t("profile.quick_access")}</h1>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto px-4 py-4 pb-28 space-y-4">
        {/* Quick Access Links */}
        <div className="grid grid-cols-2 gap-2.5">
          {quickLinks.map((link, i) => {
            const isPartner = link.href === "#partner";
            const content = (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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

        {/* Merchant Dashboard */}
        {merchantData?.isMerchant && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
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
        )}

        {/* Partner Attribution */}
        {affiliateAttribution.hasAffiliateAttribution && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/15 to-violet-600/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="font-bold text-sm">{t("profile.referred_by")}</p>
                <p className="text-xs text-muted-foreground">{t("profile.joined_through")} {affiliateAttribution.partnerName}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sign Out */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="pt-2"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full h-13 text-base font-semibold rounded-2xl backdrop-blur-xl bg-card/50 border-border/40 shadow-lg hover:shadow-xl hover:bg-card/70 transition-all duration-300 touch-manipulation"
              onClick={async () => { await signOut(); navigate("/"); }}
            >
              {t("profile.sign_out")}
            </Button>
          </motion.div>
        )}
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
