/**
 * RideQuickSearch — Streamlined ride search with recent destinations, 
 * smart suggestions, and quick rebook
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Clock, Star, Navigation, ArrowRight, Home, Building2, Plane, Bookmark, ChevronRight, Sparkles, History, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const savedPlaces = [
  { id: "home", name: "Home", address: "123 Main St, Apt 4B", icon: Home, color: "text-emerald-500" },
  { id: "work", name: "Work", address: "400 Tech Blvd, Floor 12", icon: Building2, color: "text-sky-500" },
  { id: "airport", name: "Airport", address: "JFK Terminal 4", icon: Plane, color: "text-violet-500" },
];

const recentDestinations = [
  { id: "1", address: "Downtown Gym, 55 Fitness Ave", time: "Yesterday, 6:30 PM", rides: 8 },
  { id: "2", address: "Grand Hotel, 200 Park Ave", time: "3 days ago", rides: 2 },
  { id: "3", address: "Central Mall, 88 Shopping Dr", time: "Last week", rides: 5 },
];

const smartSuggestions = [
  { id: "morning", label: "Morning commute to Work", eta: "12 min", price: "$11-14", confidence: 95 },
  { id: "gym", label: "Evening gym session", eta: "8 min", price: "$7-9", confidence: 82 },
];

export default function RideQuickSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const filteredRecent = recentDestinations.filter(d =>
    d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Greeting + search */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-black text-foreground">{greeting} 👋</h2>
          <p className="text-xs text-muted-foreground">Where are you heading?</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search destination..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-12 pl-10 rounded-2xl text-sm font-medium bg-muted/30 border-border/30 focus:bg-card"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* AI suggestions — time-aware */}
      {!searchQuery && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Sparkles className="w-3 h-3 text-primary" /> Smart Suggestions
          </h3>
          {smartSuggestions.map(s => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toast.success(`Booking: ${s.label}`)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/15 text-left transition-colors hover:border-primary/30"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">{s.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{s.eta}</span>
                  <span className="text-[10px] font-bold text-foreground">{s.price}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[8px] font-bold">{s.confidence}% match</Badge>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Saved places */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Saved Places</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {savedPlaces.map(place => {
            const Icon = place.icon;
            return (
              <button
                key={place.id}
                onClick={() => toast.success(`Navigating to ${place.name}`)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border border-border/40 shrink-0 active:scale-[0.97] transition-transform"
              >
                <Icon className={cn("w-4 h-4", place.color)} />
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">{place.name}</p>
                  <p className="text-[9px] text-muted-foreground truncate max-w-[120px]">{place.address}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent destinations */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
          <History className="w-3 h-3" /> Recent Destinations
        </h3>
        {(searchQuery ? filteredRecent : recentDestinations).map(dest => (
          <motion.button
            key={dest.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success(`Rebooking to ${dest.address.split(",")[0]}`)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 text-left hover:border-primary/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{dest.address}</p>
              <p className="text-[10px] text-muted-foreground">{dest.time} · {dest.rides} trips</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
        {searchQuery && filteredRecent.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">No matching destinations</p>
          </div>
        )}
      </div>

      {/* Quick rebook */}
      {!searchQuery && (
        <div className="rounded-2xl bg-muted/20 border border-border/30 p-4 text-center">
          <p className="text-xs font-bold text-foreground mb-1">Quick Rebook</p>
          <p className="text-[10px] text-muted-foreground mb-3">Tap any recent destination above to instantly rebook</p>
          <Badge variant="outline" className="text-[9px] font-bold">Same route, same preferences</Badge>
        </div>
      )}
    </div>
  );
}
