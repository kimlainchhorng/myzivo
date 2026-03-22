import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session, Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setupActivityTracking, clearSessionArtifacts } from "@/lib/security/sessionSecurity";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { AppleSignIn, SignInScope } from "@capawesome/capacitor-apple-sign-in";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (provider: Provider) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("check_user_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      return data ?? false;
    } catch (err) {
      console.error("Error checking admin role:", err);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(async () => {
            const adminStatus = await checkAdminRole(session.user.id);
            setIsAdmin(adminStatus);
            setIsLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminStatus = await checkAdminRole(session.user.id);
        setIsAdmin(adminStatus);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            ...(phone ? { phone } : {}),
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      const isNative = Capacitor.isNativePlatform();

      // On native iOS, use the native Sign In with Apple SDK for the
      // apple provider — this is required by Apple App Store guidelines
      // (Guideline 4.8 / Sign In with Apple requirement).
      if (isNative && provider === "apple") {
        // Generate a cryptographically random nonce for replay-attack protection.
        const rawNonce = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // SHA-256 hash the nonce — Apple embeds the hash in the identity token.
        const hashBuffer = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(rawNonce)
        );
        const hashedNonce = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const result = await AppleSignIn.signIn({
          scopes: [SignInScope.Email, SignInScope.FullName],
          nonce: hashedNonce,
        });

        // Exchange the Apple identity token for a Supabase session.
        // We pass the raw nonce — Supabase will hash it and verify it
        // against the nonce claim in the Apple-issued JWT.
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: result.idToken,
          nonce: rawNonce,
        });
        return { error };
      }

      const SAFE_OAUTH_ORIGINS = new Set<string>([
        "https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app",
        "https://72f99340-9c9f-453a-acff-60e5a9b25774.lovableproject.com",
        "https://myzivo.lovable.app",
        "https://hizivo.com",
        "https://www.hizivo.com",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
      ]);

      const currentOrigin = window.location.origin;
      // On native, redirect to published URL (the Capacitor WebView will handle it)
      const fallbackOrigin = isNative
        ? "https://myzivo.lovable.app"
        : "https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app";

      const redirectOrigin = SAFE_OAUTH_ORIGINS.has(currentOrigin) ? currentOrigin : fallbackOrigin;
      const redirectTo = `${redirectOrigin}/auth-callback`;

      if (isNative) {
        // On native, use skipBrowserRedirect so we get the URL back
        // then open it in an in-app browser (not Safari)
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });
        if (error) return { error };
        if (data?.url) {
          await Browser.open({ url: data.url, windowName: "_self" });
        }
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = useCallback(async () => {
    clearSessionArtifacts();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }, []);

  // Session security: idle timeout and max age enforcement
  useEffect(() => {
    if (!session) return;
    const cleanup = setupActivityTracking(() => {
      console.warn("[Auth] Session invalidated due to inactivity or max age");
      signOut();
    });
    return cleanup;
  }, [session, signOut]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signUp, signIn, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
