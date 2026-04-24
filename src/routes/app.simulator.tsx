import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Calendar, TrendingDown, Clock } from "lucide-react";
import { useDebtStore } from "@/lib/storage";
import { simulatePayoff, formatMoney, formatMonths, formatDate } from "@/lib/debt-math";
import { minPaymentPayoffMonths } from "@/lib/insights";

export const Route = createFileRoute("/app/simulator")({
  component: Simulator,
});

function Simulator() {
  const store = useDebtStore();
  const { debts, strategy, extraMonthly } = store;
  const [extra, setExtra] = useState(extraMonthly);

  useEffect(() => {
    setExtra(extraMonthly);
  }, [extraMonthly]);

  const baseline = useMemo(() => simulatePayoff(debts, strategy, 0), [debts, strategy]);
  const withExtra = useMemo(
    () => simulatePayoff(debts, strategy, extra),
    [debts, strategy, extra]
  );

  const monthsSaved = Math.max(0, baseline.months - withExtra.months);
  const interestSaved = Math.max(0, baseline.totalInterest - withExtra.totalInterest);

  const save = () => {
    store.setExtraMonthly(extra);
  };

  if (debts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
        <p className="text-muted-foreground">Add a debt first to play with the simulator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">What if…</h1>
        <p className="text-sm text-muted-foreground">
          See how much faster you'd be free with a little extra each month.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Extra payment / month
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold tracking-tight text-primary sm:text-6xl">
            {formatMoney(extra)}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={1000}
          step={10}
          value={extra}
          onChange={(e) => setExtra(parseInt(e.target.value))}
          className="mt-6 w-full accent-primary"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span>$500</span>
          <span>$1,000</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[25, 50, 100, 200].map((v) => (
            <button
              key={v}
              onClick={() => setExtra(v)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              +${v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ImpactCard
          icon={Calendar}
          label="New debt-free date"
          value={formatDate(withExtra.payoffDate)}
          tone="primary"
        />
        <ImpactCard
          icon={Clock}
          label="Time saved"
          value={monthsSaved > 0 ? formatMonths(monthsSaved) : "—"}
          tone="teal"
        />
        <ImpactCard
          icon={TrendingDown}
          label="Interest saved"
          value={interestSaved > 0 ? formatMoney(interestSaved) : "—"}
          tone="success"
        />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="font-display text-base font-semibold">Side by side</div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <CompareCol
            title="Without extra"
            time={formatMonths(baseline.months)}
            interest={formatMoney(baseline.totalInterest)}
            muted
          />
          <CompareCol
            title={`With +${formatMoney(extra)}/mo`}
            time={formatMonths(withExtra.months)}
            interest={formatMoney(withExtra.totalInterest)}
          />
        </div>

        <button
          onClick={save}
          disabled={extra === extraMonthly}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Sparkles className="h-4 w-4" />
          {extra === extraMonthly ? "Saved" : "Save this plan"}
        </button>
      </div>
    </div>
  );
}

function ImpactCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "primary" | "teal" | "success";
}) {
  const toneClasses = {
    primary: "bg-primary-soft text-primary",
    teal: "bg-accent text-teal-foreground",
    success: "bg-success-soft text-success",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function CompareCol({
  title,
  time,
  interest,
  muted,
}: {
  title: string;
  time: string;
  interest: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        muted ? "border-border bg-secondary/40" : "border-success bg-success-soft/40"
      }`}
    >
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">Time</div>
      <div className="font-display text-lg font-bold">{time}</div>
      <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        Interest
      </div>
      <div className="font-display text-lg font-bold">{interest}</div>
    </div>
  );
}
