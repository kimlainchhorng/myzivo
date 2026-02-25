import { motion } from "framer-motion";
import { Car, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoDriversAvailableProps {
  onRetry: () => void;
  onCancel: () => void;
  isRetrying?: boolean;
}

export function NoDriversAvailable({ onRetry, onCancel, isRetrying }: NoDriversAvailableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center hover:border-amber-500/50 hover:shadow-md transition-all duration-200"
    >
      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
        <Car className="w-8 h-8 text-amber-500" />
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2">
        No drivers available right now
      </h3>
      
      <p className="text-sm text-white/60 mb-6">
        All drivers are currently busy or offline. Please try again in a few minutes.
      </p>
      
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          className="bg-primary"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
