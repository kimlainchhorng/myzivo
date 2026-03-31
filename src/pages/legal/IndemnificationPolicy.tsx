import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, Scale, AlertTriangle, FileText, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: Shield,
    title: "1. Your Indemnification Obligation",
    content: "You agree to indemnify, defend, and hold harmless ZIVO LLC, its parent company, subsidiaries, affiliates, officers, directors, employees, agents, licensors, and suppliers (collectively, the 'ZIVO Parties') from and against any and all claims, liabilities, damages, judgments, awards, losses, costs, expenses, and fees (including reasonable attorneys' fees) arising out of or relating to your: (a) use or misuse of the Services; (b) violation of these Terms or any applicable law; (c) violation of any rights of a third party; (d) User Content you submit or transmit; and (e) any activity under your account."
  },
  {
    icon: Users,
    title: "2. Third-Party Claims",
    content: "You shall indemnify the ZIVO Parties against any claims brought by third parties resulting from: (a) your interactions with drivers, restaurants, hotels, airlines, or car owners; (b) accidents, injuries, or property damage arising from services accessed through the platform; (c) disputes with other users or service providers; (d) your failure to comply with applicable travel regulations, visa requirements, or local laws; (e) your provision of false, misleading, or inaccurate information."
  },
  {
    icon: Scale,
    title: "3. Intellectual Property Claims",
    content: "You agree to indemnify ZIVO against any claims that User Content you submit infringes upon or violates the intellectual property rights, privacy rights, publicity rights, or other rights of any third party. This includes content you post in reviews, profiles, stories, comments, or any other user-generated content feature."
  },
  {
    icon: AlertTriangle,
    title: "4. Scope of Indemnification",
    content: "Your indemnification obligation includes: (a) all damages awarded in any proceeding; (b) settlement amounts approved by ZIVO; (c) reasonable attorneys' fees and expert witness fees; (d) court costs and litigation expenses; (e) costs of investigation and pre-litigation work; (f) interest on any of the foregoing. This indemnification obligation survives the termination of your account and these Terms."
  },
  {
    icon: FileText,
    title: "5. Defense and Control",
    content: "ZIVO reserves the right, at its own expense, to assume the exclusive defense and control of any matter subject to your indemnification. You agree to cooperate fully with ZIVO in asserting any available defenses. You shall not settle any claim without ZIVO's prior written consent."
  },
  {
    icon: Gavel,
    title: "6. No Limitation on Other Remedies",
    content: "The indemnification obligations set forth herein are in addition to, and not in lieu of, any other remedies available to ZIVO under law or equity. ZIVO's failure to exercise or enforce any right or provision of these Terms shall not constitute a waiver of such right or provision."
  },
];

export default function IndemnificationPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Indemnification</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold mb-3">
            <Shield className="h-3 w-3" /> Legal Protection
          </span>
          <h2 className="text-2xl font-bold">Indemnification Agreement</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 30, 2026</p>
        </div>
        <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4">
          <p className="text-sm leading-relaxed font-medium">BY USING ZIVO, YOU AGREE TO INDEMNIFY AND HOLD HARMLESS ZIVO AND ITS AFFILIATES FROM ANY CLAIMS ARISING FROM YOUR USE OF THE PLATFORM.</p>
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
          <p className="text-sm font-semibold">Legal questions?</p>
          <p className="text-xs text-muted-foreground">Contact <span className="text-primary font-semibold">legal@hizivo.com</span></p>
        </div>
      </div>
    </div>
  );
}