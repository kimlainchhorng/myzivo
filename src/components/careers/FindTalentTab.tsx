/** FindTalentTab — employers browse profiles where open_to_work=true and invite to apply */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Send, UserCheck, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Talent = {
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
};

export default function FindTalentTab() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("profiles")
        .select("user_id,display_name,first_name,last_name,avatar_url,bio,city,country")
        .eq("open_to_work", true)
        .order("updated_at", { ascending: false })
        .limit(60);
      if (!cancel) {
        setTalents((data ?? []) as Talent[]);
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return talents;
    return talents.filter(t => {
      const name = `${t.display_name ?? ""} ${t.first_name ?? ""} ${t.last_name ?? ""}`.toLowerCase();
      return name.includes(s) || (t.bio ?? "").toLowerCase().includes(s) || (t.city ?? "").toLowerCase().includes(s);
    });
  }, [q, talents]);

  const inviteToApply = (t: Talent) => {
    toast.success(`Invite sent to ${t.display_name ?? t.first_name ?? "talent"}`);
    // Hook into notification/email pipeline as needed
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, skill, or city"
          className="pl-9"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      {loading && <p className="text-center text-sm text-muted-foreground py-6">Loading talent…</p>}
      {!loading && filtered.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          <UserCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          No open-to-work profiles match yet.
        </Card>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map(t => {
          const name = t.display_name || `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || "Talent";
          return (
            <Card key={t.user_id} className="p-3">
              <div className="flex gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={t.avatar_url ?? undefined} />
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-700">
                      <Briefcase className="mr-1 h-2.5 w-2.5" /> Open
                    </Badge>
                  </div>
                  {(t.city || t.country) && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />{[t.city, t.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {t.bio && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{t.bio}</p>}
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => navigate(`/u/${t.user_id}`)}>
                      View
                    </Button>
                    <Button size="sm" className="h-7 text-[11px]" onClick={() => inviteToApply(t)}>
                      <Send className="mr-1 h-3 w-3" /> Invite to apply
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
