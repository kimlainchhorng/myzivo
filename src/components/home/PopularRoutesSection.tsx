/**
 * Popular Routes Quick Search Section
 * Displays live Duffel prices for trending flight routes on the homepage
 */

import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePopularRoutePrices } from "@/hooks/usePopularRoutePrices";

const FALLBACK_ROUTES = [
  { from: "New York", fromCode: "JFK", to: "Miami", toCode: "MIA" },
  { from: "Los Angeles", fromCode: "LAX", to: "San Francisco", toCode: "SFO" },
  { from: "Chicago", fromCode: "ORD", to: "Atlanta", toCode: "ATL" },
  { from: "Dallas", fromCode: "DFW", to: "Denver", toCode: "DEN" },
  { from: "Seattle", fromCode: "SEA", to: "Las Vegas", toCode: "LAS" },
  { from: "Boston", fromCode: "BOS", to: "Fort Lauderdale", toCode: "FLL" },
];

export default function PopularRoutesSection() {
  const navigate = useNavigate();
  const { data: liveRoutes, isLoading } = usePopularRoutePrices();

  const handleRouteClick = (fromCode: string, toCode: string) => {
    const depart = new Date();
    depart.setDate(depart.getDate() + 7);
    const ret = new Date();
    ret.setDate(ret.getDate() + 14);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    navigate(
      `/flights/results?origin=${fromCode}&destination=${toCode}&departureDate=${fmt(depart)}&returnDate=${fmt(ret)}&adults=1&cabinClass=economy`
    );
  };

  const routes = FALLBACK_ROUTES.map((fr) => {
    const live = liveRoutes?.find(
      (lr) => lr.origin_code === fr.fromCode && lr.destination_code === fr.toCode
    );
    return {
      ...fr,
      price: live ? `$${Math.round(live.lowest_price)}` : null,
    };
  });

  const hasLive = routes.some((r) => r.price !== null);

  return (
    <section className="py-16 bg-muted/20" aria-label="Popular flight routes">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Popular Routes</h2>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border flex items-center gap-1 ${
            hasLive
              ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
              : "text-primary bg-primary/10 border-primary/20"
          }`}>
            {isLoading ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Loading</>
            ) : hasLive ? (
              <><Sparkles className="w-3 h-3" /> Live</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Updating</>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {routes.map((route, i) => (
            <motion.div
              key={`${route.fromCode}-${route.toCode}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="cursor-pointer"
              onClick={() => handleRouteClick(route.fromCode, route.toCode)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRouteClick(route.fromCode, route.toCode); }}
            >
              <div className="p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 active:scale-[0.97]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-sm">{route.fromCode}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="font-bold text-sm">{route.toCode}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {route.from} — {route.to}
                </p>
                {route.price ? (
                  <span className="text-sm font-bold text-primary">
                    from {route.price}*
                  </span>
                ) : (
                  <div className="h-4 w-16 rounded bg-muted/50 animate-pulse" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mt-4 text-center">
          {hasLive
            ? "*Live prices from Duffel. Final price confirmed at partner checkout."
            : "*Prices loading. Final price confirmed at partner checkout."}
        </p>
      </div>
    </section>
  );
}
