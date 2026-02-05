 /**
  * APILatencyChart Component
  * Displays API response times comparison across suppliers
  */
 
 import { motion } from "framer-motion";
 import { Activity, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { cn } from "@/lib/utils";
 
 interface SupplierLatency {
   name: string;
   avgMs: number;
   p95Ms: number;
   p99Ms: number;
   requestCount: number;
   status: "healthy" | "degraded" | "down";
 }
 
 interface APILatencyChartProps {
   latencies: SupplierLatency[];
   className?: string;
 }
 
 const STATUS_CONFIG = {
   healthy: {
     icon: CheckCircle2,
     color: "text-success",
     bgColor: "bg-success/10",
   },
   degraded: {
     icon: AlertTriangle,
     color: "text-warning",
     bgColor: "bg-warning/10",
   },
   down: {
     icon: XCircle,
     color: "text-destructive",
     bgColor: "bg-destructive/10",
   },
 };
 
 const MAX_LATENCY = 1000; // ms for bar scaling
 
 export default function APILatencyChart({ latencies, className }: APILatencyChartProps) {
   const avgLatency = latencies.length
     ? Math.round(latencies.reduce((sum, s) => sum + s.avgMs, 0) / latencies.length)
     : 0;
 
   const p95 = latencies.length ? Math.max(...latencies.map((s) => s.p95Ms)) : 0;
   const p99 = latencies.length ? Math.max(...latencies.map((s) => s.p99Ms)) : 0;
 
   return (
     <Card className={cn("", className)}>
       <CardHeader className="pb-4">
         <CardTitle className="flex items-center gap-2 text-base">
           <Activity className="w-4 h-4" />
           API Response Times (Last 1 Hour)
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {latencies.map((supplier, index) => {
           const config = STATUS_CONFIG[supplier.status];
           const barWidth = Math.min((supplier.avgMs / MAX_LATENCY) * 100, 100);
 
           return (
             <motion.div
               key={supplier.name}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
               className="space-y-2"
             >
               <div className="flex items-center justify-between text-sm">
                 <span className="font-medium">{supplier.name}</span>
                 <div className="flex items-center gap-2">
                   <span className="font-mono">{supplier.avgMs}ms</span>
                   <config.icon className={cn("w-4 h-4", config.color)} />
                 </div>
               </div>
               <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: `${barWidth}%` }}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   className={cn(
                     "h-full rounded-full",
                     supplier.status === "healthy" && "bg-success",
                     supplier.status === "degraded" && "bg-warning",
                     supplier.status === "down" && "bg-destructive"
                   )}
                 />
               </div>
             </motion.div>
           );
         })}
 
         {/* Summary Stats */}
         <div className="pt-4 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
           <div>
             <p className="text-lg font-bold">{avgLatency}ms</p>
             <p className="text-xs text-muted-foreground">Avg</p>
           </div>
           <div>
             <p className="text-lg font-bold">{p95}ms</p>
             <p className="text-xs text-muted-foreground">P95</p>
           </div>
           <div>
             <p className="text-lg font-bold">{p99 > 1000 ? `${(p99 / 1000).toFixed(1)}s` : `${p99}ms`}</p>
             <p className="text-xs text-muted-foreground">P99</p>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }