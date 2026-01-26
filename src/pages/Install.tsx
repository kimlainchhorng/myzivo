import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, Plus, MoreVertical, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
    "Works offline",
    "Fast & lightweight",
    "Push notifications",
    "Home screen access",
    "No app store needed",
    "Always up to date"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-display font-bold text-xl ml-2">Install ZIVO</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            {/* App Icon */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-rides flex items-center justify-center shadow-2xl">
              <span className="font-display font-bold text-4xl text-primary-foreground">Z</span>
            </div>

            <h1 className="font-display text-3xl font-bold mb-2">Get the ZIVO App</h1>
            <p className="text-muted-foreground">
              Install ZIVO on your device for the best experience
            </p>
          </motion.div>

          {isInstalled ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="glass-card border-green-500/20">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Already Installed!</h2>
                  <p className="text-muted-foreground mb-4">
                    ZIVO is already installed on your device. Open it from your home screen.
                  </p>
                  <Button variant="hero" onClick={() => navigate("/")}>
                    Open App
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-3 mb-8"
              >
                {features.map((feature, index) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-rides" />
                    <span>{feature}</span>
                  </div>
                ))}
              </motion.div>

              {/* Install Instructions */}
              {deferredPrompt ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button 
                    variant="hero" 
                    size="xl" 
                    className="w-full gap-3"
                    onClick={handleInstallClick}
                  >
                    <Download className="w-5 h-5" />
                    Install ZIVO
                  </Button>
                </motion.div>
              ) : isIOS ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-rides" />
                        Install on iPhone/iPad
                      </CardTitle>
                      <CardDescription>
                        Follow these steps to add ZIVO to your home screen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-rides/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-rides">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Tap the Share button</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            Look for <Share className="w-4 h-4" /> at the bottom of Safari
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-rides/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-rides">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Tap "Add to Home Screen"</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            Look for <Plus className="w-4 h-4" /> Add to Home Screen
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-rides/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-rides">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Tap "Add"</p>
                          <p className="text-sm text-muted-foreground">
                            Confirm and ZIVO will appear on your home screen
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : isAndroid ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-rides" />
                        Install on Android
                      </CardTitle>
                      <CardDescription>
                        Follow these steps to add ZIVO to your home screen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-rides/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-rides">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Tap the menu button</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            Look for <MoreVertical className="w-4 h-4" /> in your browser
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-rides/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-rides">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Tap "Install app" or "Add to Home Screen"</p>
                          <p className="text-sm text-muted-foreground">
                            This option may be in a submenu
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-rides/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-rides">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Confirm the installation</p>
                          <p className="text-sm text-muted-foreground">
                            ZIVO will appear on your home screen
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-card">
                    <CardContent className="pt-6 text-center">
                      <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-bold mb-2">Open on Mobile</h3>
                      <p className="text-sm text-muted-foreground">
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
