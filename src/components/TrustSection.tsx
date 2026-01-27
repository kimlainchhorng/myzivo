import {
  Shield,
  Lock,
  Eye,
  Phone,
  BadgeCheck,
  FileCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const trustFeatures = [
  {
    icon: BadgeCheck,
    title: "Verified Drivers",
    description: "Every driver passes strict background checks and vehicle inspections",
    gradient: "from-primary to-teal-400",
    glow: "shadow-primary/30",
  },
  {
    icon: MapPin,
    title: "Real-time Tracking",
    description: "Share your trip with loved ones and track every journey live",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Our safety team is available around the clock for emergencies",
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Bank-grade encryption protects every transaction",
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/30",
  },
  {
    icon: FileCheck,
    title: "Insurance Coverage",
    description: "Every ride and delivery is covered by comprehensive insurance",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/30",
  },
  {
    icon: Eye,
    title: "Privacy Protected",
    description: "Your personal data is never sold and always encrypted",
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/30",
  },
];

const partnerLogos = [
  { name: "Forbes", logo: "Forbes" },
  { name: "TechCrunch", logo: "TechCrunch" },
  { name: "Wired", logo: "WIRED" },
  { name: "Bloomberg", logo: "Bloomberg" },
  { name: "Reuters", logo: "Reuters" },
];

const stats = [
  { value: "99.9%", label: "Safe Trips" },
  { value: "2M+", label: "Background Checks" },
  { value: "<2 min", label: "Support Response" },
  { value: "500K+", label: "Reviews Daily" },
];

const TrustSection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/18 via-transparent to-transparent rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-500/20 to-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/20 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-sky-500/12 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-gradient-radial from-amber-500/10 to-transparent rounded-full blur-3xl" />

      {/* Static floating safety icons */}
      <div className="absolute top-36 right-[12%] text-5xl hidden lg:block opacity-40 animate-float">
        🛡️
      </div>
      <div className="absolute bottom-32 left-[8%] text-4xl hidden lg:block opacity-30 animate-float-delayed">
        ✅
      </div>
      <div className="absolute top-1/2 left-[5%] text-4xl hidden lg:block opacity-25 animate-float">
        🔒
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div
          className="text-center mb-14 sm:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-emerald-500/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-300"
          >
            <Shield className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-muted-foreground">Safety & Trust</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 px-2">
            Your safety is our{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              priority
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            Industry-leading safety features and support to protect every journey
          </p>
        </div>

        {/* Trust Features Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12 sm:mb-16"
        >
          {trustFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
            >
              <div className="relative p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2 hover:scale-[1.01]">
                {/* Shine sweep effect on hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700"
                />
                
                {/* Animated corner glow */}
                <div 
                  className={cn(
                    "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl animate-pulse-slow",
                    `bg-gradient-to-br ${feature.gradient}`
                  )}
                  style={{ animationDelay: `${index * 400}ms` }}
                />
                
                <div
                  className={cn(
                    "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg relative overflow-hidden transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3",
                    feature.gradient,
                    feature.glow
                  )}
                >
                  <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Subtle bottom accent line */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
                    `bg-gradient-to-r ${feature.gradient}`
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div
          className="p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-2xl mb-12 sm:mb-16 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/5" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 text-center relative">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'both' }}
              >
                <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Press Mentions */}
        <div
          className="text-center animate-in fade-in duration-500"
          style={{ animationDelay: '400ms', animationFillMode: 'both' }}
        >
          <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            As featured in
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
            {partnerLogos.map((partner, index) => (
              <div
                key={partner.name}
                className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-muted-foreground/40 hover:text-muted-foreground transition-all duration-200 cursor-default hover:scale-110 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${500 + index * 50}ms`, animationFillMode: 'both' }}
              >
                {partner.logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
