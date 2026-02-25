/**
 * Partner Logos - Animated marquee strip with dividers
 */
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const partners = [
  { name: "Duffel", category: "Flights" },
  { name: "Booking.com", category: "Hotels" },
  { name: "RateHawk", category: "Hotels" },
  { name: "EconomyBookings", category: "Cars" },
  { name: "Stripe", category: "Payments" },
  { name: "Google Maps", category: "Maps" },
];

export default function PartnerLogosShowcase() {
  return (
    <section className="py-10 sm:py-14 bg-muted/30 border-y border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Trusted by leading travel partners
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex items-center gap-3 group"
            >
              {i > 0 && (
                <div className="hidden md:block w-px h-6 bg-border/50" />
              )}
              <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors cursor-default">
                <span className="text-sm sm:text-base font-semibold text-muted-foreground/60 group-hover:text-foreground transition-colors">
                  {partner.name}
                </span>
                <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
                  {partner.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
