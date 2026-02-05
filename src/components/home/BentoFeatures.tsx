 /**
  * Bento Grid Features Section
  * Premium asymmetric grid showcasing ZIVO's core technology and trust signals
  */
 
 import { Plane, Zap, ShieldCheck } from "lucide-react";
 import { cn } from "@/lib/utils";
 import hotelLuxuryPool from "@/assets/hotel-luxury-pool.jpg";
 
 interface BentoFeaturesProps {
   className?: string;
 }
 
 export default function BentoFeatures({ className }: BentoFeaturesProps) {
   return (
     <section className={cn("py-12 sm:py-16", className)}>
       <div className="container mx-auto px-4">
         {/* Section Header */}
         <div className="text-center mb-10">
           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-3">
             Built for{" "}
             <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
               Performance
             </span>
           </h2>
           <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
             Enterprise-grade technology powering your travel search
           </p>
         </div>
 
         {/* Bento Grid */}
         <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[500px] lg:h-[550px] max-w-6xl mx-auto">
           
           {/* Hotel Inventory - Large 2x2 Card */}
           <div 
             className="md:col-span-2 md:row-span-2 bg-zinc-900 rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-white/5 flex flex-col justify-end min-h-[280px] md:min-h-0 bg-cover bg-center relative overflow-hidden group"
             style={{ backgroundImage: `url(${hotelLuxuryPool})` }}
           >
             {/* Gradient overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
             
             {/* Content */}
             <div className="relative z-10 bg-black/40 backdrop-blur-md p-5 sm:p-6 rounded-2xl lg:rounded-3xl border border-white/10">
               <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">Direct Hotel Inventory</h3>
               <p className="text-zinc-300 text-sm">
                 Hotelbeds + RateHawk normalized in real-time for the lowest rate.
               </p>
             </div>
           </div>
 
           {/* NDC Flights - Wide Card */}
           <div className="md:col-span-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 flex items-center justify-between group cursor-pointer overflow-hidden relative min-h-[140px] md:min-h-0 hover:from-sky-600 hover:to-blue-700 transition-all duration-300">
             <div className="z-10">
               <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-white">NDC Flights</h3>
               <p className="text-sky-100 opacity-90 text-sm sm:text-base">300+ Airlines via Duffel</p>
             </div>
             <Plane className="absolute -right-4 -bottom-4 w-24 h-24 sm:w-32 sm:h-32 text-white opacity-20 group-hover:scale-110 transition-transform duration-300" />
           </div>
 
           {/* Zero-Latency - Small Card */}
           <div className="bg-zinc-800 rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-6 border border-white/5 flex flex-col justify-center items-center text-center min-h-[120px] md:min-h-0 hover:border-primary/30 transition-colors duration-300">
             <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 mb-2" />
             <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-bold">Zero-Latency</p>
           </div>
 
           {/* PCI Level 1 - Small Card */}
           <div className="bg-zinc-800 rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-6 border border-white/5 flex flex-col justify-center items-center text-center min-h-[120px] md:min-h-0 hover:border-primary/30 transition-colors duration-300">
             <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mb-2" />
             <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-bold">PCI-Level 1</p>
           </div>
 
         </div>
       </div>
     </section>
   );
 }