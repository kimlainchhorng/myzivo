import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Provider } from "@supabase/supabase-js";
import ZivoLogo from "@/components/ZivoLogo";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { signIn, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
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

      setIsLoading(false);
      toast.success("Welcome back!");

      if (!profile || profile.setup_complete !== true) {
        navigate("/setup", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setIsLoading(false);
      navigate(from, { replace: true });
    }
  };

  const handleSocialLogin = async (provider: Provider) => {
    setSocialLoading(provider);
    const { error } = await signInWithProvider(provider);
    if (error) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6 sm:py-8 safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-br from-primary/20 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-tr from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-0 bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden rounded-3xl">
          <CardHeader className="space-y-1 text-center pb-4 sm:pb-6 pt-6 sm:pt-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <ZivoLogo size="lg" />
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-display font-bold">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Sign in to continue with ZIVO
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 px-6 sm:px-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90 font-medium text-sm">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="h-12 pl-12 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-foreground/90 font-medium text-sm">Password</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="h-12 pl-12 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex flex-col gap-3 sm:gap-4 pt-2 pb-6 sm:pb-8 px-5 sm:px-8">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:opacity-90 rounded-xl touch-manipulation active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-4 text-muted-foreground">or</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={socialLoading !== null}
                    className="h-11 sm:h-12 bg-muted/30 border-border/50 rounded-xl touch-manipulation active:scale-95"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={socialLoading !== null}
                    className="h-11 sm:h-12 bg-muted/30 border-border/50 rounded-xl touch-manipulation active:scale-95"
                  >
                    {socialLoading === 'apple' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={socialLoading !== null}
                    className="h-11 sm:h-12 bg-muted/30 border-border/50 rounded-xl touch-manipulation active:scale-95"
                  >
                    {socialLoading === 'facebook' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary font-semibold hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <p className="mt-4 sm:mt-6 text-center text-xs text-muted-foreground/60">
          Protected by enterprise-grade security 🔒
        </p>
      </div>
    </div>
  );
};

export default Login;
