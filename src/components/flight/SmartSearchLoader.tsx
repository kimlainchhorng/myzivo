 /**
  * SmartSearchLoader - 2026 Trust-Building Search State
  * Dual spinning rings with cycling supplier messages
  */
 
 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import { Plane, Globe2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface SmartSearchLoaderProps {
   className?: string;
   variant?: "default" | "compact";
   supplierMessages?: string[];
 }
 
 const DEFAULT_MESSAGES = [
   "Connecting to Duffel...",
   "Scanning NDC Inventory...",
   "Checking 300+ Airlines...",
   "Comparing Fares...",
   "Finding Best Deals...",
 ];
 
 export default function SmartSearchLoader({
   className,
   variant = "default",
   supplierMessages = DEFAULT_MESSAGES,
 }: SmartSearchLoaderProps) {
   const [messageIndex, setMessageIndex] = useState(0);
 
   useEffect(() => {
     const interval = setInterval(() => {
       setMessageIndex((prev) => (prev + 1) % supplierMessages.length);
     }, 2000);
     return () => clearInterval(interval);
   }, [supplierMessages.length]);
 
   if (variant === "compact") {
     return (
       <div className={cn("flex items-center gap-3", className)}>
         <div className="relative w-6 h-6">
           <motion.span 
             className="absolute inset-0 border-2 border-t-primary border-r-transparent border-b-muted/30 border-l-transparent rounded-full" 
             animate={{ rotate: 360 }}
             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           />
         </div>
         <span className="text-sm text-muted-foreground animate-pulse">
           {supplierMessages[messageIndex]}
         </span>
       </div>
     );
   }
 
   return (
     <div className={cn("flex flex-col items-center justify-center py-16 sm:py-20", className)}>
       {/* Dual Spinning Rings */}
       <div className="relative w-24 h-24 mb-8">
         {/* Outer ring - clockwise */}
         <motion.span 
           className="absolute inset-0 border-4 border-t-sky-500 border-r-transparent border-b-muted/30 border-l-transparent rounded-full" 
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
         />
         {/* Inner ring - counter-clockwise */}
         <motion.span 
           className="absolute inset-2 border-4 border-t-transparent border-r-emerald-500 border-b-transparent border-l-muted/30 rounded-full" 
           animate={{ rotate: -360 }}
           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
         />
         {/* Center icon */}
         <div className="absolute inset-0 flex items-center justify-center">
           <Plane className="w-8 h-8 text-primary" />
         </div>
       </div>
 
       {/* Cycling Message */}
       <motion.div 
         key={messageIndex}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -10 }}
         className="h-8 mb-4"
       >
         <p className="text-lg font-medium text-foreground">
           {supplierMessages[messageIndex]}
         </p>
       </motion.div>
 
       {/* Trust indicator */}
       <div className="flex items-center gap-2 text-sm text-muted-foreground">
         <Globe2 className="w-4 h-4" />
         <span>Searching 500+ travel providers worldwide</span>
       </div>
 
       {/* Progress dots */}
       <div className="flex gap-1.5 mt-6">
         {supplierMessages.map((_, i) => (
           <div
             key={i}
             className={cn(
               "w-2 h-2 rounded-full transition-all duration-300",
               i === messageIndex 
                 ? "bg-primary scale-125" 
                 : i < messageIndex 
                   ? "bg-primary/50" 
                   : "bg-muted"
             )}
           />
         ))}
       </div>
     </div>
   );
 }