/**
 * ZIVO Eats Premium - Mobile "Curated Dining" Experience
 * Real data from Supabase with dark glass UI
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search, Clock, Star, Flame, ShoppingBag, 
  MapPin, Plus, Zap, ArrowLeft, Loader2, Package, Heart, Bell
} from "lucide-react";
import { useRestaurants } from "@/hooks/useEatsOrders";
import { useCart } from "@/contexts/CartContext";
import { useEatsAlerts } from "@/hooks/useEatsAlerts";
import { FavoriteButton } from "./FavoriteButton";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ['All', 'Fine Dining', 'Healthy', 'Fast Food', 'Asian', 'Italian'];

export default function MobileEatsPremium() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data: restaurants, isLoading, error } = useRestaurants();
  const { getItemCount } = useCart();
  const { unreadCount } = useEatsAlerts();
  
  const cartCount = getItemCount();

  // Filter restaurants by category and search
  const filteredRestaurants = restaurants?.filter(r => {
    const matchesCategory = activeCategory === "All" || 
      r.cuisine_type?.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchQuery || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

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
          <button 
            onClick={() => navigate("/eats/cart")}
            className="w-12 h-12 bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold">
                {cartCount}
              </div>
            )}
          </button>
        </div>

        {/* AI Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <Search className="w-5 h-5 text-zinc-400" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Craving... (e.g. Spicy Ramen, Truffle Pizza)" 
              className="bg-transparent w-full outline-none text-white placeholder-zinc-500 font-medium text-base"
            />
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILLS */}
      <div className="pl-6 mb-6 overflow-x-auto hide-scrollbar">
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

      {/* Quick Links */}
      <div className="px-6 mb-6 flex gap-3">
        <button
          onClick={() => navigate("/eats/orders")}
          className="flex-1 bg-zinc-900/80 border border-white/10 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <span className="font-medium text-sm">My Orders</span>
        </button>
        <button
          onClick={() => navigate("/eats/favorites")}
          className="flex-1 bg-zinc-900/80 border border-white/10 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-medium text-sm">Favorites</span>
        </button>
      </div>

      {/* Alerts Quick Link */}
      {unreadCount > 0 && (
        <div className="px-6 mb-6">
          <button
            onClick={() => navigate("/eats/alerts")}
            className="w-full bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-orange-500" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                {unreadCount}
              </div>
            </div>
            <span className="font-medium text-sm text-orange-400">
              {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
            </span>
          </button>
        </div>
      )}

      {/* 3. LOADING STATE */}
      {isLoading && (
        <div className="px-6 pb-32 space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900">
              <Skeleton className="w-full h-full bg-zinc-800" />
            </div>
          ))}
        </div>
      )}

      {/* 4. EMPTY STATE */}
      {!isLoading && filteredRestaurants.length === 0 && (
        <div className="px-6 py-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold mb-2">No restaurants found</h3>
          <p className="text-sm text-zinc-500">
            {searchQuery ? "Try a different search" : "No restaurants available right now"}
          </p>
        </div>
      )}

      {/* 5. VISUAL MENU FEED */}
      {!isLoading && filteredRestaurants.length > 0 && (
        <div className="px-6 pb-32 space-y-8">
          {filteredRestaurants.map((restaurant) => (
            <motion.div 
              key={restaurant.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/eats/restaurant/${restaurant.id}`)}
              className="group relative h-[400px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900 cursor-pointer touch-manipulation"
            >
              {/* Full Bleed Image */}
              {restaurant.cover_image_url ? (
                <img 
                  src={restaurant.cover_image_url} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={restaurant.name}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-zinc-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

              {/* Floating Time Badge & Favorite */}
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <FavoriteButton restaurant={restaurant} size="sm" />
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-bold">
                    {restaurant.avg_prep_time ? `${restaurant.avg_prep_time}-${restaurant.avg_prep_time + 10} min` : "25-35 min"}
                  </span>
                </div>
              </div>

              {/* Open/Closed Badge */}
              {restaurant.is_open !== null && (
                <div className="absolute top-6 left-6">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    restaurant.is_open 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {restaurant.is_open ? "Open Now" : "Closed"}
                  </div>
                </div>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
                
                {/* Restaurant Tag */}
                {restaurant.rating && restaurant.rating >= 4.5 && (
                  <div className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                    <Flame className="w-3 h-3 fill-white" /> Popular
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black mb-1">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <span>{restaurant.cuisine_type || "Various"}</span>
                      {restaurant.rating && (
                        <>
                          <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                          <span className="flex items-center gap-1 text-orange-400">
                            <Star className="w-3 h-3 fill-orange-400" /> {restaurant.rating}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/eats/restaurant/${restaurant.id}`);
                    }}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-white/10 touch-manipulation active:scale-95"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                {/* Delivery Fee */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-400">
                  <MapPin className="w-3 h-3" /> 
                  <span>
                    Free Delivery
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
