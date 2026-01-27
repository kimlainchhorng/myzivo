import { motion } from "framer-motion";
import { MapPin, Search, Car, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: 1,
    title: "Set Location",
    description: "Enter your pickup location or let us detect it automatically",
    icon: MapPin,
    gradient: "from-primary to-teal-400",
    glow: "shadow-primary/30",
  },
  {
    step: 2,
    title: "Choose Service",
    description: "Select from rides, food delivery, flights, hotels, and more",
    icon: Search,
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
  },
  {
    step: 3,
    title: "Book & Track",
    description: "Confirm your booking and track everything in real-time",
    icon: Car,
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
  },
  {
    step: 4,
    title: "Enjoy & Rate",
    description: "Complete your trip and share your experience",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-muted/30 via-muted/10 to-background">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-radial from-primary/12 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/12 to-teal-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-violet-500/12 to-purple-500/8 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-radial from-sky-500/8 to-transparent rounded-full blur-3xl" />

      {/* Floating emojis */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-40 left-[8%] text-5xl hidden lg:block opacity-40"
      >
        📍
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-32 right-[10%] text-4xl hidden lg:block opacity-35"
      >
        ✅
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-1/2 right-[5%] text-4xl hidden lg:block opacity-25"
      >
        🎯
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-teal-400/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10"
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-muted-foreground">Simple Process</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            How it{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get started in just a few <span className="text-foreground font-medium">simple steps</span>
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative"
        >
          {/* Connection Line (desktop only) - Enhanced */}
          <div className="hidden lg:block absolute top-20 left-[15%] right-[15%] h-1">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-violet-500 via-sky-500 to-emerald-500 opacity-20 rounded-full" />
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-to-r from-primary via-violet-500 via-sky-500 to-emerald-500 opacity-60 rounded-full origin-left"
            />
          </div>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={itemVariants}
              className="relative group"
            >
              <motion.div 
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-center h-full overflow-hidden"
              >
                {/* Background glow on hover */}
                <div className={cn(
                  "absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                  step.gradient
                )} />
                
                {/* Step Number Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  className="relative mb-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={cn(
                      "w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl relative overflow-hidden",
                      step.gradient,
                      step.glow
                    )}
                  >
                    <step.icon className="w-9 h-9 sm:w-10 sm:h-10 text-white relative z-10" />
                    {/* Shine effect */}
                    <motion.div
                      initial={{ x: "-100%", opacity: 0 }}
                      whileHover={{ x: "200%", opacity: 0.3 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
                    />
                  </motion.div>
                  <motion.span 
                    whileHover={{ scale: 1.2 }}
                    className={cn(
                      "absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shadow-lg",
                      step.gradient
                    )}
                  >
                    {step.step}
                  </motion.span>
                </motion.div>

                <h3 className="font-display text-xl sm:text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
