/**
 * ChatNotificationListener — Global listener for incoming chat messages
 * Plays a sound and shows a browser notification when a new DM arrives
 * while the user is NOT actively viewing that conversation
 */
import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const SOUND_URL = "/sounds/chat-notification.wav";
const NOTIFICATION_COOLDOWN_MS = 2000; // Don't spam sounds

export default function ChatNotificationListener() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSoundRef = useRef(0);
  const activeChatRef = useRef<string | null>(null);

  // Preload audio
  useEffect(() => {
    const audio = new Audio(SOUND_URL);
    audio.volume = 0.6;
    audio.preload = "auto";
    audioRef.current = audio;
  }, []);

  // Track which chat is currently open via a custom event
  useEffect(() => {
    const handleChatOpen = (e: CustomEvent) => {
      activeChatRef.current = e.detail?.recipientId || null;
    };
    const handleChatClose = () => {
      activeChatRef.current = null;
    };
    window.addEventListener("chat-opened" as any, handleChatOpen);
    window.addEventListener("chat-closed" as any, handleChatClose);
    return () => {
      window.removeEventListener("chat-opened" as any, handleChatOpen);
      window.removeEventListener("chat-closed" as any, handleChatClose);
    };
  }, []);

  const playSound = useCallback(() => {
    const now = Date.now();
    if (now - lastSoundRef.current < NOTIFICATION_COOLDOWN_MS) return;
    lastSoundRef.current = now;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const showBrowserNotification = useCallback((senderName: string, messageText: string, senderId: string) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        const notif = new Notification(`${senderName}`, {
          body: messageText || "Sent you a message",
          icon: "/icons/icon-192x192.png",
          tag: `chat-${Date.now()}`,
          silent: false,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
          window.location.href = `/chat?with=${encodeURIComponent(senderId)}`;
        };
        // Auto-close after 5s
        setTimeout(() => notif.close(), 5000);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`global-chat-notif-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload: any) => {
          const msg = payload.new;
          if (!msg || msg.sender_id === user.id) return;

          // Don't notify if the chat with this sender is currently open
          if (activeChatRef.current === msg.sender_id) return;

          // Play sound
          playSound();

          // Get sender name + avatar
          let senderName = "Someone";
          let senderAvatar: string | null = null;
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("user_id", msg.sender_id)
              .maybeSingle();
            if (profile) {
              senderName = profile.full_name || "Someone";
              senderAvatar = profile.avatar_url || null;
            }
          } catch {}

          // Determine message preview
          let preview = msg.content || "";
          if (msg.message_type === "image" || msg.message_type === "locked_image") preview = "📷 Photo";
          else if (msg.message_type === "video" || msg.message_type === "locked_video") preview = "🎥 Video";
          else if (msg.message_type === "voice") preview = "🎤 Voice message";
          else if (msg.message_type === "location") preview = "📍 Location";
          else if (msg.message_type === "sticker") preview = "🎭 Sticker";
          else if (msg.message_type === "gif") preview = "GIF";
          else if (preview.length > 50) preview = preview.slice(0, 50) + "…";

          const senderId = msg.sender_id;

          // In-app toast with avatar + Reply action (premium iMessage-style)
          const initials = senderName
            .split(" ")
            .map(n => n[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?";

          toast.custom((t) => (
            <div className="flex items-center gap-3 w-full p-3 pr-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-2xl shadow-foreground/10 ring-1 ring-white/5">
              <div className="relative shrink-0">
                <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                  <AvatarImage src={senderAvatar || undefined} alt={senderName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-card shadow-md" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {senderName}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {preview || "Sent you a message"}
                </p>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t);
                  navigate(`/chat?with=${encodeURIComponent(senderId)}`);
                }}
                className="shrink-0 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/30 hover:shadow-primary/50 active:scale-95 transition-all"
              >
                Reply
              </button>
            </div>
          ), { duration: 5000 });

          // Browser notification (when tab is not focused)
          if (document.hidden) {
            showBrowserNotification(senderName, preview, senderId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, playSound, showBrowserNotification]);

  return null;
}
