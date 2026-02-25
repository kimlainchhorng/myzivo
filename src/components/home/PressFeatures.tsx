import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const pressFeatures = [
  {
    publication: "TechCrunch",
    logo: "TC",
    quote: "ZIVO is revolutionizing how we book travel with AI-powered recommendations.",
    date: "Jan 2024",
    color: "text-emerald-500",
    bg: "bg-emerald-500",
  },
  {
    publication: "Forbes",
    logo: "F",
    quote: "The all-in-one travel platform that's giving industry giants a run for their money.",
    date: "Dec 2023",
    color: "text-rose-500",
    bg: "bg-rose-500",
  },
  {
    publication: "The Verge",
    logo: "V",
    quote: "A beautifully designed travel app that actually delivers on its promises.",
    date: "Feb 2024",
    color: "text-purple-500",
    bg: "bg-purple-500",
  },
  {
    publication: "Wired",
    logo: "W",
    quote: "ZIVO's tech stack is setting new standards for travel industry innovation.",
    date: "Mar 2024",
    color: "text-sky-500",
    bg: "bg-sky-500",
  },
];

const PressFeatures = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-muted/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-muted text-muted-foreground border-border">
            <Newspaper className="w-3 h-3 mr-1" /> In The Press
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            What They're Saying
          </h2>
          <p className="text-muted-foreground">Featured in leading publications worldwide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pressFeatures.map((feature, index) => (
            <div
              key={feature.publication}
              className={cn(
                "group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                "hover:border-primary/30 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Publication Logo */}
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
                  feature.bg
                )}>
                  {feature.logo}
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Quote */}
              <div className="relative mb-4">
                <Quote className="w-6 h-6 text-primary/20 absolute -top-1 -left-1" />
                <p className="text-sm text-foreground/90 italic pl-4">
                  "{feature.quote}"
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className={cn("font-bold text-sm", feature.color)}>
                  {feature.publication}
                </span>
                <span className="text-xs text-muted-foreground">
                  {feature.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Press logos bar */}
        <div className="mt-10 pt-8 border-t border-border/50">
          <p className="text-center text-xs text-muted-foreground mb-4">FEATURED IN</p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-50">
            {["TechCrunch", "Forbes", "The Verge", "Wired", "Bloomberg", "CNBC"].map((pub) => (
              <span key={pub} className="text-lg font-bold text-muted-foreground">
                {pub}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PressFeatures;
