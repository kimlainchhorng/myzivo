import { Car, Plane, Hotel, Utensils, Shield, Clock, Award, Headphones } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "100% Secure",
    description: "Bank-level encryption protects every transaction",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Book anytime, anywhere in the world",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  {
    icon: Award,
    title: "Compare & Save",
    description: "Search across trusted travel partners",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Real humans ready to help instantly",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
];

const HeroValueProposition = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Why Choose ZIVO
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Travel Made <span className="text-primary">Effortless</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience seamless booking with industry-leading technology and world-class service
          </p>
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`w-14 h-14 rounded-xl ${value.bgColor} flex items-center justify-center mb-4 relative`}>
                  <Icon className={`w-7 h-7 ${value.color}`} />
                </div>
                
                <h3 className="font-semibold text-lg mb-2 relative">{value.title}</h3>
                <p className="text-sm text-muted-foreground relative">{value.description}</p>
              </div>
            );
          })}
        </div>

        {/* Service Icons Row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { icon: Car, label: "Rides", count: "10M+" },
            { icon: Utensils, label: "Orders", count: "50M+" },
            { icon: Plane, label: "Flights", count: "5M+" },
            { icon: Hotel, label: "Stays", count: "2M+" },
          ].map((service, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                <service.icon className="w-8 h-8 text-primary" />
              </div>
              <span className="text-2xl font-bold">{service.count}</span>
              <span className="text-sm text-muted-foreground">{service.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroValueProposition;
