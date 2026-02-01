/**
 * Performance Monitoring Utilities
 * Track Core Web Vitals and image loading performance
 */

export interface WebVitalsMetric {
  name: "LCP" | "CLS" | "INP" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
}

type MetricCallback = (metric: WebVitalsMetric) => void;

const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(
  name: WebVitalsMetric["name"],
  value: number
): WebVitalsMetric["rating"] {
  const threshold = thresholds[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Observe Largest Contentful Paint (LCP)
 * Target: < 2.5s
 */
export function observeLCP(callback: MetricCallback): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { 
        startTime: number;
        renderTime?: number;
        loadTime?: number;
      };
      
      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
        callback({
          name: "LCP",
          value,
          rating: getRating("LCP", value),
          delta: value,
        });
      }
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Observe Cumulative Layout Shift (CLS)
 * Target: < 0.1
 */
export function observeCLS(callback: MetricCallback): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  let clsValue = 0;
  let clsEntries: PerformanceEntry[] = [];

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { 
        value: number;
        hadRecentInput: boolean;
      })[]) {
        // Only count if no recent input
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }

      callback({
        name: "CLS",
        value: clsValue,
        rating: getRating("CLS", clsValue),
        delta: clsValue,
      });
    });

    observer.observe({ type: "layout-shift", buffered: true });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Observe First Contentful Paint (FCP)
 * Target: < 1.8s
 */
export function observeFCP(callback: MetricCallback): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((e) => e.name === "first-contentful-paint");
      
      if (fcpEntry) {
        const value = fcpEntry.startTime;
        callback({
          name: "FCP",
          value,
          rating: getRating("FCP", value),
          delta: value,
        });
        observer.disconnect();
      }
    });

    observer.observe({ type: "paint", buffered: true });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Track image load timing
 */
export function trackImageLoad(
  imageName: string,
  startTime: number
): { duration: number; isSlowLoad: boolean } {
  const duration = performance.now() - startTime;
  const isSlowLoad = duration > 1000; // Over 1 second is slow

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Perf] Image "${imageName}" loaded in ${duration.toFixed(0)}ms ${
        isSlowLoad ? "⚠️ SLOW" : "✓"
      }`
    );
  }

  return { duration, isSlowLoad };
}

/**
 * Log Core Web Vitals in development
 */
export function initPerformanceMonitoring(): void {
  if (process.env.NODE_ENV !== "development") return;

  observeLCP((metric) => {
    console.log(`[CWV] LCP: ${metric.value.toFixed(0)}ms (${metric.rating})`);
  });

  observeCLS((metric) => {
    console.log(`[CWV] CLS: ${metric.value.toFixed(3)} (${metric.rating})`);
  });

  observeFCP((metric) => {
    console.log(`[CWV] FCP: ${metric.value.toFixed(0)}ms (${metric.rating})`);
  });
}

/**
 * Check if the browser supports WebP
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  const webpData = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = webpData;
  });
}
