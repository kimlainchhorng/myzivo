 /**
  * useBookingLedger - Fetches real-time booking data for operations
  */
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { formatDistanceToNow } from "date-fns";
 
 export type BookingStatus = "TICKETED" | "PENDING" | "FAILED" | "CANCELLED" | "PROCESSING";
 
 export interface BookingLedgerItem {
   id: string;
   bookingRef: string;
   passenger: string;
   route: string;
   type: "Flight" | "Hotel" | "Car" | "Transfer";
   supplier: string;
   status: BookingStatus;
   price: number;
   margin: number;
   currency: string;
   createdAt: string;
   timeAgo: string;
   pnr?: string;
   ticketNumber?: string;
   email?: string;
 }
 
 interface UseBookingLedgerOptions {
   limit?: number;
   supplierFilter?: string;
   searchQuery?: string;
   enabled?: boolean;
 }
 
 const mapStatus = (status: string | null): BookingStatus => {
   switch (status?.toLowerCase()) {
     case "confirmed":
     case "ticketed":
     case "completed":
       return "TICKETED";
     case "pending":
     case "processing":
       return "PENDING";
     case "failed":
     case "error":
       return "FAILED";
     case "cancelled":
       return "CANCELLED";
     default:
       return "PENDING";
   }
 };
 
 export function useBookingLedger(options: UseBookingLedgerOptions = {}) {
   const { limit = 50, supplierFilter, searchQuery, enabled = true } = options;
 
   return useQuery({
     queryKey: ["booking-ledger", limit, supplierFilter, searchQuery],
     queryFn: async (): Promise<BookingLedgerItem[]> => {
       // Fetch from travel_orders for all travel bookings
       let query = supabase
         .from("travel_orders")
         .select(`
           id,
           order_number,
           user_id,
           product_type,
           provider,
           status,
           total_price,
           currency,
           created_at,
           metadata,
           profiles!travel_orders_user_id_fkey (
             first_name,
             last_name,
             email
           )
         `)
         .order("created_at", { ascending: false })
         .limit(limit);
 
       if (supplierFilter && supplierFilter !== "all") {
         query = query.eq("provider", supplierFilter);
       }
 
       if (searchQuery) {
         query = query.or(`order_number.ilike.%${searchQuery}%`);
       }
 
       const { data, error } = await query;
 
       if (error) {
         console.error("Error fetching booking ledger:", error);
         return [];
       }
 
       return (data || []).map((order: any) => {
         const metadata = order.metadata || {};
         const profile = order.profiles;
         const passengerName = profile
           ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Guest"
           : "Guest";
 
         // Calculate margin (simplified - 3% of total)
         const margin = (order.total_price || 0) * 0.03;
 
         // Build route string from metadata
         let route = metadata.destination || metadata.route || "—";
         if (order.product_type === "flight" && metadata.origin && metadata.destination) {
           route = `${metadata.origin} → ${metadata.destination}`;
         } else if (order.product_type === "hotel" && metadata.hotel_name) {
           route = metadata.hotel_name;
         }
 
         return {
           id: order.id,
           bookingRef: order.order_number || `ZV-${order.id.slice(0, 6).toUpperCase()}`,
           passenger: passengerName,
           route,
           type: (order.product_type?.charAt(0).toUpperCase() + order.product_type?.slice(1)) as any || "Flight",
           supplier: order.provider || "Direct",
           status: mapStatus(order.status),
           price: order.total_price || 0,
           margin,
           currency: order.currency || "USD",
           createdAt: order.created_at,
           timeAgo: formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
           pnr: metadata.pnr,
           ticketNumber: metadata.ticket_number,
           email: profile?.email,
         };
       });
     },
     enabled,
     staleTime: 10 * 1000, // 10 seconds
     refetchInterval: 30 * 1000, // 30 seconds auto-refresh
   });
 }