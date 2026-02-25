 /**
  * MobileTripsPremium Component
  * Premium "Living Timeline" trips experience for mobile
  */
 import { useState, ReactNode } from "react";
 import { Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { 
   Plane, Car, BedDouble, Calendar, Clock, 
   MapPin, CloudRain, ChevronRight, MoreVertical, 
   Ticket, Phone, ShieldCheck, ArrowLeft, LucideIcon
 } from "lucide-react";
 
 interface TimelineItemProps {
   icon: LucideIcon;
   time: string;
   title: string;
   subtitle: string;
   status: string;
   isLive?: boolean;
   children: ReactNode;
 }
 
 const TimelineItem = ({ icon: Icon, time, title, subtitle, status, isLive, children }: TimelineItemProps) => (
   <div className="relative pl-12 mb-10 group">
     {/* Time Marker */}
     <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-zinc-950 ${isLive ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-zinc-800 border-zinc-950'}`}>
       <Icon className={`w-4 h-4 ${isLive ? 'text-white' : 'text-zinc-400'}`} />
     </div>
 
     {/* Header Info */}
     <div className="flex justify-between items-start mb-4 pt-1">
       <div>
         <div className="flex items-center gap-2 mb-0.5">
           <span className="text-xs font-bold text-zinc-500">{time}</span>
           {isLive && <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md animate-pulse">LIVE</span>}
         </div>
         <h3 className="text-lg font-bold text-white">{title}</h3>
         <p className="text-sm text-zinc-400">{subtitle}</p>
       </div>
       <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 bg-white/5 px-2 py-1 rounded-md">
         {status}
       </div>
     </div>
 
     {/* Card Content */}
     {children}
   </div>
 );
 
 export const MobileTripsPremium = () => {
   const [activeTab, setActiveTab] = useState("Upcoming");
 
   return (
     <div className="relative min-h-screen bg-zinc-950 font-sans text-white overflow-hidden selection:bg-blue-500/30">
       
       {/* Back Button */}
        <Link 
          to="/" 
          className="fixed top-6 left-6 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold border border-white/20 backdrop-blur-md flex items-center gap-2 touch-manipulation active:scale-90 transition-all duration-200 min-h-[36px]"
        >
         <ArrowLeft className="w-4 h-4" /> Back
       </Link>
 
       {/* 1. HEADER & TRIP SELECTOR */}
       <div className="relative z-10 pt-16 px-6 pb-8 bg-gradient-to-b from-zinc-950 to-transparent sticky top-0 backdrop-blur-sm">
         <div className="flex justify-between items-end mb-6">
           <div>
             <div className="text-blue-500 font-bold uppercase text-xs tracking-widest mb-1 flex items-center gap-2">
               <Calendar className="w-3 h-3" /> Feb 24 — Mar 02
             </div>
             <h1 className="text-4xl font-black tracking-tighter">NYC <span className="text-zinc-600">→</span> LHR</h1>
           </div>
           <button className="w-11 h-11 bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center touch-manipulation active:scale-90 transition-all duration-200 min-w-[44px] min-h-[44px] hover:bg-zinc-800">
              <MoreVertical className="w-5 h-5" />
           </button>
         </div>
 
         {/* Tab Switcher */}
         <div className="bg-zinc-900/50 p-1 rounded-xl border border-white/10 flex relative">
            <motion.div 
              className="absolute inset-y-1 w-[calc(50%-4px)] bg-zinc-800 rounded-xl shadow-lg"
              animate={{ x: activeTab === 'Upcoming' ? 4 : 'calc(100% + 4px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            {['Upcoming', 'Past'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative z-10 flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 ${activeTab === tab ? 'text-white' : 'text-zinc-500'}`}
              >
                {tab}
              </button>
            ))}
         </div>
       </div>
 
       {/* 2. THE LIVING TIMELINE */}
       <div className="relative px-6 pb-32">
         {/* The Connector Line */}
         <div className="absolute left-[2.25rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent opacity-30" />
 
         {/* --- EVENT 1: FLIGHT (Live Status) --- */}
         <TimelineItem 
           icon={Plane} 
           time="08:30 AM" 
           title="Flight to London"
           subtitle="Delta • DL 402"
           status="On Time"
           isLive={true}
         >
           {/* Flight Detail Card */}
           <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-50">
                <Ticket className="w-12 h-12 text-white/5" />
             </div>
             
             <div className="flex justify-between mb-6">
                <div className="text-center">
                  <div className="text-3xl font-black">JFK</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">New York</div>
                </div>
                <div className="flex flex-col items-center justify-center px-4 w-full">
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">7h 20m</div>
                  <div className="w-full h-0.5 bg-zinc-800 relative">
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                     <Plane className="absolute right-0 -top-4 w-4 h-4 text-white rotate-90" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black">LHR</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">London</div>
                </div>
             </div>
 
             <div className="grid grid-cols-3 gap-2 text-center bg-white/5 rounded-xl p-3">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Gate</div>
                  <div className="text-lg font-bold text-white">B24</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Seat</div>
                  <div className="text-lg font-bold text-white">4A</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Group</div>
                  <div className="text-lg font-bold text-white">SKY</div>
                </div>
             </div>
 
             <button className="w-full mt-4 bg-white text-black py-3 rounded-2xl font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 touch-manipulation min-h-[44px] shadow-lg">
               View Boarding Pass
             </button>
           </div>
         </TimelineItem>
 
         {/* --- EVENT 2: RIDE (Linked) --- */}
         <TimelineItem 
           icon={Car} 
           time="08:45 PM" 
           title="Airport Pickup"
           subtitle="ZIVO Black • Mercedes S-Class"
           status="Confirmed"
         >
           <div className="bg-zinc-900 border border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:border-white/20 hover:shadow-lg transition-all duration-200 touch-manipulation active:scale-[0.99]">
              <img 
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=200" 
                className="w-16 h-16 rounded-xl object-cover"
                alt="Car"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-xs font-bold text-white">James D.</span>
                   <span className="flex items-center gap-0.5 text-[10px] text-yellow-500"><ShieldCheck className="w-3 h-3" /> 4.9</span>
                </div>
                <div className="text-xs text-zinc-400">License: 8XJ-292</div>
              </div>
              <button className="w-11 h-11 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center touch-manipulation active:scale-90 transition-all duration-200 min-w-[44px] min-h-[44px]">
                <Phone className="w-4 h-4" />
              </button>
           </div>
         </TimelineItem>
 
         {/* --- EVENT 3: HOTEL (Destination) --- */}
         <TimelineItem 
           icon={BedDouble} 
           time="09:30 PM" 
           title="The London EDITION"
           subtitle="Check-in • King Suite"
           status="Feb 24 - Mar 02"
         >
            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-5 relative overflow-hidden group">
               <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
                  alt="Hotel"
               />
               <div className="relative z-10 flex justify-between items-start">
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold">10 Berners St, London</span>
                     </div>
                     <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <CloudRain className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold">Rainy, 12°C</span>
                     </div>
                  </div>
                  <button className="bg-white/10 backdrop-blur-md p-2.5 rounded-full border border-white/10 touch-manipulation active:scale-90 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/20">
                     <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </TimelineItem>
 
       </div>
     </div>
   );
 };
 
 export default MobileTripsPremium;