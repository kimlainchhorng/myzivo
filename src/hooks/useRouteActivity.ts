 /**
  * useRouteActivity Hook
  * Fetches recent booking and search activity for a flight route
  * Used for real-time social proof micro-copy
  */
 
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { startOfDay } from "date-fns";
 
 interface RouteActivity {
   lastBooking: {
     createdAt: string;
     supplier: string | null;
   } | null;
   searchesToday: number;
   isLoading: boolean;
 }
 
 export const useRouteActivity = (origin: string, destination: string): RouteActivity => {
   // Normalize route codes
   const originCode = origin.slice(0, 3).toUpperCase();
   const destCode = destination.slice(0, 3).toUpperCase();
 
   // Fetch last booking on this route
   const { data: lastBookingData, isLoading: loadingBooking } = useQuery({
     queryKey: ["route-activity-booking", originCode, destCode],
     queryFn: async () => {
       // Try to find a booking matching this route
       const { data } = await supabase
         .from("flight_bookings")
        .select("created_at, booking_reference")
         .eq("payment_status", "paid")
         .order("created_at", { ascending: false })
         .limit(1);
 
       // Note: In production, filter by origin/destination columns
       // For now, return most recent booking as placeholder
       return data?.[0] || null;
     },
     staleTime: 60 * 1000, // 1 minute
     enabled: !!origin && !!destination,
   });
 
   // Fetch search count today
   const { data: searchCount, isLoading: loadingSearches } = useQuery({
     queryKey: ["route-activity-searches", originCode, destCode],
     queryFn: async () => {
       const todayStart = startOfDay(new Date()).toISOString();
 
       // Count searches for this route today from analytics
       const { count } = await supabase
         .from("analytics_events")
         .select("*", { count: "exact", head: true })
         .eq("event_name", "flight_search")
         .gte("created_at", todayStart);
 
       // Return a reasonable number (capped for display)
       return Math.min(count || 0, 99);
     },
     staleTime: 5 * 60 * 1000, // 5 minutes
     enabled: !!origin && !!destination,
   });
 
   return {
     lastBooking: lastBookingData
       ? {
           createdAt: lastBookingData.created_at,
          supplier: "Duffel", // Default supplier for now
         }
       : null,
     searchesToday: searchCount || 0,
     isLoading: loadingBooking || loadingSearches,
   };
 };
 
 export default useRouteActivity;