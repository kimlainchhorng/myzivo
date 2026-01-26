import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "rides",
    icon: Car,
    title: "Rides",
    description: "Get where you need to go with reliable drivers",
    href: "/ride",
    color: "rides",
    gradient: "gradient-rides",
    features: ["5-min pickup", "Live tracking", "24/7 support"],
    isNew: false,
  },
  {
    id: "eats",
    icon: UtensilsCrossed,
    title: "Eats",
    description: "Delicious food from 1000+ restaurants",
    href: "/food",
    color: "eats",
    gradient: "gradient-eats",
    features: ["30-min delivery", "1000+ restaurants", "Real-time tracking"],
    isNew: false,
  },
  {
    id: "flights",
    icon: Plane,
    title: "Flights",
    description: "Book flights to 500+ destinations worldwide",
    href: "/book-flight",
    color: "sky-500",
    gradient: "bg-gradient-to-br from-sky-500 to-sky-600",
    features: ["Best prices", "Flexible booking", "Instant confirmation"],
    isNew: false,
  },
  {
    id: "hotels",
    icon: Hotel,
    title: "Hotels",
    description: "Find your perfect stay at 25,000+ properties",
    href: "/book-hotel",
    color: "amber-500",
    gradient: "bg-gradient-to-br from-amber-500 to-amber-600",
    features: ["Free cancellation", "Best rate guarantee", "Verified reviews"],
    isNew: false,
  },
  {
    id: "car-rental",
    icon: Car,
    title: "Car Rental",
    description: "Rent vehicles for any occasion",
    href: "/rent-car",
    color: "primary",
    gradient: "bg-gradient-to-br from-primary to-accent",
    features: ["No hidden fees", "Flexible pickup", "Full insurance"],
    isNew: false,
  },
  {
    id: "package",
    icon: Package,
    title: "Package Delivery",
    description: "Send packages across the city fast",
    href: "/package-delivery",
    color: "emerald-500",
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    features: ["Same-day delivery", "Real-time tracking", "Secure handling"],
    isNew: true,
  },
  {
    id: "ground",
    icon: Train,
    title: "Bus & Train",
    description: "Book intercity ground transportation",
    href: "/ground-transport",
    color: "violet-500",
    gradient: "bg-gradient-to-br from-violet-500 to-violet-600",
    features: ["Compare routes", "E-tickets", "Flexible booking"],
    isNew: true,
  },
  {
    id: "events",
    icon: Ticket,
    title: "Events",
    description: "Tickets to concerts, sports & entertainment",
    href: "/events",
    color: "pink-500",
    gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
    features: ["Best seats", "Secure tickets", "Instant delivery"],
    isNew: true,
  },
  {
    id: "insurance",
    icon: Shield,
    title: "Travel Insurance",
    description: "Protect your trips with comprehensive coverage",
    href: "/travel-insurance",
    color: "cyan-500",
    gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    features: ["Medical coverage", "Trip cancellation", "24/7 assistance"],
    isNew: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const ServicesShowcase = () => {
  return (
    <section className="py-12 sm:py-20 lg:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-rides/5 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/2 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-eats/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-sky-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-rides" />
            <span className="text-muted-foreground">All-in-One Platform</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Everything you need, <span className="text-gradient-rides">one app</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            From daily commutes to dream vacations, ZIVO has you covered with 9 integrated
            services
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="group"
            >
              <Link to={service.href}>
                <div className="glass-card p-4 sm:p-6 h-full hover:border-white/20 transition-all duration-300 relative overflow-hidden active:scale-[0.98]">
                  {/* New Badge */}
                  {service.isNew && (
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-eats/10 text-eats">
                        New
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${service.gradient} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center text-xs sm:text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Hover Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-transparent to-${service.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Download the ZIVO app to access all services
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="hero" size="lg" className="gap-2">
              Download for iOS
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              Download for Android
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
