import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, ArrowRight, Sparkles, TrendingUp, Zap, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";

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
  title = "Trending Deals Today",
  subtitle = "Limited-time prices on popular routes",
  maxDeals = 6,
  variant = "grid",
  className,
}: TrendingDealsSectionProps) {
  const navigate = useNavigate();

  const handleDealClick = (deal: TrendingDeal) => {
    trackAffiliateClick({
      flightId: `trending-${deal.id}`,
      airline: deal.airline || "Multiple",
      airlineCode: deal.toCode,
      origin: deal.fromCode,
      destination: deal.toCode,
      price: deal.price,
      passengers: 1,
      cabinClass: "economy",
      affiliatePartner: "searadar",
      referralUrl: AFFILIATE_LINKS.flights.url,
      source: "trending_deals_section",
      ctaType: "trending_deal",
      serviceType: "flights",
    });

    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
  };

  const handleSearchClick = (deal: TrendingDeal) => {
    // Navigate to prefilled search
    const searchParams = new URLSearchParams({
      from: `${deal.from} (${deal.fromCode})`,
      to: `${deal.to} (${deal.toCode})`,
    });
    navigate(`/flights/results?${searchParams.toString()}`);
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
          Updated hourly
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
              "group hover:shadow-lg hover:border-sky-500/50 transition-all duration-300 cursor-pointer overflow-hidden",
              variant === "carousel" && "min-w-[280px] snap-start"
            )}
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
                <span className="text-xs text-muted-foreground">*</span>
              </div>

              {deal.airline && (
                <p className="text-xs text-muted-foreground mb-3">
                  via {deal.airline} and more
                </p>
              )}

              {/* CTAs */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDealClick(deal);
                  }}
                >
                  View Deal
                  <ExternalLink className="w-3 h-3" />
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
          View all deals
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-[9px] text-muted-foreground mt-2">
          *Prices are indicative and may change. ZIVO may earn a commission from bookings.
        </p>
      </div>
    </section>
  );
}
