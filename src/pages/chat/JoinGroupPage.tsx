/**
 * JoinGroupPage — `/chat/join/:code` deep-link target.
 *
 * Looks up the invite, calls the `redeem_group_invite` RPC, then redirects
 * the user into the group chat hub. If the invite is invalid or expired the
 * RPC throws a clear error which we surface via toast.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { redeemGroupInvite } from "@/hooks/useGroupAdmin";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Users from "lucide-react/dist/esm/icons/users";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InvitePreview {
  group_id: string;
  expires_at: string | null;
  revoked_at: string | null;
  max_uses: number | null;
  use_count: number;
  group?: { name: string; avatar_url: string | null } | null;
}

export default function JoinGroupPage() {
  const { code } = useParams<{ code: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Load preview (RLS allows authenticated read of any invite by code)
  useEffect(() => {
    if (!code) return;
    if (authLoading) return;
    if (!user) {
      navigate(`/auth?redirect=/chat/join/${encodeURIComponent(code)}`, { replace: true });
      return;
    }
    (async () => {
      const { data, error } = await (supabase as any)
        .from("chat_group_invites")
        .select("group_id, expires_at, revoked_at, max_uses, use_count, group:chat_groups(name, avatar_url)")
        .eq("code", code)
        .maybeSingle();
      if (error || !data) {
        setError("Invite not found");
        return;
      }
      setPreview(data as InvitePreview);
    })();
  }, [code, user, authLoading, navigate]);

  const handleJoin = async () => {
    if (!code) return;
    setJoining(true);
    const groupId = await redeemGroupInvite(code);
    setJoining(false);
    if (groupId) {
      toast.success(`Joined ${preview?.group?.name || "group"}`);
      navigate(`/chat?group=${groupId}`, { replace: true });
    }
  };

  if (authLoading || (!preview && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-3">
        <Users className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Invite unavailable</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          This invite link is invalid or no longer valid. Ask the group admin
          for a new one.
        </p>
        <Button onClick={() => navigate("/chat", { replace: true })}>Back to chats</Button>
      </div>
    );
  }

  const expired =
    preview?.expires_at && new Date(preview.expires_at).getTime() < Date.now();
  const usedUp =
    preview?.max_uses != null && preview.use_count >= preview.max_uses;
  const revoked = !!preview?.revoked_at;
  const blocked = expired || usedUp || revoked;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
      {preview?.group?.avatar_url ? (
        <img
          src={preview.group.avatar_url}
          alt=""
          className="w-20 h-20 rounded-full object-cover border border-border/60"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-9 h-9 text-primary" />
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold">{preview?.group?.name || "Group chat"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          You've been invited to join this group.
        </p>
      </div>
      {blocked && (
        <p className="text-sm text-destructive">
          {revoked ? "This invite has been revoked." : expired ? "This invite has expired." : "This invite has reached its usage limit."}
        </p>
      )}
      <div className="flex gap-2 w-full max-w-xs">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate("/chat", { replace: true })}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleJoin}
          disabled={joining || !!blocked}
        >
          {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join group"}
        </Button>
      </div>
    </div>
  );
}
