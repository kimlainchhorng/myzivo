import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Cookie, X, Settings, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("zivo-cookie-consent");
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, functional: true, analytics: true, advertising: true };
    localStorage.setItem("zivo-cookie-consent", JSON.stringify(allAccepted));
    localStorage.setItem("zivo-cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = { essential: true, functional: false, analytics: false, advertising: false };
    localStorage.setItem("zivo-cookie-consent", JSON.stringify(essentialOnly));
    localStorage.setItem("zivo-cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("zivo-cookie-consent", JSON.stringify(preferences));
    localStorage.setItem("zivo-cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  const cookieCategories = [
    {
      key: "essential" as keyof CookiePreferences,
      title: "Essential Cookies",
      description: "Required for basic functionality. Cannot be disabled.",
      required: true,
    },
    {
      key: "functional" as keyof CookiePreferences,
      title: "Functional Cookies",
      description: "Remember your preferences and enhance features.",
      required: false,
    },
    {
      key: "analytics" as keyof CookiePreferences,
      title: "Analytics Cookies",
      description: "Help us understand how you use our services.",
      required: false,
    },
    {
      key: "advertising" as keyof CookiePreferences,
      title: "Advertising Cookies",
      description: "Used for personalized ads and marketing.",
      required: false,
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <Card className="max-w-4xl mx-auto shadow-2xl border-primary/20 bg-card/95 backdrop-blur-xl">
            <CardContent className="p-6">
              {!showDetails ? (
                <>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                      <Cookie className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg mb-2">We Value Your Privacy</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
                        By clicking "Accept All", you consent to our use of cookies. 
                        Read our{" "}
                        <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={handleAcceptAll} className="gradient-rides">
                          Accept All
                        </Button>
                        <Button variant="outline" onClick={handleRejectAll}>
                          Reject All
                        </Button>
                        <Button variant="ghost" onClick={() => setShowDetails(true)} className="gap-2">
                          <Settings className="h-4 w-4" />
                          Customize
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={handleRejectAll}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-display font-bold text-lg">Cookie Preferences</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your cookie preferences below. Your choices are saved for 12 months.
                  </p>

                  <div className="space-y-4 mb-6">
                    {cookieCategories.map((category) => (
                      <div
                        key={category.key}
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-medium">{category.title}</p>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <Switch
                          checked={preferences[category.key]}
                          onCheckedChange={(checked) =>
                            setPreferences((prev) => ({ ...prev, [category.key]: checked }))
                          }
                          disabled={category.required}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSavePreferences} className="flex-1 gradient-rides">
                      Save Preferences
                    </Button>
                    <Button variant="outline" onClick={handleAcceptAll} className="flex-1">
                      Accept All
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
