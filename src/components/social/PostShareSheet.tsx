/**
 * PostShareSheet — bottom-sheet share menu used by every post in the feed.
 *
 * Replaces the old "silent clipboard copy" share with a proper grid of
 * destinations: Send to a friend (in-app DM), Story, native system sheet,
 * external apps (WhatsApp, Telegram, Messenger, X, Email, SMS), and
 * fallback Copy link.
 */
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import Send from "lucide-react/dist/esm/icons/send";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import Mail from "lucide-react/dist/esm/icons/mail";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Download from "lucide-react/dist/esm/icons/download";

export interface PostShareSheetTarget {
  postId: string;
  url: string;
  title?: string;
  text?: string;
  imageUrl?: string | null;
  /** Called when an in-app DM share is selected. */
  onSendToFriend?: () => void;
  /** Called after any successful share so the parent can bump shares_count. */
  onShared?: (channel: string) => void;
}

let setSheetTarget: ((t: PostShareSheetTarget | null) => void) | null = null;

/** Imperative open — call from anywhere (e.g. the share button). */
export function openPostShareSheet(target: PostShareSheetTarget) {
  if (setSheetTarget) setSheetTarget(target);
}

const externalIntents = (url: string, text: string) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return [
    { id: "whatsapp", label: "WhatsApp", color: "bg-emerald-500", href: `https://wa.me/?text=${t}%20${u}` },
    { id: "telegram", label: "Telegram", color: "bg-sky-500", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { id: "messenger", label: "Messenger", color: "bg-blue-500", href: `https://www.facebook.com/dialog/send?link=${u}&app_id=0&redirect_uri=${u}` },
    { id: "x", label: "X", color: "bg-zinc-900", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { id: "facebook", label: "Facebook", color: "bg-blue-600", href: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}` },
    { id: "sms", label: "Messages", color: "bg-green-500", href: `sms:?&body=${t}%20${u}` },
    { id: "email", label: "Email", color: "bg-amber-500", href: `mailto:?subject=${t}&body=${u}` },
  ];
};

const robustCopy = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
};

/** Mount once at app root so any caller can open the sheet. */
export default function PostShareSheet() {
  const [target, _setTarget] = useState<PostShareSheetTarget | null>(null);

  useEffect(() => { setSheetTarget = _setTarget; return () => { setSheetTarget = null; }; }, []);

  if (!target) {
    return (
      <Sheet open={false}>
        <SheetContent />
      </Sheet>
    );
  }

  const { url, title = "ZIVO post", text = title, onSendToFriend, onShared } = target;
  const close = () => _setTarget(null);
  const intents = externalIntents(url, text);

  const handleNativeSheet = async () => {
    try {
      // Capacitor first (iOS/Android app)
      const { Share } = await import("@capacitor/share");
      const can = await Share.canShare();
      if (can.value) {
        await Share.share({ title, text, url, dialogTitle: "Share post" });
        onShared?.("native");
        close();
        return;
      }
    } catch { /* fall through to web share */ }
    if (typeof navigator !== "undefined" && (navigator as { share?: (data: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as unknown as { share: (data: ShareData) => Promise<void> }).share({ title, text, url });
        onShared?.("native");
        close();
        return;
      } catch (e) {
        if ((e as { name?: string })?.name === "AbortError") { close(); return; }
      }
    }
    // No native sheet — copy link as a graceful fallback.
    const ok = await robustCopy(url);
    if (ok) {
      toast.success("Link copied", { description: "Paste it anywhere to share this post." });
      onShared?.("clipboard");
    } else {
      toast("Tap to copy this link", { duration: 12000, description: url, action: { label: "Copy", onClick: () => robustCopy(url) } });
    }
    close();
  };

  const handleCopy = async () => {
    const ok = await robustCopy(url);
    if (ok) {
      toast.success("Link copied", { description: "Paste it anywhere to share this post." });
      onShared?.("clipboard");
    } else {
      toast("Tap to copy this link", { duration: 12000, description: url, action: { label: "Copy", onClick: () => robustCopy(url) } });
    }
    close();
  };

  const handleStory = () => {
    // Stub: deep link the user to the story composer pre-loaded with the post.
    toast("Share to Story — coming soon", { description: "Re-share posts to your story is on the roadmap." });
    close();
  };

  const handleDownload = async () => {
    if (!target.imageUrl) {
      toast("This post has no image to save");
      return;
    }
    try {
      const a = document.createElement("a");
      a.href = target.imageUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Image opening — long-press to save");
      onShared?.("download");
    } catch {
      toast.error("Couldn't open image");
    }
    close();
  };

  const handleExternal = (intent: { id: string; href: string; label: string }) => {
    try {
      window.open(intent.href, "_blank", "noopener,noreferrer");
      onShared?.(intent.id);
    } catch {
      toast.error(`Couldn't open ${intent.label}`);
    }
    close();
  };

  return (
    <Sheet open={!!target} onOpenChange={(o) => { if (!o) close(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="text-left">
          <SheetTitle className="text-[15px] font-semibold">Share this post</SheetTitle>
        </SheetHeader>

        {/* Primary actions */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {onSendToFriend && (
            <ShareTile color="bg-primary text-primary-foreground" label="Send" onClick={() => { onSendToFriend(); onShared?.("dm"); close(); }}>
              <Send className="h-5 w-5" />
            </ShareTile>
          )}
          <ShareTile color="bg-fuchsia-500 text-white" label="Story" onClick={handleStory}>
            <BookOpen className="h-5 w-5" />
          </ShareTile>
          <ShareTile color="bg-foreground text-background" label="Native" onClick={handleNativeSheet}>
            <Share2 className="h-5 w-5" />
          </ShareTile>
          <ShareTile color="bg-muted text-foreground" label="Copy" onClick={handleCopy}>
            <Link2 className="h-5 w-5" />
          </ShareTile>
        </div>

        {/* External targets */}
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-1">Send via</p>
          <div className="grid grid-cols-4 gap-3">
            {intents.map((it) => (
              <ShareTile key={it.id} color={`${it.color} text-white`} label={it.label} onClick={() => handleExternal(it)}>
                {it.id === "sms" ? <MessageCircle className="h-5 w-5" /> :
                 it.id === "email" ? <Mail className="h-5 w-5" /> :
                 <BrandGlyph id={it.id} />}
              </ShareTile>
            ))}
            {target.imageUrl && (
              <ShareTile color="bg-zinc-700 text-white" label="Save" onClick={handleDownload}>
                <Download className="h-5 w-5" />
              </ShareTile>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-5 mb-1 break-all">{url}</p>
      </SheetContent>
    </Sheet>
  );
}

function ShareTile({ color, label, onClick, children }: { color: string; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
      <span className={`flex items-center justify-center w-12 h-12 rounded-full shadow-sm ${color}`}>{children}</span>
      <span className="text-[11px] font-medium text-foreground">{label}</span>
    </button>
  );
}

// Real brand glyphs as inline SVG paths — pulled from simple-icons (CC0).
// Inlining avoids a new dependency and keeps the share grid pixel-crisp.
function BrandGlyph({ id }: { id: string }) {
  switch (id) {
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.057 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      );
    case "messenger":
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
          <path d="M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.371-.16-3.46-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.13.82.74L9.4 13.04a.73.73 0 01.87 0l2.79 2.09c.84.62 2.04.4 2.6-.49l3.52-5.6c.35-.53-.32-1.13-.82-.74L14.6 10.96a.73.73 0 01-.87 0l-2.79-2.09a1.85 1.85 0 00-2.6.49z"/>
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z"/>
        </svg>
      );
    default:
      return <span className="font-bold text-[13px]">?</span>;
  }
}
