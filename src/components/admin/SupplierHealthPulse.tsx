 /**
  * SupplierHealthPulse - Animated pulse indicators showing live API latency
  * Features animated pulse ring effect and auto-refresh
  */
 import { motion } from "framer-motion";
 import { Activity, RefreshCw } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useSupplierHealth, type SupplierHealth } from "@/hooks/useSupplierHealth";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Skeleton } from "@/components/ui/skeleton";
 import { formatDistanceToNow } from "date-fns";
 
 interface SupplierHealthPulseProps {
   className?: string;
   compact?: boolean;
 }
 
 function PulseIndicator({ status }: { status: "healthy" | "degraded" | "down" }) {
   const colors = {
     healthy: "bg-emerald-500",
     degraded: "bg-amber-500",
     down: "bg-destructive",
   };
 
   return (
     <div className="relative">
       {/* Pulse ring */}
       <motion.div
         className={cn(
           "absolute inset-0 rounded-full",
           colors[status],
           "opacity-30"
         )}
         animate={{
           scale: [1, 1.8, 1],
           opacity: [0.3, 0, 0.3],
         }}
         transition={{
           duration: status === "healthy" ? 2 : 1,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
       {/* Core dot */}
       <div className={cn("w-3 h-3 rounded-full relative z-10", colors[status])} />
     </div>
   );
 }
 
 function SupplierCard({ supplier }: { supplier: SupplierHealth }) {
   const statusLabels = {
     healthy: "Healthy",
     degraded: "Degraded",
     down: "Down",
   };
 
   const statusColors = {
     healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
     degraded: "bg-amber-500/10 text-amber-500 border-amber-500/20",
     down: "bg-destructive/10 text-destructive border-destructive/20",
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
     >
       <div className="flex items-center gap-3">
         <PulseIndicator status={supplier.status} />
         <div>
           <p className="font-semibold text-sm">{supplier.name}</p>
           <p className="text-xs text-muted-foreground">
             {supplier.totalRequests} requests
           </p>
         </div>
       </div>
       <div className="text-right">
         <Badge className={cn("mb-1", statusColors[supplier.status])}>
           {statusLabels[supplier.status]}
         </Badge>
         <p className="text-lg font-mono font-bold">
           {supplier.latencyMs}
           <span className="text-xs text-muted-foreground ml-0.5">ms</span>
         </p>
         {supplier.errorRate > 0 && (
           <p className="text-xs text-destructive">
             {supplier.errorRate}% errors
           </p>
         )}
       </div>
     </motion.div>
   );
 }
 
 export default function SupplierHealthPulse({ className, compact }: SupplierHealthPulseProps) {
   const { data, isLoading, refetch, isFetching } = useSupplierHealth();
 
   if (compact) {
     return (
       <div className={cn("flex items-center gap-3", className)}>
         {isLoading ? (
           <Skeleton className="h-6 w-32" />
         ) : (
           <>
             <div className="flex items-center gap-2">
               <Activity className="w-4 h-4 text-muted-foreground" />
               <span className="text-sm font-medium">APIs:</span>
             </div>
             {data?.suppliers.map((s) => (
               <div key={s.name} className="flex items-center gap-1.5">
                 <PulseIndicator status={s.status} />
                 <span className="text-xs">{s.name}</span>
               </div>
             ))}
           </>
         )}
       </div>
     );
   }
 
   return (
     <Card className={className}>
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <CardTitle className="text-lg flex items-center gap-2">
             <Activity className="w-5 h-5 text-primary" />
             Supplier Health
           </CardTitle>
           <Button
             variant="ghost"
             size="sm"
             onClick={() => refetch()}
             disabled={isFetching}
           >
             <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
           </Button>
         </div>
         {data?.lastUpdated && (
           <p className="text-xs text-muted-foreground">
             Updated {formatDistanceToNow(new Date(data.lastUpdated), { addSuffix: true })}
           </p>
         )}
       </CardHeader>
       <CardContent className="space-y-3">
         {isLoading ? (
           <>
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-20 w-full" />
           </>
         ) : (
           data?.suppliers.map((supplier) => (
             <SupplierCard key={supplier.name} supplier={supplier} />
           ))
         )}
       </CardContent>
     </Card>
   );
 }