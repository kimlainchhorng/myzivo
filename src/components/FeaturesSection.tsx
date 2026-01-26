import { Car, UtensilsCrossed, Shield, Clock, CreditCard, Star, MapPin, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Clock,
    title: "Instant Pickup",
    description: "Average wait time under 5 minutes with drivers always nearby",
    color: "rides" as const,
    stat: "< 5 min",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Real-time tracking, verified drivers, and 24/7 support",
    color: "rides" as const,
    stat: "100%",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Apple Pay, Google Pay, cards, and cashless convenience",
    color: "rides" as const,
    stat: "10+",
  },
  {
    icon: UtensilsCrossed,
    title: "1000+ Restaurants",
    description: "From local favorites to top-rated cuisine delivered fast",
    color: "eats" as const,
    stat: "1000+",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Watch your ride or food in real-time on the map",
    color: "eats" as const,
    stat: "Real-time",
  },
  {
    icon: Star,
    title: "Top Rated",
    description: "4.9★ average with millions of happy customers",
    color: "eats" as const,
    stat: "4.9★",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const FeaturesSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rides" />
            <span className="text-muted-foreground">Why ZIVO?</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
            Built for <span className="text-gradient-rides">speed</span> and <span className="text-gradient-eats">convenience</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            The all-in-one platform for rides, deliveries, and everything in between
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="glass-card p-5 sm:p-6 lg:p-8 hover:border-white/20 active:scale-[0.98] transition-all duration-300 group relative overflow-hidden touch-manipulation"
            >
              {/* Stat badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xs font-bold text-muted-foreground/50">
                {feature.stat}
              </div>

              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${feature.color === 'rides' ? 'gradient-rides' : 'gradient-eats'} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.color === 'rides' ? 'text-primary-foreground' : 'text-secondary-foreground'}`} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 ${feature.color === 'rides' ? 'bg-rides/5' : 'bg-eats/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
