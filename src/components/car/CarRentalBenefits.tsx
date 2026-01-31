import { Shield, Clock, MapPin, CreditCard, Headphones, RefreshCcw, Car, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: Shield,
    title: "Full Insurance",
    description: "Comprehensive coverage included with every rental",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Clock,
    title: "24/7 Pickup",
    description: "Flexible pickup times at any hour",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MapPin,
    title: "1000+ Locations",
    description: "Pick up and drop off at convenient locations",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: CreditCard,
    title: "No Hidden Fees",
    description: "Transparent pricing with all costs upfront",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer assistance",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: RefreshCcw,
    title: "Free Cancellation",
    description: "Cancel up to 24h before pickup for free",
    color: "from-teal-500 to-cyan-500",
  },
];

const CarRentalBenefits = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10" />
      <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-gradient-radial from-violet-500/15 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Hero */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold mb-6 shadow-lg shadow-violet-500/30">
              <Sparkles className="w-4 h-4" />
              Why Choose Us
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              The Best Way to
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Rent a Car</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Experience hassle-free car rental with premium vehicles, transparent pricing, and exceptional service.
            </p>

            <div className="relative h-48 sm:h-64 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
              <div className="text-8xl sm:text-9xl animate-bounce" style={{ animationDuration: '3s' }}>
                🚗
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <div className="flex-1 h-2 rounded-full bg-violet-500/50" />
                <div className="w-12 h-2 rounded-full bg-muted" />
                <div className="w-12 h-2 rounded-full bg-muted" />
              </div>
            </div>
          </div>

          {/* Right: Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className={cn(
                  "group relative p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "hover:border-violet-500/50 hover:-translate-y-1 transition-all duration-300",
                  "cursor-pointer touch-manipulation active:scale-[0.98]"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  "bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                  benefit.color
                )}>
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-violet-400 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarRentalBenefits;
