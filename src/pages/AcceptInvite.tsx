/**
 * Accept Invitation Page
 * Handles tenant invitation acceptance flow
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "login_required">("loading");
  const [message, setMessage] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus("login_required");
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("Invalid invitation link");
      return;
    }

    acceptInvitation();
  }, [user, authLoading, token]);

  const acceptInvitation = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase.rpc("accept_tenant_invitation", {
        p_token: token,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; tenant_id?: string } | null;

      if (result?.success) {
        setStatus("success");
        setTenantId(result.tenant_id || null);
        setMessage("You've been added to the team!");
      } else {
        setStatus("error");
        setMessage(result?.error || "Failed to accept invitation");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "An error occurred");
    }
  };

  const handleLoginRedirect = () => {
    navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  };

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Team Invitation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Accepting invitation...</p>
            </>
          )}

          {status === "login_required" && (
            <>
              <Mail className="h-12 w-12 text-primary" />
              <p className="text-center">Please log in to accept this invitation</p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Log In
              </Button>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center font-medium">{message}</p>
              <Button onClick={handleContinue} className="w-full">
                Go to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-destructive">{message}</p>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Go Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
