/**
 * TrendingDealsSection - OTA Model
 * Shows trending flight deals with internal navigation (no affiliate redirects)
 */
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, ArrowRight, TrendingUp, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendingDeal {
  id: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  price: number;
  originalPrice?: number;
  airline?: string;
  departure?: string;
  trending?: boolean;
  discount?: number;
}

const trendingDeals: TrendingDeal[] = [
  { id: "1", from: "New York", fromCode: "JFK", to: "Los Angeles", toCode: "LAX", price: 89, originalPrice: 149, airline: "JetBlue", trending: true, discount: 40 },
  { id: "2", from: "Los Angeles", fromCode: "LAX", to: "London", toCode: "LHR", price: 399, originalPrice: 599, airline: "British Airways", discount: 33 },
  { id: "3", from: "Chicago", fromCode: "ORD", to: "Miami", toCode: "MIA", price: 79, originalPrice: 129, airline: "Spirit", trending: true, discount: 39 },
  { id: "4", from: "San Francisco", fromCode: "SFO", to: "Tokyo", toCode: "NRT", price: 549, originalPrice: 899, airline: "United", discount: 39 },
  { id: "5", from: "Miami", fromCode: "MIA", to: "Cancún", toCode: "CUN", price: 129, originalPrice: 199, airline: "American", trending: true, discount: 35 },
  { id: "6", from: "Dallas", fromCode: "DFW", to: "Las Vegas", toCode: "LAS", price: 69, originalPrice: 109, airline: "Southwest", discount: 37 },
];

interface TrendingDealsSectionProps {
  title?: string;
  subtitle?: string;
  maxDeals?: number;
  variant?: "grid" | "carousel";
  className?: string;
}

export default function TrendingDealsSection({
  title = "Popular Routes",
  subtitle = "Search flights on trending routes",
  maxDeals = 6,
  variant = "grid",
  className,
}: TrendingDealsSectionProps) {
  const navigate = useNavigate();

  // Internal navigation - OTA model (no external redirect)
  const handleDealClick = (deal: TrendingDeal) => {
    const params = new URLSearchParams({
      origin: deal.fromCode,
      dest: deal.toCode,
    });
    navigate(`/flights/results?${params.toString()}`);
  };

  const displayDeals = trendingDeals.slice(0, maxDeals);

  return (
    <section className={cn("py-8", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-xl">{title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Clock className="w-3 h-3" />
          Real-time prices
        </Badge>
      </div>

      <div className={cn(
        variant === "grid" 
          ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
      )}>
        {displayDeals.map((deal) => (
          <Card
            key={deal.id}
            className={cn(
              "group hover:shadow-xl hover:scale-[1.02] hover:border-sky-500/50 transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl touch-manipulation active:scale-[0.98]",
              variant === "carousel" && "min-w-[280px] snap-start"
            )}
            onClick={() => handleDealClick(deal)}
          >
            {/* Discount Banner */}
            {deal.discount && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 text-center">
                🔥 {deal.discount}% OFF — Limited Time!
              </div>
            )}

            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 flex items-center justify-center">
                    <Plane className="w-5 h-5 text-sky-500 rotate-45" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{deal.fromCode}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span>{deal.toCode}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {deal.from} → {deal.to}
                    </p>
                  </div>
                </div>
                {deal.trending && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Hot
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-sky-500">From ${deal.price}</span>
                {deal.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                )}
              </div>

              {deal.airline && (
                <p className="text-xs text-muted-foreground mb-3">
                  via {deal.airline} and more
                </p>
              )}

              {/* CTA - Internal navigation */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl shadow-md active:scale-[0.97] transition-all duration-200 touch-manipulation"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDealClick(deal);
                  }}
                >
                  Search Flights
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View More + Disclosure */}
      <div className="mt-6 text-center">
        <Link 
          to="/flights" 
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          View all routes
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-[9px] text-muted-foreground mt-2">
          *Prices shown are examples. Final prices confirmed at checkout.
        </p>
      </div>
    </section>
  );
}
