/**
 * ChatSocialShareSheet — Bottom sheet to share an external social profile link
 * inside a chat (Facebook, OnlyFans, Instagram, X, TikTok, YouTube, Snapchat,
 * Telegram, LinkedIn). Prefills the user's saved handle from their profile and
 * lets them edit before sending. Resulting URL is appended to the composer
 * input via `onShareLink`.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import X from "lucide-react/dist/esm/icons/x";
import Facebook from "lucide-react/dist/esm/icons/facebook";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import Twitter from "lucide-react/dist/esm/icons/twitter";
import Youtube from "lucide-react/dist/esm/icons/youtube";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Music2 from "lucide-react/dist/esm/icons/music-2";
import Ghost from "lucide-react/dist/esm/icons/ghost";
import Send from "lucide-react/dist/esm/icons/send";
import Heart from "lucide-react/dist/esm/icons/heart";
import LinkIcon from "lucide-react/dist/esm/icons/link";
import Disc from "lucide-react/dist/esm/icons/disc";
import Headphones from "lucide-react/dist/esm/icons/headphones";
import Music from "lucide-react/dist/esm/icons/music";
import UserRound from "lucide-react/dist/esm/icons/user-round";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileShareUrl, getPublicOrigin } from "@/lib/getPublicOrigin";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { openExternalUrl } from "@/lib/openExternalUrl";
import onlyfansLogo from "@/assets/brand-logos/onlyfans.png";

type Platform =
  | "facebook"
  | "onlyfans"
  | "instagram"
  | "x"
  | "tiktok"
  | "youtube"
  | "snapchat"
  | "telegram"
  | "linkedin"
  | "spotify"
  | "applemusic"
  | "soundcloud"
  | "ytmusic";

const PLATFORMS: {
  id: Platform;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  brandImage?: string;
  color: string;
  prefix: string;
  placeholder: string;
}[] = [
  { id: "facebook",  label: "Facebook",  icon: Facebook,  color: "bg-[#1877F2]",                                    prefix: "https://facebook.com/",   placeholder: "yourname" },
  { id: "onlyfans",  label: "OnlyFans",  icon: Heart,     brandImage: onlyfansLogo, color: "bg-white",                prefix: "https://onlyfans.com/",   placeholder: "yourname" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]", prefix: "https://instagram.com/", placeholder: "yourname" },
  { id: "x",         label: "X",         icon: Twitter,   color: "bg-black",                                        prefix: "https://x.com/",          placeholder: "yourname" },
  { id: "tiktok",    label: "TikTok",    icon: Music2,    color: "bg-black",                                        prefix: "https://tiktok.com/@",    placeholder: "yourname" },
  { id: "youtube",   label: "YouTube",   icon: Youtube,   color: "bg-[#FF0000]",                                    prefix: "https://youtube.com/@",   placeholder: "yourchannel" },
  { id: "snapchat",  label: "Snapchat",  icon: Ghost,     color: "bg-[#FFFC00] text-black",                         prefix: "https://snapchat.com/add/", placeholder: "yourname" },
  { id: "telegram",  label: "Telegram",  icon: Send,      color: "bg-[#229ED9]",                                    prefix: "https://t.me/",           placeholder: "yourname" },
  { id: "linkedin",  label: "LinkedIn",  icon: Linkedin,  color: "bg-[#0A66C2]",                                    prefix: "https://linkedin.com/in/", placeholder: "yourname" },
  { id: "spotify",    label: "Spotify",     icon: Disc,        color: "bg-[#1DB954]", prefix: "https://open.spotify.com/user/",  placeholder: "your-spotify-id or paste track URL" },
  { id: "applemusic", label: "Apple Music", icon: Headphones,  color: "bg-[#FA243C]", prefix: "https://music.apple.com/profile/", placeholder: "your-apple-id or paste song URL" },
  { id: "soundcloud", label: "SoundCloud",  icon: Music,       color: "bg-[#FF5500]", prefix: "https://soundcloud.com/",          placeholder: "yourname or paste track URL" },
  { id: "ytmusic",    label: "YT Music",    icon: Music2,      color: "bg-[#FF0000]", prefix: "https://music.youtube.com/channel/", placeholder: "channel id or paste song URL" },
];

export interface SocialCardPayload {
  platform: string;
  platform_label: string;
  url: string;
  handle: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Receives a final URL to insert/append into the composer. */
  onShareLink: (url: string) => void;
  /** When provided, the sheet's primary action sends a structured social card
   *  bubble; falls back to onShareLink (text-only) when omitted. */
  onShareSocialCard?: (payload: SocialCardPayload) => void;
}

const RECENT_KEY = "chat:social-share:recent";

function loadRecent(): Platform[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((p): p is Platform => PLATFORMS.some((x) => x.id === p));
  } catch { return []; }
}

function pushRecent(p: Platform) {
  try {
    const current = loadRecent().filter((x) => x !== p);
    const next = [p, ...current].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* noop */ }
}

