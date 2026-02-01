import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bus, 
  Wifi, 
  Briefcase, 
  Shield, 
  Ticket,
  ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

const extras = [
  {
    id: "transfers",
    title: "Airport Transfers",
    description: "Book reliable airport pickups",
    icon: Bus,
    href: "/extras",
  },
  {
    id: "esim",
    title: "Travel eSIM",
    description: "Stay connected abroad",
    icon: Wifi,
    href: "/extras",
  },
  {
    id: "activities",
    title: "Activities & Tours",
    description: "Discover local experiences",
    icon: Ticket,
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
    description: "Claim for delays/cancellations",
    icon: Shield,
    href: "/extras",
  },
];

export default function ExtrasSection() {
  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading-lg mb-3">
            ZIVO More
          </h2>
          <p className="text-muted-foreground text-body max-w-xl mx-auto">
            Everything you need to make your trip complete
          </p>
        </div>

        {/* Extras Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {extras.map((extra) => (
            <Link
              key={extra.id}
              to={extra.href}
              className="group"
            >
              <Card className="h-full border hover:border-primary/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <CardContent className="p-5 text-center">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <extra.icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1.5">
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
        <div className="text-center mt-8">
          <Link to="/extras">
            <Button variant="outline" className="rounded-xl gap-2">
              View All Extras
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
