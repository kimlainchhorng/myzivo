/**
 * GroupChat — Group conversation with multiple participants
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Send from "lucide-react/dist/esm/icons/send";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Users from "lucide-react/dist/esm/icons/users";
import ImagePlus from "lucide-react/dist/esm/icons/image-plus";
import X from "lucide-react/dist/esm/icons/x";
import Mic from "lucide-react/dist/esm/icons/mic";
import Square from "lucide-react/dist/esm/icons/square";
import Phone from "lucide-react/dist/esm/icons/phone";
import Video from "lucide-react/dist/esm/icons/video";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import HoldToRecordMic from "./HoldToRecordMic";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { uploadVoiceWithProgress, retryWithBackoff, UploadAbortedError, UploadHttpError, preflightVoiceBucket } from "@/lib/voiceUpload";
import { vlog, vwarn } from "@/lib/voiceDebug";
import GroupMembersSheet from "./GroupMembersSheet";
import GroupInviteSheet from "./GroupInviteSheet";
import GroupCallLauncher from "./call/GroupCallLauncher";
import { primeCallAudio } from "@/lib/callAudio";
import Link2 from "lucide-react/dist/esm/icons/link-2";

interface GroupChatProps {
  groupId: string;
  groupName: string;
  groupAvatar?: string | null;
  onClose: () => void;
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  message: string;
  image_url: string | null;
  voice_url: string | null;
  message_type: string;
  reply_to_id: string | null;
  created_at: string;
  file_payload?: { duration_ms?: number; client_send_id?: string } | null;
  _local_voice_url?: string;
  _upload_status?: "uploading" | "sent" | "failed";
  _upload_progress?: number;
  _upload_error?: string;
  _upload_endpoint?: string;
  _upload_status_code?: number;
  _upload_phase?: "preflight" | "upload" | "insert";
  _upload_body?: string;
}

interface Member {
  user_id: string;
  name: string;
  avatar: string | null;
}

type GroupMemberRow = {
  user_id: string;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type GroupMessageDeletePayload = {
  old?: { id?: string };
};

type GroupMessageInsertPayload = {
  new: GroupMessage;
};

type GroupMessageInsert = {
  group_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  image_url?: string;
  voice_url?: string;
  reply_to_id?: string;
  file_payload?: { duration_ms?: number; client_send_id?: string } | null;
};

const dbFrom = (table: string): any => (supabase as any).from(table);

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday " + format(d, "h:mm a");
  return format(d, "MMM d, h:mm a");
}

export default function GroupChat({ groupId, groupName, groupAvatar, onClose }: GroupChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; message: string; senderName: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [groupCall, setGroupCall] = useState<"audio" | "video" | null>(null);
  const voice = useVoiceRecorder();
  const voiceUploadInFlightRef = useRef(false);
  const voiceJobsRef = useRef<Map<string, {
    controller: AbortController;
    blob: Blob;
    durationMs: number;
    localUrl: string;
    optimisticId: string;
    publicUrl?: string;
    storagePath?: string;
  }>>(new Map());

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  // Load members
  useEffect(() => {
    if (!user?.id) return;
    const loadMembers = async () => {
      const { data } = await dbFrom("chat_group_members")
        .select("user_id")
        .eq("group_id", groupId);
      const memberData = (data || []) as GroupMemberRow[];

      if (memberData.length > 0) {
        const userIds = memberData.map((m) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        setMembers(
          ((profiles || []) as ProfileRow[]).map((p) => ({
            user_id: p.user_id,
            name: p.full_name || "User",
            avatar: p.avatar_url || null,
          }))
        );
      }
    };
    loadMembers();
  }, [groupId, user?.id]);

  // Load messages
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const { data } = await dbFrom("group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages((data || []) as GroupMessage[]);
      setLoading(false);
      scrollToBottom();
    };
    load();
  }, [groupId, user?.id, scrollToBottom]);

  // Realtime
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`group-${groupId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "group_messages",
        filter: `group_id=eq.${groupId}`,
      }, (payload: GroupMessageInsertPayload) => {
        const msg = payload.new as GroupMessage;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          // Prefer exact match on client_send_id stored in file_payload
          const incomingCsid = (msg.file_payload as { client_send_id?: string } | null)?.client_send_id;
          if (incomingCsid) {
            const csidIdx = prev.findIndex((m) => {
              const mc = (m.file_payload as { client_send_id?: string } | null)?.client_send_id;
              return mc && mc === incomingCsid;
            });
            if (csidIdx >= 0) {
              const next = [...prev];
              next[csidIdx] = { ...msg, _local_voice_url: prev[csidIdx]._local_voice_url };
              return next;
            }
          }
          if ((msg.message_type || "text") !== "voice") {
            const optIdx = prev.findIndex((m) =>
              m.id.startsWith("opt-") &&
              m.sender_id === msg.sender_id &&
              (m.message || "") === (msg.message || "") &&
              (m.message_type || "text") === (msg.message_type || "text")
            );
            if (optIdx >= 0) {
              const next = [...prev];
              next[optIdx] = msg;
              return next;
            }
          }
          return [...prev, msg];
        });
        scrollToBottom();
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "group_messages",
      }, (payload: GroupMessageDeletePayload) => {
        if (payload.old?.id) {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupId, user?.id, scrollToBottom]);

  const getSenderName = (senderId: string) => {
    if (senderId === user?.id) return "You";
    return members.find((m) => m.user_id === senderId)?.name || "User";
  };

  const getSenderAvatar = (senderId: string) => {
    return members.find((m) => m.user_id === senderId)?.avatar || null;
  };

  const handleSend = useCallback(async (imageUrl?: string, voiceUrl?: string) => {
    const text = input.trim();
    if (!text && !imageUrl && !voiceUrl) return;
    if (!user?.id || sending) return;

    const msgType = voiceUrl ? "voice" : imageUrl ? "image" : "text";
    setInput("");
    setReplyTo(null);
    setSending(true);

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: GroupMessage = {
      id: optimisticId,
      group_id: groupId,
      sender_id: user.id,
      message: text,
      image_url: imageUrl || null,
      voice_url: voiceUrl || null,
      message_type: msgType,
      reply_to_id: replyTo?.id || null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const insertData: GroupMessageInsert = {
        group_id: groupId,
        sender_id: user.id,
        message: text || "",
        message_type: msgType,
      };
      if (imageUrl) insertData.image_url = imageUrl;
      if (voiceUrl) insertData.voice_url = voiceUrl;
      if (replyTo) insertData.reply_to_id = replyTo.id;

      // Fire-and-forget insert; realtime echo will replace the optimistic row.
      const { error } = await dbFrom("group_messages").insert(insertData);
      if (error) throw error;
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      toast.error("Failed to send message");
    }
    setSending(false);
  }, [groupId, input, replyTo, scrollToBottom, sending, user?.id]);

  // ─── Voice send pipeline (cancellable + retriable) ────────────────────
  const handledVoiceBlobsRef = useRef<WeakSet<Blob>>(new WeakSet());

  const runVoiceJob = useCallback(async (clientSendId: string, startFromInsert = false) => {
    const job = voiceJobsRef.current.get(clientSendId);
    if (!job || !user?.id) return;
    const { controller, blob, durationMs, optimisticId } = job;

    const updateOpt = (patch: Partial<GroupMessage>) => {
      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? { ...m, ...patch } : m)));
    };

    let lastProgressBucket = -1;
    vlog("send:start", { clientSendId, sizeBytes: blob.size, durationMs, kind: "group", groupId });

    try {
      let publicUrl = job.publicUrl;
      let storagePath = job.storagePath;

      if (!startFromInsert || !publicUrl) {
        const contentType = blob.type || "audio/webm";
        const ext = contentType.includes("mp4") ? "m4a" : "webm";
        const path = `${user.id}/${Date.now()}-${clientSendId}.${ext}`;

        const preflight = await preflightVoiceBucket({
          bucket: "chat-media-files",
          path,
          signal: controller.signal,
        });
        if (!preflight.ok) {
          vwarn("preflight:blocked", { clientSendId, status: preflight.status });
          updateOpt({
            _upload_status: "failed",
            _upload_error: preflight.reason || `Preflight blocked (HTTP ${preflight.status})`,
            _upload_endpoint: preflight.url,
            _upload_status_code: preflight.status,
            _upload_phase: "preflight",
            _upload_body: preflight.body,
          });
          toast.error("Voice note blocked by storage permissions");
          return;
        }

        const result = await retryWithBackoff(
          (attempt) => {
            if (attempt > 0) vlog("upload:retry", { clientSendId, attempt });
            return uploadVoiceWithProgress({
              blob,
              bucket: "chat-media-files",
              path,
              contentType,
              cacheControl: "3600",
              signal: controller.signal,
              onProgress: (ratio) => {
                updateOpt({ _upload_progress: ratio });
                const bucket = Math.floor(ratio * 4);
                if (bucket !== lastProgressBucket) {
                  lastProgressBucket = bucket;
                  vlog("upload:progress", { clientSendId, pct: bucket * 25 });
                }
              },
            });
          },
          { signal: controller.signal, attempts: 3, baseDelayMs: 600 },
        );
        publicUrl = result.publicUrl;
        storagePath = result.path;
        job.publicUrl = publicUrl;
        job.storagePath = storagePath;
        vlog("upload:done", { clientSendId, publicUrl });
      }

      const insertData: GroupMessageInsert = {
        group_id: groupId,
        sender_id: user.id,
        message: "",
        message_type: "voice",
        voice_url: publicUrl!,
        reply_to_id: undefined,
        file_payload: { duration_ms: durationMs, client_send_id: clientSendId } as { duration_ms?: number },
      };
      await retryWithBackoff(
        async (attempt) => {
          if (attempt > 0) vlog("insert:retry", { clientSendId, attempt });
          const { error: insertError } = await dbFrom("group_messages").insert(insertData);
          if (insertError) throw insertError;
        },
        { signal: controller.signal, attempts: 3, baseDelayMs: 600 },
      );
      vlog("insert:done", { clientSendId });

      updateOpt({
        voice_url: publicUrl!,
        _upload_status: "sent",
        _upload_progress: 1,
        _upload_error: undefined,
      });
      setTimeout(() => URL.revokeObjectURL(job.localUrl), 30000);
      voiceJobsRef.current.delete(clientSendId);
    } catch (e) {
      if (e instanceof UploadAbortedError || controller.signal.aborted) {
        vlog("aborted", { clientSendId });
        return;
      }
      vwarn("failed", { clientSendId, error: e });
      const message = e instanceof Error ? e.message : "Upload failed";
      const httpErr = e instanceof UploadHttpError ? e : null;
      const inferredPhase: "preflight" | "upload" | "insert" | undefined =
        httpErr?.phase || (job.publicUrl ? "insert" : "upload");
      updateOpt({
        _upload_status: "failed",
        _upload_error: message,
        _upload_endpoint: httpErr?.url,
        _upload_status_code: httpErr?.status,
        _upload_phase: inferredPhase,
        _upload_body: httpErr?.body,
      });
      toast.error("Voice note failed to send", {
        description: "Tap Resend on the message to try again.",
      });
    }
  }, [user?.id, groupId]);

  const retryVoiceSend = useCallback((clientSendId: string) => {
    const job = voiceJobsRef.current.get(clientSendId);
    if (!job) return;
    job.controller = new AbortController();
    setMessages((prev) => prev.map((m) => {
      const csid = m.file_payload?.client_send_id;
      if (csid !== clientSendId) return m;
      return {
        ...m,
        _upload_status: "uploading",
        _upload_progress: 0,
        _upload_error: undefined,
        _upload_endpoint: undefined,
        _upload_status_code: undefined,
        _upload_phase: undefined,
        _upload_body: undefined,
      };
    }));
    void runVoiceJob(clientSendId, !!job.publicUrl);
  }, [runVoiceJob]);

  const discardVoiceSend = useCallback((clientSendId: string) => {
    const job = voiceJobsRef.current.get(clientSendId);
    if (!job) return;
    try { job.controller.abort(); } catch { /* noop */ }
    setMessages((prev) => prev.filter((m) => m.file_payload?.client_send_id !== clientSendId));
    try { URL.revokeObjectURL(job.localUrl); } catch { /* noop */ }
    if (job.storagePath) {
      void supabase.storage.from("chat-media-files").remove([job.storagePath]).catch(() => {});
    }
    voiceJobsRef.current.delete(clientSendId);
  }, []);

  useEffect(() => {
    if (!voice.audioBlob || voice.isRecording || !user?.id) return;
    const blob = voice.audioBlob;
    if (handledVoiceBlobsRef.current.has(blob)) return;
    handledVoiceBlobsRef.current.add(blob);

    const durationMs = Math.max(0, Math.round(voice.durationMs || (voice.duration || 0) * 1000));
    const localUrl = URL.createObjectURL(blob);
    const clientSendId = `csid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const optimisticId = `opt-voice-${clientSendId}`;
    const optimisticMsg: GroupMessage = {
      id: optimisticId,
      group_id: groupId,
      sender_id: user.id,
      message: "",
      image_url: null,
      voice_url: localUrl,
      message_type: "voice",
      reply_to_id: replyTo?.id || null,
      created_at: new Date().toISOString(),
      file_payload: { duration_ms: durationMs, client_send_id: clientSendId },
      _local_voice_url: localUrl,
      _upload_status: "uploading",
      _upload_progress: 0,
    };
    voiceJobsRef.current.set(clientSendId, {
      controller: new AbortController(),
      blob,
      durationMs,
      localUrl,
      optimisticId,
    });
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();
    voice.clearBlob();
    void runVoiceJob(clientSendId, false);
  }, [voice.audioBlob, voice.isRecording, voice, user?.id, groupId, replyTo?.id, scrollToBottom, runVoiceJob]);

  // Abort in-flight uploads on unmount, but preserve cached blob URLs so any
  // failed bubbles still showing can replay/resend until next clear.
  useEffect(() => {
    return () => {
      for (const [, job] of voiceJobsRef.current) {
        try { job.controller.abort(); } catch { /* noop */ }
      }
      voiceJobsRef.current.clear();
    };
  }, []);


  // Image upload — optimistic bubble, background upload + insert.
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    const localUrl = URL.createObjectURL(file);
    const optimisticId = `opt-img-${Date.now()}`;
    const optimisticMsg: GroupMessage = {
      id: optimisticId,
      group_id: groupId,
      sender_id: user.id,
      message: "",
      image_url: localUrl,
      voice_url: null,
      message_type: "image",
      reply_to_id: replyTo?.id || null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();
    const currentReply = replyTo;
    setReplyTo(null);

    void (async () => {
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("chat-media-files")
          .upload(path, file, { contentType: file.type, upsert: true, cacheControl: "3600" });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("chat-media-files").getPublicUrl(path);
        setMessages((prev) => prev.map((m) => m.id === optimisticId
          ? { ...m, image_url: urlData.publicUrl }
          : m));
        const insertData: GroupMessageInsert = {
          group_id: groupId,
          sender_id: user.id,
          message: "",
          message_type: "image",
          image_url: urlData.publicUrl,
        };
        if (currentReply) insertData.reply_to_id = currentReply.id;
        const { error: insErr } = await dbFrom("group_messages").insert(insertData);
        if (insErr) throw insErr;
      } catch (e) {
        console.warn("[group/image] upload/send failed", e);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        toast.error("Failed to send image");
      } finally {
        setTimeout(() => URL.revokeObjectURL(localUrl), 30000);
      }
    })();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const initials = (groupName || "G").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 safe-area-top">
        <div className="px-3 py-2 flex items-center gap-3">
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <Avatar className="h-9 w-9 border-2 border-border/30">
            <AvatarImage src={groupAvatar || undefined} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{groupName}</p>
            <p className="text-[10px] text-muted-foreground">
              {members.length} members
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => { void primeCallAudio(); setGroupCall("video"); }}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-blue-500/10"
              aria-label="Video call"
              title="Video call"
            >
              <Video className="h-5 w-5 text-blue-500" />
            </button>
            <button
              onClick={() => { void primeCallAudio(); setGroupCall("audio"); }}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-emerald-500/10"
              aria-label="Voice call"
              title="Voice call"
            >
              <Phone className="h-[19px] w-[19px] text-emerald-500" />
            </button>
            <button
              onClick={() => setShowInvites(true)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-muted/50"
              aria-label="Invite links"
              title="Invite links"
            >
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowMembers(true)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-muted/50"
              aria-label="Members"
              title="Members"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground pr-1">{members.length}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-sm">Group created</p>
            <p className="text-xs mt-1">Say hello to the group!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            const senderName = getSenderName(msg.sender_id);
            const senderAvatar = getSenderAvatar(msg.sender_id);
            const repliedMsg = msg.reply_to_id ? messages.find((m) => m.id === msg.reply_to_id) : null;
            const isOptimistic = msg.id.startsWith("opt-");

            return (
              <div
                key={msg.id}
                className={`chat-no-callout flex ${isMe ? "justify-end" : "justify-start"} gap-1.5`}
                onContextMenu={(e) => e.preventDefault()}
                style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
              >
                {!isMe && (
                  <Avatar className="h-6 w-6 mt-1 shrink-0">
                    <AvatarImage src={senderAvatar || undefined} />
                    <AvatarFallback className="text-[8px] bg-muted">{senderName[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${isOptimistic ? "opacity-60" : ""}`}>
                  {/* Sender name for others */}
                  {!isMe && (
                    <p className="text-[10px] font-semibold text-primary mb-0.5 px-1">{senderName}</p>
                  )}

                  {/* Replied message preview */}
                  {repliedMsg && (
                    <div className={`rounded-lg px-2.5 py-1.5 mb-0.5 border-l-2 border-primary/50 text-[10px] ${
                      isMe ? "bg-primary/20 text-primary-foreground/70" : "bg-muted/80 text-muted-foreground"
                    }`}>
                      <span className="font-semibold">{getSenderName(repliedMsg.sender_id)}</span>
                      <p className="truncate">{repliedMsg.message || "📷 Media"}</p>
                    </div>
                  )}

                  {/* Image */}
                  {msg.image_url && (
                    <div className={`rounded-2xl overflow-hidden mb-1 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}>
                      <img src={msg.image_url} alt="" className="max-w-full max-h-60 object-cover rounded-2xl" loading="lazy" />
                    </div>
                  )}

                  {/* Voice */}
                  {msg.message_type === "voice" && msg.voice_url && (
                    <div
                      className={`chat-no-callout px-3 py-2.5 rounded-2xl ${
                      isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                    }`}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
                    >
                      {(() => {
                        const csid = msg.file_payload?.client_send_id;
                        return (
                          <VoiceMessagePlayer
                            url={msg.voice_url}
                            isMe={isMe}
                            durationMs={msg.file_payload?.duration_ms}
                            uploadStatus={msg._upload_status}
                            uploadProgress={msg._upload_progress}
                            uploadError={msg._upload_error}
                            uploadEndpoint={msg._upload_endpoint}
                            uploadStatusCode={msg._upload_status_code}
                            uploadPhase={msg._upload_phase}
                            uploadBody={msg._upload_body}
                            onRetry={csid && msg._upload_status === "failed" ? () => retryVoiceSend(csid) : undefined}
                            onDiscard={csid && (msg._upload_status === "uploading" || msg._upload_status === "failed") ? () => discardVoiceSend(csid) : undefined}
                            onReply={!msg.id.startsWith("opt-") ? () => setReplyTo({ id: msg.id, message: "🎤 Voice message", senderName }) : undefined}
                          />
                        );
                      })()}
                    </div>
                  )}

                  {/* Text */}
                  {msg.message && msg.message_type !== "voice" && (
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                      }`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setReplyTo({ id: msg.id, message: msg.message, senderName });
                      }}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <span className={`text-[9px] block text-right mt-0.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-muted/50 border-t border-border/30 px-4 py-2 flex items-center gap-2 overflow-hidden"
          >
            <div className="w-1 h-8 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-primary">{replyTo.senderName}</p>
              <p className="text-xs text-muted-foreground truncate">{replyTo.message}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="h-7 w-7 rounded-full flex items-center justify-center">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice recording overlay is rendered inside HoldToRecordMic (Round 5) */}

      {/* Input */}
      <div className="bg-background border-t border-border/30 px-3 py-2 flex items-center gap-2 relative" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 h-10 px-4 rounded-full bg-muted/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {input.trim() ? (
          <button
            onClick={() => handleSend()}
            disabled={sending}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        ) : (
          <HoldToRecordMic voice={voice} />
        )}
      </div>

      {/* Phase 4 Track C — Group admin sheets */}
      <GroupMembersSheet
        open={showMembers}
        onOpenChange={setShowMembers}
        groupId={groupId}
        onLeft={onClose}
      />
      <GroupInviteSheet
        open={showInvites}
        onOpenChange={setShowInvites}
        groupId={groupId}
      />

      {/* LiveKit-powered group call overlay */}
      {groupCall && (
        <div className="fixed inset-0 z-[70] bg-background">
          <GroupCallLauncher
            roomName={`group-${groupId}`}
            callType={groupCall}
            onEnded={() => setGroupCall(null)}
          />
        </div>
      )}
    </motion.div>
  );
}
