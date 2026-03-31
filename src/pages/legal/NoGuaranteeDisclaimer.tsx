import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, DollarSign, TrendingDown, Search, Shield, Scale, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: DollarSign,
    title: "1. No Price Guarantee",
    content: "ZIVO DOES NOT GUARANTEE THAT PRICES DISPLAYED ON THE PLATFORM ARE THE LOWEST AVAILABLE. Prices are sourced from third-party providers and affiliates and may change at any time without notice. The price you see when searching may differ from the final price at checkout. Historical pricing, 'deals,' and 'savings' indicators are estimates based on available data and do not constitute guarantees or promises of savings."
  },
  {
    icon: TrendingDown,
    title: "2. No Savings Guarantee",
    content: "Any savings, discounts, or deal indicators displayed on ZIVO are for informational purposes only. ZIVO does not guarantee that: (a) you will save money by using our platform; (b) displayed discounts are the best available; (c) sale prices reflect true market value; (d) promotional prices will remain available; or (e) comparison prices are current. You are responsible for conducting your own price comparisons before making purchasing decisions."
  },
  {
    icon: Search,
    title: "3. No Availability Guarantee",
    content: "ZIVO does not guarantee the availability of any service, product, flight, hotel room, vehicle, or other offering displayed on the platform. Availability is determined by third-party providers and may change at any time. Displayed options may become unavailable between your search and booking attempt. ZIVO is not liable for any losses resulting from unavailability of displayed services."
  },
  {
    icon: AlertTriangle,
    title: "4. No Outcome Guarantee",
    content: "ZIVO DOES NOT GUARANTEE ANY PARTICULAR OUTCOME FROM YOUR USE OF THE PLATFORM. This includes but is not limited to: (a) quality of rides, meals, hotels, or car rentals; (b) accuracy of estimated arrival times or delivery windows; (c) satisfaction with third-party services; (d) return on loyalty points or credits; (e) successful completion of bookings; and (f) achievement of any travel-related goal. All outcomes are subject to third-party performance and external factors beyond ZIVO's control."
  },
  {
    icon: Shield,
    title: "5. No Investment or Financial Advice",
    content: "Nothing on ZIVO constitutes financial, investment, or professional advice. ZIVO does not provide recommendations on how much to spend on travel, whether to purchase travel insurance, or the financial wisdom of any booking decision. Any money spent on or through the platform is at your sole discretion and risk. ZIVO IS NOT RESPONSIBLE FOR YOUR SPENDING DECISIONS OR ANY FINANCIAL CONSEQUENCES THEREOF."
  },
  {
    icon: Scale,
    title: "6. Third-Party Content Disclaimer",
    content: "ZIVO displays content provided by third-party partners including hotel descriptions, restaurant menus, flight details, and vehicle specifications. ZIVO does not verify the accuracy, completeness, or timeliness of this content. Third-party descriptions, photos, ratings, and reviews may not accurately reflect current conditions. You should verify important details directly with the service provider before booking."
  },
  {
    icon: Ban,
    title: "7. Waiver of Claims for Overspending",
    content: "BY USING ZIVO, YOU EXPRESSLY WAIVE ANY AND ALL CLAIMS AGAINST ZIVO RELATING TO: (a) the total amount you spend on the platform; (b) perceived lack of value or savings; (c) price differences between ZIVO and other platforms; (d) subscription or membership fees that do not yield expected returns; (e) promotional offers that do not meet your expectations; and (f) any claim that ZIVO induced, encouraged, or caused you to spend more money than intended. You acknowledge that all spending decisions are voluntary and within your control."
  },
];

export default function NoGuaranteeDisclaimer() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">No Guarantee Disclaimer</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold mb-3">
            <AlertTriangle className="h-3 w-3" /> Important Disclaimer
          </span>
          <h2 className="text-2xl font-bold">No Guarantee Disclaimer</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 30, 2026</p>
        </div>
        <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4">
          <p className="text-sm leading-relaxed font-medium">ZIVO MAKES NO GUARANTEES REGARDING PRICES, SAVINGS, AVAILABILITY, OR OUTCOMES. ALL SERVICES ARE PROVIDED "AS IS." BY USING ZIVO, YOU ACKNOWLEDGE AND ACCEPT THESE DISCLAIMERS.</p>
        </div>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-bold"><Icon className="h-4 w-4 text-primary" />{s.title}</h3>
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
              </div>
            </div>
          );
        })}
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4 text-center space-y-1">
          <p className="text-sm font-semibold">Questions about these disclaimers?</p>
          <p className="text-xs text-muted-foreground">Contact <span className="text-primary font-semibold">legal@hizivo.com</span></p>
        </div>
      </div>
    </div>
  );
}