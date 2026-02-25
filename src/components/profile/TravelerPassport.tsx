/**
 * TravelerPassport Component
 * Premium 2026-era holographic ID card with glassmorphic design
 */
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTravelerStats } from "@/hooks/useTravelerStats";
import { useUserProfile } from "@/hooks/useUserProfile";

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function TravelerPassport() {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const stats = useTravelerStats();

  if (profileLoading || stats.isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto mb-12">
        <div className="bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 flex items-center justify-center min-h-[280px]">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
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
      {/* Background Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-10 overflow-hidden"
      >
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white/5 p-1 relative">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={userProfile?.avatar_url || undefined}
                  alt={fullName}
                  className="object-cover rounded-full"
                />
                <AvatarFallback className="text-2xl font-bold bg-zinc-800 text-white rounded-full">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Verified Badge */}
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-zinc-900">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Identity Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                {fullName}
              </h1>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                {stats.isVerified ? "Verified Traveler" : "Explorer"}
              </span>
            </div>
            
            <p className="text-zinc-400 flex items-center justify-center md:justify-start gap-2 mb-6">
              <MapPin className="w-4 h-4" />
              Member since <span className="text-white font-medium">{stats.memberSince}</span>
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 md:gap-12 border-t border-white/5 pt-6">
              <div>
                <div className="text-2xl font-black text-white">
                  {stats.countriesVisited || "—"}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Countries
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {formattedMiles || "—"}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Miles Flown
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {stats.zivoRank}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  ZIVO Rank
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="hidden md:block">
              <Link 
              to="/profile"
              className="bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 touch-manipulation min-h-[44px] shadow-lg"
            >
              <SettingsIcon className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TravelerPassport;