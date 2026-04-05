/**
 * ChatNotificationListener — Global listener for incoming chat messages
 * Plays a sound and shows a browser notification when a new DM arrives
 * while the user is NOT actively viewing that conversation
 */
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

const SOUND_URL = "/sounds/chat-notification.wav";
const NOTIFICATION_COOLDOWN_MS = 2000; // Don't spam sounds

export default function ChatNotificationListener() {
  const { user } = useAuth();
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

  const showBrowserNotification = useCallback((senderName: string, messageText: string) => {
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

          // Get sender name
          let senderName = "Someone";
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", msg.sender_id)
              .maybeSingle();
            if (profile) {
              senderName = profile.full_name || "Someone";
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

          // In-app toast
          toast(senderName, {
            description: preview || "Sent you a message",
            icon: <MessageSquare className="w-4 h-4 text-primary" />,
            duration: 4000,
          });

          // Browser notification (when tab is not focused)
          if (document.hidden) {
            showBrowserNotification(senderName, preview);
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
