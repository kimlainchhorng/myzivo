import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Car, UtensilsCrossed, Plane, Hotel, CarFront, Package, 
  Train, Ticket, Shield, ArrowRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
};

const services = [
  { id: "rides", icon: Car, title: "Rides", desc: "Get there fast", href: "/ride", color: "gradient-rides", shadowColor: "shadow-primary/30" },
  { id: "eats", icon: UtensilsCrossed, title: "Eats", desc: "Food delivered", href: "/food", color: "gradient-eats", shadowColor: "shadow-eats/30" },
  { id: "flights", icon: Plane, title: "Flights", desc: "500+ destinations", href: "/book-flight", color: "bg-gradient-to-br from-sky-500 to-sky-600", shadowColor: "shadow-sky-500/30" },
  { id: "hotels", icon: Hotel, title: "Hotels", desc: "Best rates", href: "/book-hotel", color: "bg-gradient-to-br from-amber-500 to-amber-600", shadowColor: "shadow-amber-500/30" },
  { id: "cars", icon: CarFront, title: "Car Rental", desc: "Drive anywhere", href: "/rent-car", color: "bg-gradient-to-br from-violet-500 to-violet-600", shadowColor: "shadow-violet-500/30" },
  { id: "package", icon: Package, title: "Package", desc: "Same-day delivery", href: "/package-delivery", color: "bg-gradient-to-br from-emerald-500 to-emerald-600", shadowColor: "shadow-emerald-500/30", isNew: true },
  { id: "train", icon: Train, title: "Bus & Train", desc: "Intercity travel", href: "/ground-transport", color: "bg-gradient-to-br from-rose-500 to-rose-600", shadowColor: "shadow-rose-500/30", isNew: true },
  { id: "events", icon: Ticket, title: "Events", desc: "Concerts & sports", href: "/events", color: "bg-gradient-to-br from-pink-500 to-pink-600", shadowColor: "shadow-pink-500/30", isNew: true },
  { id: "insurance", icon: Shield, title: "Insurance", desc: "Travel protection", href: "/travel-insurance", color: "bg-gradient-to-br from-cyan-500 to-cyan-600", shadowColor: "shadow-cyan-500/30", isNew: true },
];

const AllServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-eats/5 opacity-40" />
      <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-eats/10 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">All-in-One Platform</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            Everything you need,{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              one app
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From daily commutes to dream vacations, ZIVO has you covered
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5"
        >
          {services.map((service) => (
            <motion.button
              key={service.id}
              variants={itemVariants}
              onClick={() => navigate(service.href)}
              className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group text-left overflow-hidden"
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {service.isNew && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-eats to-orange-500 text-white rounded-full shadow-lg"
                >
                  New
                </motion.span>
              )}
              <motion.div 
                whileHover={{ scale: 1.15, rotate: 8 }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${service.color} flex items-center justify-center mb-4 shadow-xl ${service.shadowColor} group-hover:scale-110 transition-transform duration-300`}
              >
                <service.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{service.desc}</p>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-14"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg" 
              className="h-14 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-2xl shadow-primary/40 gap-3" 
              onClick={() => navigate("/install")}
            >
              Download the ZIVO app
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AllServicesSection;
