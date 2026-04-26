/**
 * FindContactsPage — privacy-preserving contact discovery.
 *
 * Users paste or import phone numbers (one per line). We normalize to E.164,
 * SHA-256 hash them locally, and call the `contact-match` edge function which
 * returns matching ZIVO profiles. Raw numbers never leave the device.
 *
 * Native Capacitor Contacts plugin can be wired in later; this screen works
 * everywhere right now.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Search from "lucide-react/dist/esm/icons/search";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Shield from "lucide-react/dist/esm/icons/shield";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { hashPhoneE164 } from "@/lib/phoneHash";
import { useContacts } from "@/hooks/useContacts";

type Match = {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

// Light-weight E.164 normalizer (assumes user supplies + or country code).
function normalize(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("+")) return cleaned;
  // assume US default if 10 digits
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith("1")) return `+${cleaned}`;
  return `+${cleaned}`;
}

export default function FindContactsPage() {
  const nav = useNavigate();
  const { add } = useContacts();
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [adding, setAdding] = useState<Record<string, boolean>>({});

  const search = async () => {
    const lines = raw
      .split(/[\n,;]+/)
      .map((l) => normalize(l.trim()))
      .filter((l): l is string => !!l);
    if (!lines.length) {
      toast.error("Add at least one phone number");
      return;
    }
    setBusy(true);
    try {
      const hashes = await Promise.all(lines.map((p) => hashPhoneE164(p)));
      const { data, error } = await supabase.functions.invoke("contact-match", {
        body: { hashes },
      });
      if (error || (data as any)?.error) {
        toast.error((data as any)?.error ?? error?.message ?? "Match failed");
        setMatches([]);
      } else {
        setMatches(((data as any)?.matches ?? []) as Match[]);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Match failed");
      setMatches([]);
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async (m: Match) => {
    setAdding((s) => ({ ...s, [m.user_id]: true }));
    const res = await add(m.user_id, { via: "phone_match" } as any);
    setAdding((s) => ({ ...s, [m.user_id]: false }));
    if (res.ok) toast.success(`Added ${m.full_name ?? m.username ?? "contact"}`);
    else toast.error(res.error ?? "Couldn't add");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border/30 sticky top-0 bg-background/95 backdrop-blur z-10">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full hover:bg-muted/60 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-semibold text-lg">Find Contacts</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/15">
          <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Numbers are <strong>hashed on your device</strong> before they're checked against ZIVO accounts. We never see the raw numbers.
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Phone numbers (one per line)
          </label>
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="+1 415 555 0123&#10;+44 20 7946 0958"
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        <button
          onClick={search}
          disabled={busy || !raw.trim()}
          className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {busy ? "Matching…" : "Find on ZIVO"}
        </button>

        {matches && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground px-1">
              {matches.length === 0 ? "No matches found." : `${matches.length} match${matches.length > 1 ? "es" : ""}`}
            </p>
            {matches.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/30">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={m.avatar_url ?? undefined} />
                  <AvatarFallback>{(m.full_name ?? m.username ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.full_name ?? "ZIVO User"}</p>
                  {m.username && <p className="text-[11px] text-muted-foreground truncate">@{m.username}</p>}
                </div>
                <button
                  onClick={() => handleAdd(m)}
                  disabled={adding[m.user_id]}
                  className="px-3 h-9 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {adding[m.user_id] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
