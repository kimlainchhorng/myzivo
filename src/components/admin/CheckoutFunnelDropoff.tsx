 /**
  * CheckoutFunnelDropoff Component
  * Visualizes step-by-step abandonment in the booking funnel
  */
 
 import { motion } from "framer-motion";
 import { TrendingDown, AlertCircle, Lightbulb } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { cn } from "@/lib/utils";
 
 interface FunnelStep {
   name: string;
   fromStep: string;
   toStep: string;
   conversionRate: number;
   count: number;
 }
 
 interface CheckoutFunnelDropoffProps {
   steps: FunnelStep[];
   className?: string;
 }
 
 export default function CheckoutFunnelDropoff({
   steps,
   className,
 }: CheckoutFunnelDropoffProps) {
   // Find the biggest drop-off
   const worstStep = steps.reduce(
     (worst, step) => (step.conversionRate < worst.conversionRate ? step : worst),
     steps[0] || { name: "", conversionRate: 100 }
   );
 
   // Recommendations based on drop-off points
   const getRecommendation = (step: FunnelStep) => {
     if (step.name.includes("Results → Details")) {
       return 'Add "Best Price" badge to top 3 offers';
     }
     if (step.name.includes("Details → Checkout")) {
       return "Simplify booking form, reduce required fields";
     }
     if (step.name.includes("Checkout → Payment")) {
       return "Add more payment options (Apple Pay, PayPal)";
     }
     return "Optimize page load time and UX";
   };
 
   return (
     <Card className={cn("", className)}>
       <CardHeader className="pb-4">
         <CardTitle className="flex items-center gap-2 text-base">
           <TrendingDown className="w-4 h-4" />
           Funnel Drop-off Points
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {steps.map((step, index) => {
           const isWorst = step.name === worstStep.name;
           const barColor =
             step.conversionRate >= 80
               ? "bg-success"
               : step.conversionRate >= 50
               ? "bg-warning"
               : "bg-destructive";
 
           return (
             <motion.div
               key={step.name}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className={cn("space-y-2", isWorst && "ring-1 ring-destructive/30 rounded-lg p-3 -mx-3")}
             >
               <div className="flex items-center justify-between text-sm">
                 <span className={cn("font-medium", isWorst && "text-destructive")}>
                   {step.name}
                   {isWorst && <AlertCircle className="w-3.5 h-3.5 inline ml-2" />}
                 </span>
                 <span className="font-mono font-bold">{step.conversionRate}%</span>
               </div>
               <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                 <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: `${step.conversionRate}%` }}
                   transition={{ duration: 0.6, delay: index * 0.1 }}
                   className={cn("h-full rounded-full", barColor)}
                 />
               </div>
             </motion.div>
           );
         })}
 
         {/* Recommendation */}
        {worstStep && "fromStep" in worstStep && worstStep.conversionRate < 70 && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
           >
             <div className="flex items-start gap-2">
               <Lightbulb className="w-4 h-4 text-warning mt-0.5" />
               <div>
                 <p className="text-xs font-medium text-muted-foreground">
                   Biggest drop: {worstStep.name}
                 </p>
                <p className="text-sm font-medium mt-1">{getRecommendation(worstStep as FunnelStep)}</p>
               </div>
             </div>
           </motion.div>
         )}
       </CardContent>
     </Card>
   );
 }