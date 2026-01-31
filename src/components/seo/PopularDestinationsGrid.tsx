import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Globe } from "lucide-react";
import { popularDestinations } from "@/utils/seoUtils";

export default function PopularDestinationsGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-xl">Popular Destinations</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          Top picks
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {popularDestinations.map((dest) => {
          const slug = dest.city.toLowerCase().replace(/\s+/g, "-");
          
          return (
            <Link
              key={dest.code}
              to={`/flights/to-${slug}`}
              className="group"
            >
              <Card className="h-full border-border/50 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group-hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{dest.image}</div>
                  <h3 className="font-bold text-sm truncate">{dest.city}</h3>
                  <p className="text-xs text-muted-foreground">{dest.country}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Flexible Dates CTA */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            Flexible dates? <Link to="/flights" className="text-primary hover:underline">Compare prices across dates</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
