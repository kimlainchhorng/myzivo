import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isNativeWebView(): boolean {
  const maybeCapacitor = (window as any)?.Capacitor;
  if (!maybeCapacitor) return false;
  if (typeof maybeCapacitor.isNativePlatform === "function") {
    try {
      return Boolean(maybeCapacitor.isNativePlatform());
    } catch {
      return false;
    }
  }
  return false;
}

export default function ShareProfileRedirect() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("post") || "";
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    // Fast path: for external mobile browsers, immediately try opening the app
    // using the exact shared path (/p/:code) before any async lookup.
    if (isMobileBrowser() && !isNativeWebView()) {
      const path = window.location.pathname.replace(/^\//, "");
      const nativeUrl = `com.hizovo.app://${path}${window.location.search}`;
      window.setTimeout(() => {
        window.location.assign(nativeUrl);
      }, 80);
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;
    supabase
      .from("profiles")
      .select("id, user_id")
      .eq("share_code", code)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const redirectParams = new URLSearchParams({ sc: code });
          if (postId) redirectParams.set("post", postId);
          // /user/:userId is keyed off auth user_id, NOT the profile row PK.
          // Falling back to data.id keeps older links working when user_id
          // happens to be null (rare, legacy rows).
          const targetId = data.user_id || data.id;
          const webPath = `/user/${targetId}?${redirectParams.toString()}`;

          navigate(webPath, { replace: true });
        } else {
          setNotFound(true);
        }
      });
  }, [code, navigate, postId]);

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
