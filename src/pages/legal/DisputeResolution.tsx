import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, MessageSquare, Gavel, Clock, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: MessageSquare,
    title: "1. Informal Resolution",
    content: "Before initiating formal proceedings, we encourage you to contact us at support@hizivo.com. Most disputes can be resolved through direct communication. We commit to responding within 5 business days and working toward a fair resolution within 30 days."
  },
  {
    icon: Scale,
    title: "2. Binding Arbitration",
    content: "If informal resolution fails, disputes will be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. Arbitration will be conducted in English, in the state of the user's residence (or remotely via video conference). The arbitrator's decision is final and binding."
  },
  {
    icon: Gavel,
    title: "3. Class Action Waiver",
    content: "You agree that any dispute resolution will be conducted on an individual basis and NOT as part of a class, consolidated, or representative action. You waive any right to participate in a class action lawsuit or class-wide arbitration against ZIVO."
  },
  {
    icon: Clock,
    title: "4. Time Limitation",
    content: "Any claim or dispute must be filed within one (1) year after the cause of action arises. Claims filed after this period will be permanently barred. This limitation applies to all claims, regardless of the legal theory."
  },
  {
    icon: Users,
    title: "5. Small Claims Court",
    content: "Notwithstanding the arbitration agreement, either party may bring an individual action in small claims court for disputes within the court's jurisdictional limits. If the claim exceeds small claims limits, it must proceed to arbitration."
  },
  {
    icon: FileText,
    title: "6. Governing Law",
    content: "These terms and any disputes are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. For matters not subject to arbitration, exclusive jurisdiction lies with the state and federal courts in Delaware."
  },
];

export default function DisputeResolution() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Dispute Resolution</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-semibold mb-3">
            <Scale className="h-3 w-3" /> Legal
          </span>
          <h2 className="text-2xl font-bold">Dispute Resolution</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 20, 2026</p>
        </div>
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4">
          <p className="text-sm leading-relaxed">This policy describes how disputes between you and ZIVO are resolved, including mandatory arbitration and class action waiver provisions.</p>
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
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center space-y-1">
          <p className="text-sm font-semibold">Have a Dispute?</p>
          <p className="text-xs text-muted-foreground">Start with <span className="text-primary font-semibold">support@hizivo.com</span> — we'll try to resolve it informally first</p>
        </div>
      </div>
    </div>
  );
}
