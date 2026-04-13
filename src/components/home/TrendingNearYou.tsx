/**
 * "Trending Near You" — AI-personalized store recommendations on the Home Screen.
 * Shows stores ranked by user interest tags + boosted status.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Star from "lucide-react/dist/esm/icons/star";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Store from "lucide-react/dist/esm/icons/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTrendingNearYou, type TrendingStore } from "@/hooks/useTrendingNearYou";

const categoryIcons: Record<string, string> = {
  food: "🍜",
  restaurant: "🍽️",
  cafe: "☕",
  car_wash: "🚗",
  beauty: "💅",
  grocery: "🛒",
  retail: "🛍️",
  health: "💊",
  fitness: "💪",
  services: "🔧",
};

export default function TrendingNearYou() {
  const navigate = useNavigate();
  const { data: stores = [], isLoading } = useTrendingNearYou(8);

  if (isLoading || stores.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Trending Near You</h3>
            <p className="text-[10px] text-muted-foreground">Personalized for you</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/store-map")}
          className="flex items-center gap-1 text-xs text-primary font-medium"
        >
          See all <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {stores.map((store, i) => (
          <TrendingCard key={store.store_id} store={store} index={i} />
        ))}
      </div>
    </div>
  );
}

function TrendingCard({ store, index }: { store: TrendingStore; index: number }) {
  const navigate = useNavigate();
  const emoji = categoryIcons[store.category?.toLowerCase()] || "📍";

  return (
    <motion.button
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/store-map`)}
      className={cn(
        "shrink-0 w-[160px] rounded-xl border border-border/40 bg-card overflow-hidden text-left",
        "hover:border-primary/30 hover:shadow-md transition-all",
        store.is_featured && "border-primary/40 bg-primary/5"
      )}
    >
      {/* Store Logo / Cover */}
      <div className="w-full h-24 bg-muted/30 flex items-center justify-center overflow-hidden">
        {store.logo_url ? (
          <img
            src={store.logo_url}
            alt={store.store_name}
            className="w-full h-full object-contain p-3"
            loading="lazy"
          />
        ) : (
          <Store className="h-10 w-10 text-muted-foreground/40" />
        )}
      </div>

      <div className="p-2.5">
        <div className="flex items-center justify-between mb-1">
          {store.is_featured && (
            <Badge variant="secondary" className="text-[8px] px-1.5 py-0 bg-amber-500/15 text-amber-600">
              <Star className="h-2.5 w-2.5 mr-0.5" /> Boosted
            </Badge>
          )}
        </div>
        <p className="text-xs font-semibold truncate">{store.store_name}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground capitalize">
            {store.category?.replace(/_/g, " ") || "Local"}
          </span>
        </div>
        {store.relevance_score > 10 && (
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-[9px] text-emerald-600 font-medium">Popular pick</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
