import { Smartphone, QrCode, Star, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Exclusive app-only deals",
  "Faster checkout experience",
  "Real-time notifications",
  "Offline access to bookings",
];

const AppDownloadCTA = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-teal-500/10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Smartphone className="w-4 h-4" />
                Mobile App
              </span>
              
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                Take ZIVO <span className="text-primary">Everywhere</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8">
                Download our award-winning app for the ultimate travel experience. 
                Available on iOS and Android with exclusive mobile features.
              </p>

              {/* Feature List */}
              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button className="h-14 px-6 bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs opacity-80">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </div>
                </Button>
                
                <Button className="h-14 px-6 bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs opacity-80">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Rating Badge */}
              <div className="flex items-center gap-4 mt-8 p-4 rounded-xl bg-card/50 border border-border/50 w-fit">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-muted-foreground"> • 2M+ Reviews</span>
                </div>
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="relative flex justify-center">
              {/* Phone Frame */}
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-teal-400/40 blur-[60px] rounded-full" />
                
                {/* Phone */}
                <div className="relative w-[280px] h-[560px] bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-[3rem] p-3 shadow-2xl border border-zinc-700">
                  {/* Screen */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 via-background to-teal-500/20 rounded-[2.5rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-2xl" />
                    
                    {/* App Content Preview */}
                    <div className="pt-12 px-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">ZIVO</div>
                        <div className="w-8 h-8 rounded-full bg-primary/20" />
                      </div>
                      
                      {/* Search Bar */}
                      <div className="h-10 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 transition-all duration-200" />
                      
                      {/* Service Icons */}
                      <div className="grid grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="aspect-square rounded-xl bg-card/50 border border-border/30 hover:border-primary/20 transition-all duration-200" />
                        ))}
                      </div>
                      
                      {/* Cards */}
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 rounded-xl bg-card/50 border border-border/30" />
                        ))}
                      </div>
                    </div>
                    
                    {/* Bottom Nav */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur border-t border-border/30 flex items-center justify-around px-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* QR Code Card */}
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-card border border-border shadow-xl hidden lg:block">
                  <div className="flex items-center gap-3 mb-3">
                    <QrCode className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Scan to Download</span>
                  </div>
                  <div className="w-24 h-24 bg-white rounded-lg p-2">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMjAiIHk9IjIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMjAiIHk9IjEyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJibGFjayIvPjwvc3ZnPg==')] bg-cover" />
                  </div>
                </div>

                {/* Download Count Badge */}
                <div className="absolute -left-4 bottom-20 p-3 rounded-xl bg-card border border-border shadow-xl hidden lg:flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-bold">10M+</div>
                    <div className="text-xs text-muted-foreground">Downloads</div>
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

export default AppDownloadCTA;
