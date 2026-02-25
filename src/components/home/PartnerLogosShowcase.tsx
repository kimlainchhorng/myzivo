/**
 * Partner Logos Showcase - Trusted by section for homepage
 */
import { motion } from "framer-motion";

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
    <section className="py-12 sm:py-16 border-y border-border/30">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider font-medium"
        >
          Trusted by industry-leading partners
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 group"
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
