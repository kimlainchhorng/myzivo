import { Lightbulb, Camera, FileText, CreditCard, Clock, Fuel, Car, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tips = [
  {
    step: 1,
    icon: FileText,
    title: "Bring Required Documents",
    description: "Valid driver's license, credit card in driver's name, and booking confirmation",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    step: 2,
    icon: Camera,
    title: "Document the Vehicle",
    description: "Take photos/videos of any existing damage before leaving the lot",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    step: 3,
    icon: Fuel,
    title: "Check Fuel Policy",
    description: "Know if it's full-to-full or prepaid fuel to avoid surprise charges",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    step: 4,
    icon: Car,
    title: "Test Before You Drive",
    description: "Check lights, wipers, mirrors, and familiarize yourself with controls",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    step: 5,
    icon: CreditCard,
    title: "Understand the Hold",
    description: "A security deposit (typically $200-500) will be held on your card",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    step: 6,
    icon: Clock,
    title: "Note Return Time",
    description: "Return late? You may be charged for an extra day - plan accordingly",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
];

const CarPickupTips = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Pickup Tips</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Smooth Pickup Checklist
          </h2>
          <p className="text-muted-foreground">Follow these steps for a hassle-free experience</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.step}
                  className={cn(
                    "relative flex items-start gap-4 p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                    "transition-all duration-200 hover:border-emerald-500/30",
                    "animate-in fade-in slide-in-from-bottom-4"
                  )}
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                    {tip.step}
                  </div>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", tip.bg)}>
                    <Icon className={cn("w-6 h-6", tip.color)} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-lg">Pro Tip</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Arrive 15-20 minutes before your scheduled pickup time. This allows for paperwork 
              processing and vehicle inspection without feeling rushed. If you're running late, 
              call the rental office to avoid losing your reservation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarPickupTips;
