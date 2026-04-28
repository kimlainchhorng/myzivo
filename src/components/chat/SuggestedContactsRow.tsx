/**
 * SuggestedContactsRow — horizontal "People you may know" strip on Contacts page.
 * - Retry-aware add() with classified error toasts
 * - Clearer badges with deep-links to follower/chat context
 * - A11y labels and keyboard focus styles
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import X from "lucide-react/dist/esm/icons/x";
import { useSuggestedContacts, type Suggested } from "@/hooks/useSuggestedContacts";
import { useContacts } from "@/hooks/useContacts";
import { useContactRequests } from "@/hooks/useContactRequests";
import { toast } from "sonner";

type FailKind = "rate" | "network" | "duplicate" | "other";

function classify(err: any): FailKind {
  const msg = (err?.message || err || "").toString().toLowerCase();
  const code = (err?.code || "").toString();
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "network";
  if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("network request")) return "network";
  if (code === "429" || msg.includes("rate") || msg.includes("too many")) return "rate";
  if (code === "23505" || msg.includes("duplicate") || msg.includes("already exists")) return "duplicate";
  return "other";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SuggestedContactsRow() {
  const navigate = useNavigate();
  const { items, loading, isStale, refresh } = useSuggestedContacts();
  const { add } = useContacts();
  const { outgoing } = useContactRequests();
  const [adding, setAdding] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const pendingIds = new Set(
    (outgoing ?? []).filter((r) => r.status === "pending").map((r) => r.to_user_id)
  );

  const visible = items.filter((i) => !dismissed.has(i.user_id));
  if (loading || visible.length === 0) return null;

  async function tryAdd(id: string, attempt = 0): Promise<void> {
    setAdding(id);
    const r = await add(id, { via: "suggested" });
    if (r.ok) {
      toast.success("Added to contacts");
      setAdding(null);
      setDismissed((prev) => new Set(prev).add(id));
      void refresh(true);
      return;
    }
    const kind = classify(r.error);
    if (kind === "duplicate") {
      toast.success("Already in your contacts");
      setAdding(null);
      void refresh(true);
      return;
    }
    if (kind === "network" && attempt < 2) {
      await sleep(800 * (attempt + 1));
      return tryAdd(id, attempt + 1);
    }
    setAdding(null);
    const message =
      kind === "rate" ? "You're going too fast. Try again in a moment."
      : kind === "network" ? "No connection. Check your network and try again."
      : (r.error || "Couldn't add contact");
    toast.error(message, {
      action: { label: "Retry", onClick: () => void tryAdd(id) },
    });
  }

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  function openContext(s: Suggested) {
    const name = s.full_name || (s.username ? `@${s.username}` : "ZIVO user");
    if (s.reason === "chat") {
      navigate("/chat", {
        state: {
          openChat: {
            recipientId: s.user_id,
            recipientName: name,
            recipientAvatar: s.avatar_url || null,
          },
        },
      });
    } else {
      const target = s.username ? `/u/${s.username}` : `/profile/${s.user_id}`;
      navigate(`${target}?context=followers`);
    }
  }

  return (
    <section
      role="group"
      aria-label="Suggested people you may know"
      className="px-1 pb-2"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-[13px] font-semibold text-muted-foreground">People you may know</h2>
        <div className="flex items-center gap-1.5">
          {isStale && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" aria-hidden="true" />}
          <span className="text-[11px] text-muted-foreground">{visible.length}</span>
        </div>
      </div>
      <ul className="flex gap-2 overflow-x-auto px-3 pb-1 scrollbar-none">
        {visible.map((s) => {
          const name = s.full_name || (s.username ? `@${s.username}` : "ZIVO user");
          const isFollower = s.reason === "follower";
          const badgeLabel = isFollower ? "Follows you" : "Recent chat";
          const badgeAria = isFollower
            ? `Open profile, ${name} follows you`
            : `Open recent chat with ${name}`;
          return (
            <li
              key={s.user_id}
              className="relative shrink-0 w-[120px] rounded-2xl border bg-card p-2.5 flex flex-col items-center text-center"
            >
              <button
                onClick={() => dismiss(s.user_id)}
                aria-label={`Dismiss ${name}`}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
              <Avatar className="w-12 h-12 mb-1.5">
                <AvatarImage src={s.avatar_url ?? undefined} />
                <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-[12px] font-medium truncate w-full leading-tight">{name}</div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openContext(s); }}
                aria-label={badgeAria}
                className={
                  "mt-1 mb-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none " +
                  (isFollower
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                    : "bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-500/25")
                }
              >
                {isFollower ? <UserCheck className="w-2.5 h-2.5" /> : <MessageCircle className="w-2.5 h-2.5" />}
                {badgeLabel}
              </button>

              <button
                type="button"
                onClick={() => void tryAdd(s.user_id)}
                disabled={adding === s.user_id}
                aria-label={`Add ${name} to contacts`}
                className="w-full h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:outline-none"
              >
                {adding === s.user_id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <><UserPlus className="w-3 h-3" /> Add</>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
