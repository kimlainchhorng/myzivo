import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Car, UtensilsCrossed, Plane, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  id: string;
  type: "ride" | "food" | "flight" | "success";
  title: string;
  message: string;
  onClose: (id: string) => void;
}

const iconMap = {
  ride: Car,
  food: UtensilsCrossed,
  flight: Plane,
  success: CheckCircle2,
};

const gradientMap = {
  ride: "from-primary to-teal-400",
  food: "from-eats to-orange-500",
  flight: "from-sky-500 to-blue-500",
  success: "from-emerald-500 to-green-500",
};

const NotificationToast = ({ id, type, title, message, onClose }: NotificationProps) => {
  const Icon = iconMap[type];
  const gradient = gradientMap[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative p-4 rounded-2xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-2xl backdrop-blur-xl max-w-sm overflow-hidden"
    >
      {/* Background glow */}
      <div className={cn(
        "absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br rounded-full blur-2xl opacity-30",
        gradient
      )} />

      <div className="relative flex items-start gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0",
            gradient
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onClose(id)}
          className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NotificationToast;
