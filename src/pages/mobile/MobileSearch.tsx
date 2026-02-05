/**
 * ZIVO Mobile Search Screen
 * Premium "Cockpit" design with unified Flights/Hotels/Cars tabs
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plane, Hotel, Car, Calendar, User, Search, 
  ArrowRight, Globe, TrendingUp, BedDouble, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import HotelSearchFormPro from "@/components/search/HotelSearchFormPro";
import CarSearchFormPro from "@/components/search/CarSearchFormPro";

type ServiceTab = "flights" | "hotels" | "cars";

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
  const initialTab = (searchParams.get("tab") as ServiceTab) || "flights";
  const [activeTab, setActiveTab] = useState<ServiceTab>(initialTab);
  
  // Flight search state
  const [tripType, setTripType] = useState("round");
  const [cabin, setCabin] = useState("economy");

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

  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-white overflow-hidden selection:bg-sky-500/30 pb-24">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover opacity-30"
          alt="Sky"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-14 pb-6 flex justify-between items-center">
        <div>
          <div className="text-sky-400 font-bold tracking-widest uppercase text-xs mb-1 flex items-center gap-2">
            <Globe className="w-3 h-3" /> Global Network
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Find Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">Horizon</span>
          </h1>
        </div>
        <button 
          onClick={() => navigate("/app/profile")}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <User className="w-5 h-5" />
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
                  onClick={() => {/* Open airport picker */}}
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
                  onClick={() => {/* Open airport picker */}}
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

      {/* Hotels Search */}
      {activeTab === "hotels" && (
        <div className="relative z-10 px-6">
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 shadow-2xl">
            <HotelSearchFormPro
              onSearch={(params) => {
                const urlParams = new URLSearchParams({
                  city: params.citySlug,
                  checkIn: params.checkIn.toISOString().split('T')[0],
                  checkOut: params.checkOut.toISOString().split('T')[0],
                  adults: params.adults.toString(),
                  rooms: params.rooms.toString(),
                });
                navigate(`/hotels?${urlParams.toString()}`);
              }}
            />
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
