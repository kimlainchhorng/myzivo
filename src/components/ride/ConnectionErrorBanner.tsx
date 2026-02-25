import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { SupabaseErrorInfo } from "@/lib/supabaseErrors";

interface ConnectionErrorBannerProps {
  error: SupabaseErrorInfo;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

const ConnectionErrorBanner = ({
  error,
  onRetry,
  isRetrying = false,
  className = "",
}: ConnectionErrorBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-destructive/90 backdrop-blur-sm px-4 py-3 ${className}`}
    >
      <div className="flex items-center justify-between text-sm text-white max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>{error.userMessage}</span>
        </div>
        {onRetry && error.isRetryable && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 active:scale-[0.95] rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1 disabled:opacity-50 touch-manipulation"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Retrying...
              </>
            ) : (
              "Retry"
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ConnectionErrorBanner;
