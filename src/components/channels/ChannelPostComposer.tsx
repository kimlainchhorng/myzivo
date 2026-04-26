import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";

interface Props {
  channelId: string;
  onPosted?: () => void;
}

interface MediaItem {
  url: string;
  path: string;
  type: "image";
}

export function ChannelPostComposer({ channelId, onPosted }: Props) {
  const [body, setBody] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [when, setWhen] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Sign in required");
      return;
    }
    setUploading(true);
    const uploaded: MediaItem[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} is over 10MB`);
        continue;
      }
      const ext = f.name.split(".").pop() || "jpg";
      const path = `${u.user.id}/${channelId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("channel-media").upload(path, f, {
        cacheControl: "3600",
        upsert: false,
        contentType: f.type,
      });
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data: pub } = supabase.storage.from("channel-media").getPublicUrl(path);
      uploaded.push({ url: pub.publicUrl, path, type: "image" });
    }
    setMedia((m) => [...m, ...uploaded].slice(0, 6));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeMedia = async (idx: number) => {
    const item = media[idx];
    setMedia((m) => m.filter((_, i) => i !== idx));
    if (item) {
      await supabase.storage.from("channel-media").remove([item.path]).catch(() => {});
    }
  };

  const submit = async () => {
    if (!body.trim() && media.length === 0) {
      toast.error("Write something or add a photo");
      return;
    }
    setSubmitting(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Sign in required");
      setSubmitting(false);
      return;
    }
    const { data, error } = await supabase.functions.invoke("channel-broadcast", {
      body: {
        channel_id: channelId,
        body: body.trim() || null,
        media: media.map((m) => ({ url: m.url, type: m.type })),
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
    setMedia([]);
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

      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((m, i) => (
            <div key={m.path} className="relative aspect-square overflow-hidden rounded-md border border-border">
              <img src={m.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeMedia(i)}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground hover:bg-background"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onPickFiles(e.target.files)}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || media.length >= 6}
            className="gap-1"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Photo
          </Button>
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
        <Button onClick={submit} disabled={submitting || uploading} size="sm" className="gap-1">
          <Send className="h-4 w-4" /> {scheduled ? "Schedule" : "Post"}
        </Button>
      </div>
    </div>
  );
}
