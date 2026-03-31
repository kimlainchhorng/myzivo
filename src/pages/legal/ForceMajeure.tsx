import { useNavigate } from "react-router-dom";
import { ArrowLeft, CloudLightning, Shield, Globe, AlertTriangle, Clock, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: CloudLightning,
    title: "1. Force Majeure Events",
    content: "ZIVO shall not be liable for any failure or delay in performing its obligations where such failure or delay results from Force Majeure Events, including but not limited to: natural disasters (earthquakes, hurricanes, floods, volcanic eruptions, tsunamis, wildfires), pandemics, epidemics, or public health emergencies, war, terrorism, civil unrest, insurrection, or armed conflict, government actions, sanctions, embargoes, or regulatory changes, strikes, labor disputes, or work stoppages, power outages, telecommunications failures, or internet disruptions, cyberattacks, hacking, or distributed denial-of-service attacks, supply chain disruptions, and any other events beyond ZIVO's reasonable control."
  },
  {
    icon: Globe,
    title: "2. Travel-Specific Events",
    content: "Additional Force Majeure Events specific to travel services include: airline strikes or air traffic control disruptions, airport closures or security incidents, border closures or travel bans, severe weather grounding flights or disrupting transportation, volcanic ash clouds or airspace restrictions, cruise port closures, natural disaster damage to hotels or rental properties, and disease outbreaks affecting travel destinations. ZIVO is not liable for any costs, losses, or damages resulting from these events."
  },
  {
    icon: Shield,
    title: "3. Effect on Obligations",
    content: "During a Force Majeure Event: (a) ZIVO's obligations under these Terms are suspended for the duration of the event; (b) deadlines and response times are extended by the duration of the disruption; (c) ZIVO is not required to provide refunds for service disruptions caused by Force Majeure Events unless required by applicable law; (d) ZIVO will use commercially reasonable efforts to resume services as soon as practicable; and (e) ZIVO will communicate known impacts through available channels."
  },
  {
    icon: AlertTriangle,
    title: "4. User Responsibilities During Force Majeure",
    content: "During Force Majeure Events, you are responsible for: (a) monitoring travel advisories and official guidance; (b) maintaining your own travel insurance covering Force Majeure scenarios; (c) making alternative arrangements at your own expense; (d) complying with government orders and safety directives; and (e) mitigating your own losses where possible. ZIVO strongly recommends comprehensive travel insurance for all bookings."
  },
  {
    icon: Clock,
    title: "5. Duration and Termination",
    content: "If a Force Majeure Event continues for more than ninety (90) consecutive days, either party may terminate the affected booking or service without penalty. In such cases, ZIVO will issue credits or refunds at its sole discretion, taking into account the nature of the event and costs already incurred by third-party providers."
  },
  {
    icon: Scale,
    title: "6. No Waiver",
    content: "ZIVO's invocation of a Force Majeure Event does not constitute a waiver of any other rights or remedies available under these Terms or applicable law. The burden of proving that a Force Majeure Event has occurred and that it caused the failure or delay rests with the party seeking relief."
  },
];

export default function ForceMajeure() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Force Majeure</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold mb-3">
            <CloudLightning className="h-3 w-3" /> Legal
          </span>
          <h2 className="text-2xl font-bold">Force Majeure Policy</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 30, 2026</p>
        </div>
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4">
          <p className="text-sm leading-relaxed">This policy explains how ZIVO handles extraordinary events beyond our reasonable control that may affect service delivery, bookings, or platform availability.</p>
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
          <p className="text-sm font-semibold">Active disruptions?</p>
          <p className="text-xs text-muted-foreground">Check <span className="text-primary font-semibold">status.hizivo.com</span> for service updates</p>
        </div>
      </div>
    </div>
  );
}