/**
 * Popular Routes Quick Search Section
 * Displays trending flight routes as clickable cards on the homepage
 */

import { Link } from "react-router-dom";
import { Plane, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const POPULAR_ROUTES = [
  { from: "New York", fromCode: "JFK", to: "Miami", toCode: "MIA", priceFrom: 89 },
  { from: "Los Angeles", fromCode: "LAX", to: "San Francisco", toCode: "SFO", priceFrom: 59 },
  { from: "Chicago", fromCode: "ORD", to: "Atlanta", toCode: "ATL", priceFrom: 75 },
  { from: "Dallas", fromCode: "DFW", to: "Denver", toCode: "DEN", priceFrom: 68 },
  { from: "Seattle", fromCode: "SEA", to: "Las Vegas", toCode: "LAS", priceFrom: 72 },
  { from: "Boston", fromCode: "BOS", to: "Fort Lauderdale", toCode: "FLL", priceFrom: 95 },
];

export default function PopularRoutesSection() {
  return (
    <section className="py-16 bg-muted/20" aria-label="Popular flight routes">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Popular Routes</h2>
          </div>
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {POPULAR_ROUTES.map((route, i) => (
            <motion.div
              key={`${route.fromCode}-${route.toCode}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                to={`/flights/results?origin=${route.fromCode}&destination=${route.toCode}&passengers=1&cabinClass=economy`}
                className="group block p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 active:scale-[0.97]"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-sm">{route.fromCode}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="font-bold text-sm">{route.toCode}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {route.from} — {route.to}
                </p>
                <span className="text-sm font-bold text-primary">
                  from ${route.priceFrom}*
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mt-4 text-center">
          *Prices are indicative and may vary. Final price confirmed at partner checkout.
        </p>
      </div>
    </section>
  );
}
