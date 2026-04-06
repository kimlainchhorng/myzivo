/**
<<<<<<< Updated upstream
 * StickerKeyboard — iMessage 2026-style sticker/emoji panel
 * Tabs: Stickers, GIFs, Avatar, Music, Store
 * All data fetched from Supabase — no mock/hardcoded data
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, Sparkles, Image, Music, User, Store, Download, Play, Pause, Heart } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
=======
 * StickerKeyboard — iMessage-style rich panel (stickers, GIFs, avatar, music, store, memes)
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smile, Image as ImageIcon, UserRound, Music2, Store, Search, Sparkles } from "lucide-react";
>>>>>>> Stashed changes
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StickerKeyboardProps {
  open: boolean;
  onClose: () => void;
  onSendSticker: (payload: StickerSendPayload) => void;
}

export interface StickerSendPayload {
  text: string;
  messageType?: "sticker" | "gif" | "text";
}

interface StickerPack {
  id: string;
  name: string;
  emoji_prefix: string;
  stickers: string[];
}

interface StorePack {
  id: string;
  name: string;
  preview_emoji: string;
  sticker_count: number;
  gradient_color: string;
  category: string;
  stickers: string[];
}

interface AvatarMood {
  id: string;
  emoji: string;
  label: string;
  gradient_from: string;
  gradient_to: string;
}

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover_emoji: string;
}

interface TrendingGif {
  id: string;
  gif_url: string;
  label: string;
  category: string;
}

type TabId = "stickers" | "gifs" | "avatar" | "music" | "store";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "stickers", label: "Stickers", icon: <span className="text-base">😊</span> },
  { id: "gifs", label: "GIFs", icon: <Image className="w-4 h-4" /> },
  { id: "avatar", label: "Avatar", icon: <User className="w-4 h-4" /> },
  { id: "music", label: "Music", icon: <Music className="w-4 h-4" /> },
  { id: "store", label: "Store", icon: <Store className="w-4 h-4" /> },
];

const RECENT_KEY = "zivo_recent_stickers";

const BUILTIN_STICKERS: Record<string, string[]> = {
  "😀 Smileys": ["😀","😃","😄","😁","😆","🤣","😂","🙂","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😋","😜","🤪","😝","🤑","🤗","🤭","🫢","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫠","😏","😒","🙄","😬","😮‍💨","🤥"],
  "❤️ Love": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💕","💞","💓","💗","💖","💘","💝","💟","♥️","🫶","💑","💏","🥰","😍","😘","💋","🌹","🌺","🌸","💐","🥀"],
  "👋 Gestures": ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🙏","💪","🫳","🫴"],
  "🎉 Celebration": ["🎉","🎊","🥳","🎈","🎁","🎂","🍰","🧁","🥂","🍾","✨","🌟","⭐","💫","🔥","🎆","🎇","🏆","🥇","🎯","🎪","🎨","🎭","🎵","🎶","💃","🕺","🪩","🎤","🎸"],
  "🐱 Animals": ["🐱","🐶","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🦋","🐛"],
  "🍔 Food": ["🍔","🍕","🌮","🌯","🥗","🍜","🍝","🍣","🍱","🥘","🍲","🍛","🍙","🍚","🥟","🍤","🍗","🍖","🥩","🌭","🍟","🧇","🥞","🍳","🥚","☕","🧋","🍵","🧃","🍺"],
};

function getRecentStickers(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 30); }
  catch { return []; }
}

function addRecentSticker(sticker: string) {
  const recent = getRecentStickers().filter((s) => s !== sticker);
  recent.unshift(sticker);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 30)));
}

<<<<<<< Updated upstream
function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

/* ─── GIFs Tab ─── */
function GifsTab({ onSend, search }: { onSend: (url: string) => void; search: string }) {
  const [gifs, setGifs] = useState<TrendingGif[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("gif_trending")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) {
        setGifs(data);
        const cats = ["All", ...new Set(data.map((g: TrendingGif) => g.category))] as string[];
        setCategories(cats);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = selectedCat === "All" ? gifs : gifs.filter((g) => g.category === selectedCat);
  const searched = search.trim()
    ? filtered.filter((g) => g.label?.toLowerCase().includes(search.toLowerCase()))
    : filtered;

  return (
    <div className="pb-4">
      {/* Category chips */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 px-3 pt-2">
          {searched.map((gif) => (
            <motion.button
              key={gif.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSend(gif.gif_url)}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 group"
            >
              <img src={gif.gif_url} alt={gif.label || "GIF"} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {gif.label && (
                <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold text-white/80 drop-shadow">{gif.label}</span>
              )}
            </motion.button>
          ))}
          {searched.length === 0 && (
            <div className="col-span-2 py-8 text-center text-muted-foreground/40 text-xs">
              {search.trim() ? "No GIFs found" : "No GIFs available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Avatar Stickers Tab ─── */
function AvatarTab({ onSend }: { onSend: (sticker: string) => void }) {
  const [moods, setMoods] = useState<AvatarMood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("avatar_sticker_moods")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setMoods(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <SectionHeader title="Your Avatar Stickers" icon={<User className="w-4 h-4 text-primary/60" />} />
      <p className="text-[11px] text-muted-foreground/50 px-4 -mt-1 mb-3">Tap a mood to send your avatar sticker</p>
      <div className="grid grid-cols-4 gap-2 px-3">
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            whileTap={{ scale: 0.85 }}
            onClick={() => onSend(`[avatar:${mood.label.toLowerCase()}]`)}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${mood.gradient_from} to-${mood.gradient_to} flex items-center justify-center shadow-sm`}>
              <span className="text-3xl">{mood.emoji}</span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground/70">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Custom avatar builder teaser */}
      <div className="mx-3 mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-foreground">Create Custom Avatar</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Build your personal avatar sticker pack with AI</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
            Soon
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Music Tab ─── */
function MusicTab({ onSend }: { onSend: (sticker: string) => void }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("shared_music_tracks")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setTracks(data);
      setLoading(false);
    };
    load();
  }, []);

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <SectionHeader title="Share a Track" icon={<Music className="w-4 h-4 text-primary/60" />} />
      <p className="text-[11px] text-muted-foreground/50 px-4 -mt-1 mb-3">Send a music clip to your chat</p>

      <div className="px-3 space-y-1.5">
        {tracks.map((track) => (
          <motion.div
            key={track.id}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl flex-shrink-0">
              {track.cover_emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{track.title}</p>
              <p className="text-[11px] text-muted-foreground/60 truncate">{track.artist} · {track.duration}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFav(track.id); }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Heart className={`w-4 h-4 ${favorites.has(track.id) ? "fill-rose-500 text-rose-500" : "text-muted-foreground/40"}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setPlayingId(playingId === track.id ? null : track.id); }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              {playingId === track.id ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-muted-foreground/50 ml-0.5" />}
            </button>
            <button
              onClick={() => onSend(`[music:${track.title} - ${track.artist}]`)}
              className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/90 transition-colors"
            >
              Send
            </button>
          </motion.div>
        ))}
        {tracks.length === 0 && (
          <div className="py-8 text-center text-muted-foreground/40 text-xs">No tracks available</div>
        )}
      </div>
    </div>
  );
}

/* ─── Store Tab ─── */
function StoreTab() {
  const { user } = useAuth();
  const [packs, setPacks] = useState<StorePack[]>([]);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: packsData } = await (supabase as any)
        .from("sticker_store_packs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (packsData) {
        setPacks(packsData.map((p: any) => ({
          ...p,
          stickers: typeof p.stickers === "string" ? JSON.parse(p.stickers) : (Array.isArray(p.stickers) ? p.stickers : []),
        })));
      }

      if (user?.id) {
        const { data: dlData } = await (supabase as any)
          .from("user_downloaded_packs")
          .select("pack_id")
          .eq("user_id", user.id);
        if (dlData) {
          setDownloaded(new Set(dlData.map((d: any) => d.pack_id)));
        }
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const handleDownload = async (packId: string) => {
    if (!user?.id) return;
    const { error } = await (supabase as any)
      .from("user_downloaded_packs")
      .insert({ user_id: user.id, pack_id: packId });
    if (!error) {
      setDownloaded((prev) => new Set([...prev, packId]));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <SectionHeader title="Sticker Store" icon={<Store className="w-4 h-4 text-primary/60" />} />
      <p className="text-[11px] text-muted-foreground/50 px-4 -mt-1 mb-3">Browse & download sticker packs</p>

      <div className="px-3 space-y-2">
        {packs.map((pack) => {
          const isDownloaded = downloaded.has(pack.id);
          return (
            <motion.div
              key={pack.id}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/10 hover:bg-muted/40 transition-colors"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pack.gradient_color} flex items-center justify-center text-2xl flex-shrink-0`}>
                {pack.preview_emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground">{pack.name}</p>
                <p className="text-[11px] text-muted-foreground/50">{pack.sticker_count} stickers</p>
              </div>
              {isDownloaded ? (
                <div className="px-3 py-1.5 rounded-full bg-muted/60 text-muted-foreground text-[11px] font-semibold">
                  Added
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(pack.id)}
                  className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center gap-1 hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Get
                </motion.button>
              )}
            </motion.div>
          );
        })}
        {packs.length === 0 && (
          <div className="py-8 text-center text-muted-foreground/40 text-xs">No packs available</div>
        )}
      </div>
    </div>
  );
}

/* ─── Main StickerKeyboard ─── */
export default function StickerKeyboard({ open, onClose, onSendSticker }: StickerKeyboardProps) {
  const [packs, setPacks] = useState<StickerPack[]>([]);
=======
type TabKey = "stickers" | "gifs" | "avatar" | "music" | "store" | "memes";

const GIF_ITEMS = [
  { label: "Happy", emoji: "😄" },
  { label: "Thumbs Up", emoji: "👍" },
  { label: "Love", emoji: "😍" },
  { label: "Dance", emoji: "💃" },
  { label: "Laugh", emoji: "😂" },
  { label: "Wow", emoji: "😮" },
];

const AVATAR_ITEMS = [
  { label: "Happy", emoji: "😊" },
  { label: "LOL", emoji: "😂" },
  { label: "Love", emoji: "😍" },
  { label: "Cool", emoji: "😎" },
  { label: "Think", emoji: "🤔" },
  { label: "Sad", emoji: "🥲" },
  { label: "Party", emoji: "🥳" },
  { label: "Sleep", emoji: "😴" },
];

const TRACKS = [
  { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
  { title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
  { title: "Stay", artist: "The Kid LAROI", duration: "2:21" },
  { title: "As It Was", artist: "Harry Styles", duration: "2:47" },
];

const STORE_PACKS = [
  { name: "Cute Cats", count: 24, emoji: "🐱" },
  { name: "Anime Reactions", count: 32, emoji: "⚡" },
  { name: "Travel Vibes", count: 18, emoji: "✈️" },
];

const MEME_ITEMS = [
  { label: "No Way", emoji: "😱" },
  { label: "Big Mood", emoji: "🫠" },
  { label: "Chef's Kiss", emoji: "🤌" },
  { label: "Legend", emoji: "🫡" },
  { label: "Plot Twist", emoji: "🌀" },
  { label: "Mic Drop", emoji: "🎤" },
];

export default function StickerKeyboard({ open, onClose, onSendSticker }: StickerKeyboardProps) {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [activePack, setActivePack] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("stickers");
>>>>>>> Stashed changes
  const [recentStickers, setRecentStickers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("stickers");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setRecentStickers(getRecentStickers());
    setSearch("");
    setActiveCategory(null);
    setActiveTab("stickers");
    const load = async () => {
      const { data } = await (supabase as any)
        .from("chat_sticker_packs")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) {
        setPacks(data.map((p: any) => ({
          ...p,
          stickers: typeof p.stickers === "string" ? JSON.parse(p.stickers) : p.stickers,
        })));
      }
    };
    load();
  }, [open]);

<<<<<<< Updated upstream
  const handleSend = useCallback((sticker: string) => {
    addRecentSticker(sticker);
    setRecentStickers(getRecentStickers());
    onSendSticker(sticker);
  }, [onSendSticker]);

  const searchResults = search.trim()
    ? Object.values(BUILTIN_STICKERS).flat().filter((s) => s.includes(search))
    : null;

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.y > 100) onClose();
  }, [onClose]);
=======
  const handleSendSticker = (sticker: string) => {
    addRecentSticker(sticker);
    setRecentStickers(getRecentStickers());
    onSendSticker({ text: sticker, messageType: "sticker" });
    onClose();
  };

  const handleQuickSend = (text: string, messageType: "gif" | "text" = "text") => {
    onSendSticker({ text, messageType });
    onClose();
  };

  const currentPack = packs[activePack];
  const allStickers = currentPack?.stickers || [];
  const displayStickers = search
    ? allStickers.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
    : allStickers;
>>>>>>> Stashed changes

  if (!open) return null;

  const builtinCategories = Object.keys(BUILTIN_STICKERS);

  return (
<<<<<<< Updated upstream
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.4 }}
      onDragEnd={handleDragEnd}
      className="bg-background border-t border-border/20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-2xl overflow-hidden"
      style={{ maxHeight: "60vh", touchAction: "none" }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
        <div className="w-9 h-[5px] rounded-full bg-muted-foreground/20" />
      </div>

      {/* Tab bar */}
      <div className="flex items-center px-2 pb-1.5 gap-0.5 border-b border-border/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(""); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            {tab.icon}
            <span className="text-[9px] font-semibold">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={onClose}
          className="px-3 py-2 text-sm font-semibold text-primary active:opacity-60 transition-opacity"
        >
          Done
        </button>
      </div>

      {/* Search (stickers & gifs tabs) */}
      {(activeTab === "stickers" || activeTab === "gifs") && (
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "gifs" ? 'Search GIFs...' : 'Try "heart" or "fire"...'}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overscroll-contain"
        style={{ maxHeight: "calc(60vh - 120px)", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* ─── Stickers Tab ─── */}
        {activeTab === "stickers" && (
          <>
            {searchResults ? (
              <div className="px-2 pb-4">
                <SectionHeader title={`Results for "${search}"`} />
                <div className="grid grid-cols-8 gap-1 px-2">
                  {searchResults.length > 0 ? searchResults.map((s, i) => (
                    <motion.button key={`${s}-${i}`} whileTap={{ scale: 0.7 }} onClick={() => handleSend(s)}
                      className="aspect-square flex items-center justify-center text-2xl rounded-xl hover:bg-muted/60 active:bg-primary/10 transition-colors">{s}</motion.button>
                  )) : (
                    <div className="col-span-8 py-8 text-center text-muted-foreground/40 text-xs">No results found</div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {recentStickers.length > 0 && (
                  <div>
                    <SectionHeader title="Recently Used" icon={<Clock className="w-4 h-4 text-muted-foreground/60" />} />
                    <div className="flex gap-1 px-3 overflow-x-auto scrollbar-none pb-2">
                      {recentStickers.map((sticker, i) => (
                        <motion.button key={`recent-${i}`} whileTap={{ scale: 0.7 }} onClick={() => handleSend(sticker)}
                          className="h-12 w-12 flex-shrink-0 flex items-center justify-center text-2xl rounded-xl hover:bg-muted/60 active:bg-primary/10 transition-colors">{sticker}</motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {packs.map((pack) => (
                  <div key={pack.id}>
                    <SectionHeader title={pack.name} icon={<span className="text-base">{pack.emoji_prefix}</span>} />
                    <div className="flex gap-1 px-3 overflow-x-auto scrollbar-none pb-2">
                      {pack.stickers.map((sticker, i) => (
                        <motion.button key={`${pack.id}-${i}`} whileTap={{ scale: 0.7 }} onClick={() => handleSend(sticker)}
                          className="h-12 w-12 flex-shrink-0 flex items-center justify-center text-2xl rounded-xl hover:bg-muted/60 active:bg-primary/10 transition-colors">{sticker}</motion.button>
                      ))}
                    </div>
                  </div>
                ))}

                {builtinCategories.map((cat) => {
                  const emojis = BUILTIN_STICKERS[cat];
                  const catKey = cat.split(" ").slice(1).join(" ") || cat;
                  const isExpanded = activeCategory === cat;
                  return (
                    <div key={cat}>
                      <SectionHeader title={catKey} icon={<span className="text-base">{cat.split(" ")[0]}</span>} />
                      <div className="px-3 pb-2">
                        {isExpanded ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-8 gap-1">
                            {emojis.map((s, i) => (
                              <motion.button key={`${cat}-${i}`} whileTap={{ scale: 0.7 }} onClick={() => handleSend(s)}
                                className="aspect-square flex items-center justify-center text-2xl rounded-xl hover:bg-muted/60 active:bg-primary/10 transition-colors">{s}</motion.button>
                            ))}
                            <button onClick={() => setActiveCategory(null)}
                              className="aspect-square flex items-center justify-center text-[10px] text-muted-foreground rounded-xl hover:bg-muted/60">Less</button>
                          </motion.div>
                        ) : (
                          <div className="flex gap-1 overflow-x-auto scrollbar-none">
                            {emojis.slice(0, 8).map((s, i) => (
                              <motion.button key={`${cat}-${i}`} whileTap={{ scale: 0.7 }} onClick={() => handleSend(s)}
                                className="h-12 w-12 flex-shrink-0 flex items-center justify-center text-2xl rounded-xl hover:bg-muted/60 active:bg-primary/10 transition-colors">{s}</motion.button>
                            ))}
                            {emojis.length > 8 && (
                              <button onClick={() => setActiveCategory(cat)}
                                className="h-12 w-12 flex-shrink-0 flex items-center justify-center text-[10px] text-primary font-semibold rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                                +{emojis.length - 8}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* AI Stickers teaser */}
                <div>
                  <SectionHeader title="AI Stickers" icon={<Sparkles className="w-4 h-4 text-primary/60" />} />
                  <div className="flex gap-2 px-3 pb-4 overflow-x-auto scrollbar-none">
                    <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-muted/60 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                    <div className="flex items-center px-3 min-w-[160px]">
                      <p className="text-xs text-muted-foreground/50 leading-tight">AI stickers coming soon — create custom stickers with AI</p>
                    </div>
                  </div>
                </div>
                <div className="h-4" />
              </>
            )}
          </>
        )}

        {/* ─── GIFs Tab ─── */}
        {activeTab === "gifs" && <GifsTab onSend={handleSend} search={search} />}

        {/* ─── Avatar Tab ─── */}
        {activeTab === "avatar" && <AvatarTab onSend={handleSend} />}

        {/* ─── Music Tab ─── */}
        {activeTab === "music" && <MusicTab onSend={handleSend} />}

        {/* ─── Store Tab ─── */}
        {activeTab === "store" && <StoreTab />}
      </div>
    </motion.div>
=======
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-background border-t border-border/40 rounded-t-2xl shadow-xl max-h-[72vh] overflow-y-auto"
      >
        {/* Header tabs */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/20 px-3 pt-3 pb-2 z-10">
          <div className="w-16 h-1.5 rounded-full bg-muted mx-auto mb-3" />
          <div className="grid grid-cols-6 gap-1 items-start">
            {[
              { key: "stickers" as TabKey, label: "Stickers", icon: Smile },
              { key: "gifs" as TabKey, label: "GIFs", icon: ImageIcon },
              { key: "avatar" as TabKey, label: "Avatar", icon: UserRound },
              { key: "music" as TabKey, label: "Music", icon: Music2 },
              { key: "store" as TabKey, label: "Store", icon: Store },
              { key: "memes" as TabKey, label: "Memes", icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-2 py-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                  activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={onClose}
              className="text-primary text-sm font-semibold px-2 py-1 rounded-lg hover:bg-primary/10"
            >
              Done
            </button>
          </div>
        </div>

        {activeTab === "stickers" && (
          <>
            <div className="px-3 py-2 border-b border-border/10">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stickers"
                  className="w-full h-10 rounded-full bg-muted/30 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div className="flex px-2 py-1.5 gap-1 overflow-x-auto scrollbar-none border-b border-border/10">
              {recentStickers.length > 0 && (
                <button
                  onClick={() => setActivePack(-1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    activePack === -1 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🕐 Recent
                </button>
              )}
              {packs.map((pack, i) => (
                <button
                  key={pack.id}
                  onClick={() => setActivePack(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    activePack === i ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pack.emoji_prefix} {pack.name}
                </button>
              ))}
            </div>

            <div className="h-[280px] overflow-y-auto p-2">
              <div className="grid grid-cols-8 gap-0.5">
                {(activePack === -1 ? recentStickers : displayStickers).map((sticker, i) => (
                  <button
                    key={`${sticker}-${i}`}
                    onClick={() => handleSendSticker(sticker)}
                    className="aspect-square flex items-center justify-center text-2xl rounded-lg hover:bg-muted/60 active:scale-90 transition-all"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              {displayStickers.length === 0 && activePack !== -1 && (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  No stickers found
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "gifs" && (
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input placeholder="Search GIFs..." className="w-full h-11 rounded-full bg-muted/30 pl-9 pr-3 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GIF_ITEMS.map((gif) => (
                <button
                  key={gif.label}
                  onClick={() => handleQuickSend(`${gif.emoji} GIF: ${gif.label}`, "gif")}
                  className="rounded-2xl border border-border/30 p-3 text-left hover:bg-muted/30"
                >
                  <p className="text-2xl">{gif.emoji}</p>
                  <p className="text-sm font-semibold mt-1">{gif.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "avatar" && (
          <div className="p-4">
            <p className="text-sm font-bold text-foreground">Your Avatar Stickers</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Tap a mood to send an avatar sticker</p>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleQuickSend(`${item.emoji} ${item.label}`)}
                  className="rounded-2xl bg-muted/30 p-3 hover:bg-muted/50"
                >
                  <p className="text-3xl">{item.emoji}</p>
                  <p className="text-xs font-medium mt-2 truncate">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "music" && (
          <div className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">Share a Track</p>
            {TRACKS.map((track) => (
              <div key={track.title} className="rounded-2xl border border-border/30 px-3 py-2.5 flex items-center gap-3">
                <span className="text-2xl">🎵</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist} · {track.duration}</p>
                </div>
                <button
                  onClick={() => handleQuickSend(`🎵 ${track.title} — ${track.artist}`)}
                  className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Send
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "store" && (
          <div className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">Sticker Store</p>
            {STORE_PACKS.map((pack) => (
              <div key={pack.name} className="rounded-2xl border border-border/30 px-3 py-3 flex items-center gap-3">
                <span className="text-3xl">{pack.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{pack.name}</p>
                  <p className="text-xs text-muted-foreground">{pack.count} stickers</p>
                </div>
                <button
                  onClick={() => handleQuickSend(`🛍️ Sticker pack: ${pack.name}`)}
                  className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Get
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "memes" && (
          <div className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">Meme Reactions</p>
            <p className="text-xs text-muted-foreground">New tab added for quick meme-style reactions.</p>
            <div className="grid grid-cols-2 gap-3">
              {MEME_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleQuickSend(`${item.emoji} ${item.label}`)}
                  className="rounded-2xl border border-border/30 p-3 text-left hover:bg-muted/30"
                >
                  <p className="text-2xl">{item.emoji}</p>
                  <p className="text-sm font-semibold mt-1">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
>>>>>>> Stashed changes
  );
}
