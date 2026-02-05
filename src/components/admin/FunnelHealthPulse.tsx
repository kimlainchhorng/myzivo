 /**
  * FunnelHealthPulse Component
  * Combined funnel analytics dashboard with latency, abandonment, and success metrics
  */
 
 import { motion } from "framer-motion";
 import { BarChart3, RefreshCw } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { useFunnelAnalytics } from "@/hooks/useFunnelAnalytics";
 import APILatencyChart from "./APILatencyChart";
 import CheckoutFunnelDropoff from "./CheckoutFunnelDropoff";
 import SupplierSuccessRate from "./SupplierSuccessRate";
 import { cn } from "@/lib/utils";
 
 interface FunnelHealthPulseProps {
   className?: string;
 }
 
 export default function FunnelHealthPulse({ className }: FunnelHealthPulseProps) {
   const { latencies, funnelSteps, supplierSuccess, isLoading } = useFunnelAnalytics();
 
   if (isLoading) {
     return (
       <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
         {[1, 2, 3].map((i) => (
           <div key={i} className="h-64 bg-muted/30 rounded-xl animate-pulse" />
         ))}
       </div>
     );
   }
 
   return (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className={cn("space-y-6", className)}
     >
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <BarChart3 className="w-5 h-5 text-primary" />
           <h2 className="font-semibold">Funnel Health Pulse</h2>
         </div>
         <Button variant="ghost" size="sm">
           <RefreshCw className="w-4 h-4" />
         </Button>
       </div>
 
       {/* Grid layout */}
       <div className="grid gap-6 lg:grid-cols-2">
         <APILatencyChart latencies={latencies} />
         <CheckoutFunnelDropoff steps={funnelSteps} />
         <SupplierSuccessRate suppliers={supplierSuccess} className="lg:col-span-2" />
       </div>
     </motion.div>
   );
 }