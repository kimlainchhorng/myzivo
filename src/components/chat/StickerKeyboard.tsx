/**
 * StickerKeyboard — Sticker pack browser with tabbed navigation and quick send
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smile } from "lucide-react";
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

// Frequently used stickers (local)
const RECENT_KEY = "zivo_recent_stickers";

function getRecentStickers(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 20);
  } catch { return []; }
}

function addRecentSticker(sticker: string) {
  const recent = getRecentStickers().filter((s) => s !== sticker);
  recent.unshift(sticker);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 20)));
}

export default function StickerKeyboard({ open, onClose, onSendSticker }: StickerKeyboardProps) {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [activePack, setActivePack] = useState(0);
  const [recentStickers, setRecentStickers] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setRecentStickers(getRecentStickers());
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

  const handleSend = (sticker: string) => {
    addRecentSticker(sticker);
    setRecentStickers(getRecentStickers());
    onSendSticker(sticker);
  };

  const currentPack = packs[activePack];
  const allStickers = currentPack?.stickers || [];
  const displayStickers = search
    ? allStickers.filter((s) => s.includes(search))
    : allStickers;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-background border-t border-border/40 rounded-t-2xl shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Stickers</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Pack tabs */}
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

        {/* Sticker grid */}
        <div className="h-[200px] overflow-y-auto p-2">
          <div className="grid grid-cols-8 gap-0.5">
            {(activePack === -1 ? recentStickers : displayStickers).map((sticker, i) => (
              <button
                key={`${sticker}-${i}`}
                onClick={() => handleSend(sticker)}
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
      </motion.div>
    </AnimatePresence>
  );
}
