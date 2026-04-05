import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setupActivityTracking, clearSessionArtifacts } from "@/lib/security/sessionSecurity";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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
  const initializedRef = useRef(false);
  const loginGraceUntilRef = useRef(0);

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
    // 1. Restore session from storage FIRST — this prevents the race condition
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const adminStatus = await checkAdminRole(session.user.id);
        setIsAdmin(adminStatus);
      }

      // Only mark as ready AFTER getSession completes
      initializedRef.current = true;
      setIsLoading(false);
    });

    // 2. Listen for subsequent auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignore events that fire before getSession has finished
        if (!initializedRef.current) return;

        console.log("[Auth] onAuthStateChange", {
          event,
          hasSession: !!session,
          userId: session?.user?.id ?? null,
          expiresAt: session?.expires_at ?? null,
        });

        // iOS/WebView can sometimes emit a transient SIGNED_OUT right after SIGNED_IN.
        // During a short grace window, attempt to rehydrate before accepting logout.
        if (event === "SIGNED_OUT" && Date.now() < loginGraceUntilRef.current) {
          console.warn("[Auth] Ignoring transient SIGNED_OUT during login grace window");
          void supabase.auth.getSession().then(async ({ data: { session: recoveredSession } }) => {
            if (!recoveredSession?.user) return;

            setSession(recoveredSession);
            setUser(recoveredSession.user);

            try {
              const adminStatus = await checkAdminRole(recoveredSession.user.id);
              setIsAdmin(adminStatus);
            } catch {
              setIsAdmin(false);
            }
          });
          return;
        }

        // Fresh logins should always start a fresh security window.
        // Keep INITIAL_SESSION untouched so persisted sessions still respect max age.
        if (event === "SIGNED_IN") {
          loginGraceUntilRef.current = Date.now() + 15_000;
          clearSessionArtifacts();
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          checkAdminRole(session.user.id).then((adminStatus) => {
            setIsAdmin(adminStatus);
          }).catch(() => {
            setIsAdmin(false);
          });
        } else {
          clearSessionArtifacts();
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`,
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
      if (!error) {
        loginGraceUntilRef.current = Date.now() + 15_000;

        // Reset session-security timers at the exact moment of successful auth.
        clearSessionArtifacts();

        // Log login event asynchronously (fire-and-forget)
        supabase.functions.invoke("log-login", {
          body: { user_agent: navigator.userAgent },
        }).catch(() => { /* non-critical */ });
      }
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
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
