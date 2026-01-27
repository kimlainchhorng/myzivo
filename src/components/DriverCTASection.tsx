import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, DollarSign, Clock, Shield, ChevronRight, Calendar, Sparkles, TrendingUp, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn on your schedule",
    description: "Make money when you want. No minimums, no commitments.",
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/30",
  },
  {
    icon: Clock,
    title: "Instant payouts",
    description: "Cash out your earnings anytime, up to 5x per day.",
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
  },
  {
    icon: Shield,
    title: "Insurance included",
    description: "Covered from pickup to dropoff with every trip.",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
  },
  {
    icon: Calendar,
    title: "Flexible hours",
    description: "Drive or deliver whenever it works for you.",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/30",
  },
];

const stats = [
  { value: "$28", label: "Avg. hourly", icon: TrendingUp },
  { value: "50K+", label: "Drivers", icon: Users },
  { value: "5x", label: "Cashouts", icon: Zap },
];

const DriverCTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="driver" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-eats/10" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-teal-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-10 lg:p-16 rounded-[2.5rem] bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-2xl overflow-hidden relative"
        >
          {/* Decorative corner glows */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary to-teal-400 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-eats to-orange-500 rounded-full blur-3xl opacity-15" />
          
          {/* Animated floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-10 right-10 text-4xl hidden lg:block opacity-40"
          >
            🚗
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute bottom-20 right-1/4 text-3xl hidden lg:block opacity-30"
          >
            💰
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-teal-400/20 text-primary border-primary/30 px-5 py-2.5 text-sm font-bold shadow-lg shadow-primary/20">
                  <Car className="w-4 h-4 mr-2" />
                  Drive with ZIVO
                </Badge>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight"
              >
                Turn your car into a
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent"> money machine</span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed"
              >
                Join thousands of drivers earning on their own terms. Whether you drive full-time or just a few hours a week, <span className="text-foreground font-medium">ZIVO puts you in control</span>.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/drive")} 
                    className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:opacity-90 gap-2"
                  >
                    Start driving
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl border-2 gap-2"
                >
                  <Sparkles className="w-5 h-5 text-eats" />
                  Deliver with ZIVO Eats
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-6 sm:gap-10 mt-10 pt-10 border-t border-border"
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-center sm:text-left"
                  >
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <stat.icon className="w-5 h-5 text-primary hidden sm:block" />
                      <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right - Benefits */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/40 hover:from-muted/80 hover:to-muted/60 border border-border/50 hover:border-primary/40 transition-all group cursor-default shadow-lg hover:shadow-xl overflow-hidden relative"
                >
                  {/* Decorative glow on hover */}
                  <div className={cn(
                    "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
                    `bg-gradient-to-br ${benefit.gradient}`
                  )} />
                  
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-xl relative",
                      benefit.gradient,
                      benefit.glow
                    )}
                  >
                    <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                  <h3 className="font-display text-base sm:text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors relative">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed relative">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DriverCTASection;
