import { useEffect, useState } from "react";
import { useSmartBack } from "@/lib/smartBack";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, UserPlus, Loader2, Phone, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { hashPhoneE164 } from "@/lib/phoneHash";
import { isNativeAvailable, pickAndHashPhones } from "@/lib/nativeContacts";

interface Match {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface ContactMatchResponse {
  matches?: Match[];
}

export default function FindContactsPage() {
  const navigate = useNavigate();
  const goBack = useSmartBack("/chat");
  const [raw, setRaw] = useState("");
  const [scanning, setScanning] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const parsePhones = (text: string): string[] => {
    // Extract candidate phone numbers; keep + and digits.
    const found = new Set<string>();
    const re = /\+?\d[\d\s\-().]{6,}\d/g;
    const matches = text.match(re) ?? [];
    for (const m of matches) {
      const digits = m.replace(/[^\d+]/g, "");
      if (digits.length >= 7) found.add(digits.startsWith("+") ? digits : `+${digits}`);
    }
    return Array.from(found);
  };

  const scan = async () => {
    const phones = parsePhones(raw);
    if (phones.length === 0) {
      toast.error("No phone numbers detected");
      return;
    }
    setScanning(true);
    try {
      const hashes = await Promise.all(phones.map(hashPhoneE164));
      const { data, error } = await supabase.functions.invoke("contact-match", {
        body: { hashes },
      });
      if (error) throw error;
      const results = (data as ContactMatchResponse | null)?.matches ?? [];
      setMatches(results);
      toast.success(
        results.length
          ? `${results.length} of your contact${phones.length > 1 ? "s are" : " is"} on ZIVO`
          : `Scanned ${phones.length} contact${phones.length > 1 ? "s" : ""} — no matches yet`
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Couldn't match contacts";
      toast.error(message);
    } finally {
      setScanning(false);
    }
  };

  const addContact = async (m: Match) => {
    setAdding(m.user_id);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Sign in required");
      setAdding(null);
      return;
    }
    const { error } = await supabase.from("contact_requests").insert({
      from_user_id: u.user.id,
      to_user_id: m.user_id,
      status: "pending",
    });
    setAdding(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Request sent");
  };

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/95 pt-safe px-3 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold">Find contacts on ZIVO</h1>
      </header>

      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Phone className="h-4 w-4 text-primary" />
            Paste or type phone numbers
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            We hash numbers locally with SHA-256 — your raw contacts never leave your device.
            Use full international format (e.g. <span className="font-mono">+15551234567</span>),
            one per line or comma-separated.
          </p>
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={"+15551234567\n+447700900000\n+85512345678"}
            rows={6}
            className="font-mono text-sm"
          />
          <Button onClick={scan} disabled={scanning || !raw.trim()} className="mt-3 gap-2">
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Scan & Match
          </Button>
        </div>

        {matches !== null && (
          <div className="space-y-2">
            <h2 className="px-1 text-sm font-semibold text-muted-foreground">
              Matches ({matches.length})
            </h2>
            {matches.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                None of those numbers are on ZIVO yet. Invite them to join!
              </div>
            ) : (
              matches.map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={m.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(m.full_name ?? m.username ?? "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {m.full_name ?? m.username ?? "ZIVO user"}
                    </div>
                    {m.username && (
                      <div className="truncate text-xs text-muted-foreground">@{m.username}</div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addContact(m)}
                    disabled={adding === m.user_id}
                    className="gap-1"
                  >
                    {adding === m.user_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
