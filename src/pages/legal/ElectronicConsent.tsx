import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, FileText, Shield, Monitor, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: FileText,
    title: "1. Consent to Electronic Communications",
    content: "By creating an account or using ZIVO services, you consent to receive all communications from ZIVO electronically, including but not limited to: terms of service updates, privacy policy changes, billing statements, receipts, booking confirmations, account notifications, legal notices, regulatory disclosures, and any other communications required by law. This consent is provided in accordance with the Electronic Signatures in Global and National Commerce Act (E-SIGN Act), 15 U.S.C. §§ 7001-7006."
  },
  {
    icon: Mail,
    title: "2. Methods of Delivery",
    content: "Electronic communications may be delivered via: (a) email to the address associated with your account; (b) push notifications on your mobile device; (c) in-app messages and notifications; (d) SMS/text messages to your registered phone number; (e) posting on your ZIVO account dashboard; or (f) posting on our website at hizivo.com. Communications sent electronically are deemed delivered when sent or posted, regardless of whether you have read them."
  },
  {
    icon: Monitor,
    title: "3. Hardware & Software Requirements",
    content: "To receive electronic communications, you need: (a) a device with internet access (computer, tablet, or smartphone); (b) a current web browser (Chrome, Firefox, Safari, or Edge, latest two versions); (c) a valid email address; (d) sufficient storage to save or print communications; and (e) a PDF viewer for certain documents. You confirm that you have the required hardware and software to receive electronic communications."
  },
  {
    icon: Shield,
    title: "4. Legal Equivalence",
    content: "You agree that all electronic communications from ZIVO satisfy any legal requirement that such communications be in writing. Electronic records of transactions, agreements, and notices constitute 'writings' and 'signed writings' under applicable law. Your electronic acceptance of terms, clicking 'I Agree,' or continued use of the Services constitutes your legally binding signature."
  },
  {
    icon: Smartphone,
    title: "5. Updating Contact Information",
    content: "You are responsible for keeping your email address and phone number current. If your contact information changes, update it immediately in Account Settings. ZIVO is not responsible for communications that fail to reach you due to outdated contact information. Failed delivery does not invalidate the legal effectiveness of the communication."
  },
  {
    icon: CheckCircle2,
    title: "6. Withdrawal of Consent",
    content: "You may withdraw your consent to receive electronic communications by emailing legal@hizivo.com. However, withdrawing consent may result in: (a) inability to use certain ZIVO services that require electronic agreement; (b) account limitations or suspension; (c) inability to process bookings or transactions; and (d) requirement to receive paper communications at your expense. Withdrawal of consent does not affect the validity of prior electronic communications."
  },
];

export default function ElectronicConsent() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Electronic Consent</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 text-xs font-semibold mb-3">
            <Mail className="h-3 w-3" /> E-SIGN Act
          </span>
          <h2 className="text-2xl font-bold">Electronic Communications Consent</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 30, 2026</p>
        </div>
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4">
          <p className="text-sm leading-relaxed">This document explains how ZIVO communicates with you electronically and your consent to receive all legal notices, disclosures, and communications in electronic form.</p>
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
          <p className="text-sm font-semibold">Need paper communications?</p>
          <p className="text-xs text-muted-foreground">Email <span className="text-primary font-semibold">legal@hizivo.com</span> to request opt-out</p>
        </div>
      </div>
    </div>
  );
}