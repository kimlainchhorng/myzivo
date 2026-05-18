/**
 * CreateSheet — Facebook-style "Create" slide-in drawer.
 *
 * Opens from the left, dimming the rest of the screen. Two sections:
 *  - Create: a 2-column grid of primary creation actions (Post, Story, Reel,
 *    Live, Event, Group, Business, Marketplace, Job, Spaces).
 *  - Shortcuts: a vertical list of fast destinations (Saved, Notifications,
 *    Messages, Trending, History, Settings).
 *
 * Every item routes to an existing path in App.tsx. Items requiring auth
 * gracefully redirect to /auth?next=… for logged-out users.
 */
import { useNavigate } from "react-router-dom";
import type { ComponentType } from "react";
import {
  Building2, Users, Calendar, Film, Camera, Radio, ShoppingBag,
  Briefcase, Mic2, Plus,
  Bookmark, Bell, MessageSquare, TrendingUp, Clock, Settings,
  ChevronRight, X as XIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type CreateItem = {
  id: string;
  label: string;
  sublabel: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  bgClass: string;
  path: string;
  requiresAuth?: boolean;
};

type ShortcutItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
  requiresAuth?: boolean;
};

const CREATE_ITEMS: CreateItem[] = [
  { id: "business", label: "Business", sublabel: "Page for your shop",
    icon: Building2, iconClass: "text-emerald-600", bgClass: "bg-emerald-500/10",
    path: "/shop-dashboard", requiresAuth: true },
  { id: "group", label: "Group", sublabel: "Build a community",
    icon: Users, iconClass: "text-blue-500", bgClass: "bg-blue-500/10",
    path: "/communities?new=1", requiresAuth: true },
  { id: "event", label: "Event", sublabel: "Bring people together",
    icon: Calendar, iconClass: "text-orange-500", bgClass: "bg-orange-500/10",
    path: "/events-hub/create", requiresAuth: true },
  { id: "reel", label: "Reel", sublabel: "Short video",
    icon: Film, iconClass: "text-pink-500", bgClass: "bg-pink-500/10",
    path: "/feed?compose=reel", requiresAuth: true },
  { id: "story", label: "Story", sublabel: "Share for 24h",
    icon: Camera, iconClass: "text-rose-500", bgClass: "bg-rose-500/10",
    path: "/feed?compose=story", requiresAuth: true },
  { id: "live", label: "Live", sublabel: "Go live now",
    icon: Radio, iconClass: "text-red-500", bgClass: "bg-red-500/10",
    path: "/feed?compose=live", requiresAuth: true },
  { id: "marketplace", label: "Marketplace", sublabel: "Sell items",
    icon: ShoppingBag, iconClass: "text-orange-600", bgClass: "bg-orange-500/10",
    path: "/feed?compose=shop", requiresAuth: true },
  { id: "job", label: "Job", sublabel: "Post a hiring",
    icon: Briefcase, iconClass: "text-sky-500", bgClass: "bg-sky-500/10",
    path: "/jobs-hub/create", requiresAuth: true },
  { id: "spaces", label: "Spaces", sublabel: "Audio room",
    icon: Mic2, iconClass: "text-purple-500", bgClass: "bg-purple-500/10",
    path: "/voice-rooms/create", requiresAuth: true },
  { id: "post", label: "Post", sublabel: "Photo, text, poll",
    icon: Plus, iconClass: "text-foreground", bgClass: "bg-muted",
    path: "/feed?compose=post", requiresAuth: true },
];

const SHORTCUT_ITEMS: ShortcutItem[] = [
  { id: "saved", label: "Saved", icon: Bookmark, path: "/saved", requiresAuth: true },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications", requiresAuth: true },
  { id: "messages", label: "Messages", icon: MessageSquare, path: "/chat", requiresAuth: true },
  { id: "trending", label: "Trending", icon: TrendingUp, path: "/trending" },
  { id: "history", label: "History", icon: Clock, path: "/history", requiresAuth: true },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings", requiresAuth: true },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where to direct logged-out users — defaults to /auth with a return path. */
  authRedirectPath?: string;
}

export default function CreateSheet({ open, onOpenChange, authRedirectPath }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const go = (path: string, requiresAuth?: boolean) => {
    onOpenChange(false);
    if (requiresAuth && !user) {
      const redirect = encodeURIComponent(authRedirectPath || path);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88%] max-w-[420px] p-0 flex flex-col gap-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-safe pb-3" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 16px)" }}>
          <div>
            <SheetTitle className="text-2xl font-extrabold tracking-tight">Create</SheetTitle>
            <SheetDescription className="sr-only">
              Choose what to create in ZIVO, including posts, reels, stories, live streams, events, listings, jobs, and voice rooms.
            </SheetDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => go("/explore")}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground active:opacity-70 transition-colors"
            >
              See all
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/70 hover:bg-muted active:scale-95 transition-all"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto pb-[max(env(safe-area-inset-bottom),16px)]">
          {/* Create grid */}
          <div className="mx-3 mb-4 rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-y divide-border/40">
              {CREATE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Create ${item.label}`}
                    onClick={() => go(item.path, item.requiresAuth)}
                    className="flex items-center gap-3 px-3 py-3 text-left active:bg-muted/40 transition-colors"
                  >
                    <span
                      className={cn(
                        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        item.bgClass,
                      )}
                    >
                      <Icon className={cn("h-5 w-5", item.iconClass)} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-bold leading-tight">{item.label}</span>
                      <span className="block truncate text-[12px] text-muted-foreground leading-tight mt-0.5">
                        {item.sublabel}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shortcuts list */}
          <div className="mx-3 mb-4 rounded-2xl border border-border/50 bg-card/60">
            <p className="px-4 pt-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              Shortcuts
            </p>
            <div className="divide-y divide-border/40">
              {SHORTCUT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.path, item.requiresAuth)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted/40 transition-colors"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-foreground/80" />
                    <span className="flex-1 text-[15px] font-medium">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>

          {!user && (
            <div className="mx-3 mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
              <p className="text-[13px] font-semibold">Sign in to create</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                You need an account to post, go live, and use shortcuts.
              </p>
              <button
                type="button"
                onClick={() => go(`/login?redirect=${encodeURIComponent(authRedirectPath || "/feed")}`, false)}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground active:opacity-80"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
