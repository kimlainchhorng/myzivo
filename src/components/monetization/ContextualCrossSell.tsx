import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hotel, Car, Ticket, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { useNavigate } from "react-router-dom";

interface ContextualCrossSellProps {
  destination: string;
  origin?: string;
  checkIn?: string;
  checkOut?: string;
  variant?: "inline" | "card" | "banner";
  className?: string;
}

export default function ContextualCrossSell({
  destination,
  origin = "",
  checkIn,
  checkOut,
  variant = "inline",
  className,
}: ContextualCrossSellProps) {
  const navigate = useNavigate();

  const crossSellOptions = [
    {
      type: "hotel" as const,
      icon: Hotel,
      title: `Need a hotel in ${destination}?`,
      subtitle: "Compare 1M+ hotels worldwide",
      cta: "Find Hotels",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-500",
      internalPath: "/book-hotel",
    },
    {
      type: "car" as const,
      icon: Car,
      title: `Need a car in ${destination}?`,
      subtitle: "Compare rental prices",
      cta: "Find Cars",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-500",
      internalPath: "/rent-car",
    },
    {
      type: "activities" as const,
      icon: Ticket,
      title: `Things to do in ${destination}`,
      subtitle: "Tours, attractions & experiences",
      cta: "Explore",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-500",
      affiliateUrl: AFFILIATE_LINKS.activities.url,
    },
  ];

  const handleCrossSellClick = (option: typeof crossSellOptions[0]) => {
    trackAffiliateClick({
      flightId: `cross-sell-${option.type}-${destination}`,
      airline: "ZIVO",
      airlineCode: "ZV",
      origin,
      destination,
      price: 0,
      passengers: 1,
      cabinClass: "economy",
      affiliatePartner: option.type === "activities" ? "klook" : "zivo_internal",
      referralUrl: option.affiliateUrl || option.internalPath || "",
      source: "contextual_cross_sell",
      ctaType: "cross_sell",
      serviceType: option.type === "hotel" ? "hotels" : option.type === "car" ? "car_rental" : "activities",
    });

    if (option.affiliateUrl) {
      window.open(option.affiliateUrl, "_blank", "noopener,noreferrer");
    } else if (option.internalPath) {
      navigate(option.internalPath);
    }
  };

  if (variant === "banner") {
    return (
      <div className={cn("grid sm:grid-cols-3 gap-3", className)}>
        {crossSellOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleCrossSellClick(option)}
            className={cn(
              "p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 text-left active:scale-[0.98] touch-manipulation",
              option.bgColor,
              option.borderColor
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", option.color)}>
                <option.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{option.title}</p>
                <p className="text-xs text-muted-foreground">{option.subtitle}</p>
              </div>
              <ArrowRight className={cn("w-4 h-4 shrink-0", option.textColor)} />
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-purple-500" />
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Complete Your {destination} Trip</h3>
          </div>

          <div className="grid gap-3">
            {crossSellOptions.map((option) => (
              <div
                key={option.type}
                className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:border-opacity-80 active:scale-[0.99] touch-manipulation cursor-pointer",
                  option.bgColor,
                  option.borderColor
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", option.color)}>
                    <option.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{option.title}</p>
                    <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("gap-1 rounded-xl active:scale-[0.95] transition-all duration-200 touch-manipulation", option.borderColor)}
                  onClick={() => handleCrossSellClick(option)}
                >
                  {option.cta}
                  {option.affiliateUrl ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </Button>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-muted-foreground text-center mt-4">
            ZIVO may earn a commission from partner bookings.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Inline variant (minimal)
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {crossSellOptions.map((option) => (
        <Badge
          key={option.type}
          variant="outline"
          className={cn("cursor-pointer hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 gap-1 py-1.5 px-3 rounded-xl touch-manipulation", option.borderColor)}
          onClick={() => handleCrossSellClick(option)}
        >
          <option.icon className={cn("w-3 h-3", option.textColor)} />
          {option.cta} in {destination}
          {option.affiliateUrl ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
        </Badge>
      ))}
    </div>
  );
}
