 /**
  * Premium Mobile Hotels Search - "Sanctuary" Design
  * Immersive hotel discovery with mood-based filtering
  */
 
 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { 
   Search, MapPin, Star, Wifi, Coffee, 
   Waves, Wind, ChevronRight, Heart, Filter,
   Calendar, Users, ArrowRight
 } from "lucide-react";
 import { useCurrency } from "@/contexts/CurrencyContext";
 
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
 
 // Hotels loaded from search — no hardcoded data
 const hotels: MobileHotel[] = [];
 
 const moods = ['Luxe', 'Eco', 'Creative', 'Zen', 'Cyber', 'Party'];
 
 interface MobileHotelSearchProps {
   onSearch?: (params: { destination: string; checkIn: Date; checkOut: Date }) => void;
 }
 
 export default function MobileHotelSearch({ onSearch }: MobileHotelSearchProps) {
   const navigate = useNavigate();
   const { format: formatCurrency } = useCurrency();
   const [activeMood, setActiveMood] = useState("Luxe");
   const [destination, setDestination] = useState("");
   const [showResults, setShowResults] = useState(true);
 
   const handleSearch = () => {
     if (onSearch && destination) {
       onSearch({
         destination,
         checkIn: new Date(),
         checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
       });
     }
     setShowResults(true);
   };
 
   const handleViewHotel = (hotel: MobileHotel) => {
     navigate(`/hotels?destination=${encodeURIComponent(hotel.location)}`);
   };
 
   // Filter hotels by mood
   const filteredHotels = activeMood === 'All' 
     ? hotels 
     : hotels.filter(h => h.tag === activeMood || activeMood === 'Luxe');
 
   return (
     <div className="relative min-h-screen bg-zinc-950 font-sans text-white overflow-hidden selection:bg-emerald-500/30 pb-24">
       
       {/* 1. BACKGROUND GLOW */}
       <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
       </div>
 
       {/* 2. HEADER & SEARCH */}
       <div className="relative z-10 px-6 pt-16 pb-6">
         <div className="flex justify-between items-end mb-8">
           <div>
             <h1 className="text-4xl font-black tracking-tighter mb-2">
               Find Your <br/> <span className="text-emerald-400">Sanctuary</span>
             </h1>
             <p className="text-zinc-400 text-sm">Curated stays for the modern nomad.</p>
           </div>
           <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all duration-200 touch-manipulation">
             <Filter className="w-4 h-4" />
           </button>
         </div>
 
         {/* Glass Search Input */}
         <div className="relative">
           <Search className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
           <input 
             value={destination}
             onChange={(e) => setDestination(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
             placeholder="City, Hotel, or Vibe..." 
             className="w-full h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder-zinc-500 outline-none focus:border-emerald-500/50 transition-colors"
           />
         </div>
 
         {/* Quick Date/Guest Row */}
         <div className="grid grid-cols-2 gap-3 mt-4">
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
 
       {/* 3. MOOD SELECTOR (The "Vibe" Filter) */}
       <div className="relative z-10 pl-6 mb-8 overflow-x-auto hide-scrollbar">
         <div className="flex gap-3 pr-6 w-max">
           {moods.map((mood) => (
             <button
               key={mood}
               onClick={() => setActiveMood(mood)}
               className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 touch-manipulation border ${
                 activeMood === mood 
                   ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                   : "bg-transparent border-white/10 text-zinc-400 hover:border-white/30"
               }`}
             >
               {mood}
             </button>
           ))}
         </div>
       </div>
 
       {/* 4. IMMERSIVE HOTEL LIST */}
       {showResults && (
         <div className="relative z-10 px-6 space-y-8">
           {filteredHotels.map((hotel) => (
             <motion.div 
               key={hotel.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               whileTap={{ scale: 0.98 }}
               onClick={() => handleViewHotel(hotel)}
               className="group relative h-[420px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900 cursor-pointer"
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
               <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                 <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                   <Star className="w-3 h-3 fill-emerald-400" /> {hotel.match}
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); }}
                   className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all duration-200 touch-manipulation text-white"
                 >
                   <Heart className="w-5 h-5" />
                 </button>
               </div>
 
               {/* Bottom Info Card */}
               <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="text-xl font-bold text-white mb-1">{hotel.name}</h3>
                     <div className="flex items-center gap-1 text-xs text-zinc-300">
                       <MapPin className="w-3 h-3" /> {hotel.location}
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-2xl font-black text-white">
                       {formatCurrency(hotel.price, 'USD')}
                     </div>
                     <div className="text-[10px] text-zinc-400">/ night</div>
                   </div>
                 </div>
 
                 {/* Amenities & Action */}
                 <div className="flex items-center justify-between">
                   <div className="flex gap-2">
                     {hotel.amenities.map((Icon, i) => (
                       <div key={i} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-300">
                         <Icon className="w-3.5 h-3.5" />
                       </div>
                     ))}
                   </div>
                   <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 active:scale-95 transition-all duration-200 touch-manipulation shadow-lg">
                     View <ChevronRight className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       )}
 
       {/* Partner Disclosure */}
       <div className="relative z-10 px-6 mt-8">
         <p className="text-center text-[10px] text-zinc-500">
           Prices shown are indicative. Final rates confirmed on partner sites.
         </p>
       </div>
     </div>
   );
 }