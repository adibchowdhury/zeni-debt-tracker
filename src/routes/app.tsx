import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CreditCard,
  CalendarCheck,
  SlidersHorizontal,
  LogOut,
  Trophy,
  ReceiptText,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { MilestoneEarnedDialog } from "@/components/debt/MilestoneEarnedDialog";
import { useEngagement } from "@/lib/engagement";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const DESKTOP_NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/debts", label: "Debts", icon: CreditCard, exact: false },
  { to: "/app/transactions", label: "Transactions", icon: ReceiptText, exact: false },
  { to: "/app/strategy", label: "Plan", icon: CalendarCheck, exact: false },
  { to: "/app/simulator", label: "What If", icon: SlidersHorizontal, exact: false },
  { to: "/app/milestones", label: "Achievements", icon: Trophy, exact: false },
] as const;

/** Mobile bottom bar: max 5; What If is linked from Plan page */
const MOBILE_NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/debts", label: "Debts", icon: CreditCard, exact: false },
  { to: "/app/transactions", label: "Transactions", icon: ReceiptText, exact: false },
  { to: "/app/strategy", label: "Plan", icon: CalendarCheck, exact: false },
  { to: "/app/milestones", label: "Wins", icon: Trophy, exact: false },
] as const;

function isNavActive(pathname: string, to: string, exact: boolean): boolean {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEngagement();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && data && !data.onboarding_completed) {
        navigate({ to: "/onboarding" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user, navigate]);

  const logout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted px-4 sm:px-6 lg:px-12">
      <div className="mx-auto flex min-h-screen w-full max-w-[1320px] bg-background lg:border lg:border-border lg:shadow-sm">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-border md:flex">
          <div className="border-b border-border px-4 pb-4 pt-5">
            <Logo to="/app" size="md" />
            <p className="mt-2 text-xs font-medium leading-snug text-muted-foreground">
              Debt payoff coach
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Main">
            {DESKTOP_NAV.map((n) => {
              const active = isNavActive(location.pathname, n.to, n.exact);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all${
                    active
                      ? "border border-primary/30 bg-primary-soft text-primary shadow-[0_8px_20px_rgba(255,106,0,0.10)]"
                      : "border border-transparent text-foreground hover:bg-accent hover:text-primary"
                  }`}
                >
                  <n.icon
                    className={`h-6 w-6 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span className={active ? "text-primary" : "text-foreground"}>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-border px-3 pt-3">
            <Link
              to="/app/settings"
              className={`mb-3 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isNavActive(location.pathname, "/app/settings", false)
                  ? "border border-primary/25 bg-primary-soft text-primary"
                  : "border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Settings
                className={`h-5 w-5 shrink-0 ${
                  isNavActive(location.pathname, "/app/settings", false)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                strokeWidth={2.25}
                aria-hidden
              />
              <span>Settings</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-muted-foreground transition-all hover:bg-accent hover:text-primary"
            >
              <LogOut className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 md:hidden">
            <Logo to="/app" size="md" />
            <div className="flex shrink-0 items-center gap-1">
              <Link
                to="/app/settings"
                aria-label="Settings"
                className={`rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
                  isNavActive(location.pathname, "/app/settings", false) ? "text-primary" : ""
                }`}
              >
                <Settings className="h-5 w-5" strokeWidth={2.25} aria-hidden />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                Sign out
              </button>
            </div>
          </header>

          <main className="w-full flex-1 px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8 lg:px-10">
            <div className="mx-auto w-full max-w-6xl">
              <MilestoneEarnedDialog />
              <Outlet />
            </div>
          </main>

          {/* Mobile bottom nav */}
          <nav
            className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
            aria-label="Mobile main"
          >
            <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {MOBILE_NAV.map((n) => {
                const active = isNavActive(location.pathname, n.to, n.exact);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors ${
                      active ? "bg-primary-soft text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <n.icon
                      className={`h-6 w-6 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span className="truncate">{n.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
