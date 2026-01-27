import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const partners = [
  { name: "Delta Airlines", logo: "✈️" },
  { name: "Marriott", logo: "🏨" },
  { name: "Enterprise", logo: "🚗" },
  { name: "Uber Eats", logo: "🍔" },
  { name: "Hilton", logo: "🏢" },
  { name: "American Airlines", logo: "🛫" },
  { name: "Budget", logo: "🚙" },
  { name: "DoorDash", logo: "🥡" },
];

const PartnersSection = () => {
  return (
    <section className="py-12 sm:py-16 relative overflow-hidden bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-teal-400/10 border border-primary/20 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Trusted Partners</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-muted-foreground">
            Partnered with leading brands worldwide
          </h3>
        </motion.div>

        {/* Scrolling Partners */}
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          
          {/* Scrolling container */}
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop" 
            }}
            className="flex gap-8"
          >
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-br from-card/80 to-card border border-border/50 shadow-lg hover:shadow-xl transition-all"
              >
                <span className="text-3xl">{partner.logo}</span>
                <span className="font-semibold text-muted-foreground whitespace-nowrap">
                  {partner.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
