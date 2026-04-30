/**
 * CommentPreview — small "View N comments" line + the most-recent or
 * highest-engaged comment text under a feed post. Tapping opens the full
 * comment sheet.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PreviewComment {
  authorName: string;
  text: string;
}

interface Props {
  postId: string;
  source: "store" | "user";
  totalCount: number;
  onOpen: () => void;
}

export default function CommentPreview({ postId, source, totalCount, onOpen }: Props) {
  const [top, setTop] = useState<PreviewComment | null>(null);

  useEffect(() => {
    if (!postId || totalCount <= 0) {
      setTop(null);
      return;
    }
    let cancelled = false;
    (async () => {
      // Pull the most recent comment for the right table
      const table = source === "user" ? "user_post_comments" : "store_post_comments";
      const { data } = await (supabase as any)
        .from(table)
        .select("user_id, comment, content, text, body, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled || !data) return;

      // Comment column varies by table; pick whichever is non-null
      const text = data.comment ?? data.content ?? data.text ?? data.body ?? "";
      if (!text) return;

      let authorName = "User";
      if (data.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", data.user_id)
          .maybeSingle();
        authorName = profile?.full_name ?? profile?.username ?? "User";
      }
      if (!cancelled) setTop({ authorName, text });
    })();

    return () => { cancelled = true; };
  }, [postId, source, totalCount]);

  if (totalCount <= 0) return null;

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onOpen(); }}
      className="text-left text-white/85 active:opacity-70 max-w-[78%]"
    >
      {top && (
        <p className="text-[12px] leading-snug line-clamp-1 drop-shadow">
          <span className="font-semibold">{top.authorName}</span>{" "}
          <span className="opacity-90">{top.text}</span>
        </p>
      )}
      <p className="mt-0.5 text-[11px] font-medium text-white/60 drop-shadow">
        View {totalCount === 1 ? "1 comment" : `all ${totalCount} comments`}
      </p>
    </button>
  );
}
