/**
 * FeedSidebar — Left sidebar for Feed page (desktop only)
 * Contains navigation shortcuts: Rides, Eats, Map, Services, More
 */
import { useNavigate } from "react-router-dom";
import { 
  Car, UtensilsCrossed, MapPin, Plane, Hotel, CarFront,
  Package, MoreHorizontal, Compass, ShoppingBag, Heart, 
  Users, Bookmark, Clock, Settings, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Rides", icon: Car, path: "/rides", color: "text-emerald-500" },
  { label: "Eats", icon: UtensilsCrossed, path: "/eats", color: "text-orange-500" },
  { label: "Map", icon: MapPin, path: "/map", color: "text-red-500" },
];

const SERVICE_ITEMS = [
  { label: "Flights", icon: Plane, path: "/flights", color: "text-sky-500" },
  { label: "Hotels", icon: Hotel, path: "/hotels", color: "text-amber-500" },
  { label: "Cars", icon: CarFront, path: "/cars", color: "text-violet-500" },
  { label: "Delivery", icon: Package, path: "/delivery", color: "text-teal-500" },
  { label: "Shopping", icon: ShoppingBag, path: "/grocery", color: "text-pink-500" },
];

const MORE_ITEMS = [
  { label: "Explore", icon: Compass, path: "/explore" },
  { label: "Saved", icon: Bookmark, path: "/saved" },
  { label: "Activity", icon: Heart, path: "/activity" },
  { label: "Friends", icon: Users, path: "/friends" },
  { label: "Trending", icon: TrendingUp, path: "/trending" },
  { label: "History", icon: Clock, path: "/history" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function FeedSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-[4.5rem] h-[calc(100vh-4.5rem)] overflow-y-auto border-r border-border/30 bg-card/30 backdrop-blur-sm">
      <div className="flex flex-col gap-0.5 p-3">
        {/* Main nav */}
        <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 pt-2 pb-1">Navigate</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors group"
          >
            <item.icon className={cn("h-5 w-5", item.color)} />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Services */}
        <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 pt-4 pb-1">Services</p>
        {SERVICE_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors group"
          >
            <item.icon className={cn("h-5 w-5", item.color)} />
            <span>{item.label}</span>
          </button>
        ))}

        {/* More */}
        <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 pt-4 pb-1">More</p>
        {MORE_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-muted/50 transition-colors"
          >
            <item.icon className="h-4.5 w-4.5 text-muted-foreground" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
