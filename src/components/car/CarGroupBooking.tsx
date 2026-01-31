import { Users, Calendar, Percent, Check, ArrowRight, Bus, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const groupBenefits = [
  "Discounts starting at 10 vehicles",
  "Dedicated fleet coordinator",
  "Flexible pickup/return",
  "Group insurance packages",
  "Same vehicle models guaranteed",
];

const CarGroupBooking = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-card/50 to-purple-500/10 border border-violet-500/20 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-violet-500/20 text-violet-400 border-violet-500/30">
                <Users className="w-3 h-3 mr-1" /> Group Booking
              </Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Traveling with a Group?
              </h2>
              <p className="text-muted-foreground mb-6">
                Save up to 30% on multi-vehicle rentals for corporate events, weddings, tours, and group travel.
              </p>

              <ul className="space-y-3 mb-6">
                {groupBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-violet-400" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-4">
                <Button size="lg" className="bg-gradient-to-r from-violet-500 to-purple-500">
                  Get Group Quote
                </Button>
                <Button size="lg" variant="outline">
                  Call Us
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-card/60 backdrop-blur-xl rounded-xl border border-violet-500/20">
                <Percent className="w-8 h-8 text-green-400 mb-3" />
                <p className="text-3xl font-bold">30%</p>
                <p className="text-sm text-muted-foreground">Max discount</p>
              </div>
              <div className="p-5 bg-card/60 backdrop-blur-xl rounded-xl border border-violet-500/20">
                <Bus className="w-8 h-8 text-violet-400 mb-3" />
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm text-muted-foreground">Vehicles available</p>
              </div>
              <div className="p-5 bg-card/60 backdrop-blur-xl rounded-xl border border-violet-500/20">
                <Calendar className="w-8 h-8 text-sky-400 mb-3" />
                <p className="text-3xl font-bold">Flex</p>
                <p className="text-sm text-muted-foreground">Booking dates</p>
              </div>
              <div className="p-5 bg-card/60 backdrop-blur-xl rounded-xl border border-violet-500/20">
                <Plane className="w-8 h-8 text-amber-400 mb-3" />
                <p className="text-3xl font-bold">Airport</p>
                <p className="text-sm text-muted-foreground">Pickup available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarGroupBooking;
