import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Bus, 
  Smartphone, 
  Briefcase, 
  Shield,
  ArrowRight 
} from "lucide-react";

const extras = [
  {
    id: "activities",
    title: "Activities",
    description: "Tours and activities",
    icon: Ticket,
    href: "/extras",
  },
  {
    id: "tickets",
    title: "Tickets",
    description: "Attractions and museums",
    icon: Ticket,
    href: "/extras",
  },
  {
    id: "transfers",
    title: "Transfers",
    description: "Airport transfers",
    icon: Bus,
    href: "/extras",
  },
  {
    id: "esim",
    title: "eSIM",
    description: "Stay connected abroad",
    icon: Smartphone,
    href: "/extras",
  },
  {
    id: "luggage",
    title: "Luggage Storage",
    description: "Store bags while exploring",
    icon: Briefcase,
    href: "/extras",
  },
  {
    id: "compensation",
    title: "Flight Compensation",
    description: "Claim for delays",
    icon: Shield,
    href: "/extras",
  },
];

export default function ExtrasSection() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            ZIVO More
          </h2>
          <p className="text-muted-foreground text-sm">
            Everything you need to complete your trip
          </p>
        </div>

        {/* Extras Grid - 6 items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {extras.map((extra) => (
            <Link
              key={extra.id}
              to={extra.href}
              className="group"
            >
              <Card className="h-full border hover:border-primary/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <extra.icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1">
                    {extra.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {extra.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-6">
          <Link to="/extras">
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              View All Extras
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
