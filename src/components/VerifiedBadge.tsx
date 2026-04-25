import { useId, type ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VERIFIED_LABEL, VERIFIED_TOOLTIP } from "@/lib/verification";

/**
 * VerifiedBadge — premium blue verified mark used across ZIVO.
 *
 * - Defaults to 1em sizing so it scales with surrounding text.
 * - Accessible: `role="img"` + `aria-label="Verified account"` + tooltip.
 * - Set `interactive={false}` when the badge sits inside another button
 *   or focusable surface (no nested interactives, no hover tooltip).
 */

type Props = {
  size?: number;
  className?: string;
  /** Tooltip + aria-label override (e.g. "Verified business"). */
  tooltipText?: string;
  /** Render with a hover tooltip + focus target. Default true. */
  interactive?: boolean;
};

const VerifiedBadge = ({
  size,
  className = "",
  tooltipText = VERIFIED_TOOLTIP,
  interactive = true,
}: Props): ReactElement => {
  const reactId = useId().replace(/[:]/g, "");
  const uid = `vb-${reactId}`;
  const sizeStyle = size
    ? { width: size, height: size }
    : { width: "1em", height: "1em" };

  const svg = (
    <span
      role="img"
      aria-label={VERIFIED_LABEL}
      title={tooltipText}
      data-testid="verified-badge"
      className={`relative inline-flex items-center justify-center shrink-0 align-[-0.125em] ${className}`}
      style={sizeStyle}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full block" aria-hidden="true" focusable="false">
        <title>{VERIFIED_LABEL}</title>
        {/* Facebook-style flat blue starburst */}
        <path
          d="M12 1.5l2.39 1.74 2.95-.13.78 2.85 2.55 1.5-1.07 2.74 1.07 2.74-2.55 1.5-.78 2.85-2.95-.13L12 22.5l-2.39-1.74-2.95.13-.78-2.85-2.55-1.5 1.07-2.74-1.07-2.74 2.55-1.5.78-2.85 2.95-.13L12 1.5z"
          fill="#1877F2"
        />
        <path
          d="M7.8 12.2l2.9 2.9 5.5-5.9"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  if (!interactive) return svg;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{svg}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="text-xs">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};

export default VerifiedBadge;
