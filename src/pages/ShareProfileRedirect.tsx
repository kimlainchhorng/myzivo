import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function ShareProfileRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    supabase
      .from("profiles")
      .select("id, user_id")
      .eq("share_code", code)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          navigate(`/user/${data.id}`, { replace: true });
        } else {
          setNotFound(true);
        }
      });
  }, [code, navigate]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
