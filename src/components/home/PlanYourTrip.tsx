import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Hotel, CarFront, Ticket, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const tripCombos = [
  {
    id: "flights-hotels",
    title: "Flights + Hotels",
    description: "Save when you bundle your flight and accommodation",
    icons: [Plane, Hotel],
    href: "/book-flight",
    gradient: "from-sky-500/20 via-amber-500/10 to-amber-500/20",
    borderColor: "border-sky-500/30 hover:border-sky-500/60",
    badge: "Popular",
    badgeColor: "bg-sky-500",
  },
  {
    id: "hotels-cars",
    title: "Hotels + Car Rental",
    description: "Explore your destination with complete freedom",
    icons: [Hotel, CarFront],
    href: "/book-hotel",
    gradient: "from-amber-500/20 via-violet-500/10 to-violet-500/20",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    badge: null,
    badgeColor: null,
  },
  {
    id: "things-to-do",
    title: "Things to Do",
    description: "Discover tours, activities, and local experiences",
    icons: [Ticket],
    href: "/things-to-do",
    gradient: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
    badge: "New",
    badgeColor: "bg-emerald-500",
  },
];

export default function PlanYourTrip() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Bundle & Save</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Plan Your{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              Whole Trip
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Combine travel services for the complete experience
          </p>
        </div>

        {/* Trip Combo Cards */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tripCombos.map((combo, index) => (
            <Link
              key={combo.id}
              to={combo.href}
              className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card
                className={cn(
                  "h-full border transition-all duration-300",
                  "hover:-translate-y-2 hover:shadow-xl",
                  `bg-gradient-to-br ${combo.gradient}`,
                  combo.borderColor
                )}
              >
                <CardContent className="p-6 text-center relative">
                  {/* Badge */}
                  {combo.badge && (
                    <Badge
                      className={cn(
                        "absolute -top-2.5 right-4 text-white border-0",
                        combo.badgeColor
                      )}
                    >
                      {combo.badge}
                    </Badge>
                  )}

                  {/* Icons */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {combo.icons.map((Icon, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform"
                      >
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                    ))}
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-lg mb-2">{combo.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {combo.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
