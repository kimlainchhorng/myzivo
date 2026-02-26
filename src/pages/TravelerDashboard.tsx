/**
 * TravelerDashboard Page
 * Premium 2026-era traveler profile with glassmorphism
 */
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TripTimeline, AIConciergeTrigger } from "@/components/profile";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Globe, MapPin, Plane, Star, Trophy, Bookmark, ChevronRight,
  Compass, Camera, Leaf, Award, TrendingUp, Heart, Package,
} from "lucide-react";

export default function TravelerDashboard() {
  const { user, isLoading } = useAuth();
  const [showBucketList, setShowBucketList] = useState(false);
  const [showTravelMap, setShowTravelMap] = useState(false);
  const [showPackingHelper, setShowPackingHelper] = useState(false);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Traveler";

  const travelAchievements = [
    { name: "Globe Trotter", desc: "Visited 5+ countries", icon: Globe, earned: true, color: "text-sky-500" },
    { name: "Early Bird", desc: "Booked 10+ flights", icon: Plane, earned: true, color: "text-amber-500" },
    { name: "Eco Traveler", desc: "5 carbon-neutral trips", icon: Leaf, earned: true, color: "text-emerald-500" },
    { name: "Adventurer", desc: "Visited 3 continents", icon: Compass, earned: false, color: "text-violet-500" },
    { name: "Snapshot", desc: "Shared 20 trip photos", icon: Camera, earned: false, color: "text-pink-500" },
    { name: "VIP Status", desc: "Reach Gold tier", icon: Award, earned: false, color: "text-amber-500" },
  ];

  const bucketList = [
    { dest: "Santorini", country: "Greece", flag: "🇬🇷", status: "planned", season: "Jun-Sep" },
    { dest: "Kyoto", country: "Japan", flag: "🇯🇵", status: "dreaming", season: "Mar-May" },
    { dest: "Patagonia", country: "Argentina", flag: "🇦🇷", status: "dreaming", season: "Nov-Mar" },
    { dest: "Amalfi Coast", country: "Italy", flag: "🇮🇹", status: "planned", season: "May-Oct" },
    { dest: "Maldives", country: "Maldives", flag: "🇲🇻", status: "dreaming", season: "Nov-Apr" },
  ];

  const travelJournal = [
    { trip: "Paris Weekend", date: "Feb 2026", rating: 5, highlight: "Eiffel Tower at sunset", emoji: "🗼" },
    { trip: "Tokyo Adventure", date: "Jan 2026", rating: 5, highlight: "Tsukiji market sushi", emoji: "🍣" },
    { trip: "Miami Beach", date: "Dec 2025", rating: 4, highlight: "Art Deco architecture", emoji: "🌴" },
  ];

  const packingChecklist = [
    { category: "Essentials", items: ["Passport", "Wallet", "Phone charger", "Medications"] },
    { category: "Clothing", items: ["Underwear (days+1)", "Comfortable shoes", "Weather layers", "Sleepwear"] },
    { category: "Tech", items: ["Adapter/converter", "Headphones", "Power bank", "Camera"] },
    { category: "Comfort", items: ["Neck pillow", "Eye mask", "Snacks", "Water bottle"] },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      <SEOHead title="My Dashboard – ZIVO" description="View your travel overview, achievements, and upcoming trips on ZIVO." noIndex={true} />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(var(--primary)/0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="pt-20 px-4 sm:px-6 pb-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-7xl mx-auto mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, <span className="text-primary">{firstName}</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your travel overview.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
          <motion.div className="lg:col-span-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <TripTimeline />

            {/* === WAVE 6: Rich Traveler Content === */}
            <div className="space-y-6 mt-8">
              {/* Travel Achievements */}
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Achievements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {travelAchievements.map(a => (
                    <Card key={a.name} className={cn("border-border/40 transition-all", a.earned ? "hover:border-primary/20" : "opacity-50")}>
                      <CardContent className="p-3 text-center">
                        <a.icon className={cn("w-6 h-6 mx-auto mb-1", a.earned ? a.color : "text-muted-foreground/40")} />
                        <p className="text-xs font-bold text-foreground">{a.name}</p>
                        <p className="text-[9px] text-muted-foreground">{a.desc}</p>
                        {a.earned && <Badge className="mt-1 bg-emerald-500/10 text-emerald-500 border-0 text-[8px]">Earned</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Travel Journal */}
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Camera className="w-5 h-5 text-pink-500" /> Travel Journal</h2>
                <div className="space-y-2">
                  {travelJournal.map(j => (
                    <Card key={j.trip} className="border-border/40 hover:border-primary/20 transition-all">
                      <CardContent className="p-4 flex items-center gap-3">
                        <span className="text-2xl">{j.emoji}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-foreground">{j.trip}</p>
                          <p className="text-[10px] text-muted-foreground">{j.date} · {j.highlight}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: j.rating }).map((_, i) => <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Bucket List */}
              <div>
                <button onClick={() => setShowBucketList(!showBucketList)} className="w-full flex items-center gap-2 text-lg font-bold mb-3">
                  <Heart className="w-5 h-5 text-destructive" /> Bucket List
                  <ChevronRight className={cn("w-4 h-4 ml-auto transition-transform", showBucketList && "rotate-90")} />
                </button>
                {showBucketList && (
                  <div className="space-y-2">
                    {bucketList.map(b => (
                      <Card key={b.dest} className="border-border/40">
                        <CardContent className="p-3 flex items-center gap-3">
                          <span className="text-lg">{b.flag}</span>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-foreground">{b.dest}, {b.country}</p>
                            <p className="text-[10px] text-muted-foreground">Best: {b.season}</p>
                          </div>
                          <Badge className={cn("text-[8px] border-0", b.status === "planned" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground")}>
                            {b.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Packing Helper */}
              <div>
                <button onClick={() => setShowPackingHelper(!showPackingHelper)} className="w-full flex items-center gap-2 text-lg font-bold mb-3">
                  <Package className="w-5 h-5 text-violet-500" /> Smart Packing List
                  <ChevronRight className={cn("w-4 h-4 ml-auto transition-transform", showPackingHelper && "rotate-90")} />
                </button>
                {showPackingHelper && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {packingChecklist.map(c => (
                      <Card key={c.category} className="border-border/40">
                        <CardContent className="p-3">
                          <p className="text-xs font-bold text-foreground mb-2">{c.category}</p>
                          <div className="space-y-1">
                            {c.items.map(item => (
                              <div key={item} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <div className="w-3.5 h-3.5 rounded border border-border/60 flex-shrink-0" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Travel Stats Summary */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Travel Score</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: "82", label: "Score", sub: "/100" },
                      { val: "8", label: "Countries", sub: "" },
                      { val: "28K", label: "Miles", sub: "" },
                      { val: "3/6", label: "Badges", sub: "" },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className="text-sm font-bold text-primary">{s.val}<span className="text-[9px] text-muted-foreground">{s.sub}</span></p>
                        <p className="text-[9px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div className="lg:col-span-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            {/* SavedForLater removed */}
          </motion.div>
        </div>
      </div>

      <AIConciergeTrigger />
      <MobileBottomNav />
    </div>
  );
}
