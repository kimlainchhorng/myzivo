/**
 * FeedSidebar — Left sidebar for Feed page (desktop only)
 * Contains navigation shortcuts, services, and account switching
 */
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  Car, UtensilsCrossed, MapPin, Plane, Hotel, CarFront,
  Package, Compass, ShoppingBag, Heart, 
  Users, Bookmark, Clock, Settings, TrendingUp,
  ArrowLeftRight, Shield, Store, LayoutDashboard,
  Handshake, CarTaxiFront, ChefHat, Building2, Briefcase,
  Headphones, Eye, Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { optimizeAvatar } from "@/utils/optimizeAvatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserAccess } from "@/hooks/useUserAccess";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: access } = useUserAccess(user?.id);
  const [showSwitch, setShowSwitch] = useState(false);

  const avatarUrl = optimizeAvatar(profile?.avatar_url, 80) || profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  // Check roles from useUserAccess (admin is invite-only via user_roles table)
  const isAdmin = (access?.isAdmin ?? false) || email === "chhorngkimlain1@gmail.com";
  const isStoreOwner = access?.isStoreOwner ?? false;
  const isDriver = access?.isDriver ?? false;
  const isRestaurantOwner = access?.isRestaurantOwner ?? false;
  const isHotelOwner = access?.isHotelOwner ?? false;

  const hasDashboard = isAdmin || isStoreOwner || isDriver || isRestaurantOwner || isHotelOwner;

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-[4.5rem] h-[calc(100vh-4.5rem)] overflow-y-auto border-r border-border/30 bg-card/30 backdrop-blur-sm">
      <div className="flex flex-col gap-0.5 p-3">
        {/* Profile card with Switch Account */}
        {user && (
          <button
            onClick={() => setShowSwitch(true)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors mb-2 group"
          >
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {displayName[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{email}</p>
            </div>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </button>
        )}

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

      {/* Switch Account Sheet */}
      <Sheet open={showSwitch} onOpenChange={setShowSwitch}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b border-border/30">
            <SheetTitle className="text-base">Switch Account</SheetTitle>
          </SheetHeader>
          <div className="p-3 space-y-1">
            {/* Current account */}
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/5 border border-primary/10">
              <Avatar className="h-11 w-11 border-2 border-primary/30">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {displayName[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{email}</p>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
            </div>

            {/* Dashboards — only shown if user has any role (admin-invite only) */}
            {hasDashboard && (
              <div className="pt-3 space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 pb-1">Dashboards</p>
                
                {isAdmin && (
                  <button
                    onClick={() => { setShowSwitch(false); navigate("/admin/analytics"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Shield className="h-5 w-5 text-red-500" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                {isStoreOwner && (
                  <button
                    onClick={() => { setShowSwitch(false); navigate("/shop-dashboard"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Store className="h-5 w-5 text-emerald-500" />
                    <span>Shop Dashboard</span>
                  </button>
                )}

                {isDriver && (
                  <button
                    onClick={() => { setShowSwitch(false); navigate("/driver/dashboard"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <CarTaxiFront className="h-5 w-5 text-sky-500" />
                    <span>Driver Dashboard</span>
                  </button>
                )}

                {isRestaurantOwner && (
                  <button
                    onClick={() => { setShowSwitch(false); navigate("/restaurant/dashboard"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <ChefHat className="h-5 w-5 text-orange-500" />
                    <span>Restaurant Dashboard</span>
                  </button>
                )}

                {isHotelOwner && (
                  <button
                    onClick={() => { setShowSwitch(false); navigate("/hotel/dashboard"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Building2 className="h-5 w-5 text-amber-500" />
                    <span>Hotel Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => { setShowSwitch(false); navigate("/more"); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span>Account Hub</span>
                </button>
              </div>
            )}

            {/* Become a Partner section — shown to users who don't have those roles yet */}
            {(!isStoreOwner || !isDriver) && (
              <div className="pt-3 space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 pb-1">Become a Partner</p>
                
                {!isStoreOwner && (
                  <button
                    onClick={() => { setShowSwitch(false); navigate("/partner-with-zivo"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Handshake className="h-5 w-5 text-emerald-500" />
                    <span>Become Shop Partner</span>
                  </button>
                )}

                {!isDriver && (
                  <button
                    onClick={() => { setShowSwitch(false); navigate("/partner-with-zivo"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <CarTaxiFront className="h-5 w-5 text-sky-500" />
                    <span>Become Driver</span>
                  </button>
                )}
              </div>
            )}

            {/* Account Hub — always available */}
            {!hasDashboard && (
              <div className="pt-3 space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 pb-1">Account</p>
                <button
                  onClick={() => { setShowSwitch(false); navigate("/more"); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span>Account Hub</span>
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </aside>
  );
}
