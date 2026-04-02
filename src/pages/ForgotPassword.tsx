import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit, formatLockout } from "@/lib/security/rateLimiter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Mail, Loader2, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background safe-area-top safe-area-bottom">
        <SEOHead title="Check Your Email – ZIVO" description="Password reset link sent." noIndex={true} />
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/10 via-transparent to-transparent rounded-full blur-3xl opacity-30" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="glass-card border-white/10 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
                  Check your email
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2 text-sm sm:text-base">
                  We've sent a password reset link to your email address. Click the link to set a new password.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setEmailSent(false)}
                  className="w-full h-12 bg-background/50 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl touch-manipulation active:scale-[0.98]"
                >
                  Try another email
                </Button>
                <Button 
                  variant="ghost" 
                  asChild
                  className="w-full h-12 hover:bg-white/5 transition-all rounded-xl"
                >
                  <Link to="/login" className="flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background safe-area-top safe-area-bottom">
      <SEOHead title="Forgot Password – ZIVO" description="Reset your ZIVO account password." noIndex={true} />
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/15 via-transparent to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/10 via-transparent to-transparent rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Logo */}
            <div className="relative mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-rides flex items-center justify-center relative overflow-hidden">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground relative z-10" />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-xl -z-10" />
            </div>

            <div>
              <CardTitle className="text-2xl sm:text-3xl font-display font-bold">
                <span className="bg-gradient-to-r from-primary via-primary to-rides bg-clip-text text-transparent">
                  Forgot password?
                </span>
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-sm sm:text-base">
                Enter your email and we'll send you a reset link
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground/80">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className="h-12 pl-10 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-rides hover:from-primary/90 hover:to-rides/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 touch-manipulation active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full h-12 hover:bg-white/5 transition-all rounded-xl" 
                    asChild
                  >
                    <Link to="/login" className="flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back to login
                    </Link>
                  </Button>
                </div>

                {/* Decorative element */}
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Sparkles className="w-4 h-4 text-primary/50" />
                  <span className="text-xs text-muted-foreground">Secure password reset</span>
                  <Sparkles className="w-4 h-4 text-primary/50" />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
