/**
 * ChatMediaGallery — Shared media tab showing all photos, videos, voice notes, files exchanged in a conversation
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, Video, Mic, FileText, Download, ArrowLeft, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ChatMediaGalleryProps {
  open: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

type MediaTab = "photos" | "videos" | "voice" | "links";

interface MediaItem {
  id: string;
  url: string;
  type: MediaTab;
  message?: string;
  created_at: string;
  sender_id: string;
}

export default function ChatMediaGallery({ open, onClose, recipientId, recipientName }: ChatMediaGalleryProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<MediaTab>("photos");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video">("image");

  useEffect(() => {
    if (!open || !user?.id) return;
    const load = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("direct_messages")
        .select("id, image_url, video_url, voice_url, message_type, message, created_at, sender_id")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: false })
        .limit(500);

      if (data) {
        const media: MediaItem[] = [];
        for (const msg of data) {
          if (msg.image_url) media.push({ id: msg.id, url: msg.image_url, type: "photos", message: msg.message, created_at: msg.created_at, sender_id: msg.sender_id });
          if (msg.video_url) media.push({ id: msg.id, url: msg.video_url, type: "videos", message: msg.message, created_at: msg.created_at, sender_id: msg.sender_id });
          if (msg.voice_url) media.push({ id: msg.id, url: msg.voice_url, type: "voice", message: msg.message, created_at: msg.created_at, sender_id: msg.sender_id });
          // Extract links from text messages
          if (msg.message && msg.message_type === "text") {
            const urlRegex = /https?:\/\/[^\s]+/g;
            const urls = msg.message.match(urlRegex);
            if (urls) {
              for (const u of urls) {
                media.push({ id: `${msg.id}-link`, url: u, type: "links", message: msg.message, created_at: msg.created_at, sender_id: msg.sender_id });
              }
            }
          }
        }
        setItems(media);
      }
      setLoading(false);
    };
    load();
  }, [open, user?.id, recipientId]);

  const filtered = items.filter((i) => i.type === tab);

  const tabs: { id: MediaTab; label: string; icon: typeof Image; count: number }[] = [
    { id: "photos", label: "Photos", icon: Image, count: items.filter(i => i.type === "photos").length },
    { id: "videos", label: "Videos", icon: Video, count: items.filter(i => i.type === "videos").length },
    { id: "voice", label: "Voice", icon: Mic, count: items.filter(i => i.type === "voice").length },
    { id: "links", label: "Links", icon: FileText, count: items.filter(i => i.type === "links").length },
  ];

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-background flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 safe-area-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Shared Media</p>
            <p className="text-[10px] text-muted-foreground">{recipientName}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-1 pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                tab === t.id ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className={`min-w-[16px] h-4 px-1 text-[9px] rounded-full flex items-center justify-center ${
                  tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
            <p className="text-sm font-medium">No {tab} shared</p>
            <p className="text-xs mt-1">Media shared in this conversation will appear here</p>
          </div>
        ) : tab === "photos" ? (
          <div className="grid grid-cols-3 gap-1.5">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => { setPreviewUrl(item.url); setPreviewType("image"); }}
                className="aspect-square rounded-xl overflow-hidden bg-muted"
              >
                <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        ) : tab === "videos" ? (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => { setPreviewUrl(item.url); setPreviewType("video"); }}
                className="aspect-video rounded-xl overflow-hidden bg-muted relative"
              >
                <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                    <Play className="w-4 h-4 text-foreground ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1.5 right-1.5 text-[9px] text-white bg-black/50 px-1.5 py-0.5 rounded-full">
                  {format(new Date(item.created_at), "MMM d")}
                </span>
              </button>
            ))}
          </div>
        ) : tab === "voice" ? (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">Voice Note</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.sender_id === user?.id ? "You" : recipientName} • {format(new Date(item.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
                <audio src={item.url} controls className="h-8 max-w-[120px]" preload="metadata" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary truncate">{item.url}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(item.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Image/Video Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
            onClick={() => setPreviewUrl(null)}
          >
            <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center safe-area-top">
              <X className="w-5 h-5 text-white" />
            </button>
            {previewType === "image" ? (
              <img src={previewUrl} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <video src={previewUrl} controls autoPlay playsInline className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
