import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  session: Session | null;
  user: Session["user"] | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

/** Avoid React churn when nothing meaningful changed (reduces cascade refetches). */
function sessionsAreEquivalent(a: Session | null, b: Session | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.user?.id !== b.user?.id) return false;
  if (a.expires_at !== b.expires_at) return false;
  if (a.access_token !== b.access_token) return false;
  return JSON.stringify(a.user) === JSON.stringify(b.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  /** Dedupe noisy DEV logs when the same auth signal repeats back-to-back */
  const lastLogKey = useRef<string>("");

  useEffect(() => {
    const logAuth = (event: AuthChangeEvent, s: Session | null) => {
      if (!import.meta.env.DEV) return;
      const key = `${event}:${s?.user?.id ?? "anon"}`;
      if (lastLogKey.current === key) return;
      lastLogKey.current = key;
      console.debug("[zeni-auth]", event, { userId: s?.user?.id ?? null });
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Auto refresh already updates the client's internal session; pushing this through React
      // re-renders the tree and retriggers every hook keyed on `user`, causing repeated REST
      // reads (debts, engagement, profiles, …) on every token rotation → egress spikes + jank.
      if (event === "TOKEN_REFRESHED") {
        logAuth(event, s);
        return;
      }
      logAuth(event, s);
      setSession((prev) => (sessionsAreEquivalent(prev, s) ? prev : s));
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (import.meta.env.DEV) {
        const key = `GET_SESSION:${s?.user?.id ?? "anon"}`;
        if (lastLogKey.current !== key) {
          lastLogKey.current = key;
          console.debug("[zeni-auth]", "GET_SESSION", { userId: s?.user?.id ?? null });
        }
      }
      setSession((prev) => (sessionsAreEquivalent(prev, s) ? prev : s));
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut,
    }),
    [session, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
