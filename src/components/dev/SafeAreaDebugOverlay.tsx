/**
 * SafeAreaDebugOverlay
 *
 * Visual debugging aid for safe-area insets.
 * Toggle via:
 *   - Account → Developer → "Show safe-area overlay" switch
 *   - Keyboard: Ctrl+Shift+S (or Cmd+Shift+S on macOS)
 *   - localStorage key: zivo:debug:safe-area = "1"
 *
 * See: docs/dev/capacitor-safe-area.md
 */
import { useEffect, useState } from "react";

const STORAGE_KEY = "zivo:debug:safe-area";

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function readInset(side: "top" | "bottom" | "left" | "right"): number {
  if (typeof window === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.height = `env(safe-area-inset-${side}, 0px)`;
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return Math.round(px);
}

export const SafeAreaDebugOverlay = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [vp, setVp] = useState({ w: 0, h: 0, dpr: 1 });

  // Hydrate from storage after mount (avoid SSR issues)
  useEffect(() => {
    setEnabled(readEnabled());
  }, []);

  // Keyboard shortcut + storage sync across tabs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const next = !readEnabled();
        try {
          localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
        } catch {
          /* ignore */
        }
        setEnabled(next);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEnabled(e.newValue === "1");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Measure insets + viewport while enabled
  useEffect(() => {
    if (!enabled) return;
    const measure = () => {
      setInsets({
        top: readInset("top"),
        bottom: readInset("bottom"),
        left: readInset("left"),
        right: readInset("right"),
      });
      setVp({
        w: window.innerWidth,
        h: window.innerHeight,
        dpr: window.devicePixelRatio || 1,
      });
    };
    measure();
    const id = window.setInterval(measure, 500);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[2147483647]"
      style={{ contain: "strict" }}
    >
      {/* Top band */}
      <div
        className="absolute inset-x-0 top-0 bg-red-500/40 border-b border-red-600"
        style={{ height: `max(${insets.top}px, 2px)` }}
      />
      {/* Bottom band */}
      <div
        className="absolute inset-x-0 bottom-0 bg-blue-500/40 border-t border-blue-600"
        style={{ height: `max(${insets.bottom}px, 2px)` }}
      />
      {/* Left band */}
      <div
        className="absolute inset-y-0 left-0 bg-green-500/30 border-r border-green-600"
        style={{ width: `max(${insets.left}px, 2px)` }}
      />
      {/* Right band */}
      <div
        className="absolute inset-y-0 right-0 bg-green-500/30 border-l border-green-600"
        style={{ width: `max(${insets.right}px, 2px)` }}
      />

      {/* HUD */}
      <div
        className="pointer-events-auto absolute left-1/2 -translate-x-1/2 rounded-lg bg-black/85 px-3 py-2 text-[11px] leading-tight text-white shadow-lg font-mono"
        style={{ top: `calc(${insets.top}px + 8px)` }}
      >
        <div className="font-semibold mb-1">SAFE AREA</div>
        <div>top: {insets.top}px · bottom: {insets.bottom}px</div>
        <div>left: {insets.left}px · right: {insets.right}px</div>
        <div className="mt-1 opacity-70">
          {vp.w}×{vp.h} @{vp.dpr}x
        </div>
        <button
          type="button"
          className="mt-1.5 w-full rounded bg-white/15 px-2 py-1 text-[10px] hover:bg-white/25"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, "0");
            } catch {
              /* ignore */
            }
            setEnabled(false);
          }}
        >
          Hide (Ctrl+Shift+S)
        </button>
      </div>
    </div>
  );
};

export default SafeAreaDebugOverlay;
