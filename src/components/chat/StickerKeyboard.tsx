/**
 * StickerKeyboard — iMessage 2026-style sticker/emoji panel
 * Sections: Recent, Sticker Packs, Built-in Categories, AI Stickers
 * Features: drag-to-dismiss, search, horizontal scroll sections, "Done" button
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, Sparkles } from "lucide-react";
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

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

export default function StickerKeyboard({ open, onClose, onSendSticker }: StickerKeyboardProps) {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [recentStickers, setRecentStickers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setRecentStickers(getRecentStickers());
    setSearch("");
    setActiveCategory(null);
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
      style={{ maxHeight: "55vh", touchAction: "none" }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
        <div className="w-9 h-[5px] rounded-full bg-muted-foreground/20" />
      </div>

      {/* Search + Done */}
      <div className="flex items-center gap-2 px-3 pb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Try "heart" or "fire"...'
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <button
          onClick={onClose}
          className="text-sm font-semibold text-primary px-2 py-1 active:opacity-60 transition-opacity"
        >
          Done
        </button>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overscroll-contain"
        style={{ maxHeight: "calc(55vh - 80px)", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
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
            {/* Recently Used */}
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

            {/* DB Sticker Packs */}
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

            {/* Built-in Emoji Categories */}
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
      </div>
    </motion.div>
  );
}