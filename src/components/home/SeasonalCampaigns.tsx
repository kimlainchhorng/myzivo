import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Snowflake, Sun, Leaf, Flower2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const campaigns = [
  {
    season: "Winter",
    icon: Snowflake,
    title: "Winter Wonderland",
    subtitle: "Ski resorts & cozy cabins",
    description: "Escape to snowy destinations with up to 35% off",
    gradient: "from-sky-400 via-blue-500 to-indigo-600",
    href: "/book-hotel?season=winter",
    featured: true,
  },
  {
    season: "Spring",
    icon: Flower2,
    title: "Spring Bloom",
    subtitle: "Cherry blossoms & gardens",
    description: "Discover nature's beauty with special spring rates",
    gradient: "from-pink-400 via-rose-500 to-fuchsia-500",
    href: "/book-flight?season=spring",
    featured: false,
  },
  {
    season: "Summer",
    icon: Sun,
    title: "Summer Escape",
    subtitle: "Beaches & tropical paradise",
    description: "Hot deals on the coolest destinations",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    href: "/book-hotel?season=summer",
    featured: false,
  },
  {
    season: "Fall",
    icon: Leaf,
    title: "Autumn Adventures",
    subtitle: "Foliage & wine country",
    description: "Experience fall colors at incredible prices",
    gradient: "from-orange-400 via-amber-500 to-yellow-500",
    href: "/rent-car?season=fall",
    featured: false,
  },
];

const SeasonalCampaigns = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Calendar className="w-3 h-3 mr-1" /> Seasonal Specials
          </Badge>
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-2">
            Travel Every Season
          </h2>
          <p className="text-muted-foreground">Year-round adventures with exclusive seasonal savings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {campaigns.map((campaign, index) => {
            const Icon = campaign.icon;
            return (
              <Link key={campaign.season} to={campaign.href}>
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-6 h-full cursor-pointer",
                    "border border-border/50 bg-card/50 backdrop-blur-sm",
                    "hover:border-primary/30 hover:-translate-y-1 transition-all duration-300",
                    "animate-in fade-in slide-in-from-bottom-4"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    campaign.gradient
                  )} />
                  {/* Shimmer sweep on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-slide-left" style={{ animationDuration: '2.5s' }} />
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl mb-4 flex items-center justify-center",
                    "bg-gradient-to-br",
                    campaign.gradient
                  )}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {campaign.season}
                    </Badge>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-all duration-200">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-primary/80 font-medium mb-2">
                      {campaign.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {campaign.description}
                    </p>

                    <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Featured badge */}
                  {campaign.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px]">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SeasonalCampaigns;
