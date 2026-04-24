import { useId } from "react";

/**
 * VerifiedBadge — Premium blue verified mark used across ZIVO.
 *
 * Defaults to 1em sizing so it scales with surrounding text when no
 * explicit `size` / `className` is passed:
 *   <span>Name <VerifiedBadge /></span>
 */

type Props = {
  size?: number;
  className?: string;
  title?: string;
};

const VerifiedBadge = ({ size, className = "", title = "Verified" }: Props) => {
  const reactId = useId().replace(/[:]/g, "");
  const uid = `vb-${reactId}`;
  const sizeStyle = size
    ? { width: size, height: size }
    : { width: "1em", height: "1em" };

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 align-[-0.125em] ${className}`}
      style={sizeStyle}
      aria-label={title}
      title={title}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full block" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3BB0FF" />
            <stop offset="100%" stopColor="#1d9bf0" />
          </linearGradient>
          <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.6" floodColor="#1d9bf0" floodOpacity="0.35" />
          </filter>
        </defs>
        <path
          filter={`url(#${uid}-shadow)`}
          d="M12 1.5l2.39 1.74 2.95-.13.78 2.85 2.55 1.5-1.07 2.74 1.07 2.74-2.55 1.5-.78 2.85-2.95-.13L12 22.5l-2.39-1.74-2.95.13-.78-2.85-2.55-1.5 1.07-2.74-1.07-2.74 2.55-1.5.78-2.85 2.95-.13L12 1.5z"
          fill={`url(#${uid}-grad)`}
          stroke="#ffffff"
          strokeWidth="0.4"
          strokeLinejoin="round"
        />
        <path
          d="M8.2 12.3l2.6 2.6 5-5.4"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};

export default VerifiedBadge;
