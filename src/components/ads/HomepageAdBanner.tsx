import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomepageAdBannerProps {
  headline: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  className?: string;
}

const HomepageAdBanner = ({
  headline,
  description,
  ctaText,
  ctaHref,
  className,
}: HomepageAdBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-sky-500 p-6 text-primary-foreground",
        className
      )}
    >
      {/* Sponsored label */}
      <span className="absolute top-2 left-3 text-[9px] uppercase tracking-widest font-semibold opacity-70">
        Sponsored
      </span>

      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold">{headline}</h3>
          <p className="text-sm opacity-85 mt-1">{description}</p>
        </div>
        <Button
          asChild
          variant="secondary"
          className="shrink-0 rounded-xl font-semibold"
        >
          <a href={ctaHref} target="_blank" rel="noopener noreferrer">
            {ctaText}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default HomepageAdBanner;
