import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Plus, Search, Users } from "lucide-react";

export default function ChannelsDirectoryPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [channels, setChannels] = useState<any[]>([]);

  const load = async () => {
    let query = supabase
      .from("channels")
      .select("*")
      .eq("is_public", true)
      .order("subscriber_count", { ascending: false })
      .limit(50);
    if (q.trim()) {
      query = query.or(`name.ilike.%${q}%,handle.ilike.%${q}%`);
    }
    const { data } = await query;
    setChannels(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border/40 pt-safe px-3 py-3 flex items-center gap-2">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/feed"))}
          className="p-2 -ml-2 rounded-full hover:bg-muted"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">Channels</h1>
        <Button asChild size="sm" className="gap-1">
          <Link to="/channels/new"><Plus className="h-4 w-4" /> New</Link>
        </Button>
      </header>
      <div className="mx-auto max-w-2xl p-4">
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search channels by name or handle"
          className="pl-9"
        />
      </div>
      <div className="space-y-2">
        {channels.map((c) => (
          <Link
            key={c.id}
            to={`/c/${c.handle}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/40"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={c.avatar_url ?? undefined} />
              <AvatarFallback>{c.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">@{c.handle}</div>
              {c.description && (
                <div className="line-clamp-1 text-xs text-muted-foreground">{c.description}</div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" /> {c.subscriber_count}
            </div>
          </Link>
        ))}
        {channels.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No channels found.
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
