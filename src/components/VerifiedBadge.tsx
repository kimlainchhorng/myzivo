/**
 * VerifiedBadge — Premium blue verified mark used across ZIVO.
 *
 * Design notes:
 *  - 12-point burst geometrically centered in a 24×24 viewBox
 *  - Subtle vertical gradient (lighter top → deeper bottom) for depth
 *  - Soft drop-shadow so the badge "lifts" off the surface
 *  - Inner white check is centered and balanced for the burst
 */

type Props = {
  size?: number;
  className?: string;
  title?: string;
};

const VerifiedBadge = ({ size, className = "", title = "Verified" }: Props) => {
  // unique id so multiple instances don't collide on the gradient/filter defs
  const uid = `vb-${Math.random().toString(36).slice(2, 8)}`;
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 align-middle ${className}`}
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
        {/* 12-point burst, centered at 12,12 */}
        <path
          filter={`url(#${uid}-shadow)`}
          d="M12 1.5l2.39 1.74 2.95-.13.78 2.85 2.55 1.5-1.07 2.74 1.07 2.74-2.55 1.5-.78 2.85-2.95-.13L12 22.5l-2.39-1.74-2.95.13-.78-2.85-2.55-1.5 1.07-2.74-1.07-2.74 2.55-1.5.78-2.85 2.95-.13L12 1.5z"
          fill={`url(#${uid}-grad)`}
          stroke="#ffffff"
          strokeWidth="0.4"
          strokeLinejoin="round"
        />
        {/* Centered checkmark */}
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
