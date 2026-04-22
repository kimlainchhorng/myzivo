/**
 * ContactCard - phone/email/whatsapp/website/emergency with inline validation.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail, Globe, MessageCircle, AlertTriangle } from "lucide-react";
import { CountryPhoneInput } from "@/components/auth/CountryPhoneInput";
import type { ContactInfo } from "@/hooks/lodging/useLodgePropertyProfile";

interface Props {
  contact: ContactInfo;
  onChange: (patch: Partial<ContactInfo>) => void;
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isUrl = (s: string) => {
  try { new URL(s.startsWith("http") ? s : `https://${s}`); return true; } catch { return false; }
};

export default function ContactCard({ contact, onChange }: Props) {
  const emailErr = contact.email && !isEmail(contact.email) ? "Invalid email" : "";
  const urlErr = contact.website && !isUrl(contact.website) ? "Invalid URL" : "";

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-[13px]"><Phone className="h-3.5 w-3.5" /> Contact details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div>
          <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Reception phone</Label>
          <CountryPhoneInput value={contact.phone || ""} onChange={(v) => onChange({ phone: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
            <Input
              className={`h-9 ${emailErr ? "border-destructive ring-1 ring-destructive" : ""}`}
              value={contact.email || ""}
              onChange={e => onChange({ email: e.target.value })}
              placeholder="reservations@example.com"
            />
            {emailErr && <p className="text-[10px] text-destructive mt-0.5">{emailErr}</p>}
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3" /> WhatsApp</Label>
            <Input
              className="h-9" value={contact.whatsapp || ""}
              onChange={e => onChange({ whatsapp: e.target.value })}
              placeholder="+855 12 345 678"
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Website</Label>
            <Input
              className={`h-9 ${urlErr ? "border-destructive ring-1 ring-destructive" : ""}`}
              value={contact.website || ""}
              onChange={e => onChange({ website: e.target.value })}
              placeholder="https://example.com"
            />
            {urlErr && <p className="text-[10px] text-destructive mt-0.5">{urlErr}</p>}
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Emergency phone</Label>
            <Input
              className="h-9" value={contact.emergency_phone || ""}
              onChange={e => onChange({ emergency_phone: e.target.value })}
              placeholder="24/7 line"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
