import { motion } from "framer-motion";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MobileServiceCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
  iconColor?: string;
  badge?: string;
  delay?: number;
}

const MobileServiceCard = ({
  icon: Icon,
  title,
  subtitle,
  href,
  gradient,
  iconColor = "text-white",
  badge,
  delay = 0
}: MobileServiceCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(href)}
      className="w-full p-4 rounded-2xl bg-card/80 border border-border/50 flex items-center gap-4 touch-manipulation active:bg-muted/50 transition-colors"
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
        gradient
      )}>
        <Icon className={cn("w-7 h-7", iconColor)} />
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-eats/20 text-eats rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.button>
  );
};

export default MobileServiceCard;
