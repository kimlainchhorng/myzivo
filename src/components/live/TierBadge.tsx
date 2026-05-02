/**
 * TierBadge — small supporter-tier badge next to chat / viewer names.
 */
import { tierFor } from "@/lib/streamTier";
import { cn } from "@/lib/utils";

interface Props {
  coinsTotal: number | undefined | null;
  size?: "xs" | "sm";
  className?: string;
}

export default function TierBadge({ coinsTotal, size = "xs", className }: Props) {
  const tier = tierFor(coinsTotal);
  if (tier.level === 0) return null;
  return (
    <span
      title={`${tier.name} supporter · ${(coinsTotal ?? 0).toLocaleString()} coins`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-black leading-none border border-white/15",
        tier.bg,
        tier.text,
        size === "xs" ? "h-3.5 min-w-[14px] px-1 text-[8px]" : "h-4 min-w-[16px] px-1 text-[9px]",
        className
      )}
    >
      {tier.symbol}
    </span>
  );
}
