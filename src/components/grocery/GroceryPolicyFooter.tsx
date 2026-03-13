/**
 * GroceryPolicyFooter — Instacart-style trust footer for store pages
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, RotateCcw, DollarSign, FileText, Scale, Clock, Heart } from "lucide-react";
import { DELIVERY_MIN_FEE, SERVICE_FEE_PCT, formatFee } from "@/config/groceryPricing";

const TRUST_BADGES = [
  { icon: DollarSign, label: "Low Fees", desc: "Transparent pricing" },
  { icon: ShieldCheck, label: "Quality Guarantee", desc: "Freshness assured" },
  { icon: RotateCcw, label: "Easy Refunds", desc: "Within 24 hours" },
  { icon: Heart, label: "100% Tips", desc: "Go to your driver" },
];

const POLICY_LINKS = [
  { to: "/grocery/fees", icon: DollarSign, label: "Pricing & Fees", desc: `Delivery from ${formatFee(DELIVERY_BASE_FEE)} · Service ${SERVICE_FEE_PCT}% · Distance-based` },
  { to: "/grocery/returns", icon: RotateCcw, label: "Returns & Refunds", desc: "Freshness guarantee · Report issues within 24h" },
  { to: "/grocery/terms", icon: FileText, label: "Terms of Service", desc: "How it works · Cancellation · Substitutions" },
];

export function GroceryPolicyFooter() {
  return (
    <div className="mx-4 mt-6 mb-4 space-y-4">
      {/* Trust badges row */}
      <div className="grid grid-cols-4 gap-2">
        {TRUST_BADGES.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted/20 border border-border/10"
          >
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <badge.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[10px] font-bold text-foreground text-center leading-tight">{badge.label}</p>
            <p className="text-[8px] text-muted-foreground text-center">{badge.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Policy links */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Policies & Information</p>
        {POLICY_LINKS.map((link, i) => (
          <motion.div
            key={link.to}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={link.to}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/15 bg-card hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-200 group"
            >
              <div className="h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-foreground">{link.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{link.desc}</p>
              </div>
              <span className="text-[10px] text-primary font-semibold shrink-0">View →</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Fine print */}
      <div className="text-center space-y-1 pt-2">
        <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
          Prices and availability subject to change. Final price confirmed at checkout.
          By ordering, you agree to our <Link to="/grocery/terms" className="text-primary/60 hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary/60 hover:underline">Privacy Policy</Link>.
        </p>
        <p className="text-[9px] text-muted-foreground/40">© {new Date().getFullYear()} ZIVO · All rights reserved</p>
      </div>
    </div>
  );
}
