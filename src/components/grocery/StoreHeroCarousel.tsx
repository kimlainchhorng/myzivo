/**
 * StoreHeroCarousel — Premium auto-scrolling hero gallery for store profiles
 * Features: Embla autoplay, Ken-Burns zoom, gradient overlay, photo counter,
 * progress bar, and tactile dot indicators.
 */
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreHeroCarouselProps {
  images: string[];
  storeName: string;
  positions?: Record<string, number>;
}

const AUTOPLAY_MS = 4500;

export default function StoreHeroCarousel({ images, storeName, positions }: StoreHeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: false, duration: 28 },
    [Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setProgress(0);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Progress bar animation
  useEffect(() => {
    if (!emblaApi || images.length <= 1) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / AUTOPLAY_MS) * 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [selectedIndex, emblaApi, images.length]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 group">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 h-full relative overflow-hidden">
              <img
                src={src}
                alt={`${storeName} photo ${i + 1}`}
                className={cn(
                  "w-full h-full object-cover transition-transform ease-out will-change-transform",
                  i === selectedIndex ? "scale-110" : "scale-100"
                )}
                // Inline transition-duration avoids the `duration-[6000ms]` Tailwind
                // ambiguity (the bracket form is parsed as a content-utility otherwise).
                style={{
                  objectPosition: `center ${positions?.[src] ?? 50}%`,
                  transitionDuration: "6000ms",
                }}
                loading={i === 0 ? "eager" : "lazy"}
              />
              {/* Cinematic gradient overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Photo counter pill — top-right */}
      <div className="absolute top-3 right-3 z-[3] inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold shadow-lg">
        <ImageIcon className="h-3 w-3" />
        <span className="tabular-nums">{selectedIndex + 1}/{images.length}</span>
      </div>

      {/* Store name caption — bottom-left, premium editorial style */}
      <div className="absolute bottom-4 left-4 right-24 z-[3] pointer-events-none">
        <div className="inline-flex items-center gap-1.5 mb-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-emerald-300 text-[9px] font-black uppercase tracking-[0.18em] drop-shadow">Live Gallery</span>
        </div>
        <p className="text-white text-[15px] font-black drop-shadow-2xl truncate leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
          {storeName}
        </p>
        <p className="text-white/75 text-[10px] font-semibold tracking-wide mt-0.5 truncate">
          Swipe to explore · {images.length} photos
        </p>
      </div>

      {/* Side arrows — desktop hover only */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous photo"
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-[3] h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/65"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next photo"
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-[3] h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/65"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dot indicators — bottom-right */}
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 z-[3] flex items-center gap-1">
          {images.slice(0, Math.min(images.length, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === selectedIndex
                  ? "w-6 bg-white shadow-md"
                  : "w-1.5 bg-white/45 hover:bg-white/70"
              )}
            />
          ))}
          {images.length > 8 && (
            <span className="ml-1 text-white/70 text-[9px] font-bold tabular-nums">+{images.length - 8}</span>
          )}
        </div>
      )}

      {/* Top progress bar */}
      {images.length > 1 && (
        <div className="absolute top-0 inset-x-0 z-[3] h-0.5 bg-white/15">
          <div
            className="h-full bg-white/85 transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
