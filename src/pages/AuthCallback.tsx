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

  // Helper function to check setup status and navigate accordingly
  const checkSetupAndNavigate = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("setup_complete")
        .eq("user_id", userId)
        .maybeSingle();

      // If no profile or setup not complete, go to setup page
      if (!profile || profile.setup_complete !== true) {
        setStatus("success");
        setTimeout(() => navigate("/setup", { replace: true }), 200);
      } else {
        setStatus("success");
        setTimeout(() => navigate("/", { replace: true }), 200);
      }
    } catch (err) {
      console.error("Error checking setup status:", err);
      // Default to home on error
      setStatus("success");
      setTimeout(() => navigate("/", { replace: true }), 200);
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Cross-app auth flow (?token=...)
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

    // Supabase OAuth PKCE flow (?code=...)
    if (code) {
      const handleCodeExchange = async () => {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("OAuth code exchange error:", exchangeError);
          setStatus("error");
          return;
        }

        if (data.session?.user) {
          await checkSetupAndNavigate(data.session.user.id);
        } else {
          setStatus("success");
          setTimeout(() => navigate("/", { replace: true }), 200);
        }
      };

      handleCodeExchange();
      return;
    }

    // Provider error returned in query params
    if (errorParam) {
      console.error("OAuth provider returned error:", { errorParam, errorDescription });
      setStatus("error");
      return;
    }

    // Fallback: if the session already exists, check setup status. Otherwise, wait briefly.
    const handleOAuthFallback = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("OAuth callback session error:", sessionError);
        setStatus("error");
        return;
      }

      if (session?.user) {
        await checkSetupAndNavigate(session.user.id);
        return;
      }

      const timeout = setTimeout(() => setStatus("error"), 7000);
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        if (nextSession?.user) {
          clearTimeout(timeout);
          await checkSetupAndNavigate(nextSession.user.id);
          subscription.unsubscribe();
        }
      });

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    };

    void handleOAuthFallback();
  }, [searchParams, navigate, exchangeToken]);

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
