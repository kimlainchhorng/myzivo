/**
 * ChatPersonalization — Custom wallpapers (preset + photo upload), theme colors, font size per conversation
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Type, ImageIcon, Check, Plus, Trash2 } from "lucide-react";
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
  { id: "default", label: "Default", preview: "bg-background border border-border/40" },
  { id: "bubbles", label: "Bubbles", preview: "bg-gradient-to-br from-primary/5 to-accent/10" },
  { id: "sunset", label: "Sunset", preview: "bg-gradient-to-b from-orange-100/50 to-pink-100/50 dark:from-orange-950/30 dark:to-pink-950/30" },
  { id: "ocean", label: "Ocean", preview: "bg-gradient-to-b from-blue-100/50 to-cyan-100/50 dark:from-blue-950/30 dark:to-cyan-950/30" },
  { id: "forest", label: "Forest", preview: "bg-gradient-to-b from-green-100/50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-950/30" },
  { id: "midnight", label: "Midnight", preview: "bg-gradient-to-b from-slate-200/50 to-indigo-100/50 dark:from-slate-900/50 dark:to-indigo-950/40" },
  { id: "lavender", label: "Lavender", preview: "bg-gradient-to-b from-purple-100/50 to-violet-100/50 dark:from-purple-950/30 dark:to-violet-950/30" },
  { id: "cherry", label: "Cherry", preview: "bg-gradient-to-b from-rose-100/50 to-red-100/50 dark:from-rose-950/30 dark:to-red-950/30" },
  { id: "gold", label: "Gold", preview: "bg-gradient-to-b from-amber-100/50 to-yellow-100/50 dark:from-amber-950/30 dark:to-yellow-950/30" },
  { id: "slate", label: "Slate", preview: "bg-gradient-to-b from-gray-200/50 to-slate-300/50 dark:from-gray-800/40 dark:to-slate-900/50" },
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
  { id: "small", label: "Small", size: "text-xs", display: "text-base" },
  { id: "medium", label: "Medium", size: "text-sm", display: "text-lg" },
  { id: "large", label: "Large", size: "text-base", display: "text-xl" },
  { id: "xlarge", label: "X-Large", size: "text-lg", display: "text-2xl" },
];

export default function ChatPersonalization({ open, onClose, chatPartnerId, chatPartnerName, onApply }: ChatPersonalizationProps) {
  const { user } = useAuth();
  const [wallpaper, setWallpaper] = useState("default");
  const [themeColor, setThemeColor] = useState("default");
  const [fontSize, setFontSize] = useState("medium");
  const [customPhotos, setCustomPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !user?.id) return;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("chat_settings")
        .select("wallpaper, theme_color, font_size, custom_wallpapers")
        .eq("user_id", user.id)
        .eq("chat_partner_id", chatPartnerId)
        .maybeSingle();
      if (data) {
        setWallpaper(data.wallpaper || "default");
        setThemeColor(data.theme_color || "default");
        setFontSize(data.font_size || "medium");
        setCustomPhotos(data.custom_wallpapers || []);
      }
    };
    load();
  }, [open, user?.id, chatPartnerId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image must be under 20MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/wallpapers/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-media-files")
        .upload(path, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("chat-media-files")
        .getPublicUrl(path);

      const newUrl = urlData.publicUrl;
      const updated = [...customPhotos, newUrl];
      setCustomPhotos(updated);
      setWallpaper(`custom:${newUrl}`);
      toast.success("Wallpaper uploaded!");
    } catch (err: any) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeCustomPhoto = (url: string) => {
    const updated = customPhotos.filter((p) => p !== url);
    setCustomPhotos(updated);
    if (wallpaper === `custom:${url}`) {
      setWallpaper("default");
    }
  };

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
        custom_wallpapers: customPhotos,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,chat_partner_id" });
    onApply({ wallpaper, themeColor, fontSize });
    toast.success("Chat personalization saved");
    onClose();
  };

  if (!open) return null;

  const selectedFontSize = FONT_SIZES.find(f => f.id === fontSize)?.size || "text-sm";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="relative bg-background rounded-t-[28px] w-full max-w-md max-h-[88vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-background z-10 px-6 pt-3 pb-4">
            <div className="w-9 h-[5px] rounded-full bg-muted-foreground/15 mx-auto mb-5" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">Personalize Chat</h3>
                <p className="text-[13px] text-primary font-semibold mt-0.5">{chatPartnerName}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-5 space-y-6">

            {/* Wallpaper */}
            <section className="bg-muted/20 rounded-2xl p-4">
              <h4 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                </div>
                Chat Wallpaper
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {WALLPAPERS.map((w) => (
                  <motion.button
                    key={w.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setWallpaper(w.id)}
                    className={`aspect-[3/4] rounded-xl border-2 transition-all overflow-hidden relative ${
                      wallpaper === w.id
                        ? "border-primary shadow-md shadow-primary/20 ring-1 ring-primary/20"
                        : "border-transparent hover:border-border/40"
                    }`}
                  >
                    <div className={`w-full h-full rounded-[10px] ${w.preview}`} />
                    {wallpaper === w.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                        </div>
                      </motion.div>
                    )}
                    <span className="absolute bottom-1 left-0 right-0 text-[8px] text-center font-semibold text-foreground/60">
                      {w.label}
                    </span>
                  </motion.button>
                ))}

                {/* Custom uploaded photos */}
                {customPhotos.map((url) => (
                  <div key={url} className="relative group">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setWallpaper(`custom:${url}`)}
                      className={`aspect-[3/4] rounded-xl border-2 transition-all overflow-hidden w-full ${
                        wallpaper === `custom:${url}`
                          ? "border-primary shadow-md shadow-primary/20 ring-1 ring-primary/20"
                          : "border-transparent hover:border-border/40"
                      }`}
                    >
                      <img src={url} alt="Custom wallpaper" className="w-full h-full object-cover rounded-[10px]" />
                      {wallpaper === `custom:${url}` && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/15 rounded-[10px]"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                            <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                          </div>
                        </motion.div>
                      )}
                      <span className="absolute bottom-1 left-0 right-0 text-[8px] text-center font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                        Photo
                      </span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => { e.stopPropagation(); removeCustomPhoto(url); }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </motion.button>
                  </div>
                ))}

                {/* Upload Photo */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-primary/25 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {uploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent"
                    />
                  ) : (
                    <Plus className="w-5 h-5 text-primary/50" />
                  )}
                  <span className="text-[8px] font-bold text-primary/50">
                    {uploading ? "Adding..." : "Photo"}
                  </span>
                </motion.button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </section>

            {/* Bubble Color */}
            <section className="bg-muted/20 rounded-2xl p-4">
              <h4 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5 text-primary" />
                </div>
                Bubble Color
              </h4>
              <div className="flex gap-3 flex-wrap">
                {THEME_COLORS.map((c) => (
                  <motion.button
                    key={c.id}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setThemeColor(c.id)}
                    className={`w-11 h-11 rounded-full ${c.color} transition-all flex items-center justify-center ${
                      themeColor === c.id
                        ? "ring-[3px] ring-offset-2 ring-offset-background ring-foreground/60 scale-105 shadow-lg"
                        : "hover:scale-110 shadow-sm"
                    }`}
                  >
                    {themeColor === c.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                        <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Font Size */}
            <section className="bg-muted/20 rounded-2xl p-4">
              <h4 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Type className="w-3.5 h-3.5 text-primary" />
                </div>
                Font Size
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {FONT_SIZES.map((f) => (
                  <motion.button
                    key={f.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFontSize(f.id)}
                    className={`py-3 rounded-xl border-2 transition-all ${
                      fontSize === f.id
                        ? "border-primary bg-primary/8 shadow-sm"
                        : "border-transparent bg-background hover:bg-muted/30"
                    }`}
                  >
                    <span className={`${f.display} font-bold text-foreground block text-center`}>Aa</span>
                    <span className={`text-[9px] block text-center mt-0.5 font-bold ${
                      fontSize === f.id ? "text-primary" : "text-muted-foreground/60"
                    }`}>{f.label}</span>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Live Preview */}
            <section className="bg-muted/20 rounded-2xl p-4">
              <h4 className="text-[13px] font-bold text-foreground mb-3">Preview</h4>
              <div className={`rounded-2xl p-4 h-28 flex flex-col justify-between relative overflow-hidden border border-border/10 ${
                wallpaper.startsWith("custom:") ? "" : getWallpaperClass(wallpaper)
              }`}
                style={wallpaper.startsWith("custom:") ? {
                  backgroundImage: `url(${wallpaper.replace("custom:", "")})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                } : undefined}
              >
                {/* Received bubble */}
                <div className="self-start max-w-[65%] px-3 py-1.5 rounded-2xl rounded-bl-sm bg-muted/80 backdrop-blur-sm">
                  <span className={`text-foreground ${selectedFontSize}`}>Hey there! 😊</span>
                </div>
                {/* Sent bubble */}
                <div className={`self-end max-w-[65%] px-3 py-1.5 rounded-2xl rounded-br-sm ${getThemeColorClass(themeColor)}`}>
                  <span className={`text-white ${selectedFontSize}`}>Hello! 👋</span>
                </div>
              </div>
            </section>
          </div>

          {/* Save button */}
          <div className="px-6 py-4 bg-background border-t border-border/10">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground text-[15px] font-bold shadow-lg shadow-primary/20 active:shadow-sm transition-all"
            >
              Apply Changes
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Get wallpaper CSS class from ID */
export function getWallpaperClass(id: string): string {
  if (id.startsWith("custom:")) return "";
  const map: Record<string, string> = {
    default: "",
    bubbles: "bg-gradient-to-br from-primary/5 to-accent/10",
    sunset: "bg-gradient-to-b from-orange-100/30 to-pink-100/30 dark:from-orange-950/20 dark:to-pink-950/20",
    ocean: "bg-gradient-to-b from-blue-100/30 to-cyan-100/30 dark:from-blue-950/20 dark:to-cyan-950/20",
    forest: "bg-gradient-to-b from-green-100/30 to-emerald-100/30 dark:from-green-950/20 dark:to-emerald-950/20",
    midnight: "bg-gradient-to-b from-slate-200/30 to-indigo-100/30 dark:from-slate-900/40 dark:to-indigo-950/30",
    lavender: "bg-gradient-to-b from-purple-100/30 to-violet-100/30 dark:from-purple-950/20 dark:to-violet-950/20",
    cherry: "bg-gradient-to-b from-rose-100/30 to-red-100/30 dark:from-rose-950/20 dark:to-red-950/20",
    gold: "bg-gradient-to-b from-amber-100/30 to-yellow-100/30 dark:from-amber-950/20 dark:to-yellow-950/20",
    slate: "bg-gradient-to-b from-gray-200/30 to-slate-300/30 dark:from-gray-800/30 dark:to-slate-900/30",
  };
  return map[id] || "";
}

/** Get wallpaper style for custom photo wallpapers */
export function getWallpaperStyle(id: string): React.CSSProperties | undefined {
  if (!id.startsWith("custom:")) return undefined;
  return {
    backgroundImage: `url(${id.replace("custom:", "")})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

/** Get theme color class for bubble */
function getThemeColorClass(id: string): string {
  const map: Record<string, string> = {
    default: "bg-primary",
    rose: "bg-rose-500",
    orange: "bg-orange-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    cyan: "bg-cyan-500",
  };
  return map[id] || "bg-primary";
}
