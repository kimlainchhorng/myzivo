/**
 * UsernameRedirectPage — `/@:username` deep-link resolver.
 *
 * Looks up a profile by `username` and forwards to the canonical
 * `/user/:userId` profile page. Shows a small loading / not-found state in
 * between so the URL feels first-class.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import UserX from "lucide-react/dist/esm/icons/user-x";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

export default function UsernameRedirectPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "not_found" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!username) {
        setStatus("not_found");
        return;
      }
      // The Profile share previously emitted `/u/<userId>` — UUIDs land here,
      // so detect that shape and forward straight to the user-id profile.
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (UUID_RE.test(username)) {
        navigate(`/user/${username}`, { replace: true });
        return;
      }
      // Compare case-insensitively — usernames are unique but stored in
      // their original casing, so we use ilike to be lenient on URL casing.
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("username", username)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setStatus("error");
        return;
      }
      const userId = (data as { user_id?: string } | null)?.user_id;
      if (userId) {
        navigate(`/user/${userId}`, { replace: true });
      } else {
        setStatus("not_found");
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [username, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <SEOHead title={`@${username}`} description={`Finding @${username} on ZIVO`} />
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <SEOHead title={`@${username} — not found`} description={`@${username} couldn't be found on ZIVO`} />
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <UserX className="w-7 h-7 text-muted-foreground" />
      </div>
      <h1 className="text-base font-bold text-foreground">@{username}</h1>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        {status === "error"
          ? "Couldn't load this profile right now. Try again in a moment."
          : "This username doesn't exist on ZIVO."}
      </p>
      <Button onClick={() => navigate("/")} className="mt-5">Go home</Button>
    </div>
  );
}
