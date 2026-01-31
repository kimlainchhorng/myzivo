import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Medal, Star, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const awards = [
  {
    icon: Trophy,
    title: "Best Travel App 2024",
    source: "TechCrunch",
    year: "2024",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Award,
    title: "Excellence in UX",
    source: "Webby Awards",
    year: "2024",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: Medal,
    title: "Top 10 Travel Platform",
    source: "Forbes",
    year: "2024",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Star,
    title: "Customer Choice Award",
    source: "Trustpilot",
    year: "2024",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Shield,
    title: "Most Secure Platform",
    source: "Cybersecurity Mag",
    year: "2024",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Crown,
    title: "Innovation Leader",
    source: "Travel Weekly",
    year: "2024",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const AwardsShowcase = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Trophy className="w-3 h-3 mr-1" /> Award Winning
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Recognized for Excellence
          </h2>
          <p className="text-muted-foreground">Industry leaders trust and celebrate ZIVO</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {awards.map((award, index) => {
            const Icon = award.icon;
            return (
              <div
                key={award.title}
                className={cn(
                  "group p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 text-center",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                  award.bg
                )}>
                  <Icon className={cn("w-6 h-6", award.color)} />
                </div>
                <h3 className="font-bold text-xs mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {award.title}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {award.source} • {award.year}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AwardsShowcase;
