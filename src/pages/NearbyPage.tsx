import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Users, Tag, Navigation, Coffee, ShoppingBag, Camera, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface NearbyItem {
  id: string;
  type: "user" | "post" | "deal" | "place";
  name: string;
  description: string;
  distance: string;
  icon: any;
  color: string;
}

const MOCK_NEARBY: NearbyItem[] = [
  { id: "1", type: "user", name: "Alex M.", description: "Online now", distance: "0.2 mi", icon: Users, color: "text-blue-500 bg-blue-500/10" },
  { id: "2", type: "deal", name: "50% off at Café Luna", description: "Valid today only", distance: "0.3 mi", icon: Coffee, color: "text-green-500 bg-green-500/10" },
  { id: "3", type: "post", name: "Beautiful sunset photo", description: "By @sarahk · 23 likes", distance: "0.5 mi", icon: Camera, color: "text-purple-500 bg-purple-500/10" },
  { id: "4", type: "place", name: "Central Park Viewpoint", description: "Popular check-in spot", distance: "0.7 mi", icon: Star, color: "text-yellow-500 bg-yellow-500/10" },
  { id: "5", type: "deal", name: "Buy 1 Get 1 at TechMart", description: "Electronics sale", distance: "0.8 mi", icon: ShoppingBag, color: "text-red-500 bg-red-500/10" },
  { id: "6", type: "user", name: "DJ Nova", description: "Last seen 5m ago", distance: "1.1 mi", icon: Users, color: "text-blue-500 bg-blue-500/10" },
  { id: "7", type: "post", name: "Street food review 🍜", description: "By @mikeross · 45 likes", distance: "1.3 mi", icon: Camera, color: "text-purple-500 bg-purple-500/10" },
  { id: "8", type: "place", name: "Riverside Walk", description: "12 check-ins today", distance: "1.5 mi", icon: Star, color: "text-yellow-500 bg-yellow-500/10" },
];

const FILTERS = ["all", "people", "deals", "posts", "places"];
const FILTER_MAP: Record<string, string[]> = {
  all: [], people: ["user"], deals: ["deal"], posts: ["post"], places: ["place"],
};

export default function NearbyPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? MOCK_NEARBY : MOCK_NEARBY.filter(i => FILTER_MAP[filter]?.includes(i.type));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 safe-area-top z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <Navigation className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Nearby</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <Badge key={f} variant={filter === f ? "default" : "outline"} className="cursor-pointer capitalize shrink-0" onClick={() => setFilter(f)}>
              {f}
            </Badge>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="h-48 bg-muted flex items-center justify-center relative">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-primary mx-auto mb-1" />
          <p className="text-sm text-muted-foreground">Map View</p>
          <p className="text-xs text-muted-foreground">Enable location to discover nearby</p>
        </div>
        <Badge className="absolute top-3 right-3 gap-1"><Navigation className="h-3 w-3" /> {filtered.length} nearby</Badge>
      </div>

      <div className="p-4 space-y-2">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0 gap-1">
                <MapPin className="h-2 w-2" /> {item.distance}
              </Badge>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
