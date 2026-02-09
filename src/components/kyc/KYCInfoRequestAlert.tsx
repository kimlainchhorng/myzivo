/**
 * KYC Info Request Alert Component
 * Displays admin's request for more information
 */

import { motion } from "framer-motion";
import { AlertTriangle, MessageSquare, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface KYCInfoRequestAlertProps {
  message: string;
  requestedAt: string;
  className?: string;
}

export function KYCInfoRequestAlert({
  message,
  requestedAt,
  className,
}: KYCInfoRequestAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Alert variant="destructive" className="border-orange-500/30 bg-orange-500/10">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertTitle className="text-orange-600 font-semibold">
          Action Required
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <p className="text-foreground">{message}</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              Requested on {format(new Date(requestedAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}

export default KYCInfoRequestAlert;
