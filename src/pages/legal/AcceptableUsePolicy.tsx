import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gavel, CheckCircle2, XCircle, Shield, Globe, AlertTriangle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const acceptableUses = [
  "Search and book travel services for personal or authorized business use",
  "Create and manage your user profile and travel preferences",
  "Leave honest reviews and ratings based on genuine experiences",
  "Share travel content (photos, stories) that you own or have rights to",
  "Communicate respectfully with other users and support staff",
  "Use referral and loyalty programs as intended",
];

const prohibitedUses = [
  "Accessing or attempting to access accounts belonging to others",
  "Scraping, crawling, or automated data extraction from ZIVO",
  "Reverse engineering, decompiling, or disassembling ZIVO software",
  "Using ZIVO to distribute malware, phishing, or spam",
  "Creating fake accounts or impersonating others",
  "Manipulating search results, reviews, or pricing through deceptive means",
  "Using the platform for money laundering or terrorist financing",
  "Circumventing security measures, rate limits, or access controls",
  "Reselling services obtained through ZIVO without authorization",
  "Using bots or automated tools to make bookings or interact with the platform",
];

const sections = [
  {
    icon: Globe,
    title: "3. Network & System Integrity",
    content: "Users must not attempt to disrupt ZIVO's systems, overload servers, or interfere with other users' access. Any security vulnerability discovered must be reported to security@hizivo.com and not exploited or disclosed publicly."
  },
  {
    icon: Scale,
    title: "4. Intellectual Property",
    content: "All ZIVO branding, logos, designs, and proprietary content are protected. Users may not reproduce, distribute, or create derivative works from ZIVO's intellectual property without written permission. User-generated content remains owned by users but is licensed to ZIVO as described in our Terms of Service."
  },
  {
    icon: Shield,
    title: "5. Compliance with Laws",
    content: "Users must comply with all applicable local, state, federal, and international laws when using ZIVO. This includes but is not limited to: export control laws, sanctions, anti-money laundering regulations, consumer protection laws, and data protection regulations (GDPR, CCPA)."
  },
  {
    icon: AlertTriangle,
    title: "6. Enforcement & Consequences",
    content: "ZIVO monitors platform usage and may investigate suspected violations. Consequences include: warnings for first-time minor violations, temporary suspension for repeated or moderate violations, permanent termination for severe or illegal activity, and legal action where appropriate. ZIVO may also report illegal activity to relevant law enforcement."
  },
];

export default function AcceptableUsePolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Acceptable Use Policy</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-semibold mb-3">
            <Gavel className="h-3 w-3" /> Legal
          </span>
          <h2 className="text-2xl font-bold text-foreground">Acceptable Use Policy</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 15, 2026</p>
        </div>

        {/* Intro */}
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4">
          <p className="text-sm text-foreground leading-relaxed">
            This Acceptable Use Policy ("AUP") defines the permitted and prohibited uses of ZIVO's platform, 
            services, and features. All users must comply with this policy. Violations may result in account 
            suspension or termination.
          </p>
        </div>

        {/* Acceptable Uses */}
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            1. Acceptable Uses
          </h3>
          <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2.5">
            {acceptableUses.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Prohibited Uses */}
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <XCircle className="h-4 w-4 text-destructive" />
            2. Prohibited Uses
          </h3>
          <div className="rounded-2xl bg-card border border-destructive/20 p-4 space-y-2.5">
            {prohibitedUses.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Other Sections */}
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {section.title}
              </h3>
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            </div>
          );
        })}

        {/* Contact */}
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">Questions?</p>
          <p className="text-xs text-muted-foreground">
            Contact us at <span className="text-primary font-semibold">legal@hizivo.com</span> for questions about this policy.
          </p>
        </div>
      </div>
    </div>
  );
}
