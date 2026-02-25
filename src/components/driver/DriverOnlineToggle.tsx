import { motion } from "framer-motion";
import { Power, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface DriverOnlineToggleProps {
  isOnline: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  className?: string;
}

const DriverOnlineToggle = ({ isOnline, onToggle, isLoading, className }: DriverOnlineToggleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-5 rounded-2xl border transition-all duration-200",
        isOnline 
          ? "bg-green-500/10 border-green-500/30" 
          : "bg-white/5 border-white/10",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={isOnline ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: isOnline ? Infinity : 0 }}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isOnline ? "bg-green-500/20" : "bg-white/10"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : (
            <Power className={cn("w-6 h-6", isOnline ? "text-green-400" : "text-white/40")} />
          )}
        </motion.div>
        
        <div>
          <p className={cn(
            "font-bold text-lg",
            isOnline ? "text-green-400" : "text-white/60"
          )}>
            {isOnline ? "You're Online" : "You're Offline"}
          </p>
          <p className="text-sm text-white/40">
            {isOnline ? "Receiving ride requests" : "Go online to receive rides"}
          </p>
        </div>
      </div>

      <Switch
        checked={isOnline}
        onCheckedChange={onToggle}
        disabled={isLoading}
        className={cn(
          "data-[state=checked]:bg-green-500",
          "h-7 w-12"
        )}
      />
    </motion.div>
  );
};

export default DriverOnlineToggle;
