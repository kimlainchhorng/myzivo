import { motion } from "framer-motion";
import { Sparkles, Star, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const partners = [
  { name: "Delta Airlines", logo: "✈️", category: "Travel" },
  { name: "Marriott", logo: "🏨", category: "Hotels" },
  { name: "Enterprise", logo: "🚗", category: "Rentals" },
  { name: "Uber Eats", logo: "🍔", category: "Delivery" },
  { name: "Hilton", logo: "🏢", category: "Hotels" },
  { name: "American Airlines", logo: "🛫", category: "Travel" },
  { name: "Budget", logo: "🚙", category: "Rentals" },
  { name: "DoorDash", logo: "🥡", category: "Delivery" },
  { name: "United", logo: "🌍", category: "Travel" },
  { name: "Hyatt", logo: "✨", category: "Hotels" },
];

const trustBadges = [
  { icon: Shield, label: "Bank-level Security", gradient: "from-emerald-500 to-green-500" },
  { icon: Star, label: "4.9★ Rated App", gradient: "from-amber-500 to-orange-500" },
  { icon: CheckCircle2, label: "100M+ Downloads", gradient: "from-primary to-teal-400" },
];

const PartnersSection = () => {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-muted/40 via-muted/20 to-background border-y border-border/30">
      {/* Enhanced Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-violet-500/10 to-purple-500/5 rounded-full blur-3xl" />
      
      {/* Floating elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-24 right-[10%] text-4xl hidden lg:block opacity-30"
      >
        🤝
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-32 left-[8%] text-4xl hidden lg:block opacity-25"
      >
        🌟
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-teal-400/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-muted-foreground">Trusted Partners</span>
          </motion.div>
          <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Partnered with{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              industry leaders
            </span>
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Connecting you with the world's most trusted brands in travel, hospitality, and delivery
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-14"
        >
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                badge.gradient
              )}>
                <badge.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-sm">{badge.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Infinite Scrolling Partners */}
        <div className="relative overflow-hidden py-4">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          
          {/* First row - scrolling left */}
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ 
              duration: 40, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop" 
            }}
            className="flex gap-5 mb-5"
          >
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`row1-${index}`}
                whileHover={{ scale: 1.05, y: -4 }}
                className="flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all cursor-default group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{partner.logo}</span>
                <div>
                  <span className="font-bold text-foreground whitespace-nowrap block">
                    {partner.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{partner.category}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Second row - scrolling right */}
          <motion.div
            animate={{ x: [-1200, 0] }}
            transition={{ 
              duration: 45, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop" 
            }}
            className="flex gap-5"
          >
            {[...partners.slice().reverse(), ...partners.slice().reverse(), ...partners.slice().reverse()].map((partner, index) => (
              <motion.div
                key={`row2-${index}`}
                whileHover={{ scale: 1.05, y: -4 }}
                className="flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all cursor-default group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{partner.logo}</span>
                <div>
                  <span className="font-bold text-foreground whitespace-nowrap block">
                    {partner.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{partner.category}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
