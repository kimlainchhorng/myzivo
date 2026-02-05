/**
 * TravelerPassport Component
 * Premium holographic ID card displaying user profile and stats
 */
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Settings, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTravelerStats } from "@/hooks/useTravelerStats";
import { useUserProfile } from "@/hooks/useUserProfile";

export function TravelerPassport() {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const stats = useTravelerStats();

  if (profileLoading || stats.isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto mb-12">
        <div className="passport-glass rounded-[2rem] p-10 flex items-center justify-center min-h-[280px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const fullName = userProfile?.full_name || "Traveler";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedMiles = stats.milesFlown >= 1000 
    ? `${Math.round(stats.milesFlown / 1000)}k` 
    : stats.milesFlown.toString();

  return (
    <div className="w-full max-w-5xl mx-auto mb-12 relative group">
      {/* Ambient Glow Background */}
      <div className="passport-glow rounded-[2.5rem]" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative passport-glass rounded-[2rem] p-8 md:p-10 overflow-hidden"
      >
        {/* Grainy Texture Overlay */}
        <div className="absolute inset-0 grainy-texture rounded-[2rem]" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-border/30 p-1 relative">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={userProfile?.avatar_url || undefined}
                  alt={fullName}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Verified Badge */}
              {stats.isVerified && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-card">
                  <ShieldCheck className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Identity Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight uppercase">
                {fullName}
              </h1>
              <span className="px-3 py-1 bg-success/10 border border-success/20 text-success text-[10px] font-bold uppercase tracking-wider rounded-full">
                {stats.isVerified ? "Verified Traveler" : "Explorer"}
              </span>
            </div>
            
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mb-6">
              <MapPin className="w-4 h-4" />
              Member since <span className="text-foreground font-medium">{stats.memberSince}</span>
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-12 border-t border-border/50 pt-6">
              <div className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-black text-foreground">
                  {stats.countriesVisited || "—"}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Countries
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-black text-foreground">
                  {formattedMiles || "—"}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Miles Flown
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-black text-foreground">
                  {stats.zivoRank}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  ZIVO Rank
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="hidden md:block">
            <Button asChild variant="secondary" className="gap-2">
              <Link to="/profile">
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TravelerPassport;