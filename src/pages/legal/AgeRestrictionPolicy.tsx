import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserX, Shield, AlertTriangle, Scale, Ban, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: UserX,
    title: "1. Minimum Age Requirement",
    content: "ZIVO services are strictly limited to individuals who are at least EIGHTEEN (18) YEARS OF AGE. If you are under the age of 18, you are NOT permitted to create an account, access, or use any ZIVO services. By creating an account or using ZIVO, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into a binding agreement."
  },
  {
    icon: Shield,
    title: "2. Age Verification",
    content: "ZIVO reserves the right to verify your age at any time. We may require government-issued identification to confirm your age. If we determine or reasonably suspect that you are under 18, we will immediately: (a) terminate your account without notice; (b) cancel any pending bookings or transactions; (c) forfeit any credits, rewards, or loyalty points; and (d) report the violation to appropriate authorities if required by law."
  },
  {
    icon: AlertTriangle,
    title: "3. COPPA Compliance",
    content: "ZIVO complies with the Children's Online Privacy Protection Act (COPPA). We do NOT knowingly collect, use, or disclose personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information immediately. Parents or guardians who believe their child has provided personal information to ZIVO should contact us at privacy@hizivo.com."
  },
  {
    icon: Scale,
    title: "4. Parental Responsibility",
    content: "Parents and legal guardians are responsible for monitoring their children's internet use. If a minor (under 18) accesses ZIVO services using an adult's account, the account holder is fully responsible for all activity, charges, and consequences. ZIVO is not liable for any unauthorized use by minors."
  },
  {
    icon: Ban,
    title: "5. Service-Specific Age Requirements",
    items: [
      "Ride-hailing: Must be 18+ to request rides independently",
      "Alcohol delivery: Must be 21+ (valid ID required at delivery)",
      "Car rental: Must be 21+ (25+ for certain vehicle classes)",
      "Flight booking: Must be 18+ to book independently",
      "Hotel booking: Must be 18+ (21+ at select properties)",
      "Account creation: Must be 18+ in all cases",
      "Payment methods: Must be 18+ to add payment information",
    ]
  },
  {
    icon: FileText,
    title: "6. Consequences of Misrepresentation",
    content: "If you misrepresent your age to gain access to ZIVO services, you agree that: (a) your account will be permanently terminated; (b) you forfeit all rights to refunds for any transactions; (c) you may be held liable for any damages incurred by ZIVO as a result of your misrepresentation; (d) ZIVO may take legal action against you or your parent/guardian; and (e) you indemnify ZIVO against any claims arising from your unauthorized use."
  },
  {
    icon: Globe,
    title: "7. International Users",
    content: "If you are accessing ZIVO from outside the United States, you must meet both: (a) the minimum age of 18, AND (b) the legal age of majority in your jurisdiction, whichever is higher. Some jurisdictions may impose additional age requirements for specific services (e.g., alcohol, transportation). You are responsible for knowing and complying with your local laws."
  },
];

export default function AgeRestrictionPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Age Restriction Policy</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-semibold mb-3">
            <UserX className="h-3 w-3" /> Age Restriction
          </span>
          <h2 className="text-2xl font-bold">Age Restriction Policy</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 30, 2026</p>
        </div>
        <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4">
          <p className="text-sm leading-relaxed font-medium">YOU MUST BE AT LEAST 18 YEARS OLD TO USE ZIVO. NO EXCEPTIONS. USE BY MINORS IS STRICTLY PROHIBITED AND MAY RESULT IN LEGAL ACTION.</p>
        </div>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-bold"><Icon className="h-4 w-4 text-primary" />{s.title}</h3>
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                {s.content && <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>}
                {s.items && (
                  <ul className="space-y-2">
                    {s.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
        <div className="rounded-2xl bg-destructive/5 border border-destructive/10 p-4 text-center space-y-1">
          <p className="text-sm font-semibold">Report Underage Use</p>
          <p className="text-xs text-muted-foreground">Email <span className="text-primary font-semibold">safety@hizivo.com</span> to report suspected underage users</p>
        </div>
      </div>
    </div>
  );
}