import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { recordStrategyPlanView } from "@/lib/achievements/signals";
import { Snowflake, Mountain, Check } from "lucide-react";
import { useDebtStore, type Strategy } from "@/lib/storage";
import { simulatePayoff, formatMoney, formatMonths } from "@/lib/debt-math";
import { PayoffRoadmap } from "@/components/debt/PayoffRoadmap";

export const Route = createFileRoute("/app/strategy")({
  component: StrategyPage,
});

function StrategyPage() {
  const store = useDebtStore();
  const { debts, payments, strategy, extraMonthly } = store;

  useEffect(() => {
    if (debts.length > 0) recordStrategyPlanView();
  }, [debts.length]);

  const compare = useMemo(() => {
    const snow = simulatePayoff(debts, "snowball", extraMonthly);
    const ava = simulatePayoff(debts, "avalanche", extraMonthly);
    return { snow, ava };
  }, [debts, extraMonthly]);

  const recommended: Strategy =
    compare.ava.totalInterest <= compare.snow.totalInterest ? "avalanche" : "snowball";

  const choose = (s: Strategy) => {
    store.setStrategy(s);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Your payoff plan
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick a strategy. Both work — pick what feels right.{" "}
          <Link
            to="/app/simulator"
            className="font-semibold text-[#FF6A00] underline-offset-2 hover:text-[#EA580C] hover:underline"
          >
            What-if simulator
          </Link>
        </p>
      </div>

      {debts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-muted-foreground">Add a debt first to see your plan.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StrategyCard
              id="avalanche"
              title="Avalanche"
              tagline="Math-optimal. Save more interest."
              icon={Mountain}
              description="Pay off the highest interest rate first. Saves the most money over time."
              result={compare.ava}
              selected={strategy === "avalanche"}
              recommended={recommended === "avalanche"}
              onSelect={() => choose("avalanche")}
            />
            <StrategyCard
              id="snowball"
              title="Snowball"
              tagline="Quick wins. Big motivation."
              icon={Snowflake}
              description="Pay off the smallest balance first. Builds momentum fast."
              result={compare.snow}
              selected={strategy === "snowball"}
              recommended={recommended === "snowball"}
              onSelect={() => choose("snowball")}
            />
          </div>

          <PayoffRoadmap
            debts={debts}
            payments={payments}
            strategy={strategy}
            extraMonthly={extraMonthly}
          />
        </>
      )}
    </div>
  );
}

function StrategyCard({
  title,
  tagline,
  icon: Icon,
  description,
  result,
  selected,
  recommended,
  onSelect,
}: {
  id: Strategy;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  result: ReturnType<typeof simulatePayoff>;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`relative rounded-3xl border bg-card p-6 shadow-sm transition-all ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      {recommended && (
        <div className="absolute -top-2.5 left-6 rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success-foreground">
          Recommended
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <p className="text-xs text-muted-foreground">{tagline}</p>
        </div>
        {selected && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{description}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-secondary/50 p-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Time</div>
          <div className="font-display text-base font-bold">{formatMonths(result.months)}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Interest</div>
          <div className="font-display text-base font-bold">
            {formatMoney(result.totalInterest)}
          </div>
        </div>
      </div>

      <button
        onClick={onSelect}
        disabled={selected}
        className={`mt-5 w-full rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
          selected
            ? "bg-secondary text-muted-foreground"
            : "bg-foreground text-background hover:-translate-y-0.5"
        }`}
      >
        {selected ? "Selected" : `Use ${title}`}
      </button>
    </div>
  );
}
