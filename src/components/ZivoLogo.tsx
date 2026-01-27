import zivoLogo from "@/assets/zivo-logo.png";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ZivoLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: "h-8",
  md: "h-10 sm:h-12",
  lg: "h-16 sm:h-20",
  xl: "h-24 sm:h-28",
};

const ZivoLogo = ({ size = "md", showText = true, className, animate = true }: ZivoLogoProps) => {
  if (!animate) {
    return (
      <img 
        src={zivoLogo} 
        alt="ZIVO" 
        className={cn(
          sizeClasses[size],
          "w-auto object-contain",
          className
        )}
      />
    );
  }

  return (
    <motion.div
      className="relative inline-flex items-center"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0"
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.img 
        src={zivoLogo} 
        alt="ZIVO" 
        className={cn(
          sizeClasses[size],
          "w-auto object-contain relative z-10 drop-shadow-lg",
          "transition-all duration-300",
          className
        )}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.div>
  );
};

export default ZivoLogo;
