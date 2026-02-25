import { motion, AnimatePresence } from "framer-motion";
import { Car, Check, Navigation, X } from "lucide-react";
import { RideStatus } from "@/types/rideTypes";

interface RideStatusBannerProps {
  status: RideStatus;
  message: string;
  subMessage?: string;
  isVisible: boolean;
  onDismiss?: () => void;
  persistent?: boolean;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  assigned: Car,
  arrived: Check,
  in_trip: Navigation,
  completed: Check,
};

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-primary",
  arrived: "bg-green-500",
  in_trip: "bg-blue-500",
  completed: "bg-green-500",
};

const RideStatusBanner = ({
  status,
  message,
  subMessage,
  isVisible,
  onDismiss,
  persistent = false,
}: RideStatusBannerProps) => {
  const Icon = STATUS_ICONS[status] || Car;
  const bgColor = STATUS_COLORS[status] || "bg-primary";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`fixed top-0 left-0 right-0 z-50 ${bgColor} text-white safe-top`}
        >
          <div className="flex items-center justify-between px-4 py-3 pt-safe">
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, delay: 0.1 }}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <div>
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-semibold"
                >
                  {message}
                </motion.p>
                {subMessage && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-white/80"
                  >
                    {subMessage}
                  </motion.p>
                )}
              </div>
            </div>
            {!persistent && onDismiss && (
              <button
                onClick={onDismiss}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:scale-90 transition-all duration-200 touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RideStatusBanner;
