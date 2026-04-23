/**
 * NotificationToastCard — Premium branded toast card
 * Used for chat, ride, promo, and generic notifications via `notify.*` helpers
 */
import { type LucideIcon, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type NotificationVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "ride"
  | "chat"
  | "promo"
  | "trip";

type VariantStyle = {
  ring: string;
  iconBg: string;
  iconText: string;
  dot: string;
  meta: string;
  button: string;
};

const variantStyles: Record<NotificationVariant, VariantStyle> = {
  info: {
    ring: "ring-sky-500/15",
    iconBg: "bg-sky-500/10",
    iconText: "text-sky-500",
    dot: "bg-sky-500",
    meta: "text-sky-500/80",
    button: "bg-sky-500 text-white shadow-sky-500/25",
  },
  success: {
    ring: "ring-emerald-500/15",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-500",
    dot: "bg-emerald-500",
    meta: "text-emerald-500/80",
    button: "bg-emerald-500 text-white shadow-emerald-500/25",
  },
  warning: {
    ring: "ring-amber-500/15",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-500",
    dot: "bg-amber-500",
    meta: "text-amber-500/80",
    button: "bg-amber-500 text-white shadow-amber-500/25",
  },
  error: {
    ring: "ring-red-500/15",
    iconBg: "bg-red-500/10",
    iconText: "text-red-500",
    dot: "bg-red-500",
    meta: "text-red-500/80",
    button: "bg-red-500 text-white shadow-red-500/25",
  },
  ride: {
    ring: "ring-emerald-500/15",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-500",
    dot: "bg-emerald-500",
    meta: "text-emerald-500/80",
    button: "bg-emerald-500 text-white shadow-emerald-500/25",
  },
  chat: {
    ring: "ring-primary/15",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    dot: "bg-primary",
    meta: "text-primary/80",
    button: "bg-primary text-primary-foreground shadow-primary/25",
  },
  promo: {
    ring: "ring-purple-500/15",
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-500",
    dot: "bg-purple-500",
    meta: "text-purple-500/80",
    button: "bg-purple-500 text-white shadow-purple-500/25",
  },
  trip: {
    ring: "ring-emerald-500/15",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-500",
    dot: "bg-emerald-500",
    meta: "text-emerald-500/80",
    button: "bg-emerald-500 text-white shadow-emerald-500/25",
  },
};

export type NotificationToastCardProps = {
  title: string;
  body?: string;
  meta?: string;
  variant?: NotificationVariant;
  icon?: LucideIcon;
  avatarUrl?: string | null;
  avatarFallback?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  onBodyClick?: () => void;
};

export default function NotificationToastCard({
  title,
  body,
  meta,
  variant = "info",
  icon: Icon,
  avatarUrl,
  avatarFallback,
  actionLabel,
  onAction,
  onDismiss,
  onBodyClick,
}: NotificationToastCardProps) {
  const v = variantStyles[variant];
  const initials = (avatarFallback || title || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const showAvatar = avatarUrl !== undefined || (!Icon && variant === "chat");

  return (
    <div
      className={cn(
        "group/toast w-[min(92vw,430px)] rounded-[26px] border border-border/40 bg-background/95 p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-2xl ring-1 animate-in slide-in-from-top-4 fade-in duration-300",
        v.ring
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Left: Avatar or Icon pill */}
        <div className="relative shrink-0 pt-0.5">
          {showAvatar ? (
            <>
              <Avatar className={cn("h-12 w-12 ring-2 shadow-md", v.ring.replace("ring-", "ring-"))}>
                <AvatarImage src={avatarUrl || undefined} alt={title} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background", v.dot)} />
            </>
          ) : (
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1", v.iconBg, v.ring)}>
              {Icon ? <Icon className={cn("h-6 w-6", v.iconText)} strokeWidth={2.2} /> : <span className={cn("h-3 w-3 rounded-full", v.dot)} />}
            </div>
          )}
        </div>

        {/* Middle: Text + action */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={onBodyClick}
              className="min-w-0 flex-1 text-left"
              disabled={!onBodyClick}
            >
              <p className="truncate text-[15px] font-semibold leading-5 text-foreground">
                {title}
              </p>
              {meta && (
                <p className={cn("mt-1 text-[11px] font-medium uppercase tracking-[0.14em]", v.meta)}>
                  {meta}
                </p>
              )}
            </button>

            <div className="flex shrink-0 items-center gap-1.5">
              {actionLabel && onAction && (
                <button
                  onClick={() => {
                    onDismiss?.();
                    onAction();
                  }}
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-[12px] font-semibold shadow-md transition-all active:scale-95",
                    v.button
                  )}
                >
                  {actionLabel}
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  aria-label="Dismiss"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {body && (
            <p
              onClick={onBodyClick}
              className={cn(
                "mt-2 max-h-10 overflow-hidden break-words text-[13px] leading-5 text-muted-foreground",
                onBodyClick && "cursor-pointer"
              )}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {body}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
