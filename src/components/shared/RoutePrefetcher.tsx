import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * Maps routes to their lazy-loaded chunk files.
 * When a user hovers over navigation links or lands on the homepage,
 * we prefetch the most likely next pages.
 */
const PREFETCH_ROUTES: Record<string, () => Promise<unknown>> = {
  "/flights": () => import("@/pages/FlightLanding"),
  "/hotels": () => import("@/pages/HotelLanding"),
  "/cars": () => import("@/pages/CarRentalLanding"),
  "/rides": () => import("@/pages/app/RideHubPage"),
  "/eats": () => import("@/pages/EatsLanding"),
};

const prefetched = new Set<string>();

function prefetchRoute(path: string) {
  if (prefetched.has(path)) return;
  const loader = PREFETCH_ROUTES[path];
  if (!loader) return;
  prefetched.add(path);
  // Use requestIdleCallback for non-blocking prefetch
  const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100));
  schedule(() => {
    loader().catch(() => {
      // Silently fail — prefetch is best-effort
      prefetched.delete(path);
    });
  });
}

/**
 * RoutePrefetcher: Automatically prefetches key routes
 * - On homepage: prefetch flights, hotels, cars after idle
 * - Provides onMouseEnter handler for nav links
 */
export function useRoutePrefetch() {
  const location = useLocation();

  // Auto-prefetch top routes when on homepage
  useEffect(() => {
    if (location.pathname !== "/") return;
    const timer = setTimeout(() => {
      prefetchRoute("/flights");
      prefetchRoute("/hotels");
      prefetchRoute("/cars");
    }, 2000); // Wait 2s after homepage load
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handlePrefetch = useCallback((path: string) => {
    prefetchRoute(path);
  }, []);

  return { prefetch: handlePrefetch };
}

/**
 * Drop-in component version — add to App layout
 */
export default function RoutePrefetcher() {
  useRoutePrefetch();
  return null;
}
