 /**
  * PNRTimeline - Visual timeline showing booking lifecycle
  * Payment Authorized → Supplier Notified → PNR Received → Ticket Issued
  */
 import { motion } from "framer-motion";
 import { Check, Clock, AlertCircle, Loader2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { format } from "date-fns";
 
 type StepStatus = "complete" | "in_progress" | "pending" | "failed";
 
 interface TimelineStep {
   label: string;
   status: StepStatus;
   timestamp?: string;
 }
 
 interface PNRTimelineProps {
   bookingId: string;
   paymentAuthorizedAt?: string;
   supplierNotifiedAt?: string;
   pnrReceivedAt?: string;
   ticketIssuedAt?: string;
   failedAt?: string;
   failedStep?: string;
   className?: string;
   compact?: boolean;
 }
 
 function getStepIcon(status: StepStatus) {
   switch (status) {
     case "complete":
       return <Check className="w-4 h-4" />;
     case "in_progress":
       return <Loader2 className="w-4 h-4 animate-spin" />;
     case "failed":
       return <AlertCircle className="w-4 h-4" />;
     default:
       return <Clock className="w-4 h-4" />;
   }
 }
 
 function getStepColors(status: StepStatus) {
   switch (status) {
     case "complete":
       return {
         bg: "bg-emerald-500",
         text: "text-white",
         ring: "ring-emerald-500/30",
       };
     case "in_progress":
       return {
         bg: "bg-amber-500",
         text: "text-white",
         ring: "ring-amber-500/30",
       };
     case "failed":
       return {
         bg: "bg-destructive",
         text: "text-white",
         ring: "ring-destructive/30",
       };
     default:
       return {
         bg: "bg-muted",
         text: "text-muted-foreground",
         ring: "ring-muted/50",
       };
   }
 }
 
 export default function PNRTimeline({
   bookingId,
   paymentAuthorizedAt,
   supplierNotifiedAt,
   pnrReceivedAt,
   ticketIssuedAt,
   failedAt,
   failedStep,
   className,
   compact,
 }: PNRTimelineProps) {
   // Determine step statuses
   const getStatus = (step: string, timestamp?: string): StepStatus => {
     if (failedStep === step) return "failed";
     if (timestamp) return "complete";
 
     // Check if previous step is complete and this is next
     const steps = ["payment", "supplier", "pnr", "ticket"];
     const stepIndex = steps.indexOf(step);
     const prevTimestamps = [paymentAuthorizedAt, supplierNotifiedAt, pnrReceivedAt, ticketIssuedAt];
 
     // If previous step is complete and this one isn't, it's in progress
     if (stepIndex > 0 && prevTimestamps[stepIndex - 1] && !timestamp) {
       return "in_progress";
     }
 
     return "pending";
   };
 
   const steps: TimelineStep[] = [
     {
       label: "Payment Authorized",
       status: getStatus("payment", paymentAuthorizedAt),
       timestamp: paymentAuthorizedAt,
     },
     {
       label: "Supplier Notified",
       status: getStatus("supplier", supplierNotifiedAt),
       timestamp: supplierNotifiedAt,
     },
     {
       label: "PNR Received",
       status: getStatus("pnr", pnrReceivedAt),
       timestamp: pnrReceivedAt,
     },
     {
       label: "Ticket Issued",
       status: getStatus("ticket", ticketIssuedAt),
       timestamp: ticketIssuedAt,
     },
   ];
 
   if (compact) {
     return (
       <div className={cn("flex items-center gap-1", className)}>
         {steps.map((step, i) => {
           const colors = getStepColors(step.status);
           return (
             <div key={step.label} className="flex items-center">
               <div
                 className={cn(
                   "w-6 h-6 rounded-full flex items-center justify-center",
                   colors.bg,
                   colors.text
                 )}
                 title={`${step.label}: ${step.status}`}
               >
                 {getStepIcon(step.status)}
               </div>
               {i < steps.length - 1 && (
                 <div
                   className={cn(
                     "w-4 h-0.5",
                     step.status === "complete" ? "bg-emerald-500" : "bg-muted"
                   )}
                 />
               )}
             </div>
           );
         })}
       </div>
     );
   }
 
   return (
     <div className={cn("relative", className)}>
       {/* Progress line background */}
       <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
 
       {/* Progress line filled */}
       <motion.div
         className="absolute top-5 left-5 h-0.5 bg-emerald-500"
         initial={{ width: 0 }}
         animate={{
           width: `${(steps.filter((s) => s.status === "complete").length / steps.length) * 100}%`,
         }}
         transition={{ duration: 0.5, ease: "easeOut" }}
       />
 
       {/* Steps */}
       <div className="relative flex justify-between">
         {steps.map((step, index) => {
           const colors = getStepColors(step.status);
 
           return (
             <motion.div
               key={step.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className="flex flex-col items-center text-center"
             >
               {/* Step icon */}
               <div
                 className={cn(
                   "w-10 h-10 rounded-full flex items-center justify-center z-10 ring-4",
                   colors.bg,
                   colors.text,
                   colors.ring
                 )}
               >
                 {getStepIcon(step.status)}
               </div>
 
               {/* Label */}
               <p className="mt-2 text-xs font-medium max-w-[80px]">{step.label}</p>
 
               {/* Timestamp */}
               {step.timestamp ? (
                 <p className="text-[10px] text-muted-foreground mt-0.5">
                   {format(new Date(step.timestamp), "HH:mm")}
                 </p>
               ) : step.status === "in_progress" ? (
                 <p className="text-[10px] text-amber-500 mt-0.5">Processing...</p>
               ) : step.status === "failed" ? (
                 <p className="text-[10px] text-destructive mt-0.5">Failed</p>
               ) : (
                 <p className="text-[10px] text-muted-foreground mt-0.5">—</p>
               )}
             </motion.div>
           );
         })}
       </div>
     </div>
   );
 }