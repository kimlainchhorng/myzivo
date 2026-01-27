import { Car, UtensilsCrossed, Shield, Clock, CreditCard, Star, MapPin, Zap, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Clock,
    title: "Instant Pickup",
    description: "Average wait time under 5 minutes with drivers always nearby",
    color: "rides" as const,
    stat: "< 5 min",
    gradient: "from-primary to-teal-400",
    glow: "shadow-primary/30",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Real-time tracking, verified drivers, and 24/7 support",
    color: "rides" as const,
    stat: "100%",
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/30",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Apple Pay, Google Pay, cards, and cashless convenience",
    color: "rides" as const,
    stat: "10+",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
  },
  {
    icon: UtensilsCrossed,
    title: "1000+ Restaurants",
    description: "From local favorites to top-rated cuisine delivered fast",
    color: "eats" as const,
    stat: "1000+",
    gradient: "from-eats to-orange-500",
    glow: "shadow-eats/30",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Watch your ride or food in real-time on the map",
    color: "eats" as const,
    stat: "Real-time",
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
  },
  {
    icon: Star,
    title: "Top Rated",
    description: "4.9★ average with millions of happy customers",
    color: "eats" as const,
    stat: "4.9★",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/30",
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const FeaturesSection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-violet-500/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-muted-foreground">Why ZIVO?</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 px-2">
            Built for{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">speed</span>
            {" "}and{" "}
            <span className="bg-gradient-to-r from-eats via-orange-500 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">convenience</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            The all-in-one platform for rides, deliveries, and everything in between
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative p-6 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-default"
            >
              {/* Background gradient on hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                `${feature.gradient.replace('from-', 'from-').replace('to-', 'to-')}/5`
              )} />
              
              {/* Corner glow */}
              <div className={cn(
                "absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
                feature.gradient
              )} />

              {/* Stat badge */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                <span className={cn(
                  "text-sm font-bold px-3 py-1 rounded-full bg-gradient-to-r text-white shadow-lg",
                  feature.gradient
                )}>
                  {feature.stat}
                </span>
              </div>

              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
                className={cn(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 sm:mb-6 shadow-lg",
                  feature.gradient,
                  feature.glow
                )}
              >
                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>
              
              <h3 className="font-display text-xl sm:text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Learn more link */}
              <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Learn more</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: "10M+", label: "Active Users", icon: Sparkles },
            { value: "195", label: "Cities", icon: MapPin },
            { value: "500K+", label: "Drivers", icon: Car },
            { value: "99.9%", label: "Uptime", icon: Shield },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
