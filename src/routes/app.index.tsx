import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Plus, TrendingDown, Calendar, Wallet, Sparkles } from "lucide-react";
import { useAppState } from "@/lib/storage";
import { simulatePayoff, formatMoney, formatDate } from "@/lib/debt-math";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { LogPaymentDialog } from "@/components/debt/LogPaymentDialog";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { state } = useAppState();
  const { debts, payments, strategy, extraMonthly } = state;

  const stats = useMemo(() => {
    const totalRemaining = debts.reduce((s, d) => s + d.balance, 0);
    const totalInitial = debts.reduce((s, d) => s + d.initialBalance, 0);
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const pct = totalInitial > 0 ? Math.min(100, (totalPaid / totalInitial) * 100) : 0;
    const sim = simulatePayoff(debts, strategy, extraMonthly);
    return { totalRemaining, totalInitial, totalPaid, pct, sim };
  }, [debts, payments, strategy, extraMonthly]);

  const greeting = state.user?.name ? `Hey ${state.user.name.split(" ")[0]}` : "Welcome back";

  if (debts.length === 0) {
    return <EmptyState greeting={greeting} />;
  }

  const motivational =
    stats.pct < 5
      ? "You've started — that's the hardest part. 💪"
      : stats.pct < 33
      ? "You're building real momentum."
      : stats.pct < 66
      ? `You're ${Math.round(stats.pct)}% closer to debt-free.`
      : stats.pct < 95
      ? "The finish line is in sight 🎯"
      : "You're almost there. Don't stop now!";

  return (
    <div className="space-y-6">
      {/* Hero progress */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{greeting}</div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {motivational}
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={Wallet}
            label="Remaining"
            value={formatMoney(stats.totalRemaining)}
            tone="default"
          />
          <Stat
            icon={TrendingDown}
            label="Paid off"
            value={formatMoney(stats.totalPaid)}
            tone="success"
          />
          <Stat
            icon={Calendar}
            label="Debt-free by"
            value={formatDate(stats.sim.payoffDate)}
            tone="teal"
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="font-display font-semibold text-success">
              {stats.pct.toFixed(1)}%
            </span>
          </div>
          <ProgressBar value={stats.pct} />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <LogPaymentDialog>
            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform">
              <Plus className="h-4 w-4" /> Log a payment
            </button>
          </LogPaymentDialog>
          <Link
            to="/app/simulator"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            <Sparkles className="h-4 w-4" /> Try What-if
          </Link>
        </div>
      </section>

      {/* Debt list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Your debts</h2>
          <Link
            to="/app/debts"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {debts.map((d) => {
            const paid = d.initialBalance - d.balance;
            const pct = d.initialBalance > 0 ? Math.min(100, (paid / d.initialBalance) * 100) : 0;
            return (
              <div key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-display text-base font-semibold">{d.name}</div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold">{formatMoney(d.balance)}</div>
                    <div className="text-xs text-muted-foreground">{d.interestRate}% APR</div>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={pct} />
                  <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>{formatMoney(paid)} paid</span>
                    <span>{pct.toFixed(0)}% done</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "default" | "success" | "teal";
}) {
  const toneClasses = {
    default: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    teal: "bg-accent text-teal-foreground",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function EmptyState({ greeting }: { greeting: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {greeting} 👋
      </h1>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        Add your first debt to see your payoff date, build a plan, and start crushing it.
      </p>
      <Link
        to="/app/debts"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
      >
        <Plus className="h-4 w-4" /> Add your first debt
      </Link>
    </div>
  );
}
