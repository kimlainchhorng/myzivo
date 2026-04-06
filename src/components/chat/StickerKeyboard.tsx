/**
 * StickerKeyboard — iMessage 2026-style sticker/emoji panel
 * Tabs: Stickers, GIFs, Avatar, Music, Store
 * Features: drag-to-dismiss, search, horizontal scroll sections, "Done" button
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, Sparkles, Image, Music, User, Store, Download, Play, Pause, Heart } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface StickerKeyboardProps {
  open: boolean;
  onClose: () => void;
  onSendSticker: (sticker: string) => void;
}

interface StickerPack {
  id: string;
  name: string;
  emoji_prefix: string;
  stickers: string[];
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

// Mock GIF data
const TRENDING_GIFS = [
  { id: "1", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDFkam1xNm1kMzh4ZGE3NHVseXI4NnF5b3l2cGltdGRqZTVyeWZkYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VGG8UY1nEl66Y/giphy.gif", label: "Happy" },
  { id: "2", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmV1ZDc0Y2RtdXN5cWl0cW5lYzZ0czU4MzUxbnNnaWM2cHJhYXlhaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYt5jPR6QX5pnqM/giphy.gif", label: "Thumbs Up" },
  { id: "3", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3NjNjR2M2tqb3RtcTQ3OGR0NTdyZHYyZHg5dW5rdGx4c3NtYjQ0ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XreQmk7ETCak0/giphy.gif", label: "LOL" },
  { id: "4", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaW5uZm5hYWZyNDkxNXBhMGQzMTVhOGFnZWowcnAzcW4xbzV3cDgwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/giphy.gif", label: "Dancing" },
];

const GIF_CATEGORIES = ["Trending", "Reactions", "Love", "Happy", "Sad", "Dance", "Anime", "Sports"];

// Mock Avatar Sticker moods
const AVATAR_MOODS = [
  { emoji: "😊", label: "Happy", bg: "from-amber-400 to-orange-400" },
  { emoji: "😂", label: "LOL", bg: "from-yellow-400 to-amber-400" },
  { emoji: "😍", label: "Love", bg: "from-pink-400 to-rose-400" },
  { emoji: "😎", label: "Cool", bg: "from-blue-400 to-cyan-400" },
  { emoji: "🤔", label: "Hmm", bg: "from-purple-400 to-violet-400" },
  { emoji: "😢", label: "Sad", bg: "from-blue-300 to-indigo-400" },
  { emoji: "🥳", label: "Party", bg: "from-fuchsia-400 to-pink-400" },
  { emoji: "😴", label: "Sleepy", bg: "from-indigo-300 to-blue-300" },
  { emoji: "🤯", label: "Mind Blown", bg: "from-red-400 to-orange-400" },
  { emoji: "💪", label: "Strong", bg: "from-emerald-400 to-green-400" },
  { emoji: "🙏", label: "Thanks", bg: "from-teal-400 to-emerald-400" },
  { emoji: "👋", label: "Hi!", bg: "from-sky-400 to-blue-400" },
];

// Mock music tracks
const MOCK_TRACKS = [
  { id: "1", title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", cover: "🎵" },
  { id: "2", title: "Levitating", artist: "Dua Lipa", duration: "3:23", cover: "🎶" },
  { id: "3", title: "Stay", artist: "Kid Laroi & Justin Bieber", duration: "2:21", cover: "🎧" },
  { id: "4", title: "Heat Waves", artist: "Glass Animals", duration: "3:58", cover: "🔥" },
  { id: "5", title: "As It Was", artist: "Harry Styles", duration: "2:47", cover: "✨" },
  { id: "6", title: "Anti-Hero", artist: "Taylor Swift", duration: "3:20", cover: "💜" },
];

// Mock sticker store packs
const STORE_PACKS = [
  { id: "s1", name: "Cute Cats", preview: "🐱", count: 24, downloaded: false, color: "from-amber-400/20 to-orange-400/20" },
  { id: "s2", name: "Anime Reactions", preview: "⚡", count: 32, downloaded: true, color: "from-purple-400/20 to-pink-400/20" },
  { id: "s3", name: "Office Vibes", preview: "💼", count: 18, downloaded: false, color: "from-blue-400/20 to-cyan-400/20" },
  { id: "s4", name: "Food & Drinks", preview: "🍕", count: 28, downloaded: false, color: "from-red-400/20 to-orange-400/20" },
  { id: "s5", name: "Sport Stars", preview: "⚽", count: 20, downloaded: false, color: "from-green-400/20 to-emerald-400/20" },
  { id: "s6", name: "Love & Hearts", preview: "💕", count: 22, downloaded: true, color: "from-pink-400/20 to-rose-400/20" },
  { id: "s7", name: "Travel World", preview: "✈️", count: 26, downloaded: false, color: "from-sky-400/20 to-blue-400/20" },
  { id: "s8", name: "Retro Gaming", preview: "🎮", count: 30, downloaded: false, color: "from-indigo-400/20 to-purple-400/20" },
];

function getRecentStickers(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 30); }
  catch { return []; }
}

function addRecentSticker(sticker: string) {
  const recent = getRecentStickers().filter((s) => s !== sticker);
  recent.unshift(sticker);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 30)));
}

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
  const [selectedCat, setSelectedCat] = useState("Trending");

  return (
    <div className="pb-4">
      {/* Category chips */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none">
        {GIF_CATEGORIES.map((cat) => (
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

      {/* GIF grid */}
      <div className="grid grid-cols-2 gap-1.5 px-3 pt-2">
        {TRENDING_GIFS.map((gif) => (
          <motion.button
            key={gif.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSend(gif.url)}
            className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 group"
          >
            <img src={gif.url} alt={gif.label} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
        {/* Placeholder slots */}
        {[1,2,3,4].map((i) => (
          <div key={`ph-${i}`} className="aspect-square rounded-xl bg-muted/20 flex items-center justify-center">
            <Image className="w-6 h-6 text-muted-foreground/20" />
          </div>
        ))}
      </div>

      {/* API notice */}
      <div className="mx-3 mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
          🔗 Connect a GIF API (Tenor/GIPHY) for full search.
          <br />
          <span className="text-primary/60 font-medium">Coming soon!</span>
        </p>
      </div>
    </div>
  );
}

/* ─── Avatar Stickers Tab ─── */
function AvatarTab({ onSend }: { onSend: (sticker: string) => void }) {
  return (
    <div className="pb-4">
      <SectionHeader title="Your Avatar Stickers" icon={<User className="w-4 h-4 text-primary/60" />} />
      <p className="text-[11px] text-muted-foreground/50 px-4 -mt-1 mb-3">Tap a mood to send your avatar sticker</p>
      <div className="grid grid-cols-4 gap-2 px-3">
        {AVATAR_MOODS.map((mood) => (
          <motion.button
            key={mood.label}
            whileTap={{ scale: 0.85 }}
            onClick={() => onSend(`[avatar:${mood.label.toLowerCase()}]`)}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mood.bg} flex items-center justify-center shadow-sm`}>
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
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="pb-4">
      <SectionHeader title="Share a Track" icon={<Music className="w-4 h-4 text-primary/60" />} />
      <p className="text-[11px] text-muted-foreground/50 px-4 -mt-1 mb-3">Send a music clip to your chat</p>

      <div className="px-3 space-y-1.5">
        {MOCK_TRACKS.map((track) => (
          <motion.div
            key={track.id}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            {/* Album art */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl flex-shrink-0">
              {track.cover}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{track.title}</p>
              <p className="text-[11px] text-muted-foreground/60 truncate">{track.artist} · {track.duration}</p>
            </div>

            {/* Actions */}
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
              {playingId === track.id ? (
                <Pause className="w-4 h-4 text-primary" />
              ) : (
                <Play className="w-4 h-4 text-muted-foreground/50 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => onSend(`[music:${track.title} - ${track.artist}]`)}
              className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/90 transition-colors"
            >
              Send
            </button>
          </motion.div>
        ))}
      </div>

      {/* API notice */}
      <div className="mx-3 mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
          🎵 Connect Spotify or Apple Music for full library.
          <br />
          <span className="text-primary/60 font-medium">Coming soon!</span>
        </p>
      </div>
    </div>
  );
}

/* ─── Store Tab ─── */
function StoreTab() {
  const [downloaded, setDownloaded] = useState<Set<string>>(
    new Set(STORE_PACKS.filter((p) => p.downloaded).map((p) => p.id))
  );

  const handleDownload = (id: string) => {
    setDownloaded((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="pb-4">
      <SectionHeader title="Sticker Store" icon={<Store className="w-4 h-4 text-primary/60" />} />
      <p className="text-[11px] text-muted-foreground/50 px-4 -mt-1 mb-3">Browse & download sticker packs</p>

      <div className="px-3 space-y-2">
        {STORE_PACKS.map((pack) => {
          const isDownloaded = downloaded.has(pack.id);
          return (
            <motion.div
              key={pack.id}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/10 hover:bg-muted/40 transition-colors"
            >
              {/* Pack icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pack.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                {pack.preview}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground">{pack.name}</p>
                <p className="text-[11px] text-muted-foreground/50">{pack.count} stickers</p>
              </div>

              {/* Download button */}
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
      </div>
    </div>
  );
}

/* ─── Main StickerKeyboard ─── */
export default function StickerKeyboard({ open, onClose, onSendSticker }: StickerKeyboardProps) {
  const [packs, setPacks] = useState<StickerPack[]>([]);
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

  if (!open) return null;

  const builtinCategories = Object.keys(BUILTIN_STICKERS);

  return (
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
  );
}
