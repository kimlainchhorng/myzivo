import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Car, Plane, UtensilsCrossed, Shield, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: AlertTriangle,
    title: "1. General Assumption of Risk",
    content: "BY USING ZIVO, YOU ACKNOWLEDGE AND AGREE THAT YOU ASSUME ALL RISKS ASSOCIATED WITH YOUR USE OF THE PLATFORM AND ANY SERVICES ACCESSED THROUGH IT. This includes, but is not limited to, risks of personal injury, property damage, financial loss, data breach, identity theft, and dissatisfaction with services. ZIVO is a technology platform and does not provide the underlying services directly."
  },
  {
    icon: Car,
    title: "2. Transportation Risks",
    content: "You acknowledge that using ride-hailing and car rental services involves inherent risks including but not limited to: traffic accidents, vehicle breakdowns, delayed pickups, route deviations, property damage, and personal injury. Drivers are independent contractors, not ZIVO employees. ZIVO does not guarantee driver conduct, vehicle condition, or trip safety. You assume full responsibility for your decision to use transportation services."
  },
  {
    icon: UtensilsCrossed,
    title: "3. Food Delivery Risks",
    content: "You acknowledge risks associated with food delivery including but not limited to: allergic reactions, foodborne illness, incorrect orders, late delivery, food temperature issues, and contamination. Restaurants are independent partners responsible for food preparation and safety. ZIVO does NOT prepare, handle, or inspect food. You assume full responsibility for reviewing allergen information and dietary suitability before ordering."
  },
  {
    icon: Plane,
    title: "4. Travel Risks",
    content: "You acknowledge that air travel and hotel stays involve inherent risks including but not limited to: flight delays, cancellations, overbooking, lost luggage, travel document issues, health risks, natural disasters, political instability, and personal safety concerns. ZIVO is not liable for any travel disruptions, and you assume all risks associated with your travel decisions. Travel insurance is strongly recommended."
  },
  {
    icon: Shield,
    title: "5. Financial Risks",
    content: "You acknowledge and accept the following financial risks: (a) prices displayed on ZIVO are estimates and may change before booking confirmation; (b) exchange rates may fluctuate; (c) third-party charges (baggage fees, resort fees, tolls) may apply; (d) promotional offers may have limitations or expire; (e) refund eligibility varies by service and provider. You agree that ZIVO is not responsible for any financial losses resulting from price changes, booking errors you make, or third-party charges."
  },
  {
    icon: Heart,
    title: "6. Health & Safety",
    content: "You are solely responsible for your own health and safety when using services accessed through ZIVO. This includes: ensuring you are medically fit to travel, checking travel advisories and vaccination requirements, carrying necessary medications, informing service providers of medical conditions or disabilities, and following all safety instructions. ZIVO does not provide medical advice or health screenings."
  },
  {
    icon: Globe,
    title: "7. International Travel Risks",
    content: "For international travel, you assume additional risks including but not limited to: visa denials, customs delays, currency conversion losses, foreign legal systems, language barriers, different safety standards, and political or civil unrest. You are solely responsible for ensuring you have valid travel documents, necessary visas, and compliance with entry/exit requirements for all destinations."
  },
];

export default function AssumptionOfRisk() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Assumption of Risk</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-semibold mb-3">
            <AlertTriangle className="h-3 w-3" /> Risk Disclosure
          </span>
          <h2 className="text-2xl font-bold">Assumption of Risk</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 30, 2026</p>
        </div>
        <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4">
          <p className="text-sm leading-relaxed font-medium">BY USING ZIVO, YOU VOLUNTARILY ASSUME ALL RISKS ASSOCIATED WITH THE SERVICES. PLEASE READ THIS DOCUMENT CAREFULLY BEFORE PROCEEDING.</p>
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
          <p className="text-sm font-semibold">Questions?</p>
          <p className="text-xs text-muted-foreground">Contact <span className="text-primary font-semibold">legal@hizivo.com</span></p>
        </div>
      </div>
    </div>
  );
}