import { ArrowRight, Download, Sparkles, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const features = [
  { icon: Zap, label: "Instant Booking" },
  { icon: Shield, label: "Secure Payments" },
  { icon: Star, label: "24/7 Support" },
];

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-eats/15" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/25 to-teal-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-eats/25 to-orange-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-violet-500/10 to-transparent rounded-full blur-3xl" />

      {/* Static floating emojis */}
      <div className="absolute top-32 left-[10%] text-6xl hidden lg:block opacity-50">🚀</div>
      <div className="absolute bottom-40 right-[8%] text-5xl hidden lg:block opacity-40">✨</div>
      <div className="absolute top-56 right-[15%] text-4xl hidden lg:block opacity-35">🎯</div>
      <div className="absolute bottom-60 left-[12%] text-3xl hidden lg:block opacity-30">💎</div>
      <div className="absolute top-1/2 right-[6%] text-3xl hidden lg:block opacity-25">🌟</div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="relative p-8 sm:p-12 lg:p-20 rounded-[3rem] bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-2xl overflow-hidden group">
            {/* Hover glow effect */}
            <div 
              className="absolute inset-0 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)/0.3), hsl(var(--eats)/0.3), hsl(var(--primary)/0.3))',
                filter: 'blur(20px)',
              }}
            />
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-eats/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-radial from-violet-500/10 to-transparent rounded-full blur-3xl" />
            
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-teal-400/20 text-primary border border-primary/30 text-sm font-bold mb-6 shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-300">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                Join millions of users
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8">
                Ready to get{" "}
                <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                  started?
                </span>
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Download the ZIVO app and experience the <span className="text-foreground font-medium">future of mobility</span>. 
                One app for rides, food, flights, hotels, and more.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {features.map((feature, index) => (
                  <div
                    key={feature.label}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50",
                      "animate-in fade-in slide-in-from-bottom-2"
                    )}
                    style={{ animationDelay: `${200 + index * 100}ms` }}
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-xl shadow-primary/30 gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/install")}
                  className="h-14 px-8 text-lg font-bold rounded-xl border-2 gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-5 h-5" />
                  Download App
                </Button>
              </div>

              {/* App Store Badges */}
              <div className="flex justify-center gap-4 mt-8">
                <div className="relative px-5 py-3 rounded-xl bg-foreground text-background flex items-center gap-3 cursor-pointer overflow-hidden group/badge transition-transform duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98]">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                  <div className="text-2xl relative z-10">🍎</div>
                  <div className="text-left relative z-10">
                    <p className="text-[10px] opacity-80">Download on the</p>
                    <p className="font-semibold text-sm">App Store</p>
                  </div>
                </div>
                <div className="relative px-5 py-3 rounded-xl bg-foreground text-background flex items-center gap-3 cursor-pointer overflow-hidden group/badge transition-transform duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98]">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                  <div className="text-2xl relative z-10">▶️</div>
                  <div className="text-left relative z-10">
                    <p className="text-[10px] opacity-80">Get it on</p>
                    <p className="font-semibold text-sm">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;