/**
 * StoryDeepLinkPage — Resolves `/stories/:storyId` shareable links by looking
 * up the story, verifying it's still active, and redirecting to the canonical
 * stories surface (`/feed?story=<id>`) where the shared StoryViewer mounts.
 *
 * Expired or missing stories show a friendly fallback instead of an empty viewer.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

export default function StoryDeepLinkPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "missing">("loading");

  useEffect(() => {
    if (!storyId) {
      setStatus("missing");
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("stories" as any)
        .select("id, expires_at")
        .eq("id", storyId)
        .maybeSingle();
      if (cancelled) return;
      const story = data as any;
      if (error || !story || new Date(story.expires_at) < new Date()) {
        track("story_deeplink_missing", { story_id: storyId, reason: error ? "error" : !story ? "not_found" : "expired" });
        setStatus("missing");
        return;
      }
      track("story_deeplink_open", { story_id: storyId, source: "shared-link" });
      navigate(`/feed?story=${storyId}`, { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [storyId, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-xl font-bold text-foreground">Story unavailable</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        This story is no longer available. Stories disappear 24 hours after they're posted.
      </p>
      <Button asChild>
        <Link to="/feed">Back to feed</Link>
      </Button>
    </div>
  );
}
