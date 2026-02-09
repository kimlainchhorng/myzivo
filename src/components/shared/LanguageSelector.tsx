import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizationSettings } from "@/hooks/usePersonalizationSettings";

const languages = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
];

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useI18n();
  const { user } = useAuth();
  const { updateSettings } = usePersonalizationSettings();
  const selected = languages.find(l => l.code === currentLanguage) || languages[0];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-lg">{selected.flag}</span>
        <span className="font-medium hidden sm:inline">{selected.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-border/50">
              <p className="text-xs text-muted-foreground px-2">Select Language</p>
            </div>
            <div className="max-h-72 overflow-y-auto p-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    changeLanguage(language.code);
                    if (user) {
                      updateSettings({ preferred_language: language.code });
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selected.code === language.code
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{language.name}</p>
                    <p className="text-xs text-muted-foreground">{language.native}</p>
                  </div>
                  {selected.code === language.code && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
