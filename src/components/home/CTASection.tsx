import { motion } from "framer-motion";
import { ArrowRight, Download, Sparkles, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Zap, label: "Instant Booking" },
  { icon: Shield, label: "Secure Payments" },
  { icon: Star, label: "24/7 Support" },
];

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-eats/10" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-eats/20 to-orange-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative p-8 sm:p-12 lg:p-16 rounded-[3rem] bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-eats/10 to-transparent rounded-full blur-2xl" />
            
            <div className="relative text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-teal-400/20 text-primary border border-primary/30 text-sm font-semibold mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Join millions of users
              </motion.div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Ready to get{" "}
                <span className="bg-gradient-to-r from-primary to-eats bg-clip-text text-transparent">
                  started?
                </span>
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Download the ZIVO app and experience the future of mobility. 
                One app for rides, food, flights, hotels, and more.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50"
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={() => navigate("/signup")}
                    className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-xl shadow-primary/30 gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Get Started Free
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/install")}
                    className="h-14 px-8 text-lg font-bold rounded-xl border-2 gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download App
                  </Button>
                </motion.div>
              </div>

              {/* App Store Badges */}
              <div className="flex justify-center gap-4 mt-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-3 rounded-xl bg-foreground text-background flex items-center gap-3 cursor-pointer"
                >
                  <div className="text-2xl">🍎</div>
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">Download on the</p>
                    <p className="font-semibold text-sm">App Store</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-3 rounded-xl bg-foreground text-background flex items-center gap-3 cursor-pointer"
                >
                  <div className="text-2xl">▶️</div>
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">Get it on</p>
                    <p className="font-semibold text-sm">Google Play</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
