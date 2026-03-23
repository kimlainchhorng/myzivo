import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, Lock, User, ArrowRight, Shield, Home, Globe, CheckCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Provider } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import SEOHead from "@/components/SEOHead";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Signup schema (extends login with name + confirm)
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(7, "Please enter a valid phone number").max(20).regex(/^[+]?[\d\s\-().]+$/, "Invalid phone number format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? false : true;
  
  const [isLogin, setIsLogin] = useState(initialMode);

  // Capture affiliate_code from URL for attribution tracking
  useEffect(() => {
    const affiliateCode = searchParams.get("affiliate_code");
    if (affiliateCode) {
      sessionStorage.setItem("signup_affiliate_code", affiliateCode);
    }
  }, [searchParams]);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { currentLanguage, changeLanguage, t } = useI18n();
  const LANGS = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "km", label: "ខ្មែរ", flag: "🇰🇭" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "th", label: "ไทย", flag: "🇹🇭" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "pt", label: "Português", flag: "🇵🇹" },
    { code: "nl", label: "Nederlands", flag: "🇳🇱" },
    { code: "pl", label: "Polski", flag: "🇵🇱" },
    { code: "sv", label: "Svenska", flag: "🇸🇪" },
    { code: "da", label: "Dansk", flag: "🇩🇰" },
    { code: "fi", label: "Suomi", flag: "🇫🇮" },
    { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
    { code: "cs", label: "Čeština", flag: "🇨🇿" },
    { code: "ro", label: "Română", flag: "🇷🇴" },
    { code: "hu", label: "Magyar", flag: "🇭🇺" },
    { code: "no", label: "Norsk", flag: "🇳🇴" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
  ];
  const { signIn, signUp, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Reset forms when switching modes
  useEffect(() => {
    if (isLogin) {
      signupForm.reset();
    } else {
      loginForm.reset();
    }
  }, [isLogin, loginForm, signupForm]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);

    if (error) {
      setIsLoading(false);
      toast.error(error.message || "Failed to sign in");
      return;
    }

    // Check user and email verification status
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check email verification for email/password users
      if (!user.email_confirmed_at) {
        setIsLoading(false);
        navigate("/verify-email", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("setup_complete")
        .eq("user_id", user.id)
        .maybeSingle();

      // Check if user is admin for auto-redirect
      const { data: isAdminUser } = await supabase.rpc("check_user_role", {
        _user_id: user.id,
        _role: "admin",
      });

      setIsLoading(false);
      toast.success("Welcome back!");

      if (isAdminUser) {
        navigate("/admin/analytics", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      setIsLoading(false);
      navigate(from, { replace: true });
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    
    // Check if email is on allowlist before attempting signup
    try {
      const { data: allowlistResponse, error: allowlistError } = await supabase.functions.invoke(
        "check-signup-allowlist",
        { body: { email: data.email } }
      );

      if (allowlistError) {
        setIsLoading(false);
        toast.error("Unable to verify email authorization. Please try again.");
        return;
      }

      if (!allowlistResponse?.allowed) {
        setIsLoading(false);
        if (allowlistResponse?.existingUser) {
          toast.info("An account with this email already exists. Please sign in instead.");
          setIsLogin(true); // Switch to login mode
        } else {
          toast.error(allowlistResponse?.message || "This email is not authorized to sign up.");
        }
        return;
      }
    } catch (err) {
      setIsLoading(false);
      toast.error("Unable to verify email authorization. Please try again.");
      return;
    }

    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const { error } = await signUp(data.email, data.password, fullName, data.phone);

    if (error) {
      setIsLoading(false);
      toast.error(error.message || "Failed to create account");
      return;
    }

    // Get the user ID for OTP tracking
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Send OTP email
    try {
      const { data: otpResponse, error: otpError } = await supabase.functions.invoke(
        "send-otp-email",
        { body: { email: data.email, userId } }
      );

      if (otpError || !otpResponse?.success) {
        console.error("Failed to send OTP:", otpError || otpResponse?.error);
        // Fall back to old verification email flow
        setIsLoading(false);
        toast.success("Account created! Please check your email to verify.");
        navigate("/verify-email");
        return;
      }
    } catch (err) {
      console.error("OTP send error:", err);
      // Fall back to old verification email flow
      setIsLoading(false);
      toast.success("Account created! Please check your email to verify.");
      navigate("/verify-email");
      return;
    }

    setIsLoading(false);
    toast.success("Verification code sent to your email!");
    navigate("/verify-otp", { state: { email: data.email, userId } });
  };

  const handleSocialLogin = async (provider: Provider) => {
    setSocialLoading(provider);
    const { error } = await signInWithProvider(provider);
    if (error) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setSocialLoading(null);
      return;
    }

    if (provider === "apple" && Capacitor.isNativePlatform()) {
      setSocialLoading(null);
      navigate("/auth-callback", { replace: true });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 px-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <SEOHead title={isLogin ? "Sign In – ZIVO" : "Create Account – ZIVO"} description="Sign in or create your ZIVO account to search flights, hotels, and car rentals." noIndex={true} />
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/3 w-[80%] h-[80%] bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[60%] h-[60%] bg-gradient-to-tl from-[hsl(var(--flights))/0.1] to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-[30%] h-[30%] bg-gradient-to-bl from-[hsl(var(--hotels))/0.08] to-transparent rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
      <div className="w-full max-w-md relative z-10 flex flex-col max-h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/80 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl shadow-black/[0.08] p-5 sm:p-6 flex-1 min-h-0 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="text-center mb-4 relative">
            {/* Language toggle - top right */}
            <div className="absolute right-0 top-0">
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-all active:scale-90 touch-manipulation"
                  aria-label="Change language"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </button>
                {showLangMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                    <div className="absolute right-0 top-10 z-50 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[130px] animate-in fade-in slide-in-from-top-2 duration-150">
                      {LANGS.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { changeLanguage(l.code); setShowLangMenu(false); }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                            currentLanguage === l.code ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"
                          )}
                        >
                          <span className="text-sm">{l.flag}</span>
                          <span>{l.label}</span>
                          {currentLanguage === l.code && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              ZIVO ID
            </h1>
            <motion.p 
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground mt-1 text-xs sm:text-sm"
            >
              {isLogin ? t("auth.welcome_back") : t("auth.get_started")}
            </motion.p>
          </div>

          {/* Forms */}
          <div className="flex-1 min-h-0 overflow-y-auto">
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm font-medium">{t("auth.email")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-muted-foreground text-sm font-medium">{t("auth.password")}</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          {t("auth.forgot")}
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mt-4 touch-manipulation active:scale-[0.98] transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {t("auth.sign_in")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground text-sm font-medium">{t("auth.first_name") || "First Name"}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              placeholder="John"
                              autoComplete="given-name"
                              className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground text-sm font-medium">{t("auth.last_name") || "Last Name"}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              placeholder="Doe"
                              autoComplete="family-name"
                              className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={signupForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            autoComplete="tel"
                            className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm font-medium">{t("auth.email")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm font-medium">{t("auth.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm font-medium">{t("auth.confirm_password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mt-3 touch-manipulation active:scale-[0.98] transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {t("auth.create_account")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
          </div>{/* end scrollable forms wrapper */}

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground">{t("auth.or_continue")}</span>
            </div>
          </div>

          {/* Social Login - 2 columns only */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="h-11 flex items-center justify-center bg-muted border border-border hover:bg-muted/80 hover:border-border/80 text-foreground rounded-xl touch-manipulation active:scale-95 transition-all disabled:opacity-50 text-sm"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={socialLoading !== null}
              className="h-11 flex items-center justify-center bg-muted border border-border hover:bg-muted/80 hover:border-border/80 text-foreground rounded-xl touch-manipulation active:scale-95 transition-all disabled:opacity-50 text-sm"
            >
              {socialLoading === 'apple' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-3 text-muted-foreground text-[10px]">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>{t("auth.encrypted")}</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{t("auth.no_spam")}</span>
            </div>
          </div>

          {/* Toggle Mode */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? t("auth.no_account") + " " : t("auth.have_account") + " "}
              <span className="text-primary font-semibold">
                {isLogin ? t("auth.sign_up") : t("auth.log_in")}
              </span>
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col items-center gap-2 mt-3 shrink-0">
          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? t("auth.protected") : t("auth.terms_agree")}
          </p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <Home className="h-4 w-4" />
            {t("auth.go_home")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;