export default function ChatSocialShareSheet({ open, onClose, onShareLink, onShareSocialCard }: Props) {
  const { data: profile } = useUserProfile();
  const { user } = useAuth();
  const [selected, setSelected] = useState<Platform | null>(null);
  const [handle, setHandle] = useState("");
  const [recent, setRecent] = useState<Platform[]>([]);

  useEffect(() => { if (open) setRecent(loadRecent()); }, [open]);

  const pickPlatform = (id: Platform) => {
    setSelected(id);
    pushRecent(id);
    setRecent(loadRecent());
  };

  const shareMyZivoProfile = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("share_code")
      .eq("user_id", user.id)
      .maybeSingle();
    const url = data?.share_code ? getProfileShareUrl(data.share_code) : `${getPublicOrigin()}/user/${user.id}`;
    onShareLink(url);
    onClose();
  };

  const savedHandle = useMemo(() => {
    if (!selected || !profile) return "";
    const raw =
      selected === "facebook"  ? profile.social_facebook :
      selected === "onlyfans"  ? profile.social_onlyfans :
      selected === "instagram" ? profile.social_instagram :
      selected === "tiktok"    ? profile.social_tiktok :
      selected === "snapchat"  ? profile.social_snapchat :
      selected === "x"         ? profile.social_x :
      selected === "linkedin"  ? profile.social_linkedin :
      selected === "telegram"  ? profile.social_telegram :
      "";
    return (raw || "").trim();
  }, [selected, profile]);

  useEffect(() => {
    if (!open) { setSelected(null); setHandle(""); }
  }, [open]);

  useEffect(() => {
    if (!selected) return;
    if (savedHandle) setHandle(stripPrefix(savedHandle, PLATFORMS.find(p => p.id === selected)!.prefix));
    else setHandle("");
  }, [selected, savedHandle]);

  const platform = PLATFORMS.find(p => p.id === selected);

  const finalUrl = useMemo(() => {
    if (!platform) return "";
    const trimmed = handle.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return platform.prefix + trimmed.replace(/^@/, "");
  }, [platform, handle]);

  const handleShare = () => {
    if (!finalUrl) return;
    onShareLink(finalUrl);
    onClose();
  };

  const handleSendAsCard = () => {
    if (!finalUrl || !platform || !onShareSocialCard) return;
    onShareSocialCard({
      platform: platform.id,
      platform_label: platform.label,
      url: finalUrl,
      handle: handle.trim(),
    });
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="social-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[1500] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="social-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed left-0 right-0 bottom-0 z-[1501] bg-background rounded-t-3xl shadow-2xl border-t border-border/30 max-h-[85vh] overflow-hidden flex flex-col"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="w-10 h-1.5 rounded-full bg-muted mx-auto" />
            </div>
            <div className="px-5 pb-2 flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-foreground">
                {platform ? `Share ${platform.label}` : "Share Social Profile"}
              </h3>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-5">
              {!platform ? (
                <>
                  <button
                    onClick={shareMyZivoProfile}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 active:scale-[0.99] transition-all mb-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                      <UserRound className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[14px] font-semibold text-foreground">Share My ZIVO Profile</p>
                      <p className="text-[12px] text-muted-foreground">Send your profile link in this chat</p>
                    </div>
                  </button>
                  {recent.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-2">Recent</p>
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                        {recent.map((rid) => {
                          const rp = PLATFORMS.find((x) => x.id === rid);
                          if (!rp) return null;
                          const RIcon = rp.icon;
                          return (
                            <button
                              key={`recent-${rid}`}
                              onClick={() => pickPlatform(rid)}
                              className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50 hover:bg-muted/80 active:scale-95 transition-all flex-shrink-0"
                            >
                              <div className={`w-6 h-6 rounded-full ${rp.color} flex items-center justify-center overflow-hidden border border-border/40`}>
                                {rp.brandImage ? (
                                  <img src={rp.brandImage} alt={rp.label} className="w-full h-full object-contain" />
                                ) : (
                                  <RIcon className="w-3.5 h-3.5 text-white" />
                                )}
                              </div>
                              <span className="text-[12px] font-semibold text-foreground">{rp.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                    {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => pickPlatform(p.id)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center shadow-sm group-active:scale-90 transition-transform overflow-hidden border ${p.brandImage ? "border-border/40" : "border-transparent"}`}>
                        {p.brandImage ? (
                          <img src={p.brandImage} alt={p.label} className="w-10 h-10 object-contain" />
                        ) : (
                          <p.icon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <span className="text-[11.5px] font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {p.label}
                      </span>
                    </button>
                  ))}
                  </div>
                </>
              ) : (
                <div className="pt-2 space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                    <div className={`w-12 h-12 rounded-2xl ${platform.color} flex items-center justify-center flex-shrink-0 overflow-hidden ${platform.brandImage ? "border border-border/40" : ""}`}>
                      {platform.brandImage ? (
                        <img src={platform.brandImage} alt={platform.label} className="w-9 h-9 object-contain" />
                      ) : (
                        <platform.icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-foreground">{platform.label}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{platform.prefix}…</p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-[12px] font-medium text-primary hover:opacity-70"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Handle or URL
                    </label>
                    <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border/40 bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                      <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleShare(); }}
                        placeholder={platform.placeholder}
                        className="flex-1 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground/60"
                      />
                    </div>
                    {finalUrl && (
                      <p className="mt-1.5 text-[11.5px] text-muted-foreground truncate">
                        Preview: <span className="text-foreground font-medium">{finalUrl}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {onShareSocialCard && (
                      <button
                        onClick={handleSendAsCard}
                        disabled={!finalUrl}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                      >
                        Send card
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={async () => { if (finalUrl) { try { await openExternalUrl(finalUrl); } catch { /* noop */ } } }}
                        disabled={!finalUrl}
                        className="px-4 py-3 rounded-xl bg-muted/60 text-foreground font-semibold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                      >
                        Open
                      </button>
                      <button
                        onClick={handleShare}
                        disabled={!finalUrl}
                        className={`flex-1 py-3 rounded-xl ${onShareSocialCard ? "bg-muted/60 text-foreground" : "bg-primary text-primary-foreground"} font-semibold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform`}
                      >
                        Add to text
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function stripPrefix(value: string, prefix: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      const path = u.pathname.replace(/^\/+/, "").replace(/^@/, "");
      return path;
    } catch { return v; }
  }
  return v.replace(/^@/, "").replace(prefix, "");
}
