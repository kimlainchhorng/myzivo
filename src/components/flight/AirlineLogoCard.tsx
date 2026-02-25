/**
 * Airline Logo Card Component
 * Premium card design with category-based styling
 */

import { memo } from 'react';
import { Crown, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AirlineLogo } from './AirlineLogo';
import type { Airline } from '@/data/airlines';

interface AirlineLogoCardProps {
  airline: Airline;
  size?: 'sm' | 'md' | 'lg';
  showAlliance?: boolean;
  showCategory?: boolean;
  interactive?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { card: 'p-2 gap-1.5', logo: 32, text: 'text-xs', badge: 'text-[9px] px-1.5 py-0.5' },
  md: { card: 'p-3 gap-2', logo: 40, text: 'text-sm', badge: 'text-[10px] px-2 py-0.5' },
  lg: { card: 'p-4 gap-3', logo: 48, text: 'text-base', badge: 'text-xs px-2 py-1' },
};

const categoryStyles = {
  premium: {
    border: 'border-amber-500/30 hover:border-amber-500/50',
    glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: Crown,
  },
  'full-service': {
    border: 'border-sky-500/30 hover:border-sky-500/50',
    glow: 'hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    icon: Sparkles,
  },
  'low-cost': {
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: Zap,
  },
};

const categoryLabels = {
  premium: '5-Star',
  'full-service': 'Full Service',
  'low-cost': 'Value',
};

function AirlineLogoCardComponent({
  airline,
  size = 'md',
  showAlliance = true,
  showCategory = false,
  interactive = true,
  className,
}: AirlineLogoCardProps) {
  const config = sizeConfig[size];
  const styles = categoryStyles[airline.category];
  const CategoryIcon = styles.icon;

  return (
    <div
      className={cn(
        'group relative flex flex-col items-center rounded-xl bg-card border',
        'transition-all duration-200',
        config.card,
        styles.border,
        interactive && [
          'cursor-pointer',
          styles.glow,
          'hover:-translate-y-0.5',
        ],
        className
      )}
    >
      {/* Premium Badge */}
      {airline.category === 'premium' && (
        <div className="absolute -top-1.5 -right-1.5 z-10">
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500 drop-shadow-sm" />
        </div>
      )}

      {/* Logo Container */}
      <div className={cn(
        'relative flex items-center justify-center rounded-xl overflow-hidden',
        'bg-gradient-to-br from-muted/50 to-muted/30',
        airline.category === 'premium' && 'ring-1 ring-amber-500/20'
      )}>
        <AirlineLogo
          iataCode={airline.code}
          airlineName={airline.name}
          size={config.logo}
          showFallbackIcon={true}
        />
      </div>

      {/* Airline Name */}
      <span className={cn(
        'font-medium text-center leading-tight truncate max-w-full',
        config.text,
        'group-hover:text-primary transition-colors'
      )}>
        {airline.name}
      </span>

      {/* Alliance Badge */}
      {showAlliance && airline.alliance && airline.alliance !== 'Independent' && (
        <span className={cn(
          'rounded-full font-medium',
          config.badge,
          'bg-muted text-muted-foreground'
        )}>
          {airline.alliance}
        </span>
      )}

      {/* Category Badge */}
      {showCategory && (
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium',
          config.badge,
          styles.badge
        )}>
          <CategoryIcon className="w-3 h-3" />
          {categoryLabels[airline.category]}
        </span>
      )}
    </div>
  );
}

export const AirlineLogoCard = memo(AirlineLogoCardComponent);
export default AirlineLogoCard;
