 /**
  * BookingDetailSlideOver - Slide-over panel for booking management
  */
 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Copy, Download, Mail, X, RefreshCw, MessageSquare } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { type BookingLedgerItem } from "@/hooks/useBookingLedger";
 import { Textarea } from "@/components/ui/textarea";
 import { toast } from "sonner";
 
 interface BookingDetailSlideOverProps {
   booking: BookingLedgerItem;
   onClose: () => void;
 }
 
 const getStatusInfo = (status: string) => {
   switch (status) {
     case "TICKETED":
       return { label: "Confirmed & Ticketed", color: "text-emerald-500", dotColor: "bg-emerald-500" };
     case "PENDING":
       return { label: "Pending Confirmation", color: "text-amber-500", dotColor: "bg-amber-500" };
     case "FAILED":
       return { label: "Booking Failed", color: "text-red-500", dotColor: "bg-red-500" };
     case "CANCELLED":
       return { label: "Cancelled", color: "text-zinc-500", dotColor: "bg-zinc-500" };
     default:
       return { label: "Processing", color: "text-zinc-400", dotColor: "bg-zinc-400" };
   }
 };
 
 const BookingDetailSlideOver = ({ booking, onClose }: BookingDetailSlideOverProps) => {
   const [agentNotes, setAgentNotes] = useState("");
   const [isCheckingRefund, setIsCheckingRefund] = useState(false);
   const statusInfo = getStatusInfo(booking.status);
 
   const copyToClipboard = (text: string, label: string) => {
     navigator.clipboard.writeText(text);
     toast.success(`${label} copied to clipboard`);
   };
 
   const handleResendEmail = () => {
     toast.success("Confirmation email queued for resend");
   };
 
   const handleCancelBooking = () => {
     setIsCheckingRefund(true);
     // Simulate agentic pre-check
     setTimeout(() => {
       setIsCheckingRefund(false);
       toast.info("Refund eligibility: Check fare rules before proceeding");
     }, 1500);
   };
 
   return (
     <div className="h-full flex flex-col text-white">
       {/* Header */}
       <div className="p-6 border-b border-white/10">
         <div className="flex justify-between items-start">
           <div>
             <h2 className="text-2xl font-bold">{booking.bookingRef}</h2>
             <p className={cn("text-sm flex items-center gap-2 mt-1", statusInfo.color)}>
               <span className={cn("w-2 h-2 rounded-full animate-pulse", statusInfo.dotColor)} />
               {statusInfo.label}
             </p>
           </div>
           <button
             onClick={onClose}
             className="p-2 hover:bg-white/10 rounded-lg transition-colors"
           >
             <X className="w-4 h-4" />
           </button>
         </div>
       </div>
 
       {/* Scrollable Content */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6">
         {/* PNR Data Block */}
         <div className="bg-zinc-900 rounded-xl p-5 border border-white/5 space-y-4">
           <div className="flex justify-between items-center text-sm">
             <span className="text-zinc-500">Passenger</span>
             <span className="font-medium text-white">{booking.passenger}</span>
           </div>
           {booking.email && (
             <div className="flex justify-between items-center text-sm">
               <span className="text-zinc-500">Email</span>
               <button
                 onClick={() => copyToClipboard(booking.email!, "Email")}
                 className="font-mono text-white hover:text-primary transition-colors flex items-center gap-1"
               >
                 {booking.email}
                 <Copy className="w-3 h-3 opacity-50" />
               </button>
             </div>
           )}
           <div className="flex justify-between items-center text-sm">
             <span className="text-zinc-500">Route</span>
             <span className="text-white">{booking.route}</span>
           </div>
           {booking.pnr && (
             <div className="flex justify-between items-center text-sm">
               <span className="text-zinc-500">Airline PNR</span>
               <button
                 onClick={() => copyToClipboard(booking.pnr!, "PNR")}
                 className="font-mono text-white hover:text-primary transition-colors flex items-center gap-1"
               >
                 {booking.pnr}
                 <Copy className="w-3 h-3 opacity-50" />
               </button>
             </div>
           )}
           {booking.ticketNumber && (
             <div className="flex justify-between items-center text-sm">
               <span className="text-zinc-500">Ticket Number</span>
               <button
                 onClick={() => copyToClipboard(booking.ticketNumber!, "Ticket")}
                 className="font-mono text-white hover:text-primary transition-colors flex items-center gap-1"
               >
                 {booking.ticketNumber}
                 <Copy className="w-3 h-3 opacity-50" />
               </button>
             </div>
           )}
           <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
             <span className="text-zinc-500">Supplier</span>
             <span className="text-white">{booking.supplier}</span>
           </div>
         </div>
 
         {/* Financial Summary */}
         <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
             Financial
           </h3>
           <div className="space-y-3">
             <div className="flex justify-between text-sm">
               <span className="text-zinc-400">Total Paid</span>
               <span className="font-mono text-white">
                 {new Intl.NumberFormat("en-US", {
                   style: "currency",
                   currency: booking.currency,
                 }).format(booking.price)}
               </span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-zinc-400">Net Margin</span>
               <span className="font-mono text-emerald-500">
                 +{new Intl.NumberFormat("en-US", {
                   style: "currency",
                   currency: booking.currency,
                 }).format(booking.margin)}
               </span>
             </div>
           </div>
         </div>
 
         {/* Quick Actions Grid */}
         <div>
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
             Operations
           </h3>
           <div className="grid grid-cols-2 gap-4">
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handleResendEmail}
               className="p-4 bg-zinc-900 border border-white/5 rounded-xl text-left hover:border-primary/50 transition-colors group"
             >
               <Mail className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
               <div className="font-bold text-sm">Resend Email</div>
               <div className="text-[10px] text-zinc-500">Send itinerary to customer</div>
             </motion.button>
 
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => toast.success("PDF download started")}
               className="p-4 bg-zinc-900 border border-white/5 rounded-xl text-left hover:border-primary/50 transition-colors group"
             >
               <Download className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
               <div className="font-bold text-sm">Download PDF</div>
               <div className="text-[10px] text-zinc-500">Export booking details</div>
             </motion.button>
 
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handleCancelBooking}
               disabled={isCheckingRefund}
               className="p-4 bg-zinc-900 border border-white/5 rounded-xl text-left hover:border-red-500/50 transition-colors group disabled:opacity-50"
             >
               {isCheckingRefund ? (
                 <RefreshCw className="w-5 h-5 text-amber-500 mb-2 animate-spin" />
               ) : (
                 <X className="w-5 h-5 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
               )}
               <div className="font-bold text-sm text-red-400">
                 {isCheckingRefund ? "Checking..." : "Cancel Booking"}
               </div>
               <div className="text-[10px] text-zinc-500">
                 {isCheckingRefund ? "Verifying refund rules" : "Check refund rules first"}
               </div>
             </motion.button>
 
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => toast.info("Contact modal would open")}
               className="p-4 bg-zinc-900 border border-white/5 rounded-xl text-left hover:border-white/20 transition-colors group"
             >
               <MessageSquare className="w-5 h-5 text-zinc-400 mb-2 group-hover:scale-110 transition-transform" />
               <div className="font-bold text-sm">Contact</div>
               <div className="text-[10px] text-zinc-500">Message passenger</div>
             </motion.button>
           </div>
         </div>
 
         {/* Agent Notes */}
         <div>
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
             Agent Notes
           </h3>
           <Textarea
             value={agentNotes}
             onChange={(e) => setAgentNotes(e.target.value)}
             placeholder="Add internal notes about this booking..."
             className="w-full h-32 bg-zinc-900 border-white/10 text-white placeholder-zinc-600 focus:border-primary resize-none"
           />
         </div>
       </div>
 
       {/* Footer with timestamp */}
       <div className="p-4 border-t border-white/10 text-xs text-zinc-600">
         Created {booking.timeAgo}
       </div>
     </div>
   );
 };
 
 export default BookingDetailSlideOver;