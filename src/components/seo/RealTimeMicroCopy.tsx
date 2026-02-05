 /**
  * RealTimeMicroCopy Component
  * Shows social proof like "Last booked 4 minutes ago via Duffel"
  */
 
 import { Clock, Users, TrendingUp } from "lucide-react";
 import { formatDistanceToNow } from "date-fns";
 import { cn } from "@/lib/utils";
 import { useRouteActivity } from "@/hooks/useRouteActivity";
 
 interface RealTimeMicroCopyProps {
   origin: string;
   destination: string;
   className?: string;
 }
 
 export default function RealTimeMicroCopy({
   origin,
   destination,
   className,
 }: RealTimeMicroCopyProps) {
   const { lastBooking, searchesToday, isLoading } = useRouteActivity(origin, destination);
 
   if (isLoading) {
     return (
       <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
         <div className="w-32 h-4 bg-muted/50 rounded animate-pulse" />
       </div>
     );
   }
 
   return (
     <div className={cn("flex flex-wrap items-center gap-4 text-sm", className)}>
       {lastBooking && (
         <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-success" />
           <span>
             Last booked{" "}
             <span className="font-medium text-foreground">
               {formatDistanceToNow(new Date(lastBooking.createdAt), { addSuffix: true })}
             </span>
             {lastBooking.supplier && (
               <span className="text-muted-foreground/70"> via {lastBooking.supplier}</span>
             )}
           </span>
         </div>
       )}
 
       {searchesToday > 0 && (
         <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-3.5 h-3.5 text-primary" />
           <span>
             <span className="font-medium text-foreground">{searchesToday}</span>{" "}
             {searchesToday === 1 ? "person" : "people"} searched today
           </span>
         </div>
       )}
 
       {!lastBooking && !searchesToday && (
         <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-warning" />
           <span>Popular route — compare prices now</span>
         </div>
       )}
     </div>
   );
 }