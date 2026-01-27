import { motion } from "framer-motion";
import { Users, UtensilsCrossed, Star, Clock, Sparkles } from "lucide-react";
import { StatCard } from "@/components/ui/premium-card";

const LiveStatsSection = () => {
  return (
    <section className="py-12 lg:py-20 border-y border-border/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-eats/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-teal-400/15 border border-primary/25 text-sm font-bold mb-5 shadow-lg shadow-primary/10"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-muted-foreground">Live Platform Stats</span>
            </motion.div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
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
