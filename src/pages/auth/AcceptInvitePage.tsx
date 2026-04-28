/** AcceptInvitePage — claims a store employee invite after sign-in. */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertTriangle, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const token = params.get("token") || "";
  const [state, setState] = useState<"idle" | "claiming" | "ok" | "already" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setState("error");
      setErrorMsg("Missing invite token.");
      return;
    }
    if (!user) {
      // Send to /auth, preserve intent
      navigate(`/auth?next=${encodeURIComponent(`/auth/accept-invite?token=${token}`)}`, { replace: true });
      return;
    }
    (async () => {
      setState("claiming");
      const { data, error } = await (supabase as any).rpc("claim_employee_invite", { _token: token });
      if (error) {
        setState("error");
        setErrorMsg(error.message);
        return;
      }
      if (data?.ok) {
        setState(data.already ? "already" : "ok");
      } else {
        setState("error");
        setErrorMsg(data?.error || "Invite could not be claimed.");
      }
    })();
  }, [authLoading, user, token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
          <Briefcase className="w-7 h-7 text-emerald-500" />
        </div>
        {state === "idle" || state === "claiming" ? (
          <>
            <h1 className="text-lg font-bold">Setting up your account…</h1>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
          </>
        ) : state === "ok" || state === "already" ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h1 className="text-lg font-bold">
              {state === "already" ? "You're already on the team" : "Welcome to the team!"}
            </h1>
            <p className="text-sm text-muted-foreground">
              You can now clock in and view your schedule.
            </p>
            <Button className="w-full" onClick={() => navigate("/personal-dashboard")}>
              Open Personal Dashboard
            </Button>
          </>
        ) : (
          <>
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h1 className="text-lg font-bold">Invite issue</h1>
            <p className="text-sm text-muted-foreground">{errorMsg || "This invite is no longer valid."}</p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>Go home</Button>
          </>
        )}
      </Card>
    </div>
  );
}
