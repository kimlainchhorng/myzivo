import { Key, Check, Star, Clock, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Clock, title: "Express Check-in", description: "Skip the lines with priority lanes" },
  { icon: Shield, title: "Lounge Access", description: "Relax in premium airport lounges" },
  { icon: Star, title: "Priority Boarding", description: "Board first, settle in comfort" },
  { icon: Key, title: "Fast Track Security", description: "Dedicated security screening" },
];

const HotelPremiumAccess = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-card/50 to-orange-500/10 border border-amber-500/20 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Key className="w-3 h-3 mr-1" /> Premium Access
              </Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Elevate Your Stay
              </h2>
              <p className="text-muted-foreground mb-6">
                Unlock exclusive hotel perks and priority services with ZIVO Premium membership.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Sparkles className="w-4 h-4 mr-2" />
                Get Premium Access
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl" />
              <div className="relative bg-card/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Premium Benefits</h3>
                  <Badge className="bg-amber-500 text-white border-0">VIP</Badge>
                </div>
                <ul className="space-y-3">
                  {["Early check-in at 10 AM", "Late check-out until 4 PM", "Room upgrade when available", "Free breakfast included", "Complimentary minibar", "24/7 concierge service"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">Starting at</span>
                    <div>
                      <span className="text-3xl font-bold">$29</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelPremiumAccess;
