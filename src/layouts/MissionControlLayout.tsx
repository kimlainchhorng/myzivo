 /**
  * MissionControlLayout - Dense, high-contrast admin workspace
  * Power-user focused with glass sidebar and system health widgets
  */
 import { Outlet, useLocation, useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Settings } from "lucide-react";
 import MissionControlSidebar from "@/components/admin/MissionControlSidebar";
 
 const MissionControlLayout = () => {
   const location = useLocation();
   const navigate = useNavigate();
 
   // Get current page title from pathname
   const getPageTitle = () => {
     const path = location.pathname.replace("/admin/ops", "").replace("/", "");
     switch (path) {
       case "":
       case "bookings":
         return "Bookings Ledger";
       case "inventory":
         return "Inventory Control";
       case "travelers":
         return "Travelers Database";
       case "resolutions":
         return "Issue Resolution Center";
       default:
         return "Mission Control";
     }
   };
 
   return (
     <div className="mission-control flex h-screen bg-[hsl(0_0%_2%)] text-white font-sans selection:bg-primary/30">
       {/* Sidebar Navigation */}
       <MissionControlSidebar />
 
       {/* Main Content Area */}
       <main className="flex-1 overflow-y-auto bg-grid-white">
         {/* Sticky Header */}
         <motion.header
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm sticky top-0 z-10"
         >
           <div className="flex items-center gap-4">
             <span className="text-zinc-500">/</span>
             <span className="font-bold">{getPageTitle()}</span>
           </div>
           <div className="flex items-center gap-4">
             <button
               onClick={() => navigate("/admin/settings")}
               className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
             >
               <Settings className="w-4 h-4" />
             </button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 border border-white/20" />
           </div>
         </motion.header>
 
         {/* Content */}
         <div className="p-8">
           <Outlet />
         </div>
       </main>
     </div>
   );
 };
 
 export default MissionControlLayout;