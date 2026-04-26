import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface Props {
  channelId: string;
  onPosted?: () => void;
}

export function ChannelPostComposer({ channelId, onPosted }: Props) {
  const [body, setBody] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [when, setWhen] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!body.trim()) {
      toast.error("Write something first");
      return;
    }
    setSubmitting(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Sign in required");
      setSubmitting(false);
      return;
    }
    // Use the channel-broadcast edge function so subscribers get notified.
    const { data, error } = await supabase.functions.invoke("channel-broadcast", {
      body: {
        channel_id: channelId,
        body: body.trim(),
        media: [],
        scheduled_for: scheduled && when ? new Date(when).toISOString() : null,
      },
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Couldn't publish");
      return;
    }
    setBody("");
    setWhen("");
    setScheduled(false);
    const notified = (data as any)?.notified ?? 0;
    toast.success(
      scheduled
        ? "Scheduled"
        : notified
        ? `Posted · ${notified} subscriber${notified > 1 ? "s" : ""} notified`
        : "Posted"
    );
    onPosted?.();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share an update with your subscribers…"
        rows={3}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={scheduled} onCheckedChange={setScheduled} id="sch" />
          <Label htmlFor="sch" className="text-xs">Schedule</Label>
        </div>
        {scheduled && (
          <Input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="w-[220px]"
          />
        )}
        <Button onClick={submit} disabled={submitting} size="sm" className="gap-1">
          <Send className="h-4 w-4" /> {scheduled ? "Schedule" : "Post"}
        </Button>
      </div>
    </div>
  );
}
