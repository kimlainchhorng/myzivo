 /**
  * SupplierSuccessRate Component
  * Shows ticketing success rate by supplier
  */
 
 import { motion } from "framer-motion";
 import { CheckCircle2, AlertTriangle, XCircle, Ticket } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { cn } from "@/lib/utils";
 
 interface SupplierSuccess {
   name: string;
   successRate: number;
   successCount: number;
   totalCount: number;
   status: "good" | "warning" | "critical";
 }
 
 interface SupplierSuccessRateProps {
   suppliers: SupplierSuccess[];
   className?: string;
 }
 
 const STATUS_CONFIG = {
   good: {
     icon: CheckCircle2,
     color: "text-success",
   },
   warning: {
     icon: AlertTriangle,
     color: "text-warning",
   },
   critical: {
     icon: XCircle,
     color: "text-destructive",
   },
 };
 
 export default function SupplierSuccessRate({
   suppliers,
   className,
 }: SupplierSuccessRateProps) {
   return (
     <Card className={cn("", className)}>
       <CardHeader className="pb-4">
         <CardTitle className="flex items-center gap-2 text-base">
           <Ticket className="w-4 h-4" />
           Ticketing Success (First Attempt)
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {suppliers.map((supplier, index) => {
           const config = STATUS_CONFIG[supplier.status];
 
           return (
             <motion.div
               key={supplier.name}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
               className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
             >
               <div className="flex items-center gap-3">
                 <config.icon className={cn("w-4 h-4", config.color)} />
                 <span className="font-medium">{supplier.name}</span>
               </div>
               <div className="text-right">
                 <span className="font-mono font-bold">{supplier.successRate}%</span>
                 <span className="text-xs text-muted-foreground ml-2">
                   ({supplier.successCount} / {supplier.totalCount})
                 </span>
               </div>
             </motion.div>
           );
         })}
 
         {/* Footer note */}
         <p className="text-xs text-muted-foreground pt-2">
           Failed tickets auto-escalate to support queue after 15 minutes.
         </p>
       </CardContent>
     </Card>
   );
 }