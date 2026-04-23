import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, ListPlus, Target, SlidersHorizontal, LogOut, Sparkles, Trophy } from "lucide-react";
import { useAppState } from "@/lib/storage";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const NAV = [
  { to: "/app", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/app/debts", label: "Debts", icon: ListPlus, exact: false },
  { to: "/app/strategy", label: "Plan", icon: Target, exact: false },
  { to: "/app/simulator", label: "What if", icon: SlidersHorizontal, exact: false },
  { to: "/app/milestones", label: "Wins", icon: Trophy, exact: false },
] as const;

function AppLayout() {
  const { state, update } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (state.user === null) {
      // Allow guest mode — auto create
      update((s) => (s.user ? s : { ...s, user: { email: "guest@local", name: "Guest" } }));
    }
  }, [state.user, update]);

  const logout = () => {
    update((s) => ({ ...s, user: null }));
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-24 sm:pb-10">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/app" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold tracking-tight">Debtfree</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((n) => {
              const active = n.exact
                ? location.pathname === n.to
                : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {NAV.map((n) => {
            const active = n.exact
              ? location.pathname === n.to
              : location.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <n.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
