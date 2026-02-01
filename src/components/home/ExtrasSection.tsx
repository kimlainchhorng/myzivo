import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { extrasCategoryPhotos } from "@/config/photos";

const extras = [
  {
    id: "activities",
    title: "Activities",
    description: "Tours and adventures",
    image: extrasCategoryPhotos.activities.src,
    href: "/extras",
  },
  {
    id: "museums",
    title: "Tickets",
    description: "Attractions & museums",
    image: extrasCategoryPhotos.museums.src,
    href: "/extras",
  },
  {
    id: "transfers",
    title: "Transfers",
    description: "Airport pickups",
    image: extrasCategoryPhotos.transfers.src,
    href: "/extras",
  },
  {
    id: "esim",
    title: "eSIM",
    description: "Stay connected",
    image: extrasCategoryPhotos.esim.src,
    href: "/extras",
  },
  {
    id: "luggage",
    title: "Luggage Storage",
    description: "Store bags safely",
    image: extrasCategoryPhotos.luggage.src,
    href: "/extras",
  },
  {
    id: "compensation",
    title: "Compensation",
    description: "Claim for delays",
    image: extrasCategoryPhotos.compensation.src,
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
            ZIVO Extras
          </h2>
          <p className="text-muted-foreground text-sm">
            Everything you need to complete your trip
          </p>
        </div>

        {/* Extras Grid - 6 items with photos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {extras.map((extra) => (
            <Link
              key={extra.id}
              to={extra.href}
              className="group"
            >
              <Card className="h-full border overflow-hidden hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                {/* Photo Header */}
                <div className="relative h-20 sm:h-24 overflow-hidden">
                  <img
                    src={extra.image}
                    alt={extra.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
                
                <CardContent className="p-3 text-center">
                  <h3 className="font-semibold text-sm mb-0.5">
                    {extra.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
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
