import { Apple, Smartphone, Download, Star, Shield, Zap, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ZivoLogo from "./ZivoLogo";

const appFeatures = [
  { icon: Zap, label: "Lightning fast", gradient: "from-amber-500 to-orange-500" },
  { icon: Shield, label: "Secure payments", gradient: "from-emerald-500 to-green-500" },
  { icon: Star, label: "4.9★ rated", gradient: "from-violet-500 to-purple-500" },
];

const stats = [
  { value: "10M+", label: "Downloads", icon: Download },
  { value: "195", label: "Countries", icon: Globe },
  { value: "4.9", label: "Rating", icon: Star },
];

const AppDownloadSection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-transparent to-transparent" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/20 to-orange-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-radial from-violet-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* Floating icon decorations */}
      <div className="absolute top-32 left-[10%] hidden lg:block opacity-30 animate-float">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
          <Smartphone className="w-6 h-6 text-primary/50" />
        </div>
      </div>
      <div className="absolute bottom-40 right-[8%] hidden lg:block opacity-30 animate-float-delayed">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center backdrop-blur-sm">
          <Download className="w-6 h-6 text-emerald-500/50" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          className="p-8 sm:p-12 lg:p-20 rounded-[2.5rem] bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-2xl text-center relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500"
        >
          {/* Animated border glow - CSS animation */}
          <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none animate-border-glow" />
          
          {/* Recurring shine sweep - CSS animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none animate-shine" />
          
          {/* Animated background decoration */}
          <div className="absolute top-0 right-0 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-gradient-to-br from-primary/15 to-teal-400/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-gradient-to-tr from-eats/15 to-orange-500/10 rounded-full blur-3xl animate-pulse-slower" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-violet-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />

          <div className="relative z-10">
            <div className="animate-in zoom-in-95 duration-200" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-eats/20 text-primary border-primary/30 px-5 py-2.5 text-sm font-bold shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 mr-2 animate-spin" style={{ animationDuration: '3s' }} />
                Available now
              </Badge>
            </div>

            <h2 
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: '150ms', animationFillMode: 'both' }}
            >
              Get the{" "}
              <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">ZIVO</span>{" "}
              app
            </h2>
            
            <p 
              className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 px-4 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: '200ms', animationFillMode: 'both' }}
            >
              Download the app and start riding in minutes. Available on <span className="text-foreground font-medium">iOS</span> and <span className="text-foreground font-medium">Android</span>.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
              {appFeatures.map((feature, index) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/50 border border-border/50 transition-transform duration-200 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${250 + index * 75}ms`, animationFillMode: 'both' }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    feature.gradient
                  )}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">{feature.label}</span>
                </div>
              ))}
            </div>
            
            {/* Download Buttons */}
            <div 
              className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: '400ms', animationFillMode: 'both' }}
            >
              <Button 
                size="lg" 
                className="gap-3 h-16 px-8 text-base rounded-2xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-xl shadow-primary/30 hover:opacity-90 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Apple className="w-7 h-7" />
                <div className="text-left">
                  <p className="text-xs opacity-80">Download on the</p>
                  <p className="font-bold text-lg">App Store</p>
                </div>
              </Button>
              <Button 
                size="lg" 
                className="gap-3 h-16 px-8 text-base rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-xl shadow-emerald-500/30 hover:opacity-90 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Smartphone className="w-7 h-7" />
                <div className="text-left">
                  <p className="text-xs opacity-80">Get it on</p>
                  <p className="font-bold text-lg">Google Play</p>
                </div>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-12">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-in fade-in zoom-in-95"
                  style={{ animationDelay: `${500 + index * 75}ms`, animationFillMode: 'both' }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* QR Code - Hidden on mobile */}
            <div 
              className="hidden sm:inline-block animate-in fade-in zoom-in-95 duration-500"
              style={{ animationDelay: '600ms', animationFillMode: 'both' }}
            >
              <div className="p-5 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 shadow-xl">
                <div className="w-32 h-32 sm:w-36 sm:h-36 bg-foreground rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-5 gap-1 p-2">
                    {[...Array(25)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                          [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i) 
                            ? 'bg-background' 
                            : 'bg-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  {/* ZIVO logo in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ZivoLogo size="sm" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 font-medium">Scan to download</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
