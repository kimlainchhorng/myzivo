/**
 * ZivoProfileReal Component
 * Premium holographic profile card with real Supabase user data
 */
import { useNavigate } from "react-router-dom";
import { 
  User, Settings, LogOut, Shield, CreditCard, 
  ChevronRight, Fingerprint, Camera, Mail, Loader2 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 px-1">{title}</p>
    <div className="bg-zinc-900/60 rounded-2xl border border-white/5 divide-y divide-white/5">
      {children}
    </div>
  </div>
);

const MenuItem = ({ icon: Icon, label, sub, onClick }: { 
  icon: React.ElementType; 
  label: string; 
  sub: string;
  onClick?: () => void;
}) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all duration-200 text-left"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
        <Icon className="w-5 h-5 text-zinc-400" />
      </div>
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-xs text-zinc-500">{sub}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-zinc-600" />
  </button>
);

export function ZivoProfileReal() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

  const isLoading = authLoading || profileLoading;

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Build profile display data
  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || "ZIVO Traveler";
  const displayEmail = userProfile?.email || user?.email || "";
  const memberId = user?.id?.slice(0, 8) || "--------";
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const tier = "Gold Member"; // Placeholder until tiers are added to database
  
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-16 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-tight">ZIVO ID</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" /> LOG OUT
        </button>
      </div>

      {/* HOLOGRAPHIC ID CARD */}
      <div className="relative mb-10 group">
        {/* Ambient glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-emerald-500/20 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <div className="relative bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 overflow-hidden">
          {/* Holographic shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-start gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 bg-zinc-800">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-400">
                    {initials}
                  </div>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-black">
                <Camera className="w-3.5 h-3.5 text-black" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 pt-1">
              <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                {tier}
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">{displayName}</h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  {displayEmail}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Member ID</span>
                  <span className="font-mono text-zinc-400">#{memberId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MENU */}
      <div className="space-y-6">
        <Section title="Account">
          <MenuItem 
            icon={User} 
            label="Edit Profile" 
            sub="Name, photo, phone" 
            onClick={() => navigate("/profile")}
          />
          <MenuItem 
            icon={Shield} 
            label="Security" 
            sub="Password, 2FA" 
            onClick={() => navigate("/profile")}
          />
        </Section>

        <Section title="Payments">
          <MenuItem 
            icon={CreditCard} 
            label="Payment Methods" 
            sub="Cards, wallets" 
          />
          <MenuItem 
            icon={Settings} 
            label="Preferences" 
            sub="Currency, notifications" 
          />
        </Section>
      </div>
    </div>
  );
}

export default ZivoProfileReal;
