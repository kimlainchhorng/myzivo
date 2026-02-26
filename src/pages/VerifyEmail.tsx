import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ZivoLogo from "@/components/ZivoLogo";

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error("No email found. Please try signing up again.");
        navigate("/signup");
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: window.location.origin + "/auth-callback",
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (err) {
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    navigate("/login");
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-display font-bold">
              Verify your email
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1 px-4">
              We've sent a verification link to your email address. Please click the link to verify your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6 sm:px-8">
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or click the button below to resend.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:gap-4 pt-2 pb-6 sm:pb-8 px-5 sm:px-8">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:opacity-90 rounded-xl touch-manipulation active:scale-[0.98]"
            >
              {isResending ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Resend verification email
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full h-12 text-base font-medium rounded-xl touch-manipulation active:scale-[0.98]"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to login
            </Button>
          </CardFooter>
        </Card>

        <p className="mt-4 sm:mt-6 text-center text-xs text-muted-foreground/60">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
