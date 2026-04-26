/**
 * ChatSearchAllPage — Unified global search across messages, people, media, links.
 * Pulls from `messages` (text), `profiles` (people), and the same table filtered
 * by attachment kind for media/links.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import Search from "lucide-react/dist/esm/icons/search";
import X from "lucide-react/dist/esm/icons/x";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Users from "lucide-react/dist/esm/icons/users";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import LinkIcon from "lucide-react/dist/esm/icons/link";
import { cn } from "@/lib/utils";

type Tab = "messages" | "people" | "media" | "links";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "people", label: "People", icon: Users },
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "links", label: "Links", icon: LinkIcon },
];

export default function ChatSearchAllPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("messages");
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!user?.id || debounced.length < 2) {
      setMessages([]); setPeople([]); setMedia([]); setLinks([]);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      const term = `%${debounced}%`;
      try {
        if (tab === "messages") {
          const { data } = await (supabase as any)
            .from("messages")
            .select("id, content, sender_id, recipient_id, created_at")
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .ilike("content", term)
            .order("created_at", { ascending: false })
            .limit(50);
          if (alive) setMessages(data || []);
        } else if (tab === "people") {
          const { data } = await (supabase as any)
            .from("profiles")
            .select("id, user_id, full_name, username, avatar_url")
            .or(`full_name.ilike.${term},username.ilike.${term}`)
            .limit(40);
          if (alive) setPeople(data || []);
        } else if (tab === "media") {
          const { data } = await (supabase as any)
            .from("messages")
            .select("id, image_url, video_url, sender_id, recipient_id, created_at")
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .or("image_url.not.is.null,video_url.not.is.null")
            .order("created_at", { ascending: false })
            .limit(60);
          if (alive) setMedia((data || []).filter((m: any) => m.image_url || m.video_url));
        } else if (tab === "links") {
          const { data } = await (supabase as any)
            .from("messages")
            .select("id, content, sender_id, recipient_id, created_at")
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .ilike("content", "%http%")
            .order("created_at", { ascending: false })
            .limit(60);
          if (alive) setLinks((data || []).filter((m: any) => /https?:\/\//.test(m.content || "")));
        }
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [debounced, tab, user?.id]);

  const goToChat = (partnerId: string) => nav(`/chat?with=${partnerId}`);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border/40 px-3 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => nav(-1)} className="p-1.5 rounded-full hover:bg-muted/60">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search everything..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-muted/40 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-3 mt-3">
        {debounced.length < 2 ? (
          <div className="text-center text-sm text-muted-foreground py-12">
            Type at least 2 characters to search.
          </div>
        ) : loading ? (
          <div className="text-center text-sm text-muted-foreground py-12">Searching…</div>
        ) : tab === "messages" ? (
          messages.length === 0 ? <Empty label="No messages found" /> : (
            <ul className="space-y-1">
              {messages.map((m) => {
                const partnerId = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
                return (
                  <li key={m.id}>
                    <button onClick={() => goToChat(partnerId)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-muted/40">
                      <div className="text-sm line-clamp-2">{m.content}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        ) : tab === "people" ? (
          people.length === 0 ? <Empty label="No people found" /> : (
            <ul className="space-y-1">
              {people.map((p) => (
                <li key={p.id}>
                  <button onClick={() => goToChat(p.user_id || p.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={p.avatar_url || ""} />
                      <AvatarFallback>{(p.full_name || p.username || "?").slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-medium truncate">{p.full_name || p.username}</div>
                      {p.username && <div className="text-[11px] text-muted-foreground truncate">@{p.username}</div>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : tab === "media" ? (
          media.length === 0 ? <Empty label="No media found" /> : (
            <div className="grid grid-cols-3 gap-1">
              {media.map((m) => {
                const partnerId = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
                const url = m.image_url || m.video_url;
                return (
                  <button key={m.id} onClick={() => goToChat(partnerId)} className="aspect-square overflow-hidden rounded-lg bg-muted/40">
                    {m.image_url ? (
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <video src={url} className="w-full h-full object-cover" muted />
                    )}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          links.length === 0 ? <Empty label="No links found" /> : (
            <ul className="space-y-1">
              {links.map((m) => {
                const partnerId = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
                const url = (m.content || "").match(/https?:\/\/\S+/)?.[0] || "";
                return (
                  <li key={m.id}>
                    <button onClick={() => goToChat(partnerId)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-muted/40">
                      <div className="text-sm text-primary truncate">{url}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{m.content}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        )}
      </main>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="text-center text-sm text-muted-foreground py-12">{label}</div>;
}
