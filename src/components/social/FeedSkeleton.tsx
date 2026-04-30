/**
 * FeedSkeleton — content placeholder shown while the feed query is loading.
 * Matches the vertical-scroll reel layout so the page doesn't jump on load.
 */
export default function FeedSkeleton() {
  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* One full-screen card placeholder with shimmer */}
      <div className="relative w-full h-full">
        {/* Top bar (search + actions) */}
        <div className="absolute left-4 right-4 top-12 flex items-center justify-between">
          <div className="h-8 w-24 rounded-full bg-white/10 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* Center placeholder image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-white/5 via-white/10 to-white/5 animate-pulse" />
        </div>

        {/* Right action rail */}
        <div className="absolute right-3 bottom-32 flex flex-col gap-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-full bg-white/15 animate-pulse" />
              <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Bottom caption + author */}
        <div className="absolute left-4 right-20 bottom-24 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-white/15 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-white/15 animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-2/3 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
