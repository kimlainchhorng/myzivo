import { Car, UtensilsCrossed, Shield, Clock, CreditCard, Star, Smartphone, MapPin } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Instant Pickup",
    description: "Average wait time under 5 minutes with drivers always nearby",
    color: "rides" as const,
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Real-time tracking, verified drivers, and 24/7 support",
    color: "rides" as const,
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Apple Pay, Google Pay, cards, and cashless convenience",
    color: "rides" as const,
  },
  {
    icon: UtensilsCrossed,
    title: "1000+ Restaurants",
    description: "From local favorites to top-rated cuisine delivered fast",
    color: "eats" as const,
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Watch your ride or food in real-time on the map",
    color: "eats" as const,
  },
  {
    icon: Star,
    title: "Top Rated",
    description: "4.9★ average with millions of happy customers",
    color: "eats" as const,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Why choose <span className="text-gradient-rides">ZIVO</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The all-in-one platform for rides, deliveries, and everything in between
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 lg:p-8 hover:border-white/20 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color === 'rides' ? 'gradient-rides' : 'gradient-eats'} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color === 'rides' ? 'text-primary-foreground' : 'text-secondary-foreground'}`} />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
