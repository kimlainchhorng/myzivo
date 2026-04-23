/**
 * notify — Centralized branded notification helpers
 * Wraps sonner `toast.custom` with NotificationToastCard for consistent visuals
 */
import { createElement } from "react";
import { toast } from "sonner";
import {
  Bell,
  Car,
  CheckCircle2,
  Info,
  MapPin,
  MessageSquare,
  Tag,
  TriangleAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import NotificationToastCard, {
  type NotificationVariant,
} from "@/components/notifications/NotificationToastCard";

type BaseOpts = {
  title: string;
  body?: string;
  meta?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  onBodyClick?: () => void;
  duration?: number;
  avatarUrl?: string | null;
  avatarFallback?: string;
};

function show(variant: NotificationVariant, opts: BaseOpts) {
  const { duration = 5000, ...rest } = opts;
  return toast.custom(
    (t) =>
      createElement(NotificationToastCard, {
        variant,
        ...rest,
        onDismiss: () => toast.dismiss(t),
      }),
    { duration }
  );
}

export const notify = {
  info: (opts: BaseOpts) => show("info", { icon: Info, meta: "Info", ...opts }),
  success: (opts: BaseOpts) =>
    show("success", { icon: CheckCircle2, meta: "Success", ...opts }),
  warning: (opts: BaseOpts) =>
    show("warning", { icon: TriangleAlert, meta: "Heads up", ...opts }),
  error: (opts: BaseOpts) =>
    show("error", { icon: XCircle, meta: "Error", ...opts }),
  chat: (opts: BaseOpts) =>
    show("chat", { icon: MessageSquare, meta: "New message", ...opts }),
  ride: (
    event:
      | "driver_assigned"
      | "driver_en_route"
      | "driver_arrived"
      | "trip_started"
      | "trip_completed"
      | "trip_cancelled"
      | "surge_alert"
      | "promo_available",
    opts: BaseOpts
  ) => {
    const map: Record<string, { icon: LucideIcon; meta: string; variant: NotificationVariant }> = {
      driver_assigned: { icon: Car, meta: "Driver found", variant: "ride" },
      driver_en_route: { icon: Car, meta: "On the way", variant: "ride" },
      driver_arrived: { icon: MapPin, meta: "Arrived", variant: "warning" },
      trip_started: { icon: Car, meta: "Trip started", variant: "trip" },
      trip_completed: { icon: CheckCircle2, meta: "Trip complete", variant: "success" },
      trip_cancelled: { icon: XCircle, meta: "Cancelled", variant: "error" },
      surge_alert: { icon: TriangleAlert, meta: "Surge", variant: "error" },
      promo_available: { icon: Tag, meta: "Promo", variant: "promo" },
    };
    const cfg = map[event] || { icon: Bell, meta: "Update", variant: "info" as const };
    return show(cfg.variant, { icon: cfg.icon, meta: cfg.meta, ...opts });
  },
  promo: (opts: BaseOpts) =>
    show("promo", { icon: Tag, meta: "Promo", ...opts }),
};
