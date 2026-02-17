 /**
  * ZIVO Mobile Search Screen
  * Premium "Cockpit" for Flights, "Sanctuary" for Hotels
  */
 import { useState } from "react";
 import { useNavigate, useSearchParams } from "react-router-dom";
 import { motion } from "framer-motion";
 import { 
   Plane, Car, Calendar, User, Search, 
   ArrowRight, Globe, TrendingUp, BedDouble, MapPin,
   Star, Wifi, Coffee, Waves, Wind, ChevronRight, Heart, Filter, Users
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import ZivoMobileNav from "@/components/app/ZivoMobileNav";
 import CarSearchFormPro from "@/components/search/CarSearchFormPro";
 import { useCurrency } from "@/contexts/CurrencyContext";
 
 type ServiceTab = "flights" | "hotels" | "cars";
 
 // Hotel data loaded from real search API
 interface MobileHotel {
   id: string;
   name: string;
   location: string;
   price: number;
   rating: string;
   match: string;
   tag: string;
   image: string;
   amenities: React.ComponentType<{ className?: string }>[];
 }
 
 // Hotels will be populated from real search results
 const featuredHotels: MobileHotel[] = [];
 
 const hotelMoods = ['Luxe', 'Eco', 'Creative', 'Zen', 'Cyber', 'Party'];
 
 // Trending destinations
 const destinations = [
   { city: "Tokyo", country: "Japan", price: "$840", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600" },
   { city: "Paris", country: "France", price: "$420", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600" },
   { city: "Bali", country: "Indonesia", price: "$910", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600" },
   { city: "London", country: "UK", price: "$380", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600" },
 ];
 
 export default function MobileSearch() {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const { format: formatCurrency } = useCurrency();
   const initialTab = (searchParams.get("tab") as ServiceTab) || "flights";
   const [activeTab, setActiveTab] = useState<ServiceTab>(initialTab);
   
   // Flight search state
   const [tripType, setTripType] = useState("round");
   const [cabin, setCabin] = useState("economy");
   
   // Hotel search state
   const [hotelMood, setHotelMood] = useState("Luxe");
   const [hotelDestination, setHotelDestination] = useState("");
 
   const serviceTabs = [
     { id: "flights" as ServiceTab, label: "Flights", icon: Plane },
     { id: "hotels" as ServiceTab, label: "Hotels", icon: BedDouble },
     { id: "cars" as ServiceTab, label: "Cars", icon: Car },
   ];
 
   const handleFlightSearch = () => {
     const tomorrow = new Date();
     tomorrow.setDate(tomorrow.getDate() + 7);
     navigate(`/flights/results?origin=JFK&destination=LHR&departDate=${tomorrow.toISOString().split('T')[0]}&passengers=2&cabinClass=${cabin}`);
   };
 
   const handleHotelView = (hotel: MobileHotel) => {
     navigate(`/hotels?destination=${encodeURIComponent(hotel.location)}`);
   };
 
   // Filter hotels by mood
   const filteredHotels = hotelMood === 'All' 
     ? featuredHotels 
     : featuredHotels.filter(h => h.tag === hotelMood || hotelMood === 'Luxe');
 
   return (
     <div className={cn(
       "relative min-h-screen font-sans text-white overflow-hidden pb-24",
       activeTab === "hotels" 
         ? "bg-zinc-950 selection:bg-emerald-500/30" 
         : "bg-zinc-950 selection:bg-sky-500/30"
     )}>
       
       {/* Ambient Background - Flights/Cars */}
       {activeTab !== "hotels" && (
         <div className="fixed inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=2000"
             className="w-full h-full object-cover opacity-30"
             alt="Sky"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950" />
         </div>
       )}
       
       {/* Hotels Background Glow */}
       {activeTab === "hotels" && (
         <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]" />
           <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
         </div>
       )}
 
       {/* Header */}
       <div className="relative z-10 px-6 pt-14 pb-4 flex justify-between items-center">
         {activeTab === "hotels" ? (
           <div>
             <h1 className="text-3xl font-black tracking-tight">
               Find Your <br/>
               <span className="text-emerald-400">Sanctuary</span>
             </h1>
             <p className="text-zinc-400 text-sm mt-1">Curated stays for the modern nomad.</p>
           </div>
         ) : (
           <div>
             <div className="text-sky-400 font-bold tracking-widest uppercase text-xs mb-1 flex items-center gap-2">
               <Globe className="w-3 h-3" /> Global Network
             </div>
             <h1 className="text-3xl font-black tracking-tight">
               Find Your <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">Horizon</span>
             </h1>
           </div>
         )}
         <button 
           onClick={() => navigate("/app/profile")}
           className={cn(
             "w-11 h-11 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center transition-all",
             activeTab === "hotels" ? "bg-white/5 hover:bg-white/10" : "bg-white/10 hover:bg-white/20"
           )}
         >
           {activeTab === "hotels" ? <Filter className="w-4 h-4" /> : <User className="w-5 h-5" />}
         </button>
       </div>
 
       {/* Service Tabs */}
       <div className="relative z-10 px-6 mb-4">
         <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
           {serviceTabs.map((tab) => {
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all touch-manipulation",
                   isActive
                     ? "bg-white text-zinc-900 shadow-lg"
                     : "text-zinc-400 hover:text-white"
                 )}
               >
                 <tab.icon className="w-4 h-4" />
                 {tab.label}
               </button>
             );
           })}
         </div>
       </div>
 
       {/* Flight Search - Premium "Cockpit" Design */}
       {activeTab === "flights" && (
         <div className="relative z-10 px-6">
           <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 shadow-2xl">
             
             {/* Trip Type Tabs */}
             <div className="flex bg-black/40 rounded-full p-1 w-fit mb-5 border border-white/5">
               {['round', 'one-way', 'multi'].map((type) => (
                 <button
                   key={type}
                   onClick={() => setTripType(type)}
                   className={cn(
                     "px-4 py-2 rounded-full text-xs font-bold uppercase transition-all",
                     tripType === type 
                       ? 'bg-zinc-800 text-white shadow-lg' 
                       : 'text-zinc-500 hover:text-zinc-300'
                   )}
                 >
                   {type.replace('-', ' ')}
                 </button>
               ))}
             </div>
 
             {/* Route Inputs */}
             <div className="space-y-3">
               <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                 <button 
                   className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-sky-500/50 transition-colors text-left group"
                 >
                   <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">From</div>
                   <div className="text-xl font-black group-hover:text-sky-400 transition-colors">NYC</div>
                   <div className="text-xs text-zinc-400 truncate">John F. Kennedy</div>
                 </button>
 
                 <button className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/20 z-10 hover:bg-sky-500 transition-colors">
                   <ArrowRight className="w-4 h-4" />
                 </button>
 
                 <button 
                   className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-sky-500/50 transition-colors text-left group"
                 >
                   <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">To</div>
                   <div className="text-xl font-black group-hover:text-sky-400 transition-colors">LHR</div>
                   <div className="text-xs text-zinc-400 truncate">London Heathrow</div>
                 </button>
               </div>
 
               {/* Date & Travelers */}
               <div className="grid grid-cols-2 gap-3">
                 <button className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:border-sky-500/50 transition-colors">
                   <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                     <Calendar className="w-3 h-3" /> Departure
                   </div>
                   <div className="font-bold">Feb 24, Wed</div>
                 </button>
                 <button className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:border-sky-500/50 transition-colors">
                   <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                     <User className="w-3 h-3" /> Travelers
                   </div>
                   <div className="font-bold">2 Adults</div>
                 </button>
               </div>
 
               {/* Cabin Class */}
               <div className="grid grid-cols-3 gap-2">
                 {['economy', 'business', 'first'].map((c) => (
                   <button 
                     key={c}
                     onClick={() => setCabin(c)}
                     className={cn(
                       "p-3 rounded-xl border text-center transition-all",
                       cabin === c 
                         ? 'bg-sky-600/20 border-sky-500 text-sky-400' 
                         : 'bg-transparent border-white/5 text-zinc-500 hover:bg-white/5'
                     )}
                   >
                     <div className="text-[10px] font-bold uppercase">{c}</div>
                   </button>
                 ))}
               </div>
             </div>
 
             {/* Search Button */}
             <button 
               onClick={handleFlightSearch}
               className="w-full mt-5 bg-white text-zinc-900 h-14 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
             >
               <Search className="w-5 h-5" /> Search Flights
             </button>
           </div>
         </div>
       )}
 
       {/* Hotels - Premium "Sanctuary" Design */}
       {activeTab === "hotels" && (
         <div className="relative z-10">
           {/* Search & Filters */}
           <div className="px-6 mb-4">
             {/* Glass Search Input */}
             <div className="relative mb-4">
               <Search className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
               <input 
                 value={hotelDestination}
                 onChange={(e) => setHotelDestination(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && hotelDestination) {
                     navigate(`/hotels?destination=${encodeURIComponent(hotelDestination)}`);
                   }
                 }}
                 placeholder="City, Hotel, or Vibe..." 
                 className="w-full h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder-zinc-500 outline-none focus:border-emerald-500/50 transition-colors"
               />
             </div>
 
             {/* Quick Date/Guest Row */}
             <div className="grid grid-cols-2 gap-3">
               <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-zinc-500" />
                 <div>
                   <div className="text-[10px] text-zinc-500 uppercase font-bold">Dates</div>
                   <div className="text-sm font-medium">Feb 14-17</div>
                 </div>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2">
                 <Users className="w-4 h-4 text-zinc-500" />
                 <div>
                   <div className="text-[10px] text-zinc-500 uppercase font-bold">Guests</div>
                   <div className="text-sm font-medium">2 Adults</div>
                 </div>
               </div>
             </div>
           </div>
 
           {/* Mood Selector */}
           <div className="pl-6 mb-6 overflow-x-auto hide-scrollbar">
             <div className="flex gap-3 pr-6 w-max">
               {hotelMoods.map((mood) => (
                 <button
                   key={mood}
                   onClick={() => setHotelMood(mood)}
                   className={cn(
                     "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                     hotelMood === mood 
                       ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                       : "bg-transparent border-white/10 text-zinc-400 hover:border-white/30"
                   )}
                 >
                   {mood}
                 </button>
               ))}
             </div>
           </div>
 
           {/* Immersive Hotel Cards */}
           <div className="px-6 space-y-6">
             {filteredHotels.map((hotel) => (
               <motion.div 
                 key={hotel.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => handleHotelView(hotel)}
                 className="group relative h-[400px] rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-900 cursor-pointer"
               >
                 {/* Background Image */}
                 <img 
                   src={hotel.image} 
                   className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                   alt={hotel.name}
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
 
                 {/* Top Tags */}
                 <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                   <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                     <Star className="w-3 h-3 fill-emerald-400" /> {hotel.match}
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); }}
                     className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                   >
                     <Heart className="w-5 h-5" />
                   </button>
                 </div>
 
                 {/* Bottom Info Card */}
                 <div className="absolute bottom-5 left-5 right-5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h3 className="text-lg font-bold text-white mb-0.5">{hotel.name}</h3>
                       <div className="flex items-center gap-1 text-xs text-zinc-300">
                         <MapPin className="w-3 h-3" /> {hotel.location}
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-xl font-black text-white">
                         {formatCurrency(hotel.price, 'USD')}
                       </div>
                       <div className="text-[10px] text-zinc-400">/ night</div>
                     </div>
                   </div>
 
                   {/* Amenities & Action */}
                   <div className="flex items-center justify-between">
                     <div className="flex gap-2">
                       {hotel.amenities.map((Icon, i) => (
                         <div key={i} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-300">
                           <Icon className="w-3 h-3" />
                         </div>
                       ))}
                     </div>
                     <button className="bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 hover:bg-emerald-400 transition-colors">
                       View <ChevronRight className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               </motion.div>
             ))}
           </div>
 
           {/* Partner Disclosure */}
           <div className="px-6 mt-6">
             <p className="text-center text-[10px] text-zinc-500">
               Prices shown are indicative. Final rates confirmed on partner sites.
             </p>
           </div>
         </div>
       )}
 
       {/* Cars Search */}
       {activeTab === "cars" && (
         <div className="relative z-10 px-6">
           <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 shadow-2xl">
             <CarSearchFormPro
               onSearch={(params) => {
                 navigate(`/rent-car/results?${params.toString()}`);
               }}
             />
           </div>
         </div>
       )}
 
       {/* Trending Destinations (Flights only) */}
       {activeTab === "flights" && (
         <div className="relative z-10 px-6 py-8">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-base font-bold flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-emerald-400" /> Trending Now
             </h2>
             <span className="text-xs text-zinc-500">From NYC</span>
           </div>
 
           <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x -mx-6 px-6">
             {destinations.map((dest, i) => (
               <motion.div 
                 key={i}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => {
                   const tomorrow = new Date();
                   tomorrow.setDate(tomorrow.getDate() + 14);
                   navigate(`/flights/results?origin=JFK&destination=${dest.city.substring(0,3).toUpperCase()}&departDate=${tomorrow.toISOString().split('T')[0]}&passengers=1&cabinClass=economy`);
                 }}
                 className="min-w-[180px] h-[240px] rounded-3xl relative overflow-hidden snap-start group cursor-pointer flex-shrink-0"
               >
                 <img 
                   src={dest.img} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                   alt={dest.city} 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                 
                 <div className="absolute bottom-4 left-4 right-4">
                   <div className="flex justify-between items-end">
                     <div>
                       <h3 className="text-lg font-bold">{dest.city}</h3>
                       <p className="text-xs text-zinc-300">{dest.country}</p>
                     </div>
                     <div className="text-right">
                       <div className="text-[10px] text-zinc-400">from</div>
                       <div className="font-mono font-bold text-emerald-400">{dest.price}</div>
                     </div>
                   </div>
                 </div>
               </motion.div>
             ))}
           </div>
         </div>
       )}
 
       {/* Bottom Navigation */}
       <ZivoMobileNav />
     </div>
   );
 }