/**
 * Grocery Fees & Pricing — Instacart-style transparent pricing page
 */
import { ArrowLeft, DollarSign, Truck, Sparkles, Heart, ShieldCheck, Tag, Percent, Info, Gift, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { DELIVERY_BASE_FEE, DELIVERY_PER_MILE, DELIVERY_PER_MIN, DELIVERY_MIN_FEE, DELIVERY_MAX_FEE, SERVICE_FEE, TIP_OPTIONS, formatFee, calcMarkup, getMarkupPct, MARKUP_THRESHOLD } from "@/config/groceryPricing";

const FEE_BREAKDOWN = [
  {
    icon: Truck,
    label: "Delivery Fee",
    amount: formatFee(DELIVERY_FEE),
    description: "Covers driver compensation for shopping your order, vehicle costs, and delivery logistics. This fee goes directly toward ensuring your driver is fairly paid.",
    note: "May be reduced with ZIVO+ membership or promotional offers.",
  },
  {
    icon: Sparkles,
    label: "Service Fee",
    amount: formatFee(SERVICE_FEE),
    description: "Supports the ZIVO platform — including real-time inventory search, order management, customer support, and payment processing.",
    note: "This fee helps us operate and improve the service for you.",
  },
  {
    icon: Heart,
    label: "Driver Tip",
    amount: "Optional",
    description: `Your tip goes 100% to your driver — ZIVO never takes a cut. Suggested amounts: ${TIP_OPTIONS.filter(t => t > 0).map(t => `$${t}`).join(', ')}. You can also enter a custom amount.`,
    note: "Tips are optional but appreciated. Your driver shops, waits in line, and delivers to your door.",
  },
];

const PRICE_PROMISES = [
  { icon: Tag, title: "No Hidden Markups", desc: "Product prices match what the store charges. We don't inflate item prices — you pay the real shelf price." },
  { icon: ShieldCheck, title: "Price Transparency", desc: "All fees are shown upfront before you place your order. No surprise charges." },
  { icon: Percent, title: "Promo Codes Welcome", desc: "Apply promo codes at checkout to reduce delivery or service fees. Check your email for exclusive offers." },
  { icon: Gift, title: "Referral Credits", desc: "Refer friends and earn credits toward free deliveries. Both you and your friend get rewarded." },
];

const CANCEL_FEES = [
  { stage: "Before driver assigned", fee: "Free", color: "text-emerald-500" },
  { stage: "Driver assigned, not started", fee: "15%", color: "text-amber-500" },
  { stage: "Driver actively shopping", fee: "25%", color: "text-orange-500" },
  { stage: "Items purchased & en-route", fee: "50%", color: "text-destructive" },
];

export default function GroceryFees() {
  const navigate = useNavigate();
  const exampleSubtotal = 45.00;
  const exampleTip = 3;
  const exampleTotal = exampleSubtotal + DELIVERY_FEE + SERVICE_FEE + exampleTip;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 rounded-2xl hover:bg-muted/60"><ArrowLeft className="h-5 w-5" /></motion.button>
          <div>
            <h1 className="text-base font-bold">Pricing & Fees</h1>
            <p className="text-[10px] text-muted-foreground">Transparent pricing, no hidden costs</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/15 text-center space-y-2">
          <Zap className="h-6 w-6 text-primary mx-auto" />
          <h2 className="text-[16px] font-bold text-foreground">In-Store Prices. No Markup.</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            ZIVO never marks up product prices. You pay the same price as shopping in-store, plus a small delivery and service fee.
          </p>
        </motion.div>

        {/* Fee breakdown */}
        <div className="space-y-2">
          <h3 className="text-[14px] font-bold text-foreground px-1">Fee Breakdown</h3>
          {FEE_BREAKDOWN.map((fee, i) => (
            <motion.div
              key={fee.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 rounded-2xl border border-border/20 bg-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <fee.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-foreground">{fee.label}</p>
                    <p className="text-[10px] text-muted-foreground">{fee.note}</p>
                  </div>
                </div>
                <span className="text-[16px] font-extrabold text-foreground">{fee.amount}</span>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed pl-[46px]">{fee.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Example order */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/20 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/10 bg-muted/10 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-[13px] font-bold text-foreground">Example Order Breakdown</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { label: "Item subtotal (12 items)", value: `$${exampleSubtotal.toFixed(2)}` },
              { label: `Platform fee (${getMarkupPct(exampleSubtotal)}%)`, value: `$${exampleMarkup.toFixed(2)}` },
              { label: "Delivery fee (3.2 mi)", value: `$${exampleDelivery.toFixed(2)}` },
              { label: "Service fee", value: formatFee(SERVICE_FEE) },
              { label: "Driver tip", value: `$${exampleTip.toFixed(2)}` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">{row.label}</span>
                <span className="text-[12px] font-semibold text-foreground">{row.value}</span>
              </div>
            ))}
            <div className="border-t border-border/20 pt-2.5 flex items-center justify-between">
              <span className="text-[13px] font-bold text-foreground">Estimated Total</span>
              <span className="text-[16px] font-extrabold text-primary">${exampleTotal.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Price promises */}
        <div className="space-y-2">
          <h3 className="text-[14px] font-bold text-foreground px-1">Our Price Promises</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {PRICE_PROMISES.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3.5 rounded-2xl border border-border/20 bg-card space-y-2"
              >
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <p.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-[12px] font-bold text-foreground">{p.title}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cancellation fees */}
        <div className="space-y-2">
          <h3 className="text-[14px] font-bold text-foreground px-1">Cancellation Fees</h3>
          <div className="rounded-2xl border border-border/20 overflow-hidden">
            <div className="grid grid-cols-2 bg-muted/20 px-4 py-2.5 border-b border-border/10">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Order Stage</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Fee</span>
            </div>
            {CANCEL_FEES.map((row, i) => (
              <div key={row.stage} className={`grid grid-cols-2 px-4 py-3 ${i < CANCEL_FEES.length - 1 ? "border-b border-border/10" : ""}`}>
                <span className="text-[12px] text-foreground/90">{row.stage}</span>
                <span className={`text-[12px] font-bold text-right ${row.color}`}>{row.fee}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground px-1">Cancellation fees are calculated as a percentage of the order subtotal (excluding fees and tip).</p>
        </div>

        <div className="text-center pt-4">
          <p className="text-[11px] text-muted-foreground">Questions about pricing? Contact <span className="text-primary font-semibold">support@hizivo.com</span></p>
        </div>
      </div>
      <ZivoMobileNav />
    </div>
  );
}
