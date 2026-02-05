import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchangeAuthToken } from "@/hooks/useCrossAppAuth";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { exchangeToken, isExchanging, error } = useExchangeAuthToken();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    
    // If there's a cross-app token, handle that flow
    if (token) {
      const handleExchange = async () => {
        const redirectUrl = await exchangeToken(token);
        
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          setStatus("error");
        }
      };
      handleExchange();
      return;
    }

    // Otherwise, this is an OAuth callback - check for session
    const handleOAuthCallback = async () => {
      // Give Supabase a moment to process the hash fragment
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("OAuth callback error:", sessionError);
        setStatus("error");
        return;
      }

      if (session) {
        // Successfully authenticated via OAuth
        setStatus("success");
        setTimeout(() => navigate("/", { replace: true }), 500);
      } else {
        // No session yet - wait for auth state change
        const timeout = setTimeout(() => {
          setStatus("error");
        }, 5000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            clearTimeout(timeout);
            setStatus("success");
            setTimeout(() => navigate("/", { replace: true }), 500);
            subscription.unsubscribe();
          }
        });

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
        <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Welcome!</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Redirecting you now...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error" || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
        <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              {error || "The authentication link is invalid or has expired."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl touch-manipulation active:scale-95">
                Go Home
              </Button>
              <Button onClick={() => navigate("/login")} className="rounded-xl touch-manipulation active:scale-95">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Signing you in...</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Please wait while we authenticate your session.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
