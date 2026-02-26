import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, DollarSign, Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizationSettings } from "@/hooks/usePersonalizationSettings";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";

const PreferencesPage = () => {
  const navigate = useNavigate();
  const { currentLanguage, changeLanguage } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();
  const { updateSettings } = usePersonalizationSettings();
  const { data: supportedLanguages } = useSupportedLanguages(true);
  const activeLanguages = (supportedLanguages || []).filter(l => l.is_active);

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
    if (user) {
      updateSettings({ preferred_language: langCode });
    }
    toast.success("Language updated");
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    if (user) {
      updateSettings({ preferred_currency: currencyCode });
    }
    toast.success("Currency updated");
  };

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-top safe-area-bottom">
      <div className="container max-w-lg mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="rounded-xl hover:bg-muted/50 -ml-2 touch-manipulation active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold">Preferences</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Appearance, language & currency</p>
          </div>
        </div>

        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Appearance Section */}
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ThemeToggle
                onChange={(theme) => {
                  if (user) {
                    updateSettings({ preferred_theme: theme } as any);
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Language Section */}
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Language
              </CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {activeLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors touch-manipulation active:scale-[0.98] ${
                      currentLanguage === lang.code
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="text-xl">{lang.flag_emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{lang.name}</p>
                      <p className="text-xs text-muted-foreground">{lang.native_name}</p>
                    </div>
                    {currentLanguage === lang.code && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Currency Section */}
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Currency
              </CardTitle>
              <CardDescription>Choose your preferred currency for price display</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors touch-manipulation active:scale-[0.98] ${
                      currency === curr.code
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "hover:bg-muted bg-muted/30"
                    }`}
                  >
                    <span className="text-lg">{curr.flag}</span>
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-sm">{curr.code}</p>
                      <p className="text-xs text-muted-foreground truncate">{curr.symbol}</p>
                    </div>
                    {currency === curr.code && (
                      <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
