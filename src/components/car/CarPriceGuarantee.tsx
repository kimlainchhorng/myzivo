import { Shield, BadgeDollarSign, Clock, Headphones, Award, ArrowRight, Car, Fuel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const guarantees = [
  { icon: BadgeDollarSign, title: "Best Rate Guarantee", description: "Find it cheaper? We'll refund the difference plus 10%", color: "text-green-400", bgColor: "bg-green-500/10" },
  { icon: Clock, title: "Free Cancellation", description: "Cancel up to 48 hours before pickup for a full refund", color: "text-blue-400", bgColor: "bg-blue-500/10" },
  { icon: Fuel, title: "Fair Fuel Policy", description: "Pick up full, return full - no hidden fuel charges", color: "text-amber-400", bgColor: "bg-amber-500/10" },
  { icon: Headphones, title: "Roadside Assistance", description: "24/7 emergency support wherever you are", color: "text-purple-400", bgColor: "bg-purple-500/10" },
];

const CarPriceGuarantee = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-card/50 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Shield className="w-3 h-3 mr-1" /> Rent with Confidence
              </Badge>
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-3">
                Our Promise to Drivers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {guarantees.map((guarantee) => (
                <div key={guarantee.title} className="p-5 bg-card/60 backdrop-blur-xl rounded-xl border border-border/30">
                  <div className={`w-12 h-12 ${guarantee.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <guarantee.icon className={`w-6 h-6 ${guarantee.color}`} />
                  </div>
                  <h3 className="font-bold mb-2">{guarantee.title}</h3>
                  <p className="text-sm text-muted-foreground">{guarantee.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500">
                <Award className="w-4 h-4 mr-2" />
                Learn About Our Guarantees
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarPriceGuarantee;
