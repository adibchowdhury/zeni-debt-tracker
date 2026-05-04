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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white md:flex">
        <div className="border-b border-[#E5E7EB] px-4 pb-4 pt-5">
          <Logo to="/app" size="md" />
          <p className="mt-2 text-xs font-medium leading-snug text-[#94A3B8]">Debt payoff coach</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Main">
          {DESKTOP_NAV.map((n) => {
            const active = isNavActive(location.pathname, n.to, n.exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  active
                    ? "border border-[#FF6A00]/30 bg-[#FFF7ED] text-[#EA580C] shadow-[0_8px_20px_rgba(255,106,0,0.10)]"
                    : "border border-transparent text-[#0F172A] hover:bg-[#FFF7ED] hover:text-[#EA580C]"
                }`}
              >
                <n.icon
                  className={`h-6 w-6 shrink-0 ${active ? "text-[#FF6A00]" : "text-[#475569]"}`}
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span className={active ? "text-[#EA580C]" : "text-[#0F172A]"}>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#E5E7EB] p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#475569] transition-all hover:bg-[#FFF7ED] hover:text-[#EA580C]"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3 md:hidden">
          <Logo to="/app" size="md" />
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#475569] transition-colors hover:bg-[#FFF7ED] hover:text-[#EA580C]"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Sign out
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E5E7EB] bg-white md:hidden"
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
                    active ? "bg-[#FFF7ED] text-[#EA580C]" : "text-[#475569]"
                  }`}
                >
                  <n.icon
                    className={`h-6 w-6 shrink-0 ${active ? "text-[#FF6A00]" : "text-[#475569]"}`}
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
  );
}
