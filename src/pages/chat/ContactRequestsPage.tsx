/**
 * ContactRequestsPage — incoming + outgoing contact requests.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useContactRequests } from "@/hooks/useContactRequests";
import { formatDistanceToNow } from "date-fns";

export default function ContactRequestsPage() {
  const nav = useNavigate();
  const { incoming, outgoing, loading, accept, decline, cancel } = useContactRequests();
  const [tab, setTab] = useState<"in" | "out">("in");
  const list = tab === "in" ? incoming : outgoing;

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border/30 sticky top-0 bg-background/95 backdrop-blur z-10">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full hover:bg-muted/60 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-semibold text-lg">Contact Requests</h1>
      </header>

      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-muted/60">
          <button onClick={() => setTab("in")} className={`h-9 rounded-full text-sm font-medium ${tab === "in" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            Incoming{incoming.length ? ` · ${incoming.length}` : ""}
          </button>
          <button onClick={() => setTab("out")} className={`h-9 rounded-full text-sm font-medium ${tab === "out" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            Sent{outgoing.length ? ` · ${outgoing.length}` : ""}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <p className="text-center text-sm text-muted-foreground py-12">Loading…</p>}
        {!loading && list.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <UserPlus className="h-10 w-10 mx-auto opacity-30 mb-2" />
            <p className="text-sm">No {tab === "in" ? "incoming" : "sent"} requests.</p>
          </div>
        )}
        {list.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/30">
            <Avatar className="h-12 w-12">
              <AvatarImage src={r.profile?.avatar_url ?? undefined} />
              <AvatarFallback>{(r.profile?.full_name ?? r.profile?.username ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{r.profile?.full_name ?? r.profile?.username ?? "User"}</p>
              {r.message && <p className="text-xs text-muted-foreground truncate">{r.message}</p>}
              <p className="text-[10px] text-muted-foreground/60">{formatDistanceToNow(new Date(r.created_at))} ago · {r.status}</p>
            </div>
            {tab === "in" && r.status === "pending" && (
              <div className="flex gap-1.5">
                <button onClick={() => accept(r.id)} className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => decline(r.id)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {tab === "out" && r.status === "pending" && (
              <button onClick={() => cancel(r.id)} className="px-3 h-9 rounded-full bg-muted text-xs font-medium">Cancel</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
