 /**
  * MarginTracker - Per-booking profitability calculator
  * Shows sale price, supplier cost, fees, and net margin
  */
 import { motion } from "framer-motion";
 import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Plane, Building2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Skeleton } from "@/components/ui/skeleton";
 import { useBookingMargins, type BookingMargin } from "@/hooks/useBookingMargins";
 import { formatDistanceToNow } from "date-fns";
 
 interface MarginTrackerProps {
   className?: string;
   showBookings?: boolean;
   limit?: number;
 }
 
 function MarginBar({ percent, isLow }: { percent: number; isLow: boolean }) {
   return (
     <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
       <motion.div
         className={cn(
           "absolute left-0 top-0 h-full rounded-full",
           isLow ? "bg-amber-500" : "bg-emerald-500"
         )}
         initial={{ width: 0 }}
         animate={{ width: `${Math.min(percent, 100)}%` }}
         transition={{ duration: 0.5, ease: "easeOut" }}
       />
     </div>
   );
 }
 
 function BookingMarginRow({ booking }: { booking: BookingMargin }) {
   const ServiceIcon = booking.serviceType === "flight" ? Plane : Building2;
 
   return (
     <motion.div
       initial={{ opacity: 0, x: -10 }}
       animate={{ opacity: 1, x: 0 }}
       className={cn(
         "p-3 rounded-lg border",
         booking.isLowMargin
           ? "bg-amber-500/5 border-amber-500/20"
           : "bg-muted/30 border-border/50"
       )}
     >
       <div className="flex items-start justify-between mb-2">
         <div className="flex items-center gap-2">
           <ServiceIcon className="w-4 h-4 text-muted-foreground" />
           <span className="font-mono text-sm font-medium">{booking.bookingRef}</span>
           {booking.isLowMargin && (
             <Badge variant="outline" className="text-[10px] h-5 bg-amber-500/10 text-amber-500 border-amber-500/20">
               <AlertTriangle className="w-3 h-3 mr-1" />
               Low
             </Badge>
           )}
         </div>
         <span className="text-xs text-muted-foreground">
           {formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}
         </span>
       </div>
 
       <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
         <div className="flex justify-between">
           <span className="text-muted-foreground">Sale:</span>
           <span className="font-medium">${booking.salePrice.toLocaleString()}</span>
         </div>
         <div className="flex justify-between">
           <span className="text-muted-foreground">Supplier:</span>
           <span className="text-destructive">-${booking.supplierCost.toLocaleString()}</span>
         </div>
         <div className="flex justify-between">
           <span className="text-muted-foreground">Stripe:</span>
           <span className="text-destructive">-${booking.stripeFee.toFixed(2)}</span>
         </div>
         <div className="flex justify-between">
           <span className="text-muted-foreground">Platform:</span>
           <span className="text-destructive">-${booking.platformFee.toFixed(2)}</span>
         </div>
       </div>
 
       <div className="flex items-center justify-between pt-2 border-t border-border/50">
         <div className="flex items-center gap-2">
           <span className="text-sm font-semibold">
             ${booking.netMargin.toFixed(2)}
           </span>
           <span className={cn(
             "text-xs font-medium",
             booking.isLowMargin ? "text-amber-500" : "text-emerald-500"
           )}>
             ({booking.marginPercent}%)
           </span>
         </div>
         <MarginBar percent={booking.marginPercent * 2} isLow={booking.isLowMargin} />
       </div>
     </motion.div>
   );
 }
 
 export default function MarginTracker({ className, showBookings = true, limit = 5 }: MarginTrackerProps) {
   const { data, isLoading } = useBookingMargins({ days: 7 });
 
   if (isLoading) {
     return (
       <Card className={className}>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <DollarSign className="w-5 h-5" />
             Margin Tracker
           </CardTitle>
         </CardHeader>
         <CardContent>
           <Skeleton className="h-32 w-full" />
         </CardContent>
       </Card>
     );
   }
 
   const agg = data?.aggregates;
 
   return (
     <Card className={className}>
       <CardHeader className="pb-3">
         <CardTitle className="text-lg flex items-center gap-2">
           <DollarSign className="w-5 h-5 text-primary" />
           Margin Tracker
           <span className="text-xs text-muted-foreground font-normal ml-2">
             Last 7 days
           </span>
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Aggregate Stats */}
         <div className="grid grid-cols-3 gap-3">
           <div className="text-center p-3 rounded-lg bg-muted/30">
             <p className="text-xs text-muted-foreground mb-1">Revenue</p>
             <p className="text-lg font-bold">${(agg?.totalRevenue || 0).toLocaleString()}</p>
           </div>
           <div className="text-center p-3 rounded-lg bg-muted/30">
             <p className="text-xs text-muted-foreground mb-1">Net Margin</p>
             <p className="text-lg font-bold text-emerald-500">
               ${(agg?.totalMargin || 0).toLocaleString()}
             </p>
           </div>
           <div className="text-center p-3 rounded-lg bg-muted/30">
             <p className="text-xs text-muted-foreground mb-1">Avg %</p>
             <div className="flex items-center justify-center gap-1">
               {(agg?.avgMarginPercent || 0) >= 5 ? (
                 <TrendingUp className="w-4 h-4 text-emerald-500" />
               ) : (
                 <TrendingDown className="w-4 h-4 text-amber-500" />
               )}
               <p className="text-lg font-bold">{agg?.avgMarginPercent || 0}%</p>
             </div>
           </div>
         </div>
 
         {/* Low margin alert */}
         {(agg?.lowMarginCount || 0) > 0 && (
           <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
             <AlertTriangle className="w-4 h-4 text-amber-500" />
             <span className="text-sm">
               <strong>{agg?.lowMarginCount}</strong> bookings with margin below 5%
             </span>
           </div>
         )}
 
         {/* Individual bookings */}
         {showBookings && data?.bookings && (
           <div className="space-y-2 max-h-[300px] overflow-y-auto">
             {data.bookings.slice(0, limit).map((booking) => (
               <BookingMarginRow key={booking.bookingId} booking={booking} />
             ))}
           </div>
         )}
       </CardContent>
     </Card>
   );
 }