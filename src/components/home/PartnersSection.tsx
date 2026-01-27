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
    <section className="py-14 sm:py-20 relative overflow-hidden bg-muted/30 border-y border-border/50">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-30" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-teal-400/15 border border-primary/25 text-sm font-bold mb-5 shadow-lg shadow-primary/10"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-muted-foreground">Trusted Partners</span>
          </motion.div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold">
            Partnered with <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">leading brands</span> worldwide
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
