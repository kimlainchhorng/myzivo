/**
 * Partner Logos Showcase - Premium trusted-by section with glassmorphism
 */
import { motion } from "framer-motion";
import { Handshake } from "lucide-react";

const partners = [
  { name: "Duffel", logo: "✈️" },
  { name: "Booking.com", logo: "🏨" },
  { name: "RateHawk", logo: "🌐" },
  { name: "Stripe", logo: "💳" },
  { name: "TravelFusion", logo: "🔗" },
  { name: "Google Maps", logo: "🗺️" },
];

export default function PartnerLogosShowcase() {
  return (
    <section className="py-14 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 mb-3">
            <Handshake className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trusted Partners</span>
          </div>
        </motion.div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 hover:bg-card/80 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">{partner.logo}</span>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{partner.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
