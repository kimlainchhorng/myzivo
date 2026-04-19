import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

type LegalKind = "terms" | "privacy";

interface LegalPreviewLinkProps {
  kind: LegalKind;
  className?: string;
  children: React.ReactNode;
}

const TERMS_SECTIONS = [
  { title: "1. Service Overview", body: "ZIVO is a travel search and referral platform. We help you compare flights, hotels, and other travel products from licensed partners. We do not issue tickets or act as the merchant of record." },
  { title: "2. Bookings & Payments", body: "All bookings, payments, and ticketing are handled by our travel partners (the merchant of record). ZIVO does not collect card payments for air travel." },
  { title: "3. Pricing", body: "Prices shown on ZIVO are estimates provided by our partners. The final price, taxes, fees, and terms are confirmed on the partner's checkout page." },
  { title: "4. Cancellations & Refunds", body: "Changes, cancellations, and refunds are governed by the partner's terms. Contact the partner directly for reservation servicing. ZIVO supports website navigation issues only." },
  { title: "5. Account & Conduct", body: "You agree to provide accurate information, keep your credentials secure, and use ZIVO lawfully. We may suspend accounts for fraud, abuse, or policy violations." },
  { title: "6. Liability", body: "ZIVO is provided 'as is' without warranties. To the maximum extent allowed by law, ZIVO is not liable for partner actions, travel disruptions, or indirect damages." },
  { title: "7. Changes", body: "We may update these Terms. Continued use after changes means you accept the updated Terms. Material changes will be communicated by email or in-app." },
];

const PRIVACY_SECTIONS = [
  { title: "1. What We Collect", body: "Account info (name, email, phone), search and booking activity, device and usage data, and—with your consent—location and contact details to complete bookings with partners." },
  { title: "2. How We Use It", body: "To operate the platform, personalize search results, send transactional and account emails, prevent fraud, and improve ZIVO. We do not sell your personal data." },
  { title: "3. Sharing", body: "We share necessary booking info with the chosen travel partner so they can complete your reservation. We use trusted processors (hosting, analytics, email) under strict data agreements." },
  { title: "4. Your Rights", body: "You can access, correct, export, or delete your data. Account deletion has a 30-day grace period—log back in within 30 days to cancel deletion." },
  { title: "5. Cookies", body: "We use essential cookies for login and security, and optional cookies for analytics and personalization. You can manage cookie choices anytime in settings." },
  { title: "6. Security", body: "We use encryption in transit, RLS-enforced databases, and audit logs. No system is 100% secure—report suspected issues to security@hizivo.com." },
  { title: "7. Contact", body: "Questions about privacy? Email privacy@hizivo.com. We respond within 30 days." },
];

export function LegalPreviewLink({ kind, className, children }: LegalPreviewLinkProps) {
  const [open, setOpen] = useState(false);
  const isTerms = kind === "terms";
  const Icon = isTerms ? FileText : ShieldCheck;
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const subtitle = isTerms
    ? "How ZIVO works as a travel search and referral platform."
    : "How we collect, use, and protect your data.";
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const fullPath = isTerms ? "/terms" : "/privacy";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-base font-bold">{title}</SheetTitle>
                <SheetDescription className="text-xs">{subtitle}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 px-5 py-4">
            <div className="space-y-4 pb-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Effective Date · February 1, 2026
              </p>
              {sections.map((s) => (
                <section key={s.title} className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </section>
              ))}
              <div className="rounded-xl bg-muted/40 border border-border/40 p-3 text-xs text-muted-foreground">
                This is a summary for quick review. The full legal document is available on the dedicated page.
              </div>
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 p-3 flex gap-2 safe-area-bottom">
            <Button asChild variant="outline" className="flex-1 h-11 rounded-xl">
              <Link to={fullPath} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                Full page
              </Link>
            </Button>
            <Button
              onClick={() => setOpen(false)}
              className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Got it
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
