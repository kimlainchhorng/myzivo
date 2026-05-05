import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * Maps routes to their lazy-loaded chunk files.
 * Prefetch happens only on user intent (hover/focus) — no eager
 * homepage auto-prefetch that competes with hero LCP bandwidth.
 */
const PREFETCH_ROUTES: Record<string, () => Promise<unknown>> = {
  "/flights": () => import("@/pages/FlightLanding"),
  "/hotels": () => import("@/pages/HotelLanding"),
  "/cars": () => import("@/pages/CarRentalLanding"),
  "/rides": () => import("@/pages/app/RideHubPage"),
  "/eats": () => import("@/pages/EatsLanding"),
  "/feed": () => import("@/pages/FeedPage"),
  // Bottom-nav targets — prefetched on touch-down so the chunk is in-memory
  // by the time the user's finger lifts and the click fires.
  "/reels": () => import("@/pages/ReelsFeedPage"),
  "/chat": () => import("@/pages/ChatHubPage"),
  "/profile": () => import("@/pages/Profile"),
  // Home "More Services" tiles — same touch-down prefetch pattern.
  "/rent-car": () => import("@/pages/CarRentalBooking"),
  "/grocery": () => import("@/pages/GroceryMarketplace"),
  "/delivery": () => import("@/pages/DeliveryPage"),
};

const prefetched = new Set<string>();

function prefetchRoute(path: string) {
  if (prefetched.has(path)) return;
  const loader = PREFETCH_ROUTES[path];
  if (!loader) return;
  prefetched.add(path);
  const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100));
  schedule(() => {
    loader().catch(() => {
      prefetched.delete(path);
    });
  });
}

/**
 * RoutePrefetcher: intent-based prefetch only.
 * - On homepage: prefetch /feed (the desktop redirect target) on idle.
 * - Provides hover/focus prefetch handler for nav links.
 */
export function useRoutePrefetch() {
  const location = useLocation();

  // Only prefetch the redirect target on homepage — not all top routes.
  useEffect(() => {
    if (location.pathname !== "/") return;
    const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 200));
    const handle = schedule(() => prefetchRoute("/feed"));
    return () => {
      if (typeof handle === "number" && window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      }
    };
  }, [location.pathname]);

  const handlePrefetch = useCallback((path: string) => {
    prefetchRoute(path);
  }, []);

  return { prefetch: handlePrefetch };
}

export default function RoutePrefetcher() {
  useRoutePrefetch();
  return null;
}
