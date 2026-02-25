import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, DollarSign, Clock, Shield, ChevronRight, Calendar, Sparkles, TrendingUp, Zap, Users, Rocket, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn on your schedule",
    description: "Make money when you want. No minimums, no commitments.",
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/30",
  },
  {
    icon: Clock,
    title: "Instant payouts",
    description: "Cash out your earnings anytime, up to 5x per day.",
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
  },
  {
    icon: Shield,
    title: "Insurance included",
    description: "Covered from pickup to dropoff with every trip.",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
  },
  {
    icon: Calendar,
    title: "Flexible hours",
    description: "Drive or deliver whenever it works for you.",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/30",
  },
];

const stats = [
  { value: "$28", label: "Avg. hourly", icon: TrendingUp },
  { value: "50K+", label: "Drivers", icon: Users },
  { value: "5x", label: "Cashouts", icon: Zap },
];

const DriverCTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="driver" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-eats/12" />
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/25 to-teal-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-eats/20 to-orange-500/15 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-violet-500/15 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-3xl" />
      
      <div className="absolute top-32 left-[6%] hidden lg:block opacity-40 animate-float">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
          <Rocket className="w-7 h-7 text-primary/50" />
        </div>
      </div>
      <div className="absolute bottom-40 right-[5%] hidden lg:block opacity-35 animate-float-delayed">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-yellow-500/15 flex items-center justify-center backdrop-blur-sm">
          <Star className="w-6 h-6 text-amber-500/50" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          className="p-8 sm:p-12 lg:p-20 rounded-[2.5rem] bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-2xl overflow-hidden relative animate-in fade-in slide-in-from-bottom-6 duration-500"
        >
          {/* Animated border glow - CSS animation */}
          <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none animate-border-glow-emerald" />
          
          {/* Recurring shine sweep - CSS animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none animate-shine" />
          
          {/* Animated corner glows */}
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary to-teal-400 rounded-full blur-3xl animate-pulse-slow opacity-25" 
          />
          <div 
            className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-eats to-orange-500 rounded-full blur-3xl animate-pulse-slower opacity-20" 
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-violet-500/5 to-transparent rounded-full blur-3xl" />
          
          <div className="absolute top-12 right-12 hidden lg:block opacity-40 animate-float">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/15 to-blue-500/15 flex items-center justify-center backdrop-blur-sm">
              <Car className="w-7 h-7 text-sky-500/50" />
            </div>
          </div>
          <div className="absolute bottom-24 right-1/4 hidden lg:block opacity-30 animate-float-delayed">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="w-6 h-6 text-emerald-500/50" />
            </div>
          </div>
          <div className="absolute top-1/3 left-[5%] hidden lg:block opacity-25 animate-float">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/15 to-yellow-500/15 flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-amber-500/50" />
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative">
            {/* Left Content */}
            <div>
              <div
                className="animate-in fade-in zoom-in-95 duration-200"
                style={{ animationDelay: '100ms', animationFillMode: 'both' }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-teal-400/20 text-primary border-primary/30 px-5 py-2.5 text-sm font-bold shadow-lg shadow-primary/20">
                  <Car className="w-4 h-4 mr-2" />
                  Drive with ZIVO
                </Badge>
              </div>
              
              <h2 
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '150ms', animationFillMode: 'both' }}
              >
                Turn your car into a
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent"> money machine</span>
              </h2>
              
              <p 
                className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '200ms', animationFillMode: 'both' }}
              >
                Join thousands of drivers earning on their own terms. Whether you drive full-time or just a few hours a week, <span className="text-foreground font-medium">ZIVO puts you in control</span>.
              </p>
              
              <div 
                className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '250ms', animationFillMode: 'both' }}
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate("/drive")} 
                  className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:opacity-90 gap-2 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                >
                  Start driving
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl border-2 gap-2 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5 text-eats" />
                  Deliver with ZIVO Eats
                </Button>
              </div>

              {/* Stats */}
              <div 
                className="grid grid-cols-3 gap-6 sm:gap-10 mt-10 pt-10 border-t border-border animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '300ms', animationFillMode: 'both' }}
              >
                {stats.map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="text-center sm:text-left animate-in fade-in zoom-in-95"
                    style={{ animationDelay: `${350 + index * 75}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <stat.icon className="w-5 h-5 text-primary hidden sm:block" />
                      <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Benefits */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/40 hover:from-muted/80 hover:to-muted/60 border border-border/50 hover:border-primary/40 transition-all duration-200 group cursor-default shadow-lg hover:shadow-xl overflow-hidden relative hover:-translate-y-2 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${200 + index * 75}ms`, animationFillMode: 'both' }}
                >
                  {/* Decorative glow on hover */}
                  <div className={cn(
                    "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
                    `bg-gradient-to-br ${benefit.gradient}`
                  )} />
                  
                  <div 
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-xl relative transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3",
                      benefit.gradient,
                      benefit.glow
                    )}
                  >
                    <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors relative">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed relative">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverCTASection;
