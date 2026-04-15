import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, Lock, User, ArrowRight, Shield, Home, Globe, CheckCircle, Sparkles } from "lucide-react";
import { CountryPhoneInput } from "@/components/auth/CountryPhoneInput";
import { toast } from "sonner";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";
import InlineLegalSheet, { useLegalSheet } from "@/components/checkout/InlineLegalSheet";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const normalizePhoneDigits = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 65248))
    .replace(/\D/g, "");

// Signup schema (extends login with name + confirm)
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().trim().refine((value) => {
    const digits = normalizePhoneDigits(value);
    const valid = digits.length >= 7 && digits.length <= 15;
    if (!valid) {
      console.warn("[Signup] Phone validation failed:", { raw: value, digits, length: digits.length });
    }
    return valid;
  }, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  agreeToTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the Terms of Service" }) }),
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
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("zivo_remember_me") === "true");
  
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { sheet, openSheet, setOpen } = useLegalSheet();
  const { currentLanguage, changeLanguage, t } = useI18n();
  const LANGS = [
    { code: "en", label: "English", flag: "/flags/us.svg" },
    { code: "km", label: "ខ្មែរ", flag: "/flags/kh.svg" },
    { code: "zh", label: "中文", flag: "/flags/cn.svg" },
    { code: "ko", label: "한국어", flag: "/flags/kr.svg" },
    { code: "ja", label: "日本語", flag: "/flags/jp.svg" },
    { code: "vi", label: "Tiếng Việt", flag: "/flags/vn.svg" },
    { code: "th", label: "ไทย", flag: "/flags/th.svg" },
    { code: "es", label: "Español", flag: "/flags/es.svg" },
    { code: "fr", label: "Français", flag: "/flags/fr.svg" },
    { code: "de", label: "Deutsch", flag: "/flags/de.svg" },
    { code: "it", label: "Italiano", flag: "/flags/it.svg" },
    { code: "pt", label: "Português", flag: "/flags/pt.svg" },
    { code: "nl", label: "Nederlands", flag: "/flags/nl.svg" },
    { code: "pl", label: "Polski", flag: "/flags/pl.svg" },
    { code: "sv", label: "Svenska", flag: "/flags/se.svg" },
    { code: "da", label: "Dansk", flag: "/flags/dk.svg" },
    { code: "fi", label: "Suomi", flag: "/flags/fi.svg" },
    { code: "el", label: "Ελληνικά", flag: "/flags/gr.svg" },
    { code: "cs", label: "Čeština", flag: "/flags/cz.svg" },
    { code: "ro", label: "Română", flag: "/flags/ro.svg" },
    { code: "hu", label: "Magyar", flag: "/flags/hu.svg" },
    { code: "no", label: "Norsk", flag: "/flags/no.svg" },
    { code: "ru", label: "Русский", flag: "/flags/ru.svg" },
    { code: "tr", label: "Türkçe", flag: "/flags/tr.svg" },
    { code: "ar", label: "العربية", flag: "/flags/sa.svg" },
  ];
  const currentLangItem = LANGS.find(l => l.code === currentLanguage);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem("zivo_saved_email") || "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: undefined as unknown as true,
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
    
    // Save or clear remembered email
    if (rememberMe) {
      localStorage.setItem("zivo_remember_me", "true");
      localStorage.setItem("zivo_saved_email", data.email);
    } else {
      localStorage.removeItem("zivo_remember_me");
      localStorage.removeItem("zivo_saved_email");
    }

    const { error } = await signIn(data.email, data.password);

    if (error) {
      setIsLoading(false);
      const msg = (error.message || "").toLowerCase();
      const emailExists = (error as any)?._emailExists;

      if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
        if (emailExists === false) {
          toast.error("No account found with this email. Please sign up first.", { icon: "📧" });
        } else {
          toast.error("Incorrect password. Please try again.", { icon: "🔒" });
        }
      } else if (msg.includes("email not confirmed")) {
        toast.error("Please verify your email before signing in.", { icon: "✉️" });
        navigate("/verify-email", { replace: true });
      } else if (msg.includes("too many requests") || msg.includes("rate limit")) {
        toast.error("Too many attempts. Please wait a moment and try again.", { icon: "⏳" });
      } else if (msg.includes("too many failed") || msg.includes("temporarily locked")) {
        toast.error(error.message, { icon: "🔐" });
      } else {
        toast.error(error.message || "Failed to sign in. Please try again.");
      }
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
      } else if (!profile?.setup_complete) {
        navigate("/setup", { replace: true });
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

    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const { error } = await signUp(data.email, data.password, fullName, data.phone);

    if (error) {
      setIsLoading(false);
      const msg = (error.message || "").toLowerCase();
      const code = ((error as any).code || "").toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("user already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else if (code === "weak_password" || msg.includes("weak_password") || msg.includes("pwned") || (msg.includes("password") && (msg.includes("short") || msg.includes("weak") || msg.includes("length") || msg.includes("easy to guess")))) {
        toast.error("🔒 Password is too common or has been exposed in a data breach. Please choose a stronger, unique password.", { duration: 6000 });
      } else if (msg.includes("valid email") || msg.includes("invalid email")) {
        toast.error("Please enter a valid email address.");
      } else if (msg.includes("too many requests") || msg.includes("rate limit")) {
        toast.error("Too many attempts. Please wait a moment and try again.");
      } else {
        toast.error(error.message || "Failed to create account. Please try again.");
      }
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


  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  // 3D tilt effect — disabled on touch devices to prevent iOS input tap issues
  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], isTouchDevice ? [0, 0] : [4, -4]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], isTouchDevice ? [0, 0] : [-4, 4]), { stiffness: 200, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY, isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const input3D = "w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-2 pl-9 pr-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.05)]";
  const input3DLg = "w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-2.5 pl-10 pr-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.05)]";

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">
      <SEOHead title={isLogin ? "Sign In – ZIVO" : "Create Account – ZIVO"} description="Sign in or create your ZIVO account to search flights, hotels, and car rentals." noIndex={true} />

      {/* 3D Background */}
      <div className="absolute inset-0">
        <img src="/images/auth-bg-3d.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            animate={{ y: [0, -200, 0], x: [0, Math.sin(i) * 50, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: 4 + i * 0.8, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
            style={{ left: `${15 + i * 14}%`, bottom: "10%" }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10 px-4" style={isTouchDevice ? undefined : { perspective: "1200px" }}>
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            ...(isTouchDevice ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" as const }),
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5), 0 10px 25px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] rounded-3xl p-4 sm:p-5 flex flex-col"
        >
          {/* Glass shimmer */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.04] rounded-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-3 relative z-20" style={{ transform: "translateZ(30px)" }}>
            <div className="absolute -left-2 -top-2">
              <button onClick={(e) => { e.stopPropagation(); navigate("/"); }} className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 touch-manipulation relative z-30" aria-label="Go to Home">
                <Home className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="absolute -right-2 -top-2">
              <button onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }} className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 touch-manipulation relative z-30" aria-label="Change language">
                <Globe className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-lg">ZIVO ID</h1>
            <motion.p key={isLogin ? "login" : "signup"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/60 mt-0.5 text-xs">
              {isLogin ? t("auth.welcome_back") : t("auth.get_started")}
            </motion.p>
          </div>

          {/* Forms */}
          <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-2.5">
                <FormField control={loginForm.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-white/70 text-xs font-medium">{t("auth.email")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input type="email" placeholder="you@example.com" autoComplete="email" className={input3DLg} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                <FormField control={loginForm.control} name="password" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-white/70 text-xs font-medium">{t("auth.password")}</FormLabel>
                      <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">{t("auth.forgot")}</Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input type="password" placeholder="Enter password" autoComplete="current-password" className={input3DLg} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                {/* Remember Me */}
                <div className="flex items-center gap-2 py-1">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`h-5 w-5 min-w-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-primary border-primary' : 'border-white/30 bg-white/5'}`}
                  >
                    {rememberMe && <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <span className="text-xs text-white/60 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>Remember me</span>
                </div>

                <motion.div whileTap={{ scale: 0.97, y: 2 }} whileHover={{ scale: 1.01 }}>
                  <Button type="submit" className="w-full h-10 text-sm font-bold rounded-xl touch-manipulation transition-all relative overflow-hidden shadow-[0_6px_20px_-4px_rgba(34,197,94,0.5),0_2px_4px_-1px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]" disabled={isLoading} style={{ background: "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.85) 100%)" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 pointer-events-none rounded-t-xl" />
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <span className="relative z-10 flex items-center gap-2">{t("auth.sign_in")}<ArrowRight className="h-4 w-4" /></span>}
                  </Button>
                </motion.div>
              </form>
            </Form>
          ) : (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <FormField control={signupForm.control} name="firstName" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-white/70 text-xs font-medium">{t("auth.first_name")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                          <input placeholder="John" autoComplete="given-name" className={input3D} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="lastName" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-white/70 text-xs font-medium">{t("auth.last_name")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                          <input placeholder="Doe" autoComplete="family-name" className={input3D} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )} />
                </div>

                <FormField control={signupForm.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-white/70 text-xs font-medium">{t("auth.phone")}</FormLabel>
                    <FormControl>
                      <div>
                        <CountryPhoneInput
                          value={field.value}
                          onChange={(value) => {
                            signupForm.setValue("phone", value, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });

                            const digits = normalizePhoneDigits(value);
                            if (digits.length >= 7 && digits.length <= 15) {
                              signupForm.clearErrors("phone");
                            }
                          }}
                          onBlur={() => {
                            field.onBlur();
                            void signupForm.trigger("phone");
                          }}
                          name={field.name}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                <FormField control={signupForm.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-white/70 text-xs font-medium">{t("auth.email")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                        <input type="email" placeholder="you@example.com" autoComplete="email" className={input3D} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-2">
                  <FormField control={signupForm.control} name="password" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-white/70 text-xs font-medium">{t("auth.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                          <input type="password" placeholder="Min 6 chars" autoComplete="new-password" className={input3D} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-white/70 text-xs font-medium">{t("auth.confirm_password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                          <input type="password" placeholder="••••••••" autoComplete="new-password" className={input3D} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )} />
                </div>

                <FormField control={signupForm.control} name="agreeToTerms" render={({ field }) => (
                  <FormItem className="space-y-0">
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked ? true : undefined)} className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-primary focus:ring-primary accent-primary cursor-pointer" />
                      </FormControl>
                      <label className="text-xs text-white/60 leading-tight cursor-pointer" onClick={() => field.onChange(field.value === true ? undefined : true)}>
                        I agree to the{" "}
                        <button type="button" onClick={(e) => { e.stopPropagation(); openSheet("Terms of Service", "/terms"); }} className="text-primary hover:underline font-medium">Terms of Service</button>
                        {" "}and{" "}
                        <button type="button" onClick={(e) => { e.stopPropagation(); openSheet("Privacy Policy", "/privacy"); }} className="text-primary hover:underline font-medium">Privacy Policy</button>
                      </label>
                    </div>
                    <FormMessage className="text-red-400 text-xs ml-6" />
                  </FormItem>
                )} />

                <motion.div whileTap={{ scale: 0.97, y: 2 }} whileHover={{ scale: 1.01 }}>
                  <Button type="submit" className="w-full h-10 text-sm font-bold rounded-xl touch-manipulation transition-all relative overflow-hidden shadow-[0_6px_20px_-4px_rgba(34,197,94,0.5),0_2px_4px_-1px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]" disabled={isLoading} style={{ background: "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.85) 100%)" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 pointer-events-none rounded-t-xl" />
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <span className="relative z-10 flex items-center gap-2">{t("auth.create_account")}<ArrowRight className="h-4 w-4" /></span>}
                  </Button>
                </motion.div>
              </form>
            </Form>
          )}
          </div>


          {/* Trust */}
          <div className="flex items-center justify-center gap-3 mt-2.5 text-white/40 text-[10px] relative z-10">
            <div className="flex items-center gap-1"><Shield className="w-3 h-3" /><span>{t("auth.encrypted")}</span></div>
            <div className="w-px h-3 bg-white/15" />
            <div className="flex items-center gap-1"><Mail className="w-3 h-3" /><span>{t("auth.no_spam")}</span></div>
          </div>

          {/* Toggle */}
          <div className="text-center mt-2 relative z-10">
            <button type="button" onClick={toggleMode} className="text-xs text-white/50 hover:text-white/80 transition-colors">
              {isLogin ? t("auth.no_account") + " " : t("auth.have_account") + " "}
              <span className="text-primary font-semibold">{isLogin ? t("auth.sign_up") : t("auth.log_in")}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-white/30 relative z-10">
            <span>{isLogin ? t("auth.protected") : t("auth.terms_agree")}</span>
          </div>

          {/* Partner buttons row */}
          <div className="relative z-10 mt-4 flex gap-2">
            {/* Become a ZIVO Partner */}
            <motion.button
              type="button"
              onClick={() => navigate("/partner-with-zivo")}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96, rotateX: 6 }}
              className="relative flex-1 py-3 rounded-2xl text-xs font-bold tracking-wide text-white/80 hover:text-white border border-white/10 hover:border-primary/40 bg-gradient-to-b from-white/[0.06] via-transparent to-white/[0.02] backdrop-blur-sm transition-all duration-300 overflow-hidden group"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {t("auth.become_partner")}
              </span>
            </motion.button>

            {/* Partner Sign In */}
            <motion.button
              type="button"
              onClick={() => navigate("/partner-login")}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96, rotateX: 6 }}
              className="relative flex-1 py-3 rounded-2xl text-xs font-bold tracking-wide text-white/80 hover:text-white border border-white/10 hover:border-primary/40 bg-gradient-to-b from-white/[0.06] via-transparent to-white/[0.02] backdrop-blur-sm transition-all duration-300 overflow-hidden group"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                {t("auth.partner_sign_in")}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <InlineLegalSheet open={sheet.open} onOpenChange={setOpen} title={sheet.title} url={sheet.url} />

      {/* Language menu rendered via portal to escape 3D transform context */}
      {showLangMenu && createPortal(
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setShowLangMenu(false)} />
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-6 pointer-events-none">
            <div className="pointer-events-auto w-[260px] max-h-[60vh] bg-black/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 h-fit ml-auto">
              <div className="relative px-3 py-2 border-b border-white/10 overflow-hidden">
                {currentLangItem?.flag && (
                  <img src={currentLangItem.flag} alt="" className="absolute -right-3 -top-3 w-24 h-24 opacity-[0.07] pointer-events-none blur-[1px]" style={{ transform: "rotate(-12deg) scale(1.3)" }} />
                )}
                <p className="text-xs font-medium text-white/60 relative z-10">{t("lang.select")}</p>
              </div>
              <div className="max-h-[320px] overflow-y-auto py-1">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { changeLanguage(l.code); setShowLangMenu(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-200 relative overflow-hidden group",
                      currentLanguage === l.code ? "bg-primary/20 text-primary font-semibold" : "text-white/80 hover:bg-white/10"
                    )}
                  >
                    <img src={l.flag} alt="" className="absolute right-0 top-1/2 w-14 h-14 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none blur-[0.5px]" style={{ transform: "translateY(-50%) rotate(-8deg)" }} />
                    <img src={l.flag} alt={l.label} className="w-6 h-[17px] rounded-[3px] object-cover shadow-sm border border-white/20 shrink-0 relative z-10" />
                    <span className="relative z-10 flex-1 text-left">{l.label}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase relative z-10">{l.code}</span>
                    {currentLanguage === l.code && <CheckCircle className="w-3.5 h-3.5 text-primary relative z-10" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default Login;