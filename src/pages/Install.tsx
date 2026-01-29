import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, Plus, MoreVertical, ArrowLeft, Sparkles, Zap, Shield, Wifi, Bell, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import ZivoLogo from "@/components/ZivoLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Wifi, label: "Works offline", color: "text-sky-500" },
    { icon: Zap, label: "Fast & lightweight", color: "text-amber-500" },
    { icon: Bell, label: "Push notifications", color: "text-pink-500" },
    { icon: Smartphone, label: "Home screen access", color: "text-violet-500" },
    { icon: Download, label: "No app store needed", color: "text-emerald-500" },
    { icon: Shield, label: "Always up to date", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Enhanced Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-bl from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-tr from-primary/15 to-teal-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14 sm:h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl touch-manipulation active:scale-95">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-display font-bold text-lg sm:text-xl ml-3">Install ZIVO</span>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-28 pb-16 px-4 relative z-10">
        <div className="container mx-auto max-w-lg">
          <div className="text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Premium App Icon */}
            <div className="mx-auto mb-6 sm:mb-8">
              <ZivoLogo size="xl" />
            </div>

            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-teal-400/20 text-primary border-primary/30 px-4 py-2 text-sm font-semibold">
              <Star className="w-4 h-4 mr-2 fill-primary" />
              Progressive Web App
            </Badge>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Get the{" "}
              <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                ZIVO App
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Install ZIVO on your device for the best experience
            </p>
          </div>

          {isInstalled ? (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
                <CardContent className="pt-8 sm:pt-10 pb-6 sm:pb-8 relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-in zoom-in-50 duration-500 delay-200">
                    <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Already Installed!</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    ZIVO is already installed on your device. Open it from your home screen.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/")}
                    className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 touch-manipulation active:scale-95"
                  >
                    Open App
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-8 sm:mb-10">
                {features.map((feature, index) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-card/80 to-card border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                      <feature.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Install Instructions */}
              {deferredPrompt ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Button 
                    size="lg" 
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-xl shadow-primary/30 gap-3 touch-manipulation active:scale-[0.98]"
                    onClick={handleInstallClick}
                  >
                    <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                    Install ZIVO
                  </Button>
                </div>
              ) : isIOS ? (
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="pb-2 p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      Install on iPhone/iPad
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Follow these steps to add ZIVO to your home screen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-5 pt-2 sm:pt-4 p-4 sm:p-6">
                    {[
                      { step: 1, title: "Tap the Share button", desc: "at the bottom of Safari", icon: Share },
                      { step: 2, title: 'Tap "Add to Home Screen"', desc: "from the share menu", icon: Plus },
                      { step: 3, title: 'Tap "Add"', desc: "ZIVO will appear on your home screen", icon: Check },
                    ].map((item, index) => (
                      <div 
                        key={item.step}
                        className="flex items-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-primary text-sm">{item.step}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{item.title}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <item.icon className="w-3.5 h-3.5" /> {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : isAndroid ? (
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="pb-2 p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      Install on Android
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Follow these steps to add ZIVO to your home screen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-5 pt-2 sm:pt-4 p-4 sm:p-6">
                    {[
                      { step: 1, title: "Tap the menu button", desc: "in your browser", icon: MoreVertical },
                      { step: 2, title: 'Tap "Install app"', desc: "or Add to Home Screen", icon: Download },
                      { step: 3, title: "Confirm the installation", desc: "ZIVO will appear on your home screen", icon: Check },
                    ].map((item, index) => (
                      <div 
                        key={item.step}
                        className="flex items-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-primary text-sm">{item.step}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{item.title}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <item.icon className="w-3.5 h-3.5" /> {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="pt-8 sm:pt-10 pb-6 sm:pb-8 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                      <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl mb-2">Open on Mobile</h3>
                    <p className="text-sm text-muted-foreground">
                      Visit this page on your mobile device to install ZIVO
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Install;
