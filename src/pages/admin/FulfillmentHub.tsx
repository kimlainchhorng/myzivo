 /**
  * FulfillmentHub - Agentic Admin Dashboard
  * Proactively surfaces bookings needing attention
  * Features: Supplier Health, PNR Lifecycle, Margin Tracking, Alerts
  */
 import { useState, useEffect } from "react";
 import { Link } from "react-router-dom";
 import { motion, AnimatePresence } from "framer-motion";
 import {
   Activity,
   AlertTriangle,
   ArrowLeft,
   Bell,
   DollarSign,
   RefreshCw,
   Plane,
   Clock,
   CheckCircle2,
 } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { subHours, formatDistanceToNow } from "date-fns";
 
 // Import components
 import SupplierHealthPulse from "@/components/admin/SupplierHealthPulse";
 import PNRTimeline from "@/components/admin/PNRTimeline";
 import MarginTracker from "@/components/admin/MarginTracker";
 import AgenticAlertCard, { type AgenticAlert } from "@/components/admin/AgenticAlertCard";
 import { useSupplierHealth } from "@/hooks/useSupplierHealth";
 import { useFlightSystemHealth } from "@/hooks/useFlightSystemHealth";
 
 export default function FulfillmentHub() {
   const [activeTab, setActiveTab] = useState("alerts");
   const { data: supplierHealth } = useSupplierHealth();
   const { data: systemHealth, refetch: refetchHealth } = useFlightSystemHealth();
 
   // Fetch pending bookings needing attention
   const { data: pendingBookings, isLoading: loadingBookings } = useQuery({
     queryKey: ["pending-fulfillment"],
     queryFn: async () => {
       const fiveMinutesAgo = subHours(new Date(), 0.083); // 5 minutes
       const fifteenMinutesAgo = subHours(new Date(), 0.25); // 15 minutes
 
       // Get bookings with payment but no PNR yet
       const { data: pendingPNR } = await supabase
         .from("flight_bookings")
         .select("id, booking_reference, created_at, payment_status, ticketing_status, pnr")
         .eq("payment_status", "paid")
         .is("pnr", null)
         .lte("created_at", fiveMinutesAgo.toISOString())
         .order("created_at", { ascending: true })
         .limit(10);

       // Get bookings with PNR but no ticket
       const { data: pendingTicket } = await supabase
         .from("flight_bookings")
         .select("id, booking_reference, created_at, payment_status, ticketing_status, pnr")
         .eq("payment_status", "paid")
         .not("pnr", "is", null)
         .neq("ticketing_status", "issued")
         .lte("created_at", fifteenMinutesAgo.toISOString())
         .order("created_at", { ascending: true })
         .limit(10);
 
       return {
         pendingPNR: pendingPNR || [],
         pendingTicket: pendingTicket || [],
       };
     },
     refetchInterval: 30000, // 30 seconds
   });
 
   // Generate agentic alerts from data
   const alerts: AgenticAlert[] = [];
 
   // Add pending PNR alerts
   pendingBookings?.pendingPNR?.forEach((booking) => {
     alerts.push({
       id: `pnr-${booking.id}`,
       type: "pending_pnr",
       priority: "high",
       title: `PNR Delay: ${booking.booking_reference || "Booking"}`,
       description: `Payment received ${formatDistanceToNow(new Date(booking.created_at))} ago. No PNR from Duffel yet.`,
       bookingRef: booking.booking_reference || undefined,
       bookingId: booking.id,
       createdAt: booking.created_at,
     });
   });
 
   // Add ticketing delay alerts
   pendingBookings?.pendingTicket?.forEach((booking) => {
     alerts.push({
       id: `ticket-${booking.id}`,
       type: "ticketing_delay",
       priority: "high",
       title: `Ticketing Delay: ${booking.booking_reference || "Booking"}`,
       description: `PNR received but ticket not issued. Created ${formatDistanceToNow(new Date(booking.created_at))} ago.`,
       bookingRef: booking.booking_reference || undefined,
       bookingId: booking.id,
       createdAt: booking.created_at,
     });
   });
 
   // Add supplier degraded alerts
   supplierHealth?.suppliers?.forEach((supplier) => {
     if (supplier.status === "degraded" || supplier.status === "down") {
       alerts.push({
         id: `supplier-${supplier.name}`,
         type: "supplier_degraded",
         priority: supplier.status === "down" ? "critical" : "medium",
         title: `${supplier.name} API ${supplier.status === "down" ? "Down" : "Degraded"}`,
         description: `Latency: ${supplier.latencyMs}ms, Error rate: ${supplier.errorRate}%`,
         supplierName: supplier.name,
         createdAt: supplier.lastChecked,
       });
     }
   });
 
   // Sample recent bookings for timeline view
   const { data: recentBookings } = useQuery({
     queryKey: ["recent-bookings-timeline"],
     queryFn: async () => {
       const { data } = await supabase
         .from("flight_bookings")
         .select("id, booking_reference, created_at, payment_status, ticketing_status, pnr, ticketed_at")
         .eq("payment_status", "paid")
         .order("created_at", { ascending: false })
         .limit(5);
       return data || [];
     },
   });
 
   const handleAlertAction = (id: string, action: string) => {
     console.log("Alert action:", id, action);
     // Would navigate to appropriate view or trigger action
   };
 
   return (
     <div className="min-h-screen bg-background p-6 space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
           <Link to="/admin/operations">
             <Button variant="ghost" size="sm">
               <ArrowLeft className="w-4 h-4 mr-2" />
               Back
             </Button>
           </Link>
           <div>
             <h1 className="text-2xl font-bold flex items-center gap-2">
               Fulfillment Hub
               <Badge variant="outline" className="text-xs font-normal">
                 Agentic
               </Badge>
             </h1>
             <p className="text-sm text-muted-foreground">
               Proactive booking lifecycle management
             </p>
           </div>
         </div>
 
         <div className="flex items-center gap-3">
           {/* Overall health indicator */}
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
             <div
               className={`w-2 h-2 rounded-full ${
                 systemHealth?.overall === "healthy"
                   ? "bg-emerald-500"
                   : systemHealth?.overall === "degraded"
                   ? "bg-amber-500"
                   : "bg-destructive"
               }`}
             />
             <span className="text-xs font-medium capitalize">
               {systemHealth?.overall || "Unknown"}
             </span>
           </div>
 
           <Button variant="outline" size="sm" onClick={() => refetchHealth()}>
             <RefreshCw className="w-4 h-4" />
           </Button>
         </div>
       </div>
 
       {/* Alert count banner */}
       {alerts.length > 0 && (
         <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
         >
           <Bell className="w-5 h-5 text-amber-500" />
           <span className="font-medium">
             {alerts.length} issue{alerts.length !== 1 ? "s" : ""} requiring attention
           </span>
           <div className="flex-1" />
           <div className="flex gap-2">
             {alerts.filter((a) => a.priority === "critical").length > 0 && (
               <Badge variant="destructive">
                 {alerts.filter((a) => a.priority === "critical").length} Critical
               </Badge>
             )}
             {alerts.filter((a) => a.priority === "high").length > 0 && (
               <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                 {alerts.filter((a) => a.priority === "high").length} High
               </Badge>
             )}
           </div>
         </motion.div>
       )}
 
       {/* Main content */}
       <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList>
           <TabsTrigger value="alerts" className="gap-2">
             <AlertTriangle className="w-4 h-4" />
             Alerts
             {alerts.length > 0 && (
               <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-[10px]">
                 {alerts.length}
               </Badge>
             )}
           </TabsTrigger>
           <TabsTrigger value="lifecycle" className="gap-2">
             <Clock className="w-4 h-4" />
             PNR Lifecycle
           </TabsTrigger>
           <TabsTrigger value="health" className="gap-2">
             <Activity className="w-4 h-4" />
             Supplier Health
           </TabsTrigger>
           <TabsTrigger value="margins" className="gap-2">
             <DollarSign className="w-4 h-4" />
             Margins
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="alerts" className="mt-6">
           <div className="grid gap-4 lg:grid-cols-2">
             <AnimatePresence mode="popLayout">
               {alerts.length === 0 ? (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="lg:col-span-2 flex flex-col items-center justify-center p-12 rounded-xl border border-dashed"
                 >
                   <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                   <h3 className="font-semibold text-lg mb-1">All Clear</h3>
                   <p className="text-sm text-muted-foreground">
                     No issues requiring attention right now
                   </p>
                 </motion.div>
               ) : (
                 alerts.map((alert) => (
                   <AgenticAlertCard
                     key={alert.id}
                     alert={alert}
                     onAction={handleAlertAction}
                   />
                 ))
               )}
             </AnimatePresence>
           </div>
         </TabsContent>
 
         <TabsContent value="lifecycle" className="mt-6 space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Plane className="w-5 h-5" />
                 Recent Booking Lifecycles
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               {recentBookings?.map((booking) => (
                 <div key={booking.id} className="pb-6 border-b border-border/50 last:border-0 last:pb-0">
                   <div className="flex items-center justify-between mb-4">
                     <div>
                       <p className="font-mono font-medium">
                         {booking.booking_reference || `FL-${booking.id.slice(0, 8)}`}
                       </p>
                       <p className="text-xs text-muted-foreground">
                         Created {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                       </p>
                     </div>
                     <Badge
                       variant={
                         booking.ticketing_status === "issued"
                           ? "default"
                           : booking.ticketing_status === "failed"
                           ? "destructive"
                           : "secondary"
                       }
                     >
                       {booking.ticketing_status || "pending"}
                     </Badge>
                   </div>
                   <PNRTimeline
                     bookingId={booking.id}
                     paymentAuthorizedAt={booking.payment_status === "paid" ? booking.created_at : undefined}
                     supplierNotifiedAt={booking.pnr ? booking.created_at : undefined}
                     pnrReceivedAt={booking.pnr ? booking.created_at : undefined}
                     ticketIssuedAt={booking.ticketed_at || undefined}
                   />
                 </div>
               ))}
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="health" className="mt-6">
           <div className="grid gap-6 lg:grid-cols-2">
             <SupplierHealthPulse />
             <Card>
               <CardHeader>
                 <CardTitle>System Overview</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-lg bg-muted/30 text-center">
                     <p className="text-2xl font-bold">{systemHealth?.duffel.totalSearches || 0}</p>
                     <p className="text-xs text-muted-foreground">Searches (1h)</p>
                   </div>
                   <div className="p-4 rounded-lg bg-muted/30 text-center">
                     <p className="text-2xl font-bold">{systemHealth?.duffel.avgResponseTime || 0}ms</p>
                     <p className="text-xs text-muted-foreground">Avg Response</p>
                   </div>
                   <div className="p-4 rounded-lg bg-muted/30 text-center">
                     <p className="text-2xl font-bold">{systemHealth?.bookings.totalToday || 0}</p>
                     <p className="text-xs text-muted-foreground">Bookings Today</p>
                   </div>
                   <div className="p-4 rounded-lg bg-muted/30 text-center">
                     <p className="text-2xl font-bold">{systemHealth?.bookings.pendingTickets || 0}</p>
                     <p className="text-xs text-muted-foreground">Pending Tickets</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         <TabsContent value="margins" className="mt-6">
           <MarginTracker showBookings limit={10} />
         </TabsContent>
       </Tabs>
     </div>
   );
 }