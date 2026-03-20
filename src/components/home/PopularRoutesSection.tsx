/**
 * Popular Routes Quick Search Section
 * Displays live Duffel prices for trending flight routes on the homepage
 */

import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, Sparkles, Loader2, Plane } from "lucide-react";
import { motion } from "framer-motion";
import { usePopularRoutePrices } from "@/hooks/usePopularRoutePrices";

import miamiImg from "@/assets/destinations/miami.jpg";
import sfImg from "@/assets/destinations/san-francisco.jpg";
import atlantaImg from "@/assets/destinations/atlanta.jpg";
import denverImg from "@/assets/destinations/denver.jpg";
import vegasImg from "@/assets/destinations/las-vegas.jpg";
import fllImg from "@/assets/destinations/fort-lauderdale.jpg";

const FALLBACK_ROUTES = [
  { from: "New York", fromCode: "JFK", to: "Miami", toCode: "MIA", image: miamiImg },
  { from: "Los Angeles", fromCode: "LAX", to: "San Francisco", toCode: "SFO", image: sfImg },
  { from: "Chicago", fromCode: "ORD", to: "Atlanta", toCode: "ATL", image: atlantaImg },
  { from: "Dallas", fromCode: "DFW", to: "Denver", toCode: "DEN", image: denverImg },
  { from: "Seattle", fromCode: "SEA", to: "Las Vegas", toCode: "LAS", image: vegasImg },
  { from: "Boston", fromCode: "BOS", to: "Fort Lauderdale", toCode: "FLL", image: fllImg },
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
              className="cursor-pointer group"
              onClick={() => handleRouteClick(route.fromCode, route.toCode)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRouteClick(route.fromCode, route.toCode); }}
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300 active:scale-[0.97]">
                {/* Destination Image */}
                <div className="relative h-28">
                  <img
                    src={route.image}
                    alt={route.to}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  
                  {/* Route badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 border border-border/30">
                    <span className="font-bold text-[11px] text-foreground">{route.fromCode}</span>
                    <Plane className="w-2.5 h-2.5 text-primary rotate-45" />
                    <span className="font-bold text-[11px] text-foreground">{route.toCode}</span>
                  </div>
                </div>
                
                {/* Info at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-[11px] text-muted-foreground truncate">
                    {route.from} → {route.to}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    {route.price ? (
                      <span className="text-sm font-bold text-primary">
                        from {route.price}*
                      </span>
                    ) : (
                      <div className="h-4 w-16 rounded bg-muted/50 animate-pulse" />
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
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
