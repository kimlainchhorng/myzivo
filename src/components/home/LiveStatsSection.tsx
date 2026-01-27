import { motion } from "framer-motion";
import { Users, UtensilsCrossed, Star, Clock, Sparkles } from "lucide-react";
import { StatCard } from "@/components/ui/premium-card";

const LiveStatsSection = () => {
  return (
    <section className="py-14 lg:py-24 border-y border-border/40 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-eats/8" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-radial from-eats/10 to-transparent rounded-full blur-3xl" />
      
      {/* Floating emojis */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-20 left-[8%] text-4xl hidden lg:block opacity-40"
      >
        📈
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-20 right-[10%] text-4xl hidden lg:block opacity-30"
      >
        🌍
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-teal-400/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-muted-foreground">Live Platform Stats</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </motion.div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                millions
              </span>
              {" "}worldwide
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <StatCard
                value="2.5M+"
                label="Active riders"
                icon={<Users className="w-5 h-5" />}
                trend={{ value: "12%", positive: true }}
                color="rides"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <StatCard
                value="50K+"
                label="Partner restaurants"
                icon={<UtensilsCrossed className="w-5 h-5" />}
                trend={{ value: "8%", positive: true }}
                color="eats"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <StatCard
                value="4.9★"
                label="Average rating"
                icon={<Star className="w-5 h-5" />}
                trend={{ value: "0.2", positive: true }}
                color="amber"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <StatCard
                value="< 5 min"
                label="Avg. pickup time"
                icon={<Clock className="w-5 h-5" />}
                trend={{ value: "15%", positive: true }}
                color="primary"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveStatsSection;
