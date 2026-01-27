import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, Plus, MoreVertical, ArrowLeft, Sparkles, Zap, Shield, Wifi, Bell, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-eats/10 to-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/10 to-teal-500/5 rounded-full blur-3xl" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-display font-bold text-xl ml-3">Install ZIVO</span>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-16 px-4 relative z-10">
        <div className="container mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            {/* Premium App Icon */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-28 h-28 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-2xl shadow-primary/40 relative"
            >
              <span className="font-display font-bold text-5xl text-white">Z</span>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-eats to-orange-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </motion.div>

            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-teal-400/20 text-primary border-primary/30 px-4 py-2 text-sm font-semibold">
              <Star className="w-4 h-4 mr-2 fill-primary" />
              Progressive Web App
            </Badge>

            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Get the{" "}
              <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                ZIVO App
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Install ZIVO on your device for the best experience
            </p>
          </motion.div>

          {isInstalled ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
                <CardContent className="pt-10 pb-8 relative">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-3">Already Installed!</h2>
                  <p className="text-muted-foreground mb-6">
                    ZIVO is already installed on your device. Open it from your home screen.
                  </p>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/")}
                      className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30"
                    >
                      Open App
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 gap-3 mb-10"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-card/80 to-card border border-border/50"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Install Instructions */}
              {deferredPrompt ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg" 
                      className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-xl shadow-primary/30 gap-3"
                      onClick={handleInstallClick}
                    >
                      <Download className="w-6 h-6" />
                      Install ZIVO
                    </Button>
                  </motion.div>
                </motion.div>
              ) : isIOS ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        Install on iPhone/iPad
                      </CardTitle>
                      <CardDescription className="text-base">
                        Follow these steps to add ZIVO to your home screen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-4">
                      {[
                        { step: 1, title: "Tap the Share button", desc: "at the bottom of Safari", icon: Share },
                        { step: 2, title: 'Tap "Add to Home Screen"', desc: "from the share menu", icon: Plus },
                        { step: 3, title: 'Tap "Add"', desc: "ZIVO will appear on your home screen", icon: Check },
                      ].map((item) => (
                        <motion.div 
                          key={item.step}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + item.step * 0.1 }}
                          className="flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-primary">{item.step}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-base">{item.title}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <item.icon className="w-4 h-4" /> {item.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : isAndroid ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        Install on Android
                      </CardTitle>
                      <CardDescription className="text-base">
                        Follow these steps to add ZIVO to your home screen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-4">
                      {[
                        { step: 1, title: "Tap the menu button", desc: "in your browser", icon: MoreVertical },
                        { step: 2, title: 'Tap "Install app"', desc: "or Add to Home Screen", icon: Download },
                        { step: 3, title: "Confirm the installation", desc: "ZIVO will appear on your home screen", icon: Check },
                      ].map((item) => (
                        <motion.div 
                          key={item.step}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + item.step * 0.1 }}
                          className="flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-primary">{item.step}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-base">{item.title}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <item.icon className="w-4 h-4" /> {item.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl">
                    <CardContent className="pt-10 pb-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">Open on Mobile</h3>
                      <p className="text-muted-foreground">
                        Visit this page on your mobile device to install ZIVO
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Install;
