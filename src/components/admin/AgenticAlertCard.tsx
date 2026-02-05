 /**
  * AgenticAlertCard - Proactive cards that surface issues before they become problems
  * Supports: pending_pnr, ticketing_delay, low_margin, supplier_degraded, payment_mismatch
  */
 import { motion } from "framer-motion";
 import { Link } from "react-router-dom";
 import { 
   AlertTriangle, 
   Clock, 
   DollarSign, 
   Activity, 
   CreditCard,
   ExternalLink,
   Phone,
   X
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Button } from "@/components/ui/button";
 import { formatDistanceToNow } from "date-fns";
 
 export type AlertType = 
   | "pending_pnr"
   | "ticketing_delay"
   | "low_margin"
   | "supplier_degraded"
   | "payment_mismatch";
 
 export type AlertPriority = "critical" | "high" | "medium" | "low";
 
 export interface AgenticAlert {
   id: string;
   type: AlertType;
   priority: AlertPriority;
   title: string;
   description: string;
   bookingRef?: string;
   bookingId?: string;
   supplierName?: string;
   amount?: number;
   createdAt: string;
 }
 
 interface AgenticAlertCardProps {
   alert: AgenticAlert;
   onDismiss?: (id: string) => void;
   onAction?: (id: string, action: string) => void;
   className?: string;
 }
 
 const alertConfig: Record<AlertType, {
   icon: React.ElementType;
   primaryAction: { label: string; action: string };
   secondaryAction?: { label: string; action: string };
 }> = {
   pending_pnr: {
     icon: Clock,
     primaryAction: { label: "View Booking", action: "view" },
     secondaryAction: { label: "Contact Supplier", action: "contact" },
   },
   ticketing_delay: {
     icon: AlertTriangle,
     primaryAction: { label: "Investigate", action: "investigate" },
     secondaryAction: { label: "Retry Ticketing", action: "retry" },
   },
   low_margin: {
     icon: DollarSign,
     primaryAction: { label: "View Details", action: "view" },
   },
   supplier_degraded: {
     icon: Activity,
     primaryAction: { label: "Check Status", action: "status" },
   },
   payment_mismatch: {
     icon: CreditCard,
     primaryAction: { label: "Review Payment", action: "review" },
     secondaryAction: { label: "Contact Support", action: "support" },
   },
 };
 
 const priorityConfig: Record<AlertPriority, {
   bgColor: string;
   borderColor: string;
   iconColor: string;
   label: string;
 }> = {
   critical: {
     bgColor: "bg-destructive/10",
     borderColor: "border-destructive/30",
     iconColor: "text-destructive",
     label: "CRITICAL",
   },
   high: {
     bgColor: "bg-amber-500/10",
     borderColor: "border-amber-500/30",
     iconColor: "text-amber-500",
     label: "HIGH",
   },
   medium: {
     bgColor: "bg-blue-500/10",
     borderColor: "border-blue-500/30",
     iconColor: "text-blue-500",
     label: "MEDIUM",
   },
   low: {
     bgColor: "bg-muted",
     borderColor: "border-border",
     iconColor: "text-muted-foreground",
     label: "LOW",
   },
 };
 
 export default function AgenticAlertCard({
   alert,
   onDismiss,
   onAction,
   className,
 }: AgenticAlertCardProps) {
   const typeConfig = alertConfig[alert.type];
   const prioConfig = priorityConfig[alert.priority];
   const Icon = typeConfig.icon;
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 10, scale: 0.98 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       exit={{ opacity: 0, y: -10, scale: 0.98 }}
       className={cn(
         "relative rounded-xl border p-4",
         prioConfig.bgColor,
         prioConfig.borderColor,
         className
       )}
     >
       {/* Priority label */}
       <div className="flex items-start justify-between mb-3">
         <div className="flex items-center gap-2">
           <span
             className={cn(
               "text-[10px] font-bold tracking-wider px-2 py-0.5 rounded",
               alert.priority === "critical" && "bg-destructive text-white",
               alert.priority === "high" && "bg-amber-500 text-white",
               alert.priority === "medium" && "bg-blue-500 text-white",
               alert.priority === "low" && "bg-muted-foreground text-white"
             )}
           >
             🔴 {prioConfig.label}
           </span>
           <span className="text-xs text-muted-foreground">
             {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
           </span>
         </div>
 
         {onDismiss && (
           <button
             onClick={() => onDismiss(alert.id)}
             className="p-1 rounded hover:bg-muted/50 transition-colors"
           >
             <X className="w-4 h-4 text-muted-foreground" />
           </button>
         )}
       </div>
 
       {/* Content */}
       <div className="flex items-start gap-3 mb-4">
         <div className={cn("p-2 rounded-lg", prioConfig.bgColor)}>
           <Icon className={cn("w-5 h-5", prioConfig.iconColor)} />
         </div>
         <div className="flex-1 min-w-0">
           <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
           <p className="text-xs text-muted-foreground">{alert.description}</p>
           {alert.bookingRef && (
             <p className="text-xs font-mono mt-1">
               Booking: {alert.bookingRef}
             </p>
           )}
         </div>
       </div>
 
       {/* Actions */}
       <div className="flex items-center gap-2">
         <Button
           size="sm"
           className="h-8"
           onClick={() => onAction?.(alert.id, typeConfig.primaryAction.action)}
         >
           {typeConfig.primaryAction.label}
           <ExternalLink className="w-3 h-3 ml-1" />
         </Button>
         {typeConfig.secondaryAction && (
           <Button
             variant="outline"
             size="sm"
             className="h-8"
             onClick={() => onAction?.(alert.id, typeConfig.secondaryAction!.action)}
           >
             {typeConfig.secondaryAction.action === "contact" && (
               <Phone className="w-3 h-3 mr-1" />
             )}
             {typeConfig.secondaryAction.label}
           </Button>
         )}
       </div>
     </motion.div>
   );
 }