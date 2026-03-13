/**
 * Grocery Terms of Service — Instacart-style policy page
 */
import { ArrowLeft, FileText, ShieldCheck, Truck, Clock, AlertTriangle, Scale, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

const sections = [
  {
    icon: FileText,
    title: "Agreement to Terms",
    content: `By placing an order through the ZIVO Grocery marketplace, you agree to these Terms of Service. ZIVO connects you with a personal shopper (driver) who will visit the selected store, purchase the items you've requested, and deliver them to your specified address. ZIVO is not a retailer and does not sell or manufacture any products.`,
  },
  {
    icon: Truck,
    title: "How It Works",
    content: `When you place a grocery order, a ZIVO driver is assigned to fulfill it. The driver visits the store, shops for your items based on your order, and delivers them to your door. Prices shown are estimates based on store listings at the time of search and may differ slightly from in-store prices. Your final charge reflects the actual prices at checkout plus applicable fees.`,
  },
  {
    icon: Scale,
    title: "Pricing & Fees",
    content: `• Delivery Fee: $5.99 per order\n• Service Fee: $1.99 per order\n• Driver Tip: Optional, 100% goes to your driver\n• Item Prices: Based on real-time store data; final price may vary slightly from estimates\n• No hidden markups on product prices — you pay what the store charges\n• Promotional codes may reduce fees; terms apply per promotion`,
  },
  {
    icon: ShieldCheck,
    title: "Quality Guarantee",
    content: `We stand behind the quality of your delivery. If items arrive damaged, spoiled, or are incorrect, you may request a refund or credit for those items within 24 hours of delivery. Photo evidence may be required for quality claims. Our team reviews each request and typically resolves issues within 1–2 business days.`,
  },
  {
    icon: Clock,
    title: "Delivery Times & Availability",
    content: `Delivery times are estimates based on driver availability, store hours, and order complexity. While we aim for same-day delivery, times may vary during peak hours, holidays, or severe weather. ZIVO is not responsible for delays caused by store inventory changes, traffic, or circumstances beyond our control.`,
  },
  {
    icon: AlertTriangle,
    title: "Substitutions & Out-of-Stock Items",
    content: `If an item is out of stock, your driver or our system will follow your substitution preference:\n• Contact Me: Driver contacts you for approval before substituting\n• Best Match: Driver selects a similar item at a comparable price\n• Refund: You receive a refund for the unavailable item\n\nYou can set your default substitution preference during checkout.`,
  },
  {
    icon: Ban,
    title: "Order Cancellation",
    content: `You may cancel an order free of charge before a driver begins shopping. Once shopping has started, a cancellation fee may apply:\n• Before driver assigned: No fee\n• Driver assigned but not started: 15% of order subtotal\n• Driver actively shopping: 25% of order subtotal\n• Items purchased and en-route: 50% of order subtotal\n\nCancellation fees help compensate drivers for their time and effort.`,
  },
  {
    icon: FileText,
    title: "Account & Eligibility",
    content: `You must be 18 years or older to use the ZIVO Grocery service. You are responsible for maintaining the security of your account credentials. Orders containing age-restricted items (alcohol, tobacco) require valid ID verification upon delivery. ZIVO reserves the right to refuse or cancel orders that violate these terms.`,
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content: `ZIVO acts as a marketplace platform connecting customers with independent drivers. We are not responsible for the quality, safety, or legality of products purchased from retail stores. Our liability is limited to the fees charged by ZIVO (delivery and service fees). Product liability rests with the original manufacturer and retailer.`,
  },
  {
    icon: FileText,
    title: "Changes to Terms",
    content: `ZIVO may update these Terms of Service at any time. Continued use of the grocery delivery service after changes constitutes acceptance of the updated terms. Material changes will be communicated via email or in-app notification. Last updated: March 2026.`,
  },
];

export default function GroceryTerms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 rounded-2xl hover:bg-muted/60"><ArrowLeft className="h-5 w-5" /></motion.button>
          <div>
            <h1 className="text-base font-bold">Grocery Terms of Service</h1>
            <p className="text-[10px] text-muted-foreground">Last updated March 2026</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
          <p className="text-[13px] text-foreground/80 leading-relaxed">
            These terms govern your use of the ZIVO Grocery delivery marketplace. By using this service, you agree to the following terms and conditions.
          </p>
        </motion.div>

        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-border/20 bg-card overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/10 bg-muted/10">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-[14px] font-bold text-foreground">{s.title}</h2>
            </div>
            <div className="px-4 py-3">
              <p className="text-[12px] text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          </motion.div>
        ))}

        <div className="text-center pt-4">
          <p className="text-[11px] text-muted-foreground">Questions? Contact <span className="text-primary font-semibold">support@hizivo.com</span></p>
        </div>
      </div>
      <ZivoMobileNav />
    </div>
  );
}
