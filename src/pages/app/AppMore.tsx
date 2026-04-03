/**
 * App More Screen — Quick Access only
 */
import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight, Settings, ShoppingBag, Wallet, MapPin, Handshake,
  Sparkles, Car, UtensilsCrossed, Store, Wrench, Building2, Truck,
} from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

const partnerOptions = [
  { icon: Car, label: "Become a Driver", description: "Earn money driving with ZIVO", href: "/partner-with-zivo?type=driver", color: "from-blue-500 to-blue-600" },
  { icon: UtensilsCrossed, label: "Become a Restaurant Partner", description: "List your restaurant on ZIVO", href: "/partner-with-zivo?type=restaurant", color: "from-orange-500 to-amber-500" },
  { icon: Store, label: "Become a Shop Partner", description: "Sell products through ZIVO", href: "/partner-with-zivo?type=store", color: "from-emerald-500 to-green-500" },
  { icon: Wrench, label: "Become an Auto Repair Partner", description: "Offer repair services on ZIVO", href: "/partner-with-zivo?type=auto-repair", color: "from-slate-500 to-slate-600" },
  { icon: Building2, label: "Become a Hotel Partner", description: "List your property on ZIVO", href: "/partner-with-zivo?type=hotel", color: "from-purple-500 to-purple-600" },
  { icon: Truck, label: "Become a Delivery Partner", description: "Deliver food & packages", href: "/partner-with-zivo?type=delivery", color: "from-rose-500 to-pink-500" },
];

const quickLinks = [
  { icon: Settings, label: "Settings", href: "/account/settings", description: "App settings & preferences", iconColor: "text-muted-foreground", iconBg: "bg-muted/60" },
  { icon: ShoppingBag, label: "My Orders", href: "/grocery/orders", description: "Order history & tracking", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { icon: Wallet, label: "Wallet", href: "/wallet", description: "Balance & transactions", iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  { icon: Sparkles, label: "Loyalty", href: "/account/loyalty", description: "Points & tier perks", iconColor: "text-amber-500", iconBg: "bg-amber-500/10" },
  { icon: MapPin, label: "Saved Addresses", href: "/account/addresses", description: "Delivery addresses", iconColor: "text-rose-500", iconBg: "bg-rose-500/10" },
  { icon: Handshake, label: "Become Partner", href: "#partner", description: "Join ZIVO as partner", iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
];

const AppMore = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showPartnerSheet, setShowPartnerSheet] = useState(false);

  return (
    <AppLayout title="More" hideHeader>
      <div className="flex flex-col justify-center px-5 py-8 min-h-[70dvh]">
        <h2 className="font-bold text-lg mb-4">Quick Access</h2>

        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link, i) => {
            const isPartner = link.href === "#partner";
            const card = (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileTap={{ scale: 0.96 }}
                onClick={isPartner ? () => setShowPartnerSheet(true) : undefined}
                className="rounded-2xl bg-card border border-border/40 shadow-sm p-3.5 flex items-center gap-3 touch-manipulation cursor-pointer active:bg-muted/30 transition-colors"
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", link.iconBg)}>
                  <link.icon className={cn("w-5 h-5", link.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{link.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{link.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              </motion.div>
            );

            if (isPartner) return <Fragment key={link.label}>{card}</Fragment>;
            return <Link key={link.label} to={link.href} className="contents">{card}</Link>;
          })}
        </div>

        {/* Sign Out */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <button
              onClick={() => signOut()}
              className="w-full py-3.5 rounded-2xl border border-border/60 bg-card text-foreground font-bold text-sm touch-manipulation active:scale-[0.98] transition-all shadow-sm"
            >
              Sign out
            </button>
          </motion.div>
        )}

        {/* Close */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-3 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground text-sm font-medium touch-manipulation"
          >
            Close
          </button>
        </motion.div>
      </div>

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
    </AppLayout>
  );
};

export default AppMore;
