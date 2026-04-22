/**
 * SafeCaption — renders post captions with auto-linkified URLs that are
 * passed through the platform's url-safety heuristics. Suspicious or blocked
 * links are rendered as non-clickable text with a warning tooltip.
 */
import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, ExternalLink } from "lucide-react";
import { assessLinkSync, type LinkRiskLevel } from "@/hooks/useLinkRisk";
import { openExternalUrl } from "@/lib/openExternalUrl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SafeCaptionProps {
  text: string;
  className?: string;
}

// Match http(s) URLs and bare domains (e.g. t.me/foo, maps.app.goo.gl/abc)
const URL_REGEX = /\b((?:https?:\/\/|www\.)[^\s<>"]+|(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>"]*)/gi;

interface Segment {
  type: "text" | "link";
  value: string;
  href?: string;
  risk?: LinkRiskLevel;
  warnings?: string[];
}

function tokenize(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIdx = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const idx = match.index ?? 0;
    if (idx > lastIdx) {
      segments.push({ type: "text", value: text.slice(lastIdx, idx) });
    }
    const raw = match[0];
    // Strip trailing punctuation that's likely not part of the URL
    const cleaned = raw.replace(/[.,;:!?)"']+$/g, "");
    const trail = raw.slice(cleaned.length);
    const href = cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    const assessment = assessLinkSync(href);
    segments.push({
      type: "link",
      value: cleaned,
      href,
      risk: assessment.level,
      warnings: assessment.warnings,
    });
    if (trail) segments.push({ type: "text", value: trail });
    lastIdx = idx + raw.length;
  }
  if (lastIdx < text.length) {
    segments.push({ type: "text", value: text.slice(lastIdx) });
  }
  return segments;
}

const LINK_STYLES: Record<LinkRiskLevel, string> = {
  trusted: "text-primary underline decoration-primary/40 hover:decoration-primary",
  neutral: "text-primary underline decoration-primary/30 hover:decoration-primary",
  suspicious: "text-amber-600 dark:text-amber-400 underline decoration-dotted decoration-amber-500",
  blocked: "text-destructive line-through decoration-destructive/60 cursor-not-allowed",
};

export default function SafeCaption({ text, className }: SafeCaptionProps) {
  const segments = useMemo(() => tokenize(text), [text]);
  const [pendingLink, setPendingLink] = useState<Segment | null>(null);

  const handleLinkClick = (e: React.MouseEvent, seg: Segment) => {
    e.stopPropagation();
    e.preventDefault();
    if (seg.risk === "blocked") return;
    if (seg.risk === "suspicious" || seg.risk === "neutral") {
      setPendingLink(seg);
      return;
    }
    if (seg.href) openExternalUrl(seg.href);
  };

  const proceed = () => {
    if (pendingLink?.href) openExternalUrl(pendingLink.href);
    setPendingLink(null);
  };

  return (
    <>
      <span className={cn("whitespace-pre-wrap break-words", className)}>
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.value}</span>;
          const risk = seg.risk ?? "neutral";
          return (
            <a
              key={i}
              href={seg.href}
              onClick={(e) => handleLinkClick(e, seg)}
              title={seg.warnings?.length ? seg.warnings.join(" · ") : seg.href}
              className={cn(
                "inline-flex items-center gap-0.5 break-all",
                LINK_STYLES[risk]
              )}
              aria-disabled={risk === "blocked"}
            >
              {risk === "blocked" && <ShieldAlert className="w-3 h-3 shrink-0" aria-hidden />}
              {risk === "suspicious" && <ShieldAlert className="w-3 h-3 shrink-0" aria-hidden />}
              {seg.value}
            </a>
          );
        })}
      </span>

      <Dialog open={!!pendingLink} onOpenChange={(o) => !o && setPendingLink(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {pendingLink?.risk === "suspicious" ? (
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-primary" />
              )}
              {pendingLink?.risk === "suspicious" ? "Caution: external link" : "Leaving ZIVO"}
            </DialogTitle>
            <DialogDescription className="text-xs break-all pt-1">
              {pendingLink?.href}
            </DialogDescription>
          </DialogHeader>
          {pendingLink?.warnings?.length ? (
            <ul className="text-[11px] text-amber-600 dark:text-amber-400 space-y-0.5 list-disc pl-4">
              {pendingLink.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              This link goes to a third-party site outside ZIVO. Verify the URL before continuing.
            </p>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => setPendingLink(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={proceed} className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
