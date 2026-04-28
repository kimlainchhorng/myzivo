/**
 * SuggestedContactsRow — horizontal "People you may know" strip on Contacts page.
 */
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Loader2, X } from "lucide-react";
import { useSuggestedContacts } from "@/hooks/useSuggestedContacts";
import { useContacts } from "@/hooks/useContacts";
import { toast } from "sonner";

export default function SuggestedContactsRow() {
  const { items, loading, refresh } = useSuggestedContacts();
  const { add } = useContacts();
  const [adding, setAdding] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = items.filter((i) => !dismissed.has(i.user_id));
  if (loading || visible.length === 0) return null;

  async function onAdd(id: string) {
    setAdding(id);
    const r = await add(id, { via: "suggested" });
    setAdding(null);
    if (r.ok) {
      toast.success("Added to contacts");
      void refresh();
    } else {
      toast.error(r.error || "Couldn't add");
    }
  }

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  return (
    <div className="px-1 pb-2">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-[13px] font-semibold text-muted-foreground">People you may know</h2>
        <span className="text-[11px] text-muted-foreground">{visible.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 pb-1 scrollbar-none">
        {visible.map((s) => {
          const name = s.full_name || (s.username ? `@${s.username}` : "ZIVO user");
          return (
            <div
              key={s.user_id}
              className="relative shrink-0 w-[120px] rounded-2xl border bg-card p-2.5 flex flex-col items-center text-center"
            >
              <button
                onClick={() => dismiss(s.user_id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
              <Avatar className="w-12 h-12 mb-1.5">
                <AvatarImage src={s.avatar_url ?? undefined} />
                <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-[12px] font-medium truncate w-full leading-tight">{name}</div>
              <div className="text-[10px] text-muted-foreground mb-1.5">
                {s.reason === "follower" ? "Follows you" : "Recent chat"}
              </div>
              <button
                onClick={() => onAdd(s.user_id)}
                disabled={adding === s.user_id}
                className="w-full h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1 disabled:opacity-60"
              >
                {adding === s.user_id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <><UserPlus className="w-3 h-3" /> Add</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
