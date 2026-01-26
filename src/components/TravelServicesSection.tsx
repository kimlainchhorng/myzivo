import { Button } from "@/components/ui/button";
import { Plane, Hotel, Car, ChevronRight, Calendar, MapPin, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    id: "flights",
    icon: Plane,
    title: "ZIVO Flights",
    subtitle: "Book flights worldwide",
    description: "Compare prices from 100+ airlines. Find the best deals on domestic and international flights.",
    features: ["Price comparison", "Flexible dates", "24/7 support"],
    color: "sky",
    gradient: "from-sky-500 to-blue-600",
    route: "/flights",
    stats: { value: "1000+", label: "Routes" },
    image: "✈️",
  },
  {
    id: "hotels",
    icon: Hotel,
    title: "ZIVO Hotels",
    subtitle: "Stay anywhere",
    description: "From budget-friendly to luxury stays. Book hotels, apartments, and unique accommodations.",
    features: ["Best price guarantee", "Free cancellation", "Verified reviews"],
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    route: "/hotels",
    stats: { value: "25K+", label: "Properties" },
    image: "🏨",
  },
  {
    id: "car-rental",
    icon: Car,
    title: "ZIVO Car Rental",
    subtitle: "Drive your way",
    description: "Rent cars from trusted partners. From economy to luxury, we have the perfect ride for you.",
    features: ["No hidden fees", "Free modifications", "Roadside assistance"],
    color: "emerald",
    gradient: "from-emerald-500 to-green-600",
    route: "/car-rental",
    stats: { value: "500+", label: "Locations" },
    image: "🚗",
  },
];

const TravelServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="travel" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium mb-6">
            <Plane className="w-4 h-4 text-sky-500" />
            ZIVO Travel
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Your complete
            <br />
            <span className="bg-gradient-to-r from-sky-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
              travel companion
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Flights, hotels, and car rentals — all in one place. Plan your perfect trip with ZIVO.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="glass-card overflow-hidden hover:border-white/20 transition-all duration-500 group animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Header with Image */}
              <div className={`relative h-40 bg-gradient-to-br ${service.gradient} flex items-center justify-center overflow-hidden`}>
                <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                  {service.image}
                </span>
                {/* Stats badge */}
                <div className="absolute bottom-4 right-4 glass-card px-3 py-1.5 rounded-full">
                  <span className="font-bold text-foreground">{service.stats.value}</span>
                  <span className="text-muted-foreground text-sm ml-1">{service.stats.label}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center`}>
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.subtitle}</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{service.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${service.gradient}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-muted transition-colors"
                  onClick={() => navigate(service.route)}
                >
                  Explore {service.title.split(" ")[1]}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card inline-flex items-center gap-4 px-6 py-4 rounded-2xl">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-lg">✈️</div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg">🏨</div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-lg">🚗</div>
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Bundle & Save</p>
              <p className="text-sm text-muted-foreground">Book flight + hotel together and save up to 30%</p>
            </div>
            <Button variant="hero" size="sm">
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelServicesSection;
