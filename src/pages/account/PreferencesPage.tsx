import { useNavigate } from "react-router-dom";
import { useRef, useCallback } from "react";
import { ArrowLeft, Globe, DollarSign, Check, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizationSettings } from "@/hooks/usePersonalizationSettings";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";

const use3DTilt = (ref: React.RefObject<HTMLElement | null>) => {
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  }, [ref]);

  const handleLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(800px) rotateY(0deg) rotateX(0deg)`;
  }, [ref]);

  return {
    onMouseMove: (e: React.MouseEvent) => handleMove(e.clientX, e.clientY),
    onMouseLeave: handleLeave,
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    },
    onTouchEnd: handleLeave,
  };
};

const Section3D = ({ children, icon: Icon, title, subtitle, delay = 0, iconColor = "text-primary" }: {
  children: React.ReactNode;
  icon: any;
  title: string;
  subtitle: string;
  delay?: number;
  iconColor?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const tilt = use3DTilt(ref);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      ref={ref}
      {...tilt}
      className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-xl shadow-[0_8px_32px_hsl(var(--primary)/0.08)] overflow-hidden transition-transform duration-200 ease-out"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Header with glow */}
      <div className="relative px-5 pt-5 pb-3">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shadow-lg border border-primary/10">
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        {children}
      </div>
    </motion.div>
  );
};

const PreferencesPage = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentLanguage, changeLanguage } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();
  const { updateSettings } = usePersonalizationSettings();
  const { data: supportedLanguages } = useSupportedLanguages(true);
  const activeLanguages = (supportedLanguages || []).filter(l => l.is_active);

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const headerY = useTransform(scrollYProgress, [0, 0.15], [0, -20]);
  const headerScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.85]);

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
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div
        ref={scrollRef}
        className="relative z-10 h-screen overflow-y-auto pb-24"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="container max-w-lg mx-auto px-4 pt-4 pb-8">
          {/* 3D Header */}
          <motion.div
            style={{ y: headerY, scale: headerScale, opacity: headerOpacity }}
            className="flex items-center gap-3 mb-8"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="rounded-xl hover:bg-muted/50 -ml-2 touch-manipulation active:scale-95 backdrop-blur-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2"
              >
                Preferences
                <Sparkles className="w-4 h-4 text-primary/60" />
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-muted-foreground text-xs sm:text-sm"
              >
                Appearance, language & currency
              </motion.p>
            </div>
          </motion.div>

          <div className="space-y-5">
            {/* Appearance */}
            <Section3D icon={Palette} title="Appearance" subtitle="Choose your preferred theme" delay={0.1} iconColor="text-primary">
              <ThemeToggle
                onChange={(theme) => {
                  if (user) {
                    updateSettings({ preferred_theme: theme } as any);
                  }
                }}
              />
            </Section3D>

            {/* Language */}
            <Section3D icon={Globe} title="Language" subtitle="Choose your preferred language" delay={0.2} iconColor="text-primary">
              <div className="space-y-0.5 max-h-[360px] overflow-y-auto rounded-xl">
                {activeLanguages.map((lang, i) => (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + i * 0.02 }}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 touch-manipulation active:scale-[0.98] ${
                      currentLanguage === lang.code
                        ? "bg-primary/10 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.1)] ring-1 ring-primary/20"
                        : "hover:bg-muted/60 hover:shadow-md"
                    }`}
                  >
                    <span className="text-xl">{lang.flag_emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{lang.name}</p>
                      <p className="text-xs text-muted-foreground">{lang.native_name}</p>
                    </div>
                    {currentLanguage === lang.code && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </Section3D>

            {/* Currency */}
            <Section3D icon={DollarSign} title="Currency" subtitle="Choose your preferred currency" delay={0.3} iconColor="text-primary">
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_CURRENCIES.map((curr, i) => (
                  <motion.button
                    key={curr.code}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.35 + i * 0.03 }}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 touch-manipulation active:scale-[0.97] ${
                      currency === curr.code
                        ? "bg-primary/10 text-primary ring-1 ring-primary/25 shadow-[0_0_16px_hsl(var(--primary)/0.1)]"
                        : "hover:bg-muted/60 bg-muted/30 hover:shadow-md"
                    }`}
                  >
                    <span className="text-lg">{curr.flag}</span>
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-sm">{curr.code}</p>
                      <p className="text-xs text-muted-foreground truncate">{curr.symbol}</p>
                    </div>
                    {currency === curr.code && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                        <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </Section3D>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
