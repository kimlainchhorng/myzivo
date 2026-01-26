import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Users,
  Phone,
  BadgeCheck,
  FileCheck,
  Clock,
  MapPin,
  Heart,
} from "lucide-react";

const trustFeatures = [
  {
    icon: BadgeCheck,
    title: "Verified Drivers",
    description: "Every driver passes strict background checks and vehicle inspections",
  },
  {
    icon: MapPin,
    title: "Real-time Tracking",
    description: "Share your trip with loved ones and track every journey live",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Our safety team is available around the clock for emergencies",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Bank-grade encryption protects every transaction",
  },
  {
    icon: FileCheck,
    title: "Insurance Coverage",
    description: "Every ride and delivery is covered by comprehensive insurance",
  },
  {
    icon: Eye,
    title: "Privacy Protected",
    description: "Your personal data is never sold and always encrypted",
  },
];

const partnerLogos = [
  { name: "Forbes", logo: "Forbes" },
  { name: "TechCrunch", logo: "TechCrunch" },
  { name: "Wired", logo: "WIRED" },
  { name: "Bloomberg", logo: "Bloomberg" },
  { name: "Reuters", logo: "Reuters" },
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

const TrustSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-32 relative overflow-hidden bg-muted/20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rides/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rides" />
            <span className="text-muted-foreground">Safety & Trust</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
            Your safety is our <span className="text-gradient-rides">priority</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Industry-leading safety features and support to protect every journey
          </p>
        </motion.div>

        {/* Trust Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16"
        >
          {trustFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="glass-card p-5 sm:p-6 hover:border-rides/30 active:scale-[0.98] transition-all duration-300 group touch-manipulation"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gradient-rides flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div>
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-rides mb-0.5 sm:mb-1">99.9%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Safe Trips</p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-rides mb-0.5 sm:mb-1">2M+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Background Checks</p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-rides mb-0.5 sm:mb-1">&lt;2 min</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Support Response</p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-rides mb-0.5 sm:mb-1">500K+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Reviews Daily</p>
            </div>
          </div>
        </motion.div>

        {/* Press Mentions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">As featured in</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-12">
            {partnerLogos.map((partner) => (
              <div
                key={partner.name}
                className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                {partner.logo}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
