import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Apple, PlayCircle, QrCode, Star, Download, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  "Exclusive app-only deals",
  "Offline access to bookings",
  "Real-time notifications",
  "Faster checkout",
];

const MobileAppPromo = () => {
  const [showQR, setShowQR] = useState(false);

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-teal-600 rounded-3xl p-8 md:p-12">
          {/* Background effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Smartphone className="w-3 h-3 mr-1" /> Mobile App
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Travel Smarter with the ZIVO App
              </h2>
              <p className="text-white/80 mb-6 max-w-lg">
                Book flights, hotels, and cars on the go. Get exclusive mobile deals and manage your trips anywhere.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-white/90">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Button className="bg-black hover:bg-black/90 text-white gap-2 h-12 px-5">
                  <Apple className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">Download on</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </Button>
                <Button className="bg-black hover:bg-black/90 text-white gap-2 h-12 px-5">
                  <PlayCircle className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 gap-2"
                  onClick={() => setShowQR(!showQR)}
                >
                  <QrCode className="w-4 h-4" />
                  Scan QR
                </Button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mt-6 justify-center lg:justify-start">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-white text-white" />
                  ))}
                </div>
                <span className="text-white/80 text-sm">4.9 • 500K+ reviews</span>
              </div>
            </div>

            {/* Phone Mockup / QR Code */}
            <div className="relative">
              {showQR ? (
                <div className="w-48 h-48 bg-white rounded-2xl p-4 flex items-center justify-center animate-in zoom-in duration-200">
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSI3MCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMCIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48L3N2Zz4=')] bg-contain" />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-64 h-[500px] bg-gradient-to-b from-white/20 to-white/5 rounded-[3rem] border-4 border-white/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Smartphone className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70 text-sm">App Preview</p>
                    </div>
                  </div>
                  {/* Download badge */}
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl px-4 py-2 shadow-xl flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Downloads</p>
                      <p className="font-bold text-foreground">2M+</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppPromo;
