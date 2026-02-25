import { useNavigate } from "react-router-dom";
import { Car, Plane, Hotel, UtensilsCrossed, Package, CarFront, Ticket, Shield, TrendingUp, Star, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    id: "rides",
    title: "Rides",
    description: "Get there fast with reliable drivers",
    icon: Car,
    href: "/ride",
    color: "from-primary to-teal-400",
    stats: { bookings: "2.5M+", rating: 4.9 },
    popular: true,
  },
  {
    id: "food",
    title: "Food Delivery",
    description: "Your favorite restaurants, delivered",
    icon: UtensilsCrossed,
    href: "/food",
    color: "from-eats to-orange-400",
    stats: { bookings: "1.8M+", rating: 4.8 },
    popular: true,
  },
  {
    id: "flights",
    title: "Flights",
    description: "Compare & save on 500+ airlines",
    icon: Plane,
    href: "/book-flight",
    color: "from-sky-400 to-blue-500",
    stats: { bookings: "850K+", rating: 4.7 },
    popular: true,
  },
  {
    id: "hotels",
    title: "Hotels",
    description: "Best rates on 2M+ properties",
    icon: Hotel,
    href: "/book-hotel",
    color: "from-amber-400 to-orange-500",
    stats: { bookings: "1.2M+", rating: 4.8 },
    popular: false,
  },
  {
    id: "cars",
    title: "Car Rentals",
    description: "Drive your way, any destination",
    icon: CarFront,
    href: "/rent-car",
    color: "from-emerald-400 to-green-500",
    stats: { bookings: "450K+", rating: 4.6 },
    popular: false,
  },
  {
    id: "delivery",
    title: "Package Delivery",
    description: "Send anything, anywhere fast",
    icon: Package,
    href: "/package-delivery",
    color: "from-violet-400 to-purple-500",
    stats: { bookings: "320K+", rating: 4.7 },
    popular: false,
  },
];

const PopularServicesShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Most Popular</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Explore Our Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for your journey, all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            
            return (
              <button
                key={service.id}
                onClick={() => navigate(service.href)}
                className={cn(
                  "group relative p-6 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "text-left transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                  "touch-manipulation active:scale-[0.98]",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {service.popular && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-teal-400 text-xs font-bold text-white">
                    Popular
                  </div>
                )}

                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                  "bg-gradient-to-br", service.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-all duration-200">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{service.stats.bookings}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{service.stats.rating}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularServicesShowcase;
