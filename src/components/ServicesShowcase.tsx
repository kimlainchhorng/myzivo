// CSS animations used instead of framer-motion for performance
import { Link } from "react-router-dom";
import {
  Car,
  UtensilsCrossed,
  Plane,
  Hotel,
  Package,
  Train,
  Ticket,
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    id: "rides",
    icon: Car,
    title: "Rides",
    description: "Get where you need to go with reliable drivers",
    href: "/ride",
    color: "rides",
    gradient: "from-primary to-teal-400",
    glow: "shadow-primary/30",
    features: ["5-min pickup", "Live tracking", "24/7 support"],
    isNew: false,
    isPremium: true,
  },
  {
    id: "eats",
    icon: UtensilsCrossed,
    title: "Eats",
    description: "Delicious food from 1000+ restaurants",
    href: "/food",
    color: "eats",
    gradient: "from-eats to-orange-500",
    glow: "shadow-eats/30",
    features: ["30-min delivery", "1000+ restaurants", "Real-time tracking"],
    isNew: false,
    isPremium: true,
  },
  {
    id: "flights",
    icon: Plane,
    title: "Flights",
    description: "Book flights to 500+ destinations worldwide",
    href: "/book-flight",
    color: "sky-500",
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
    features: ["Best prices", "Flexible booking", "Instant confirmation"],
    isNew: false,
    isPremium: false,
  },
  {
    id: "hotels",
    icon: Hotel,
    title: "Hotels",
    description: "Find your perfect stay at 25,000+ properties",
    href: "/book-hotel",
    color: "amber-500",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/30",
    features: ["Free cancellation", "Best rate guarantee", "Verified reviews"],
    isNew: false,
    isPremium: false,
  },
  {
    id: "car-rental",
    icon: Car,
    title: "Car Rental",
    description: "Rent vehicles for any occasion",
    href: "/rent-car",
    color: "primary",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
    features: ["No hidden fees", "Flexible pickup", "Full insurance"],
    isNew: false,
    isPremium: false,
  },
  {
    id: "package",
    icon: Package,
    title: "Package Delivery",
    description: "Send packages across the city fast",
    href: "/package-delivery",
    color: "emerald-500",
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/30",
    features: ["Same-day delivery", "Real-time tracking", "Secure handling"],
    isNew: true,
    isPremium: false,
  },
  {
    id: "ground",
    icon: Train,
    title: "Bus & Train",
    description: "Book intercity ground transportation",
    href: "/ground-transport",
    color: "violet-500",
    gradient: "from-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/30",
    features: ["Compare routes", "E-tickets", "Flexible booking"],
    isNew: true,
    isPremium: false,
  },
  {
    id: "events",
    icon: Ticket,
    title: "Events",
    description: "Tickets to concerts, sports & entertainment",
    href: "/events",
    color: "pink-500",
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/30",
    features: ["Best seats", "Secure tickets", "Instant delivery"],
    isNew: true,
    isPremium: false,
  },
  {
    id: "insurance",
    icon: Shield,
    title: "Travel Insurance",
    description: "Protect your trips with comprehensive coverage",
    href: "/travel-insurance",
    color: "cyan-500",
    gradient: "from-cyan-500 to-teal-500",
    glow: "shadow-cyan-500/30",
    features: ["Medical coverage", "Trip cancellation", "24/7 assistance"],
    isNew: true,
    isPremium: false,
  },
];

const ServicesShowcase = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-br from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[450px] h-[450px] bg-gradient-to-tl from-sky-500/15 to-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-violet-500/15 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />

      {/* Static floating icons - removed motion */}
      <div className="absolute top-40 left-[8%] text-4xl hidden lg:block opacity-40 animate-float">
        🚀
      </div>
      <div className="absolute bottom-48 right-[6%] text-4xl hidden lg:block opacity-30 animate-float-delayed">
        ✨
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10 animate-in fade-in zoom-in-95 duration-300">
            <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-muted-foreground">All-in-One Platform</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
            Everything you need,{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              one app
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From daily commutes to dream vacations, ZIVO has you covered with <span className="text-foreground font-medium">9 integrated services</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link to={service.href}>
                <div className="relative p-5 sm:p-6 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300 overflow-hidden hover:-translate-y-2 hover:scale-[1.01] active:scale-[0.98]">
                  {/* Decorative corner glow */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${service.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {service.isNew && (
                      <Badge className="bg-gradient-to-r from-eats to-orange-500 text-white border-0 text-xs font-semibold px-2.5 py-1">
                        <Zap className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    )}
                    {service.isPremium && (
                      <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-500 border-amber-500/30 text-xs font-semibold px-2.5 py-1">
                        <Star className="w-3 h-3 mr-1 fill-amber-500" />
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 shadow-lg ${service.glow} transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <service.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl sm:text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-all duration-200">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 sm:mt-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <p className="text-muted-foreground mb-6 text-lg">
            Download the ZIVO app to access all services
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:opacity-90 gap-2 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              Download for iOS
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 text-lg font-bold rounded-xl border-2 gap-2 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              Download for Android
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
