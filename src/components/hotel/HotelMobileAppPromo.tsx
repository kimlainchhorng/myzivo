import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Star, Download, Zap, Bell, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotelMobileAppPromoProps {
  className?: string;
}

export default function HotelMobileAppPromo({ className }: HotelMobileAppPromoProps) {
  const appFeatures = [
    { icon: Zap, text: "Instant booking confirmation" },
    { icon: Bell, text: "Real-time price alerts" },
    { icon: Gift, text: "App-exclusive deals" },
  ];

  return (
    <section className={cn("py-10 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500/10 via-card to-purple-500/10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
          
          <CardContent className="p-6 sm:p-10 relative">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div>
                <Badge className="mb-4 px-4 py-2 bg-violet-500/20 text-violet-400 border-violet-500/30">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile App
                </Badge>
                
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  Book Hotels
                  <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent ml-2">
                    On The Go
                  </span>
                </h2>
                
                <p className="text-muted-foreground mb-6 max-w-md">
                  Download the ZIVO app for exclusive mobile deals, instant bookings, and seamless travel management.
                </p>

                <div className="space-y-3 mb-6">
                  {appFeatures.map((feature) => (
                    <div key={feature.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-violet-400" />
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* App Store Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="h-12 px-6 border-border/50 hover:bg-violet-500/10 touch-manipulation active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    App Store
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-12 px-6 border-border/50 hover:bg-violet-500/10 touch-manipulation active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Google Play
                  </Button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.8 • 500K+ reviews</span>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="relative flex justify-center">
                <div className="relative w-48 sm:w-56">
                  {/* Phone frame */}
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
                    <div className="bg-gradient-to-br from-violet-600/20 via-purple-500/10 to-pink-500/20 rounded-[2rem] aspect-[9/19] flex flex-col items-center justify-center p-6">
                      {/* Screen content mockup */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-2xl font-bold text-white">Z</span>
                      </div>
                      <p className="text-xs text-center text-white/80 mb-4">ZIVO Hotels</p>
                      
                      {/* Mini cards */}
                      <div className="space-y-2 w-full">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-8 rounded-lg bg-white/10 backdrop-blur-sm animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                        ))}
                      </div>
                    </div>
                    {/* Notch */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full" />
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-[2.5rem] blur-2xl -z-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
