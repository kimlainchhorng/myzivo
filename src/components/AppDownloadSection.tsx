import { Apple, Smartphone, Download, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const appFeatures = [
  { icon: Zap, label: "Lightning fast" },
  { icon: Shield, label: "Secure payments" },
  { icon: Star, label: "4.9★ rated" },
];

const AppDownloadSection = () => {
  return (
    <section className="py-12 sm:py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-8 lg:p-16 rounded-2xl sm:rounded-3xl text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-rides/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-eats/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 text-rides" />
              <span className="text-muted-foreground">Available now</span>
            </motion.div>

            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
              Get the <span className="text-gradient-rides">ZIVO</span> app
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Download the app and start riding in minutes. Available on iOS and Android.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
              {appFeatures.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base"
                >
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-rides" />
                  <span>{feature.label}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Button variant="hero" size="lg" className="gap-2 sm:gap-3 h-14 sm:h-auto text-sm sm:text-base">
                <Apple className="w-5 h-5 sm:w-6 sm:h-6" />
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs opacity-80">Download on the</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </Button>
              <Button variant="hero" size="lg" className="gap-2 sm:gap-3 h-14 sm:h-auto text-sm sm:text-base">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs opacity-80">Get it on</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </Button>
            </div>

            {/* QR Code - Hidden on mobile */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="hidden sm:inline-block"
            >
              <div className="glass-card p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-foreground rounded-lg sm:rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-5 gap-0.5 sm:gap-1 p-1.5 sm:p-2">
                    {[...Array(25)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${
                          [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i) 
                            ? 'bg-background' 
                            : 'bg-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  {/* ZIVO logo in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg gradient-rides flex items-center justify-center">
                      <span className="font-display font-bold text-[10px] sm:text-xs text-primary-foreground">Z</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">Scan to download</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
