import { Briefcase, Check, Clock, Crown, Plane, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const corporateFeatures = [
  "Dedicated account manager",
  "Volume-based discounts",
  "Centralized billing",
  "Travel policy integration",
  "Priority rebooking",
  "Expense reporting tools",
];

const FlightCorporateSection = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
                <Briefcase className="w-3 h-3 mr-1" /> For Business
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
                ZIVO for Enterprise
              </h2>
              <p className="text-slate-400 mb-6">
                Streamline your corporate travel with dedicated tools, volume discounts, and premium support.
              </p>

              <ul className="space-y-3 mb-8">
                {corporateFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-sky-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex gap-4">
                <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                  Request Demo <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                <Crown className="w-8 h-8 text-amber-400 mb-3" />
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm text-slate-400">Enterprise clients</p>
              </div>
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                <Users className="w-8 h-8 text-sky-400 mb-3" />
                <p className="text-2xl font-bold text-white">1M+</p>
                <p className="text-sm text-slate-400">Business travelers</p>
              </div>
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                <Plane className="w-8 h-8 text-green-400 mb-3" />
                <p className="text-2xl font-bold text-white">35%</p>
                <p className="text-sm text-slate-400">Avg savings</p>
              </div>
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                <Clock className="w-8 h-8 text-purple-400 mb-3" />
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-sm text-slate-400">Priority support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightCorporateSection;
