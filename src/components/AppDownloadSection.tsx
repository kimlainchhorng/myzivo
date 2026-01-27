import { Apple, Smartphone, Download, Star, Shield, Zap, Sparkles, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const appFeatures = [
  { icon: Zap, label: "Lightning fast", gradient: "from-amber-500 to-orange-500" },
  { icon: Shield, label: "Secure payments", gradient: "from-emerald-500 to-green-500" },
  { icon: Star, label: "4.9★ rated", gradient: "from-violet-500 to-purple-500" },
];

const stats = [
  { value: "10M+", label: "Downloads", icon: Download },
  { value: "195", label: "Countries", icon: Globe },
  { value: "4.9", label: "Rating", icon: Star },
];

const AppDownloadSection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-transparent to-transparent" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/10 to-teal-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-12 lg:p-20 rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-primary/10 to-teal-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-tr from-eats/10 to-orange-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-eats/20 text-primary border-primary/30 px-4 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Available now
              </Badge>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground"
            >
              Get the{" "}
              <span className="bg-gradient-to-r from-primary to-eats bg-clip-text text-transparent">ZIVO</span>{" "}
              app
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 px-4"
            >
              Download the app and start riding in minutes. Available on iOS and Android.
            </motion.p>

            {/* Features */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10"
            >
              {appFeatures.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/50 border border-border/50"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    feature.gradient
                  )}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Download Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-12"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="gap-3 h-16 px-8 text-base rounded-2xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-xl shadow-primary/30 hover:opacity-90">
                  <Apple className="w-7 h-7" />
                  <div className="text-left">
                    <p className="text-xs opacity-80">Download on the</p>
                    <p className="font-bold text-lg">App Store</p>
                  </div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="gap-3 h-16 px-8 text-base rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-xl shadow-emerald-500/30 hover:opacity-90">
                  <Smartphone className="w-7 h-7" />
                  <div className="text-left">
                    <p className="text-xs opacity-80">Get it on</p>
                    <p className="font-bold text-lg">Google Play</p>
                  </div>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* QR Code - Hidden on mobile */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="hidden sm:inline-block"
            >
              <div className="p-5 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 shadow-xl">
                <div className="w-32 h-32 sm:w-36 sm:h-36 bg-foreground rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-5 gap-1 p-2">
                    {[...Array(25)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                          [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i) 
                            ? 'bg-background' 
                            : 'bg-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  {/* ZIVO logo in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
                      <span className="font-display font-bold text-base text-white">Z</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 font-medium">Scan to download</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
