 /**
  * useBookingMargins - Calculate per-booking profitability
  * Tracks sale price, supplier cost, Stripe fees, and net margin
  */
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { subDays } from "date-fns";
 
 export interface BookingMargin {
   bookingId: string;
   bookingRef: string;
   serviceType: "flight" | "hotel" | "activity" | "transfer";
   salePrice: number;
   supplierCost: number;
   stripeFee: number;
   platformFee: number;
   netMargin: number;
   marginPercent: number;
   isLowMargin: boolean;
   createdAt: string;
 }
 
 export interface MarginStats {
   bookings: BookingMargin[];
   aggregates: {
     totalRevenue: number;
     totalCost: number;
     totalMargin: number;
     avgMarginPercent: number;
     lowMarginCount: number;
   };
 }
 
 const STRIPE_FEE_PERCENT = 0.029; // 2.9%
 const STRIPE_FEE_FIXED = 0.30; // $0.30
 const PLATFORM_FEE_PERCENT = 0.01; // 1% platform fee
 const LOW_MARGIN_THRESHOLD = 5; // 5%
 
 export function useBookingMargins(options?: { days?: number; enabled?: boolean }) {
   const days = options?.days ?? 7;
 
   return useQuery({
     queryKey: ["booking-margins", days],
     queryFn: async (): Promise<MarginStats> => {
       const since = subDays(new Date(), days);
 
       // Fetch flight bookings with pricing (using actual columns)
       const { data: flightBookings } = await supabase
         .from("flight_bookings")
         .select("id, booking_reference, total_amount, ticketing_status, created_at")
         .gte("created_at", since.toISOString())
         .eq("payment_status", "paid")
         .order("created_at", { ascending: false })
         .limit(100);
 
       // Fetch travel orders (using actual columns)
       const { data: travelOrders } = await supabase
         .from("travel_orders")
         .select("id, order_number, total, status, created_at")
         .gte("created_at", since.toISOString())
         .in("status", ["confirmed", "completed"])
         .order("created_at", { ascending: false })
         .limit(100);
 
       const bookings: BookingMargin[] = [];
 
       // Process flight bookings
       flightBookings?.forEach((fb) => {
         const salePrice = Number(fb.total_amount) || 0;
         const supplierCost = salePrice * 0.92; // Estimate ~8% margin
         const stripeFee = salePrice * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED;
         const platformFee = salePrice * PLATFORM_FEE_PERCENT;
         const netMargin = salePrice - supplierCost - stripeFee - platformFee;
         const marginPercent = salePrice > 0 ? (netMargin / salePrice) * 100 : 0;
 
         bookings.push({
           bookingId: fb.id,
           bookingRef: fb.booking_reference || `FL-${fb.id.slice(0, 8)}`,
           serviceType: "flight",
           salePrice,
           supplierCost,
           stripeFee: Math.round(stripeFee * 100) / 100,
           platformFee: Math.round(platformFee * 100) / 100,
           netMargin: Math.round(netMargin * 100) / 100,
           marginPercent: Math.round(marginPercent * 10) / 10,
           isLowMargin: marginPercent < LOW_MARGIN_THRESHOLD,
           createdAt: fb.created_at,
         });
       });
 
       // Process travel orders (hotels, activities, transfers)
       travelOrders?.forEach((to) => {
         const salePrice = Number(to.total) || 0;
         const supplierCost = salePrice * 0.85; // Typical OTA margin ~15%
         const stripeFee = salePrice * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED;
         const platformFee = salePrice * PLATFORM_FEE_PERCENT;
         const netMargin = salePrice - supplierCost - stripeFee - platformFee;
         const marginPercent = salePrice > 0 ? (netMargin / salePrice) * 100 : 0;
 
         bookings.push({
           bookingId: to.id,
           bookingRef: to.order_number || `TO-${to.id.slice(0, 8)}`,
           serviceType: "hotel", // Default, would need item_type from order_items
           salePrice,
           supplierCost,
           stripeFee: Math.round(stripeFee * 100) / 100,
           platformFee: Math.round(platformFee * 100) / 100,
           netMargin: Math.round(netMargin * 100) / 100,
           marginPercent: Math.round(marginPercent * 10) / 10,
           isLowMargin: marginPercent < LOW_MARGIN_THRESHOLD,
           createdAt: to.created_at,
         });
       });
 
       // Calculate aggregates
       const totalRevenue = bookings.reduce((sum, b) => sum + b.salePrice, 0);
       const totalCost = bookings.reduce((sum, b) => sum + b.supplierCost + b.stripeFee + b.platformFee, 0);
       const totalMargin = bookings.reduce((sum, b) => sum + b.netMargin, 0);
       const avgMarginPercent = bookings.length > 0
         ? bookings.reduce((sum, b) => sum + b.marginPercent, 0) / bookings.length
         : 0;
       const lowMarginCount = bookings.filter((b) => b.isLowMargin).length;
 
       return {
         bookings: bookings.sort((a, b) => 
           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
         ),
         aggregates: {
           totalRevenue: Math.round(totalRevenue * 100) / 100,
           totalCost: Math.round(totalCost * 100) / 100,
           totalMargin: Math.round(totalMargin * 100) / 100,
           avgMarginPercent: Math.round(avgMarginPercent * 10) / 10,
           lowMarginCount,
         },
       };
     },
     staleTime: 60 * 1000, // 1 minute
     enabled: options?.enabled !== false,
   });
 }