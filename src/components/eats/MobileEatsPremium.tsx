 /**
  * ZIVO Eats Premium - Mobile "Curated Dining" Experience
  * Immersive restaurant discovery with visual menu feed
  */
 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useNavigate } from "react-router-dom";
 import { 
   Search, Clock, Star, Flame, ShoppingBag, 
   MapPin, Plus, Zap, ArrowLeft
 } from "lucide-react";
 
 // Premium Restaurant Data
 const restaurants = [
   {
     id: 1,
     name: "Nobu Downtown",
     cuisine: "Japanese Fusion",
     rating: "4.9",
     time: "25-35 min",
     delivery: "$0.00",
     image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000",
     featured: true,
     tag: "Chef's Choice"
   },
   {
     id: 2,
     name: "Carbone",
     cuisine: "Italian Fine Dining",
     rating: "4.8",
     time: "40-50 min",
     delivery: "$5.99",
     image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=1000",
     featured: false,
     tag: "Trending"
   },
   {
     id: 3,
     name: "Sweetgreen",
     cuisine: "Healthy Bowls",
     rating: "4.7",
     time: "15-25 min",
     delivery: "$1.99",
     image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
     featured: false,
     tag: "Healthy"
   },
   {
     id: 4,
     name: "Xi'an Famous Foods",
     cuisine: "Chinese Noodles",
     rating: "4.6",
     time: "20-30 min",
     delivery: "$2.99",
     image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=1000",
     featured: true,
     tag: "Local Favorite"
   }
 ];
 
 const categories = ['Recommended', 'Fine Dining', 'Healthy', 'Late Night', 'Comfort'];
 
 export default function MobileEatsPremium() {
   const [activeCategory, setActiveCategory] = useState("Recommended");
   const navigate = useNavigate();
 
   return (
     <div className="relative min-h-screen bg-zinc-950 font-sans text-white overflow-hidden selection:bg-orange-500/30">
       
       {/* Back Button */}
       <button 
         onClick={() => navigate("/")}
         className="fixed top-6 left-6 z-50 w-10 h-10 bg-zinc-900/80 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/10 touch-manipulation active:scale-95 transition-transform"
       >
         <ArrowLeft className="w-5 h-5" />
       </button>
 
       {/* 1. HEADER & AI SEARCH */}
       <div className="relative z-10 px-6 pt-16 pb-4">
         <div className="flex justify-between items-center mb-6">
           <div>
             <div className="flex items-center gap-2 text-orange-500 font-bold uppercase text-xs tracking-widest mb-1">
               <Zap className="w-3 h-3" /> Priority Delivery
             </div>
             <h1 className="text-4xl font-black tracking-tighter">
               Curated <br/>
               <span className="text-white">Dining</span>
             </h1>
           </div>
           <div className="w-12 h-12 bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center relative">
             <ShoppingBag className="w-5 h-5" />
             <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full border-2 border-zinc-950" />
           </div>
         </div>
 
         {/* AI Search Bar */}
         <div className="relative group">
           <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
             <Search className="w-5 h-5 text-zinc-400" />
             <input 
               placeholder="Craving... (e.g. Spicy Ramen, Truffle Pizza)" 
               className="bg-transparent w-full outline-none text-white placeholder-zinc-500 font-medium text-base"
             />
           </div>
         </div>
       </div>
 
       {/* 2. CATEGORY PILLS */}
       <div className="pl-6 mb-8 overflow-x-auto hide-scrollbar">
         <div className="flex gap-3 w-max pr-6">
           {categories.map((cat) => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border touch-manipulation active:scale-95 ${
                 activeCategory === cat 
                   ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/40" 
                   : "bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-zinc-800"
               }`}
             >
               {cat}
             </button>
           ))}
         </div>
       </div>
 
       {/* 3. VISUAL MENU FEED */}
       <div className="px-6 pb-32 space-y-8">
         {restaurants.map((place) => (
           <motion.div 
             key={place.id}
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             whileTap={{ scale: 0.98 }}
             className="group relative h-[400px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900 cursor-pointer touch-manipulation"
           >
             {/* Full Bleed Image */}
             <img 
               src={place.image} 
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               alt={place.name}
               loading="lazy"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
 
             {/* Floating Time Badge */}
             <div className="absolute top-6 right-6">
               <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                 <Clock className="w-3 h-3 text-orange-400" />
                 <span className="text-xs font-bold">{place.time}</span>
               </div>
             </div>
 
             {/* Content Overlay */}
             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
               
               {/* Restaurant Tag */}
               {place.featured && (
                 <div className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                   <Flame className="w-3 h-3 fill-white" /> {place.tag}
                 </div>
               )}
 
               <div className="flex justify-between items-end">
                 <div>
                   <h3 className="text-2xl font-black mb-1">{place.name}</h3>
                   <div className="flex items-center gap-2 text-sm text-zinc-300">
                     <span>{place.cuisine}</span>
                     <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                     <span className="flex items-center gap-1 text-orange-400">
                       <Star className="w-3 h-3 fill-orange-400" /> {place.rating}
                     </span>
                   </div>
                 </div>
                 
                 <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-white/10 touch-manipulation active:scale-95">
                   <Plus className="w-6 h-6" />
                 </button>
               </div>
 
               {/* Delivery Fee */}
               <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-400">
                 <MapPin className="w-3 h-3" /> 
                 <span>
                   {place.delivery === "$0.00" 
                     ? <span className="text-emerald-400 font-bold">Free Delivery</span> 
                     : `Delivery: ${place.delivery}`
                   }
                 </span>
               </div>
             </div>
           </motion.div>
         ))}
 
         {/* Coming Soon Notice */}
         <div className="text-center py-8 px-6">
           <p className="text-sm text-zinc-500">
             ZIVO Eats is coming soon. This is a preview of the experience.
           </p>
         </div>
       </div>
     </div>
   );
 }