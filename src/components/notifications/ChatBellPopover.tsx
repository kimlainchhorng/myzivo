/**
 * Facebook-style Notifications popover for the Chat header bell.
 * Shows All / Unread tabs, empty "You're all caught up" state,
 * and a footer link to the full notifications page.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Bell from "lucide-react/dist/esm/icons/bell";
import CheckCheck from "lucide-react/dist/esm/icons/check-check";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ChatBellPopoverProps {
  className?: string;
}

export function ChatBellPopover({ className }: ChatBellPopoverProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications(20);

  const list = useMemo(
    () => (tab === "unread" ? notifications.filter((n) => !n.is_read) : notifications),
    [notifications, tab]
  );

  // Outside click + ESC
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleClick = (n: any) => {
    if (!n.is_read) markAsRead([n.id]);
    if (n.action_url) {
      let url = n.action_url as string;
      const m = url.match(/^\/dispatch\/support\/(.+)$/);
      if (m) url = `/support/tickets/${m[1]}`;
      if (url.startsWith("/")) navigate(url);
    }
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+8px)] z-[1300] w-[340px] max-w-[calc(100vw-24px)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="px-4 pb-2 flex items-center gap-2">
              {(["all", "unread"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/70"
                  )}
                >
                  {t === "all" ? "All" : "Unread"}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                </div>
              ) : list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    You're all caught up
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New notifications will appear here.
                  </p>
                </div>
              ) : (
                <ul className="py-1">
                  {list.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => handleClick(n)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 flex gap-3 items-start hover:bg-muted/60 transition-colors",
                          !n.is_read && "bg-primary/5"
                        )}
                      >
                        <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-primary"
                             style={{ opacity: n.is_read ? 0 : 1 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground line-clamp-1">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">
                              {n.body}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
                className="w-full py-3 text-sm font-semibold text-primary hover:bg-muted/50 transition-colors"
              >
                See all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatBellPopover;
