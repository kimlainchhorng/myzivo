import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copyright, AlertTriangle, FileText, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: Copyright,
    title: "1. Overview",
    content: "ZIVO respects the intellectual property rights of others and expects our users to do the same. This policy outlines how copyright owners can report alleged infringement on our platform and how we process such claims in accordance with the Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512."
  },
  {
    icon: FileText,
    title: "2. Filing a DMCA Notice",
    content: "To file a copyright infringement claim, send a written notice to our designated agent containing:",
    items: [
      "Identification of the copyrighted work you claim is being infringed",
      "Identification of the infringing material and its location on ZIVO",
      "Your contact information (name, address, phone, email)",
      "A statement that you have a good faith belief the use is not authorized",
      "A statement, under penalty of perjury, that the information is accurate and you are the copyright owner or authorized to act on their behalf",
      "Your physical or electronic signature",
    ]
  },
  {
    icon: Mail,
    title: "3. Designated Agent",
    content: "DMCA notices should be sent to:\n\nZIVO LLC — DMCA Agent\nEmail: dmca@hizivo.com\nMail: ZIVO LLC, Attn: DMCA Agent, [Address on file]\n\nWe aim to acknowledge all valid notices within 2 business days."
  },
  {
    icon: AlertTriangle,
    title: "4. Counter-Notification",
    content: "If you believe your content was removed in error, you may submit a counter-notification including: identification of the removed material, a statement under penalty of perjury that the removal was a mistake, your contact information, and consent to jurisdiction of the federal court in your district. We will forward the counter-notification to the original complainant and restore the material within 10–14 business days unless the complainant files a court action."
  },
  {
    icon: CheckCircle2,
    title: "5. Repeat Infringers",
    content: "ZIVO will terminate accounts of users who are repeat infringers. We track DMCA notices per account and may suspend or permanently ban users with multiple valid claims against them."
  },
];

export default function DMCACopyrightPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">DMCA / Copyright Policy</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-semibold mb-3">
            <Copyright className="h-3 w-3" /> Intellectual Property
          </span>
          <h2 className="text-2xl font-bold">DMCA / Copyright Policy</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 20, 2026</p>
        </div>
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4">
          <p className="text-sm leading-relaxed">This policy explains how to report copyright infringement on ZIVO and how we handle such claims under the DMCA.</p>
        </div>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-bold"><Icon className="h-4 w-4 text-primary" />{s.title}</h3>
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                {s.content && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</p>}
                {s.items && (
                  <ul className="mt-2 space-y-2">
                    {s.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center space-y-1">
          <p className="text-sm font-semibold">Report Infringement</p>
          <p className="text-xs text-muted-foreground">Email <span className="text-primary font-semibold">dmca@hizivo.com</span></p>
        </div>
      </div>
    </div>
  );
}
