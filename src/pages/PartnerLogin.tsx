/**
 * Partner Login Page — Sign-in for ZIVO Partners (shop owners, merchants, etc.)
 * After login, redirects to partner dashboard based on user role.
 */
import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, Lock, ArrowRight, Home, Store, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";

const partnerLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type PartnerLoginData = z.infer<typeof partnerLoginSchema>;

export default function PartnerLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const form = useForm<PartnerLoginData>({
    resolver: zodResolver(partnerLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: PartnerLoginData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);

    if (error) {
      setIsLoading(false);
      toast.error(error.message || "Failed to sign in");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      toast.error("Authentication failed");
      return;
    }

    // Check partner roles: restaurant owner, hotel owner, car rental owner, store merchant
    const [restaurant, hotel, carRentals, adminRole] = await Promise.all([
      supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle(),
      supabase.from("hotels").select("id").eq("owner_id", user.id).maybeSingle(),
      supabase.from("rental_cars").select("id").eq("owner_id", user.id).limit(1),
      supabase.rpc("check_user_role", { _user_id: user.id, _role: "admin" }),
    ]);

    setIsLoading(false);

    // Route based on partner type
    if (adminRole.data) {
      toast.success("Welcome back, Admin!");
      navigate("/admin/analytics", { replace: true });
    } else if (restaurant.data) {
      toast.success("Welcome back, Partner!");
      navigate("/restaurant/dashboard", { replace: true });
    } else if (hotel.data) {
      toast.success("Welcome back, Partner!");
      navigate("/hotel/dashboard", { replace: true });
    } else if ((carRentals.data?.length ?? 0) > 0) {
      toast.success("Welcome back, Partner!");
      navigate("/car-rental/dashboard", { replace: true });
    } else {
      // No partner role found — still logged in, send to store/business setup
      toast.info("No partner account found. Please set up your business first.");
      navigate("/partner-with-zivo", { replace: true });
    }
  };

  // 3D tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 200, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const input3D = "w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-2.5 pl-10 pr-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.05)]";

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">
      <SEOHead title="Partner Sign In – ZIVO" description="Sign in to your ZIVO Partner account to manage your business." noIndex />

      {/* Background */}
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

      <div className="w-full max-w-md relative z-10 px-4" style={{ perspective: "1200px" }}>
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            rotateX, rotateY,
            transformStyle: "preserve-3d" as const,
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5), 0 10px 25px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] rounded-3xl p-5 sm:p-6 flex flex-col"
        >
          {/* Glass shimmer */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.04] rounded-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-5 relative z-20" style={{ transform: "translateZ(30px)" }}>
            <div className="absolute -left-1 -top-1">
              <button onClick={() => navigate("/")} className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 touch-manipulation" aria-label="Go to Home">
                <Home className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Partner icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center mb-3 shadow-[0_8px_24px_-6px_rgba(34,197,94,0.3)]">
              <Store className="w-7 h-7 text-primary" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-lg">Partner Sign In</h1>
            <p className="text-white/50 mt-1 text-xs">Access your ZIVO business dashboard</p>
          </div>

          {/* Form */}
          <div className="relative z-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-white/70 text-xs font-medium">Business Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input type="email" placeholder="partner@business.com" autoComplete="email" className={input3D} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-white/70 text-xs font-medium">Password</FormLabel>
                      <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">Forgot?</Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input type="password" placeholder="••••••••" autoComplete="current-password" className={input3D} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                <motion.div whileTap={{ scale: 0.97, y: 2 }} whileHover={{ scale: 1.01 }}>
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-bold rounded-xl touch-manipulation transition-all relative overflow-hidden shadow-[0_6px_20px_-4px_rgba(34,197,94,0.5),0_2px_4px_-1px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    disabled={isLoading}
                    style={{ background: "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.85) 100%)" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 pointer-events-none rounded-t-xl" />
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                    ) : (
                      <span className="relative z-10 flex items-center gap-2">
                        Sign In to Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[10px] text-white/40 bg-transparent">NEW PARTNER?</span>
              </div>
            </div>

            {/* Register CTA */}
            <motion.button
              type="button"
              onClick={() => navigate("/partner-with-zivo")}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96, rotateX: 6 }}
              className="w-full py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-sm text-white/80 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-all touch-manipulation shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]"
              style={{ transformStyle: "preserve-3d" as const }}
            >
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              Become a ZIVO Partner
            </motion.button>

            {/* Customer login link */}
            <p className="text-center text-white/40 text-[11px] mt-3">
              Looking for customer login?{" "}
              <button onClick={() => navigate("/login")} className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in here
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
