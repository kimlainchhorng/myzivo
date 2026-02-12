 /**
  * MissionControlSidebar - Glass sidebar with nav and API health widget
  */
 import { useState } from "react";
 import { useNavigate, useLocation } from "react-router-dom";
 import { motion } from "framer-motion";
 import {
  LayoutDashboard,
  Plane,
  Hotel,
  Users,
  AlertCircle,
  Activity,
  HeartPulse,
} from "lucide-react";
 import { useSupplierHealth } from "@/hooks/useSupplierHealth";
 import { cn } from "@/lib/utils";
 
 const navItems = [
   { id: "dashboard", path: "/admin/ops", icon: LayoutDashboard, label: "Overview" },
   { id: "bookings", path: "/admin/ops/bookings", icon: Plane, label: "Live Bookings" },
   { id: "inventory", path: "/admin/ops/inventory", icon: Hotel, label: "Inventory" },
   { id: "travelers", path: "/admin/ops/travelers", icon: Users, label: "Travelers" },
  { id: "resolutions", path: "/admin/ops/resolutions", icon: AlertCircle, label: "Resolutions", alertCount: 2 },
  { id: "system-health", path: "/admin/system-health", icon: HeartPulse, label: "System Health" },
];
 
 const MissionControlSidebar = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const { data: healthData } = useSupplierHealth({ refetchInterval: 15000 });
 
   const isActive = (path: string) => {
     if (path === "/admin/ops") {
       return location.pathname === "/admin/ops" || location.pathname === "/admin/ops/";
     }
     return location.pathname.startsWith(path);
   };
 
   const getLatencyColor = (latency: number) => {
     if (latency < 200) return "text-emerald-400";
     if (latency < 500) return "text-amber-400";
     return "text-red-400";
   };
 
   const getLatencyBarWidth = (latency: number) => {
     // Scale: 0-1000ms maps to 0-100%
     return Math.min((latency / 1000) * 100, 100);
   };
 
   const getLatencyBarColor = (latency: number) => {
     if (latency < 200) return "bg-emerald-500";
     if (latency < 500) return "bg-amber-500";
     return "bg-red-500";
   };
 
   return (
     <motion.aside
       initial={{ x: -20, opacity: 0 }}
       animate={{ x: 0, opacity: 1 }}
       className="w-64 mc-sidebar flex flex-col"
     >
       {/* Branding */}
       <div className="p-6 border-b border-white/5">
         <div className="text-xl font-black tracking-tighter">
           ZIVO<span className="text-primary">.OPS</span>
         </div>
         <div className="text-[10px] text-zinc-500 font-mono mt-1">
           V2.4 • SYSTEM ONLINE
         </div>
       </div>
 
       {/* Navigation */}
       <nav className="flex-1 p-4 space-y-1">
         {navItems.map((item) => (
           <button
             key={item.id}
             onClick={() => navigate(item.path)}
             className={cn(
               "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
               isActive(item.path)
                 ? "bg-primary text-white shadow-lg shadow-primary/20"
                 : "text-zinc-400 hover:bg-white/5 hover:text-white"
             )}
           >
             <div className="flex items-center gap-3">
               <item.icon className="w-4 h-4" />
               {item.label}
             </div>
             {item.alertCount && (
               <span className="bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                 {item.alertCount}
               </span>
             )}
           </button>
         ))}
       </nav>
 
       {/* API Health Widget */}
       <div className="p-4 border-t border-white/5">
         <div className="mc-card rounded-xl p-3">
           <div className="flex items-center gap-2 mb-3 text-xs text-zinc-400 uppercase font-bold">
             <Activity className="w-3 h-3 text-emerald-500" />
             API Latency
           </div>
           <div className="space-y-3">
             {healthData?.suppliers.slice(0, 2).map((supplier) => (
               <div key={supplier.name} className="space-y-1">
                 <div className="flex justify-between text-[10px] font-mono">
                   <span className="text-zinc-400">{supplier.name}</span>
                   <span className={getLatencyColor(supplier.latencyMs)}>
                     {supplier.latencyMs}ms
                   </span>
                 </div>
                 <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <div
                     className={cn("h-full transition-all", getLatencyBarColor(supplier.latencyMs))}
                     style={{ width: `${100 - getLatencyBarWidth(supplier.latencyMs)}%` }}
                   />
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </motion.aside>
   );
 };
 
 export default MissionControlSidebar;