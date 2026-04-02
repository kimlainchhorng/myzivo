/**
 * ChatPersonalization — Custom wallpapers, theme colors, font size per conversation
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Type, Image, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatPersonalizationProps {
  open: boolean;
  onClose: () => void;
  chatPartnerId: string;
  chatPartnerName: string;
  onApply: (settings: { wallpaper: string; themeColor: string; fontSize: string }) => void;
}

const WALLPAPERS = [
  { id: "default", label: "Default", preview: "bg-background" },
  { id: "bubbles", label: "Bubbles", preview: "bg-gradient-to-br from-primary/5 to-accent/10" },
  { id: "sunset", label: "Sunset", preview: "bg-gradient-to-b from-orange-100/30 to-pink-100/30 dark:from-orange-950/20 dark:to-pink-950/20" },
  { id: "ocean", label: "Ocean", preview: "bg-gradient-to-b from-blue-100/30 to-cyan-100/30 dark:from-blue-950/20 dark:to-cyan-950/20" },
  { id: "forest", label: "Forest", preview: "bg-gradient-to-b from-green-100/30 to-emerald-100/30 dark:from-green-950/20 dark:to-emerald-950/20" },
  { id: "midnight", label: "Midnight", preview: "bg-gradient-to-b from-slate-200/30 to-indigo-100/30 dark:from-slate-900/40 dark:to-indigo-950/30" },
  { id: "lavender", label: "Lavender", preview: "bg-gradient-to-b from-purple-100/30 to-violet-100/30 dark:from-purple-950/20 dark:to-violet-950/20" },
];

const THEME_COLORS = [
  { id: "default", label: "Default", color: "bg-primary" },
  { id: "rose", label: "Rose", color: "bg-rose-500" },
  { id: "orange", label: "Orange", color: "bg-orange-500" },
  { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
  { id: "blue", label: "Blue", color: "bg-blue-500" },
  { id: "purple", label: "Purple", color: "bg-purple-500" },
  { id: "amber", label: "Amber", color: "bg-amber-500" },
  { id: "cyan", label: "Cyan", color: "bg-cyan-500" },
];

const FONT_SIZES = [
  { id: "small", label: "Small", size: "text-xs" },
  { id: "medium", label: "Medium", size: "text-sm" },
  { id: "large", label: "Large", size: "text-base" },
  { id: "xlarge", label: "X-Large", size: "text-lg" },
];

export default function ChatPersonalization({ open, onClose, chatPartnerId, chatPartnerName, onApply }: ChatPersonalizationProps) {
  const { user } = useAuth();
  const [wallpaper, setWallpaper] = useState("default");
  const [themeColor, setThemeColor] = useState("default");
  const [fontSize, setFontSize] = useState("medium");

  useEffect(() => {
    if (!open || !user?.id) return;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("chat_settings")
        .select("wallpaper, theme_color, font_size")
        .eq("user_id", user.id)
        .eq("chat_partner_id", chatPartnerId)
        .maybeSingle();
      if (data) {
        setWallpaper(data.wallpaper || "default");
        setThemeColor(data.theme_color || "default");
        setFontSize(data.font_size || "medium");
      }
    };
    load();
  }, [open, user?.id, chatPartnerId]);

  const handleSave = async () => {
    if (!user?.id) return;
    await (supabase as any)
      .from("chat_settings")
      .upsert({
        user_id: user.id,
        chat_partner_id: chatPartnerId,
        wallpaper,
        theme_color: themeColor,
        font_size: fontSize,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,chat_partner_id" });
    onApply({ wallpaper, themeColor, fontSize });
    toast.success("Chat personalization saved");
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10 px-5 pt-5 pb-3 border-b border-border/30">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Personalize Chat</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{chatPartnerName}</p>
          </div>

          <div className="p-5 space-y-6">
            {/* Wallpaper */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" /> Chat Wallpaper
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {WALLPAPERS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWallpaper(w.id)}
                    className={`aspect-[3/4] rounded-xl border-2 transition-all overflow-hidden relative ${
                      wallpaper === w.id ? "border-primary shadow-md" : "border-border/30"
                    }`}
                  >
                    <div className={`w-full h-full ${w.preview}`} />
                    {wallpaper === w.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-0 right-0 text-[8px] text-center font-medium text-foreground">
                      {w.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Color */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Bubble Color
              </h4>
              <div className="flex gap-2 flex-wrap">
                {THEME_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setThemeColor(c.id)}
                    className={`w-10 h-10 rounded-full ${c.color} border-2 transition-all flex items-center justify-center ${
                      themeColor === c.id ? "border-foreground scale-110 shadow-lg" : "border-transparent"
                    }`}
                  >
                    {themeColor === c.id && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" /> Font Size
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {FONT_SIZES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontSize(f.id)}
                    className={`py-3 rounded-xl border-2 transition-all ${
                      fontSize === f.id ? "border-primary bg-primary/10" : "border-border/30"
                    }`}
                  >
                    <span className={`${f.size} font-medium text-foreground block text-center`}>Aa</span>
                    <span className="text-[9px] text-muted-foreground block text-center mt-1">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
            >
              Apply Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Get wallpaper CSS class from ID */
export function getWallpaperClass(id: string): string {
  const map: Record<string, string> = {
    default: "",
    bubbles: "bg-gradient-to-br from-primary/5 to-accent/10",
    sunset: "bg-gradient-to-b from-orange-100/30 to-pink-100/30 dark:from-orange-950/20 dark:to-pink-950/20",
    ocean: "bg-gradient-to-b from-blue-100/30 to-cyan-100/30 dark:from-blue-950/20 dark:to-cyan-950/20",
    forest: "bg-gradient-to-b from-green-100/30 to-emerald-100/30 dark:from-green-950/20 dark:to-emerald-950/20",
    midnight: "bg-gradient-to-b from-slate-200/30 to-indigo-100/30 dark:from-slate-900/40 dark:to-indigo-950/30",
    lavender: "bg-gradient-to-b from-purple-100/30 to-violet-100/30 dark:from-purple-950/20 dark:to-violet-950/20",
  };
  return map[id] || "";
}
