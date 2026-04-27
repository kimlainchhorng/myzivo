import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChannel } from "@/hooks/useChannel";
import { useSmartBack } from "@/lib/smartBack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelMemberRow, type MemberRow } from "@/components/channels/ChannelMemberRow";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

export default function ManageChannelPage() {
  const { handle } = useParams<{ handle: string }>();
  const { channel, userId, refresh, loading } = useChannel(handle);
  const goBack = useSmartBack(handle ? `/c/${handle}` : "/channels");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (!channel) return;
    setName(channel.name);
    setDesc(channel.description ?? "");
    setIsPublic(channel.is_public);
    loadMembers();
    loadScheduled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.id]);

  const loadMembers = async () => {
    if (!channel) return;
    const { data } = await supabase
      .from("channel_subscribers")
      .select("user_id, role")
      .eq("channel_id", channel.id);
    if (!data) return;
    const ids = data.map((r) => r.user_id);
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const map = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
    setMembers(
      data.map((r: any) => ({
        user_id: r.user_id,
        role: r.role,
        display_name: map.get(r.user_id)?.display_name,
        avatar_url: map.get(r.user_id)?.avatar_url,
      }))
    );
  };

  const loadScheduled = async () => {
    if (!channel) return;
    const { data } = await supabase
      .from("channel_posts")
      .select("*")
      .eq("channel_id", channel.id)
      .is("published_at", null)
      .not("scheduled_for", "is", null)
      .order("scheduled_for", { ascending: true });
    setScheduled(data ?? []);
  };

  const saveMeta = async () => {
    if (!channel) return;
    const { error } = await supabase
      .from("channels")
      .update({ name: name.trim(), description: desc.trim() || null, is_public: isPublic })
      .eq("id", channel.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      refresh();
    }
  };

  const setRole = async (uid: string, role: string) => {
    if (!channel) return;
    await supabase
      .from("channel_subscribers")
      .update({ role: role as any })
      .eq("channel_id", channel.id)
      .eq("user_id", uid);
    loadMembers();
  };

  const removeMember = async (uid: string) => {
    if (!channel) return;
    await supabase
      .from("channel_subscribers")
      .delete()
      .eq("channel_id", channel.id)
      .eq("user_id", uid);
    loadMembers();
  };

  const cancelScheduled = async (id: string) => {
    await supabase.from("channel_posts").delete().eq("id", id);
    loadScheduled();
  };

  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!channel) return <div className="p-8 text-center text-sm text-muted-foreground">Not found.</div>;
  if (userId !== channel.owner_id) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Only the owner can manage this channel.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border/40 pt-safe px-3 py-3 flex items-center gap-2">
        <button onClick={goBack} className="p-1.5 rounded-full hover:bg-muted/60" aria-label="Back">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1 truncate">Manage @{channel.handle}</h1>
      </header>
      <div className="mx-auto max-w-2xl p-4">

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Public</Label>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <Button onClick={saveMeta}>Save</Button>
        </TabsContent>

        <TabsContent value="members" className="space-y-2">
          {members.map((m) => (
            <ChannelMemberRow
              key={m.user_id}
              member={m}
              isOwnerView
              onPromote={() => setRole(m.user_id, "admin")}
              onDemote={() => setRole(m.user_id, "sub")}
              onRemove={() => removeMember(m.user_id)}
            />
          ))}
          {members.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No members yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-2">
          {scheduled.map((p) => (
            <div key={p.id} className="flex items-start justify-between rounded-lg border border-border bg-card p-3">
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm">{p.body}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Scheduled for {new Date(p.scheduled_for).toLocaleString()}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => cancelScheduled(p.id)}>
                Cancel
              </Button>
            </div>
          ))}
          {scheduled.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nothing scheduled.
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
