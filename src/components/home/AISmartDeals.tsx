/**
 * AI Smart Deals — AI-curated flight deals with smart descriptions
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Plane, Calendar, Zap, TrendingDown,
  Palmtree, Building2, Mountain, Landmark, Music, Users,
  ChevronRight, Lightbulb
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAISmartDeals, type SmartDeal } from "@/hooks/useAISmartDeals";
import { destinationPhotos } from "@/config/photos";

const categoryIcons: Record<string, typeof Palmtree> = {
  beach: Palmtree,
  city: Building2,
  adventure: Mountain,
  culture: Landmark,
  nightlife: Music,
  family: Users,
};

const categoryLabels: Record<string, string> = {
  all: "All Deals",
  beach: "Beach",
  city: "City",
  adventure: "Adventure",
  culture: "Culture",
  nightlife: "Nightlife",
  family: "Family",
};

const AISmartDeals = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { data: deals = [], isLoading } = useAISmartDeals(
    activeCategory === "all" ? undefined : activeCategory
  );

  const categories = Object.entries(categoryLabels);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          AI Smart Deals
          <Badge className="text-[9px] font-bold bg-gradient-to-r from-primary/15 to-purple-500/15 text-primary border-0 px-1.5 py-0">
            <Sparkles className="w-2 h-2 mr-0.5" /> AI
          </Badge>
        </h2>
        <button
          onClick={() => navigate("/flights")}
          className="text-xs text-primary font-bold touch-manipulation active:scale-95 min-w-[44px] min-h-[32px] flex items-center gap-0.5 hover:gap-1.5 transition-all"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        {categories.map(([key, label]) => {
          const Icon = categoryIcons[key] || Sparkles;
          const isActive = activeCategory === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/50"
              )}
            >
              <Icon className="w-3 h-3" />
              {label}
            </motion.button>
          );
        })}
      </div>

      {/* Deals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[100px] rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : deals.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-3">
            {deals.slice(0, 6).map((deal, i) => (
              <SmartDealCard key={deal.id} deal={deal} index={i} />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">AI is searching for the best deals...</p>
        </div>
      )}
    </div>
  );
};

const SmartDealCard = ({ deal, index }: { deal: SmartDeal; index: number }) => {
  const navigate = useNavigate();
  const destPhoto = destinationPhotos[deal.destinationKey as keyof typeof destinationPhotos];
  const formattedDate = new Date(deal.departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
  const CategoryIcon = categoryIcons[deal.category] || Plane;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/flights?from=${deal.originCode}&to=${deal.destinationCode}&date=${deal.departureDate}`)}
      className="w-full flex rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm hover:shadow-lg transition-all duration-300 touch-manipulation text-left group"
    >
      {/* Image */}
      <div className="relative w-[110px] h-[110px] shrink-0 overflow-hidden">
        <img
          src={destPhoto?.src || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300`}
          alt={deal.destination}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        {/* Savings badge */}
        {deal.savingsPercent > 5 && (
          <div className="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 shadow-sm">
            <span className="text-[8px] font-bold text-white flex items-center gap-0.5">
              <TrendingDown className="w-2 h-2" /> {deal.savingsPercent}% OFF
            </span>
          </div>
        )}
        {/* Category icon */}
        <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <CategoryIcon className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-foreground truncate">{deal.destination}</div>
            <Badge
              variant="outline"
              className={cn(
                "text-[8px] font-bold shrink-0 border-0 px-1.5",
                deal.dealScore >= 80
                  ? "bg-emerald-500/15 text-emerald-600"
                  : deal.dealScore >= 60
                  ? "bg-amber-500/15 text-amber-600"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              <Zap className="w-2 h-2 mr-0.5" /> {deal.dealTag}
            </Badge>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {deal.originCode} → {deal.destinationCode} · {deal.stops === 0 ? "Nonstop" : `${deal.stops} stop`} · {deal.duration}
          </div>
          {/* AI Description */}
          <div className="text-[10px] text-primary/80 mt-1 flex items-start gap-1 truncate">
            <Sparkles className="w-2.5 h-2.5 shrink-0 mt-0.5" />
            <span className="truncate">{deal.aiDescription}</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-1.5">
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" /> {formattedDate}
            </span>
            {deal.airline && <span className="truncate max-w-[80px]">{deal.airline}</span>}
          </div>
          <div className="text-right">
            <div className="text-base font-black text-foreground leading-none">${Math.round(deal.price)}</div>
            <div className="text-[8px] text-muted-foreground">one way</div>
          </div>
        </div>
        {/* AI Tip */}
        {deal.aiTip && (
          <div className="mt-1.5 flex items-center gap-1 bg-primary/5 rounded-lg px-2 py-1">
            <Lightbulb className="w-2.5 h-2.5 text-primary shrink-0" />
            <span className="text-[8px] text-primary/70 truncate">{deal.aiTip}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default AISmartDeals;
