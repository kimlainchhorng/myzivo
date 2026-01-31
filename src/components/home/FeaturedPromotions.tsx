import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, Percent, Gift, Plane, Hotel, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const promotions = [
  {
    id: 1,
    title: "Summer Flight Sale",
    subtitle: "Up to 40% off international flights",
    description: "Book your dream vacation with exclusive summer discounts on 500+ airlines worldwide.",
    cta: "Search Flights",
    href: "/book-flight?promo=summer",
    icon: Plane,
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    accentColor: "text-sky-400",
    badge: "Limited Time",
    discount: "40%",
    endsIn: "3 days",
  },
  {
    id: 2,
    title: "Hotel Flash Deals",
    subtitle: "Tonight stays from $49",
    description: "Last-minute luxury at budget prices. Premium hotels with up to 60% savings.",
    cta: "View Hotels",
    href: "/book-hotel?deals=flash",
    icon: Hotel,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    accentColor: "text-amber-400",
    badge: "Flash Sale",
    discount: "60%",
    endsIn: "12 hours",
  },
  {
    id: 3,
    title: "Weekend Car Rentals",
    subtitle: "Free upgrade on all bookings",
    description: "Get a free vehicle upgrade plus unlimited mileage on weekend rentals.",
    cta: "Rent Now",
    href: "/rent-car?promo=weekend",
    icon: Car,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    accentColor: "text-emerald-400",
    badge: "Free Upgrade",
    discount: "Free",
    endsIn: "5 days",
  },
];

const FeaturedPromotions = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((i) => (i + 1) % promotions.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  const activePromo = promotions[activeIndex];
  const Icon = activePromo.icon;

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-gradient-to-r from-primary/20 to-teal-500/20 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" /> Featured Promotions
          </Badge>
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-2">
            Exclusive Deals Just for You
          </h2>
          <p className="text-muted-foreground">Limited-time offers you won't find anywhere else</p>
        </div>

        {/* Main Promo Card */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-8 md:p-12",
          "bg-gradient-to-br",
          activePromo.gradient
        )}>
          {/* Background Effects */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Clock className="w-3 h-3 mr-1" /> Ends in {activePromo.endsIn}
              </Badge>
              
              <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">
                {activePromo.title}
              </h3>
              <p className="text-xl md:text-2xl text-white/90 font-medium mb-4">
                {activePromo.subtitle}
              </p>
              <p className="text-white/70 mb-6 max-w-lg">
                {activePromo.description}
              </p>

              <Link to={activePromo.href}>
                <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 gap-2 shadow-xl">
                  {activePromo.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <div className="text-center">
                  <Percent className="w-8 h-8 text-white mx-auto mb-1" />
                  <span className="text-4xl md:text-5xl font-bold text-white">{activePromo.discount}</span>
                  <p className="text-white/80 text-sm">OFF</p>
                </div>
              </div>
              <Icon className="w-16 h-16 text-white/50" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-white/80 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Promo Indicators */}
        <div className="flex justify-center gap-3 mt-6">
          {promotions.map((promo, index) => (
            <button
              key={promo.id}
              onClick={() => {
                setActiveIndex(index);
                setProgress(0);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                index === activeIndex
                  ? "bg-card border border-primary/30 shadow-lg"
                  : "bg-card/50 border border-border/50 hover:border-primary/20"
              )}
            >
              <promo.icon className={cn("w-4 h-4", index === activeIndex ? promo.accentColor : "text-muted-foreground")} />
              <span className={cn("text-sm font-medium", index === activeIndex ? "text-foreground" : "text-muted-foreground")}>
                {promo.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPromotions;
