/**
 * Recommended Deals Section
 * Personalized deals for home pages (desktop grid / mobile scroll)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Plane, Hotel, Car, Utensils, Clock, ArrowRight, Tag, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRecommendedDeals, RecommendedDeal } from '@/hooks/useRecommendedDeals';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const serviceIcons: Record<string, typeof Plane> = {
  flights: Plane,
  hotels: Hotel,
  cars: Car,
  eats: Utensils,
  rides: Car,
};

const serviceColors: Record<string, string> = {
  flights: 'text-sky-400',
  hotels: 'text-amber-400',
  cars: 'text-violet-400',
  eats: 'text-orange-400',
  rides: 'text-emerald-400',
};

const serviceBgColors: Record<string, string> = {
  flights: 'bg-sky-500/20',
  hotels: 'bg-amber-500/20',
  cars: 'bg-violet-500/20',
  eats: 'bg-orange-500/20',
  rides: 'bg-emerald-500/20',
};

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, [expiresAt]);

  if (!timeLeft) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-amber-400">
      <Clock className="w-3 h-3" />
      {timeLeft}
    </span>
  );
}

function DealCard({ deal, compact }: { deal: RecommendedDeal; compact?: boolean }) {
  const navigate = useNavigate();
  const Icon = serviceIcons[deal.serviceType] || Tag;
  const iconColor = serviceColors[deal.serviceType] || 'text-primary';
  const iconBg = serviceBgColors[deal.serviceType] || 'bg-primary/20';

  const showCountdown = deal.expiresAt &&
    (new Date(deal.expiresAt).getTime() - Date.now()) < 48 * 3600000 &&
    (new Date(deal.expiresAt).getTime() - Date.now()) > 0;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(deal.code);
    toast({ title: 'Code copied!', description: deal.code });
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(deal.href)}
      className={cn(
        'cursor-pointer rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/5',
        compact ? 'min-w-[240px] snap-start' : ''
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header: icon + discount badge */}
        <div className="flex items-center justify-between">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon className={cn('w-4.5 h-4.5', iconColor)} />
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-bold">
            {deal.discountLabel}
          </Badge>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="text-sm font-bold text-white truncate">{deal.name}</h3>
          {deal.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{deal.description}</p>
          )}
        </div>

        {/* Countdown + code */}
        <div className="flex items-center justify-between">
          {showCountdown ? (
            <Countdown expiresAt={deal.expiresAt!} />
          ) : (
            <span className="text-xs text-zinc-500 capitalize">{deal.serviceType}</span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-xl bg-white/5"
          >
            <Copy className="w-3 h-3" />
            {deal.code}
          </button>
        </div>

        {/* CTA */}
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-between text-xs text-white/80 hover:text-white hover:bg-white/5"
          onClick={(e) => { e.stopPropagation(); navigate(deal.href); }}
        >
          View Deal
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

interface RecommendedDealsSectionProps {
  className?: string;
}

const RecommendedDealsSection = ({ className }: RecommendedDealsSectionProps) => {
  const { deals, isLoading, hasHistory, hasDeals } = useRecommendedDeals(6);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Hide entirely if no deals
  if (!isLoading && !hasDeals) return null;

  // Loading skeleton
  if (isLoading) {
    return (
      <section className={cn('py-12 px-4 md:px-8', className)}>
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-48 bg-zinc-800 rounded-xl animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-zinc-900/80 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-12 px-4 md:px-8', className)}>
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl md:text-2xl font-bold text-white">Recommended Deals</h2>
            </div>
            <p className="text-sm text-zinc-400">
              {hasHistory ? 'Based on your recent searches' : 'Trending deals for you'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white gap-1"
            onClick={() => navigate('/deals')}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Cards: grid on desktop, horizontal scroll on mobile */}
        {isMobile ? (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-hide">
            {deals.map(deal => (
              <DealCard key={deal.id} deal={deal} compact />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {deals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedDealsSection;
