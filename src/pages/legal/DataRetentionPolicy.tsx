import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, Clock, Trash2, Shield, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: Database,
    title: "1. What Data We Retain",
    content: "We retain personal data you provide (name, email, phone, travel preferences) and transactional data (bookings, payments, search history) as necessary to provide our services, comply with legal obligations, and improve your experience."
  },
  {
    icon: Clock,
    title: "2. Retention Periods",
    items: [
      { label: "Account data", period: "Duration of account + 30 days after deletion" },
      { label: "Booking records", period: "7 years (tax & legal compliance)" },
      { label: "Payment records", period: "7 years (financial regulations)" },
      { label: "Support conversations", period: "3 years after resolution" },
      { label: "Search & browsing history", period: "12 months" },
      { label: "Marketing preferences", period: "Until consent is withdrawn" },
      { label: "Security logs", period: "2 years" },
      { label: "Analytics data", period: "Aggregated indefinitely (anonymized)" },
    ]
  },
  {
    icon: Trash2,
    title: "3. Data Deletion",
    content: "You may request deletion of your personal data at any time via Account Settings or by emailing privacy@hizivo.com. Upon request, we delete or anonymize your data within 30 days, except where retention is required by law. Backup copies may persist for up to 90 days before automatic purge."
  },
  {
    icon: Server,
    title: "4. Data Storage & Security",
    content: "Your data is stored on secure, encrypted servers located in the United States. We use industry-standard encryption (AES-256 at rest, TLS 1.3 in transit) and access controls. Third-party processors are bound by data processing agreements and equivalent security standards."
  },
  {
    icon: Shield,
    title: "5. Legal Basis for Retention",
    content: "We retain data based on: (a) contractual necessity to fulfill bookings, (b) legal obligations under tax and financial regulations, (c) legitimate interests such as fraud prevention and service improvement, and (d) your consent for marketing communications. You may withdraw consent at any time without affecting prior processing."
  },
];

export default function DataRetentionPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Data Retention Policy</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold mb-3">
            <Database className="h-3 w-3" /> Data Governance
          </span>
          <h2 className="text-2xl font-bold">Data Retention Policy</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 20, 2026</p>
        </div>
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4">
          <p className="text-sm leading-relaxed">This policy explains what personal data ZIVO retains, how long we keep it, and how you can request its deletion.</p>
        </div>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-bold"><Icon className="h-4 w-4 text-primary" />{s.title}</h3>
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                {s.content && <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>}
                {s.items && (
                  <div className="space-y-2">
                    {s.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start gap-2 text-sm">
                        <span className="text-foreground font-medium">{item.label}</span>
                        <span className="text-muted-foreground text-right text-xs">{item.period}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center space-y-1">
          <p className="text-sm font-semibold">Data Deletion Request</p>
          <p className="text-xs text-muted-foreground">Email <span className="text-primary font-semibold">privacy@hizivo.com</span> or use Account Settings → Delete Account</p>
        </div>
      </div>
    </div>
  );
}
