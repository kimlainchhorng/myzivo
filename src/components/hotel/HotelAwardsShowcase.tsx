import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Medal, Shield, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const hotelAwards = [
  {
    icon: Trophy,
    title: "Travelers' Choice",
    year: "2024",
    source: "TripAdvisor",
    description: "Top 10% of hotels worldwide",
    color: "text-amber-500",
    bg: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: Star,
    title: "Best in Class",
    year: "2024",
    source: "Booking.com",
    description: "Exceptional guest satisfaction",
    color: "text-sky-500",
    bg: "from-sky-500/20 to-blue-500/20",
  },
  {
    icon: Award,
    title: "Luxury Award",
    year: "2023",
    source: "World Travel Awards",
    description: "Leading luxury hotel brand",
    color: "text-purple-500",
    bg: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Shield,
    title: "Safety Excellence",
    year: "2024",
    source: "SafeHotels",
    description: "Certified safe accommodation",
    color: "text-emerald-500",
    bg: "from-emerald-500/20 to-teal-500/20",
  },
];

const HotelAwardsShowcase = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Crown className="w-3 h-3 mr-1" /> Award-Winning Properties
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Recognized Excellence
          </h2>
          <p className="text-muted-foreground">Stay at hotels celebrated by travelers worldwide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotelAwards.map((award, index) => {
            const Icon = award.icon;
            return (
              <div
                key={award.title}
                className={cn(
                  "group relative overflow-hidden p-6 rounded-2xl border border-border/50",
                  "bg-gradient-to-br",
                  award.bg,
                  "hover:border-primary/30 hover:-translate-y-1 transition-all duration-300",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Sparkle effect */}
                <Sparkles className="absolute top-3 right-3 w-4 h-4 text-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                    "bg-card/80 border border-border/50 shadow-lg"
                  )}>
                    <Icon className={cn("w-7 h-7", award.color)} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">
                        {award.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px]">
                        {award.year}
                      </Badge>
                    </div>
                    <p className={cn("text-sm font-medium mb-1", award.color)}>
                      {award.source}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {award.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HotelAwardsShowcase;
