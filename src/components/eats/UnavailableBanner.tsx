/**
 * Unavailable Restaurant Banner
 * Non-dismissible banner for temporarily unavailable restaurants
 */
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnavailableBannerProps {
  message?: string | null;
  className?: string;
}

export function UnavailableBanner({ message, className }: UnavailableBannerProps) {
  return (
    <div
      className={cn(
        "bg-red-500/10 border border-red-500/30 rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="font-bold text-red-400">
            This restaurant is temporarily unavailable
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            You can browse the menu, but ordering is paused.
          </p>
          {message && (
            <p className="text-sm text-zinc-500 mt-2 italic">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
