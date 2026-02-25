/**
 * Partner Logos - Clean horizontal strip
 */
import { motion } from "framer-motion";

const partners = [
  { name: "Duffel" },
  { name: "Booking.com" },
  { name: "RateHawk" },
  { name: "Stripe" },
  { name: "TravelFusion" },
  { name: "Google Maps" },
];

export default function PartnerLogosShowcase() {
  return (
    <section className="py-10 sm:py-12 bg-muted/30 border-y border-border/30">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">Trusted by leading travel partners</p>
        
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {partners.map((partner, i) => (
            <motion.span
              key={partner.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="text-sm sm:text-base font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {partner.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
