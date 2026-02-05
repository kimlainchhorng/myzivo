 /**
  * BookingLedger - Real-time booking table for operations
  */
 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Copy, RefreshCw } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useBookingLedger, type BookingLedgerItem, type BookingStatus } from "@/hooks/useBookingLedger";
 import LedgerFilters from "./LedgerFilters";
 import BookingDetailSlideOver from "./BookingDetailSlideOver";
 import { Sheet, SheetContent } from "@/components/ui/sheet";
 import { toast } from "sonner";
 
 const getStatusColor = (status: BookingStatus) => {
   switch (status) {
     case "TICKETED":
       return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
     case "PENDING":
     case "PROCESSING":
       return "bg-amber-500/10 text-amber-400 border-amber-500/20";
     case "FAILED":
       return "bg-red-500/10 text-red-400 border-red-500/20";
     case "CANCELLED":
       return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
     default:
       return "bg-zinc-800 text-zinc-400";
   }
 };
 
 const getSupplierColor = (supplier: string) => {
   switch (supplier.toLowerCase()) {
     case "duffel":
       return "bg-indigo-500";
     case "hotelbeds":
       return "bg-orange-500";
     case "ratehawk":
       return "bg-teal-500";
     case "viator":
       return "bg-purple-500";
     default:
       return "bg-zinc-500";
   }
 };
 
 const formatCurrency = (amount: number, currency: string = "USD") => {
   return new Intl.NumberFormat("en-US", {
     style: "currency",
     currency,
     minimumFractionDigits: 2,
   }).format(amount);
 };
 
 const BookingLedger = () => {
   const [searchQuery, setSearchQuery] = useState("");
   const [supplierFilter, setSupplierFilter] = useState("all");
   const [selectedBooking, setSelectedBooking] = useState<BookingLedgerItem | null>(null);
 
   const { data: bookings, isLoading, refetch, isFetching } = useBookingLedger({
     limit: 50,
     supplierFilter: supplierFilter === "all" ? undefined : supplierFilter,
     searchQuery: searchQuery || undefined,
   });
 
   const copyToClipboard = (text: string, label: string) => {
     navigator.clipboard.writeText(text);
     toast.success(`${label} copied to clipboard`);
   };
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold">Live Bookings</h1>
           <p className="text-sm text-zinc-500 mt-1">
             Real-time view of all travel bookings
           </p>
         </div>
         <button
           onClick={() => refetch()}
           disabled={isFetching}
           className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
         >
           <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
           Refresh
         </button>
       </div>
 
       {/* Filters */}
       <LedgerFilters
         searchQuery={searchQuery}
         onSearchChange={setSearchQuery}
         supplierFilter={supplierFilter}
         onSupplierChange={setSupplierFilter}
       />
 
       {/* The Ledger Table */}
       <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="mc-card rounded-2xl overflow-hidden"
       >
         {isLoading ? (
           <div className="p-8 text-center text-zinc-500">
             <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
             Loading bookings...
           </div>
         ) : !bookings?.length ? (
           <div className="p-8 text-center text-zinc-500">
             No bookings found
           </div>
         ) : (
           <table className="w-full text-left text-sm">
             <thead className="bg-white/5 text-zinc-400 font-medium border-b border-white/5">
               <tr>
                 <th className="px-6 py-4">Booking Ref</th>
                 <th className="px-6 py-4">Passenger</th>
                 <th className="px-6 py-4">Service</th>
                 <th className="px-6 py-4">Supplier</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Net Margin</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {bookings.map((booking) => (
                 <tr
                   key={booking.id}
                   onClick={() => setSelectedBooking(booking)}
                   className="hover:bg-white/5 transition-colors group cursor-pointer"
                 >
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <span className="font-mono text-zinc-300 group-hover:text-primary transition-colors">
                         {booking.bookingRef}
                       </span>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           copyToClipboard(booking.bookingRef, "Booking Ref");
                         }}
                         className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                       >
                         <Copy className="w-3 h-3" />
                       </button>
                     </div>
                     <span className="block text-[10px] text-zinc-600">
                       {booking.timeAgo}
                     </span>
                   </td>
                   <td className="px-6 py-4 font-medium text-white">
                     {booking.passenger}
                   </td>
                   <td className="px-6 py-4 text-zinc-400">{booking.route}</td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <div
                         className={cn(
                           "w-2 h-2 rounded-full",
                           getSupplierColor(booking.supplier)
                         )}
                       />
                       {booking.supplier}
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <span
                       className={cn(
                         "px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                         getStatusColor(booking.status)
                       )}
                     >
                       {booking.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right font-mono text-emerald-500">
                     +{formatCurrency(booking.margin, booking.currency)}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
       </motion.div>
 
       {/* Booking Detail Slide-Over */}
       <Sheet
         open={selectedBooking !== null}
         onOpenChange={() => setSelectedBooking(null)}
       >
         <SheetContent
           side="right"
           className="w-full sm:w-[480px] bg-[#0A0A0A] p-0 border-l border-white/10"
         >
           {selectedBooking && (
             <BookingDetailSlideOver
               booking={selectedBooking}
               onClose={() => setSelectedBooking(null)}
             />
           )}
         </SheetContent>
       </Sheet>
     </div>
   );
 };
 
 export default BookingLedger;