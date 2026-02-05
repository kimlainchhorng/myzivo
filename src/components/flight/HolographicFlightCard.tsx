 /**
  * HolographicFlightCard - 2026 Premium Flight Result Card
  * Digital asset styling with glass effects and glow
  */
 
 import { motion } from "framer-motion";
 import { Wifi, Utensils, Usb, Clock, Briefcase, CheckCircle } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 
 interface FlightSegment {
   time: string;
   code: string;
 }
 
 export interface HolographicFlightData {
   id: string;
   airline: string;
   airlineCode: string;
   airlineLogo?: string;
   flightNumber: string;
   departure: FlightSegment;
   arrival: FlightSegment;
   duration: string;
   stops: number;
   stopCities?: string[];
   price: number;
   currency?: string;
   cabinClass?: string;
   amenities?: string[];
   baggageIncluded?: string;
   isRealPrice?: boolean;
   isBestPrice?: boolean;
   isFastest?: boolean;
   isBestValue?: boolean;
   isRefundable?: boolean;
 }
 
 interface HolographicFlightCardProps {
   flight: HolographicFlightData;
   onSelect: (flight: HolographicFlightData) => void;
   variant?: "default" | "compact";
   className?: string;
 }
 
 const amenityIcons: Record<string, typeof Wifi> = {
   wifi: Wifi,
   meal: Utensils,
   usb: Usb,
   power: Usb,
 };
 
 export default function HolographicFlightCard({
   flight,
   onSelect,
   variant = "default",
   className,
 }: HolographicFlightCardProps) {
   const currencySymbol = flight.currency === 'EUR' ? '€' : flight.currency === 'GBP' ? '£' : '$';
   
   // Default amenities if not provided
   const displayAmenities = flight.amenities?.length 
     ? flight.amenities 
     : ['wifi', 'meal', 'usb'];
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       className={cn(
         "group relative w-full",
         "bg-card/60 dark:bg-zinc-900/40 backdrop-blur-md",
         "border border-border/50 dark:border-white/5 rounded-3xl",
         "p-4 sm:p-6 mb-4",
         "hover:bg-card/80 dark:hover:bg-zinc-900/60",
         "transition-all duration-300",
         className
       )}
     >
       {/* Hover Glow Gradient */}
       <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
 
       <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
         {/* Airline & Route - 7 cols on desktop */}
         <div className="md:col-span-7 flex items-center gap-4 sm:gap-6">
           {/* Airline Logo */}
           <div className="w-14 h-14 sm:w-16 sm:h-16 bg-background rounded-2xl p-2 flex items-center justify-center shrink-0 border border-border/50">
             {flight.airlineLogo ? (
               <img 
                 src={flight.airlineLogo} 
                 alt={flight.airline} 
                 className="w-full h-full object-contain"
               />
             ) : (
               <span className="text-lg font-bold text-muted-foreground">
                 {flight.airlineCode}
               </span>
             )}
           </div>
           
           {/* Route Info */}
           <div className="flex-1 min-w-0">
             {/* Times & Codes */}
             <div className="flex items-center justify-between text-lg sm:text-2xl font-black mb-1">
               <div className="flex flex-col">
                 <span className="text-foreground">{flight.departure.time}</span>
                 <span className="text-xs text-muted-foreground font-medium">{flight.departure.code}</span>
               </div>
               
               {/* Duration & Stops */}
               <div className="flex-1 flex flex-col items-center px-3 sm:px-4">
                 <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                   {flight.duration}
                 </span>
                 <div className="w-full flex items-center gap-1 my-1">
                   <div className="flex-1 border-t border-dashed border-border" />
                   {flight.stops === 0 ? (
                     <span className="text-[10px] uppercase font-bold text-emerald-500 px-1">Direct</span>
                   ) : (
                     <span className="text-[10px] uppercase font-bold text-muted-foreground px-1">
                       {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                     </span>
                   )}
                   <div className="flex-1 border-t border-dashed border-border" />
                 </div>
                 {flight.stopCities && flight.stopCities.length > 0 && (
                   <span className="text-[10px] text-muted-foreground">
                     via {flight.stopCities.join(', ')}
                   </span>
                 )}
               </div>
               
               <div className="flex flex-col text-right">
                 <span className="text-foreground">{flight.arrival.time}</span>
                 <span className="text-xs text-muted-foreground font-medium">{flight.arrival.code}</span>
               </div>
             </div>
             
             {/* Airline & Flight Details */}
             <div className="text-xs sm:text-sm text-muted-foreground truncate">
               {flight.airline} • {flight.flightNumber}
               {flight.cabinClass && ` • ${flight.cabinClass}`}
             </div>
           </div>
         </div>
 
         {/* Benefits Badges - 3 cols */}
         <div className="md:col-span-3 flex flex-wrap gap-1.5 sm:gap-2">
           {/* Badges for best price, fastest, etc */}
           {flight.isBestPrice && (
             <Badge variant="outline" className="border-accent/50 text-accent-foreground text-[10px] uppercase font-bold bg-accent/10">
               Best Price
             </Badge>
           )}
           {flight.isFastest && (
             <Badge variant="outline" className="border-primary/50 text-primary text-[10px] uppercase font-bold">
               <Clock className="w-3 h-3 mr-1" />
               Fastest
             </Badge>
           )}
           {flight.isBestValue && (
             <Badge variant="outline" className="border-secondary/50 text-secondary-foreground text-[10px] uppercase font-bold bg-secondary/10">
               Best Value
             </Badge>
           )}
           
           {/* Amenity badges */}
           {displayAmenities.slice(0, 3).map((amenity) => {
             const Icon = amenityIcons[amenity.toLowerCase()] || Briefcase;
             return (
               <span 
                 key={amenity}
                 className="px-2 py-1 bg-muted/50 dark:bg-white/5 rounded-full text-[10px] uppercase font-bold text-muted-foreground border border-border/50 dark:border-white/5 flex items-center gap-1"
               >
                 <Icon className="w-3 h-3" />
                 {amenity}
               </span>
             );
           })}
           
           {/* Refundable indicator */}
           {flight.isRefundable && (
             <span className="px-2 py-1 bg-accent/10 rounded-full text-[10px] uppercase font-bold text-accent-foreground border border-accent/20 flex items-center gap-1">
               <CheckCircle className="w-3 h-3" />
               Refundable
             </span>
           )}
         </div>
 
         {/* Price & Action - 2 cols */}
         <div className="md:col-span-2 text-right border-t md:border-t-0 md:border-l border-border/50 dark:border-white/5 pt-4 md:pt-0 md:pl-6">
           <div className="text-xs text-muted-foreground mb-1">
             {flight.isRealPrice ? 'Total Price' : 'Est. Price'}
           </div>
           <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-2 sm:mb-3">
             {currencySymbol}{flight.price.toLocaleString()}
           </div>
           <Button
             onClick={() => onSelect(flight)}
             className={cn(
               "w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm",
               "bg-foreground text-background",
               "hover:bg-primary hover:text-primary-foreground",
               "transition-colors active:scale-[0.98]"
             )}
           >
             Select
           </Button>
           
           {/* Baggage info */}
           {flight.baggageIncluded && (
             <p className="text-[10px] text-muted-foreground mt-2 truncate">
               {flight.baggageIncluded}
             </p>
           )}
         </div>
       </div>
     </motion.div>
   );
 }