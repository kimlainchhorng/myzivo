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
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Trending</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold">Popular Routes</h2>
          </div>
          <Link
            to="/flights"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all routes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {POPULAR_ROUTES.map((route, i) => (
            <motion.div
              key={`${route.fromCode}-${route.toCode}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={`/flights/results?origin=${route.fromCode}&destination=${route.toCode}&passengers=1&cabinClass=economy`}
                className="group block p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="text-2xl mb-2">{route.emoji}</div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-sm">{route.fromCode}</span>
                  <Plane className="w-3 h-3 text-muted-foreground -rotate-45" />
                  <span className="font-bold text-sm">{route.toCode}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {route.from} → {route.to}
                </p>
                <div className="mt-2 text-xs font-medium text-primary sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Search flights <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          to="/flights"
          className="sm:hidden flex items-center justify-center gap-1 mt-6 text-sm font-medium text-primary"
        >
          View all routes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
