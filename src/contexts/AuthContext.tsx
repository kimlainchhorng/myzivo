import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session, Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setupActivityTracking, clearSessionArtifacts } from "@/lib/security/sessionSecurity";
import { Capacitor } from "@capacitor/core";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
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
      // IMPORTANT:
      // - If a user triggers OAuth from an unconfigured domain (e.g., hizivo.com before DNS/custom domain),
      //   redirecting back there will strand them on an unreachable/invalid callback.
      // - Lovable previews may run on different hostnames (lovable.app, lovableproject.com, myzivo.lovable.app).
      //   We should redirect back to the current safe origin whenever possible.

      const SAFE_OAUTH_ORIGINS = new Set<string>([
        // Preview
        "https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app",
        // Preview (alternate host)
        "https://72f99340-9c9f-453a-acff-60e5a9b25774.lovableproject.com",
        // Published
        "https://myzivo.lovable.app",
        // Production custom domain
        "https://hizivo.com",
        "https://www.hizivo.com",
        // Local dev
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
      ]);

      const currentOrigin = window.location.origin;
      const fallbackOrigin = "https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app";

      const redirectOrigin = SAFE_OAUTH_ORIGINS.has(currentOrigin) ? currentOrigin : fallbackOrigin;
      const redirectTo = `${redirectOrigin}/auth-callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account", // Force account chooser - never auto-sign-in
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
