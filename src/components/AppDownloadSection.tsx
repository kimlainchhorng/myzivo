import { Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppDownloadSection = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card p-8 lg:p-16 rounded-3xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Get the <span className="text-gradient-rides">ZIVO</span> app
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Download the app and start riding in minutes. Available on iOS and Android.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl" className="gap-3">
              <Apple className="w-6 h-6" />
              <div className="text-left">
                <p className="text-xs opacity-80">Download on the</p>
                <p className="font-semibold">App Store</p>
              </div>
            </Button>
            <Button variant="hero" size="xl" className="gap-3">
              <Smartphone className="w-6 h-6" />
              <div className="text-left">
                <p className="text-xs opacity-80">Get it on</p>
                <p className="font-semibold">Google Play</p>
              </div>
            </Button>
          </div>

          {/* QR Code placeholder */}
          <div className="mt-12 flex justify-center">
            <div className="glass-card p-4 rounded-2xl">
              <div className="w-32 h-32 bg-foreground rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-sm ${
                        Math.random() > 0.5 ? 'bg-background' : 'bg-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Scan to download</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
