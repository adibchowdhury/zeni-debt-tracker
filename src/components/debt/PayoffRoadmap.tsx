import { useMemo } from "react";
import { Check, Flame } from "lucide-react";
import type { Debt, Payment, Strategy } from "@/lib/storage";
import {
  debtPayoffPercent,
  formatDate,
  formatMoney,
  formatMonths,
  payoffDateAfterMonths,
  payoffRoadmapOrder,
} from "@/lib/debt-math";
import { ProgressBar } from "@/components/debt/ProgressBar";

const MAX_SIM_MONTHS = 12 * 80;

interface PayoffRoadmapProps {
  debts: Debt[];
  payments: Payment[];
  strategy: Strategy;
  extraMonthly: number;
}

export function PayoffRoadmap({
  debts,
  payments,
  strategy,
  extraMonthly,
}: PayoffRoadmapProps) {
  const { ordered, sim } = useMemo(
    () => payoffRoadmapOrder(debts, strategy, extraMonthly),
    [debts, strategy, extraMonthly],
  );

  const allPaid = debts.length > 0 && debts.every((d) => d.balance <= 0);

  const redirectMonthly = useMemo(
    () =>
      debts.filter((d) => d.balance > 0).reduce((s, d) => s + d.minPayment, 0) +
      extraMonthly,
    [debts, extraMonthly],
  );

  const title = strategy === "snowball" ? "Snowball roadmap" : "Avalanche roadmap";
  const subtitle =
    strategy === "snowball"
      ? "Sorted by payoff order — smallest balances first."
      : "Sorted by payoff order — highest interest rates first.";

  if (debts.length === 0) {
    return null;
  }

  if (ordered.length === 0 && !allPaid) {
    return null;
  }

  const simHitCap = sim.months >= MAX_SIM_MONTHS && debts.some((d) => d.balance > 0);

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {!allPaid && (
          <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-primary sm:text-right">
            {strategy === "snowball" ? "Smallest balance first" : "Highest APR first"}
          </p>
        )}
      </div>

      {simHitCap && (
        <p className="mb-6 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Payoff timeline could not be estimated for every debt — ensure minimum payments are above monthly
          interest so balances can shrink.
        </p>
      )}

      <div className="relative">
        {ordered.length > 0 && (
          <div
            className="absolute bottom-14 left-[17px] top-10 w-0.5 bg-border sm:left-[21px]"
            aria-hidden
          />
        )}

        <div className="space-y-4">
          {ordered.map((debt, index) => {
            const pct = debtPayoffPercent(debt, payments);
            const isFocus = index === 0;
            const monthsUntil = sim.perDebtMonths[debt.id];

            let payoffLine: string;
            let timeLine: string;

            if (typeof monthsUntil === "number" && Number.isFinite(monthsUntil)) {
              payoffLine = `Payoff: ${formatDate(payoffDateAfterMonths(monthsUntil))}`;
              timeLine = `${formatMonths(monthsUntil)} left`;
            } else {
              payoffLine = "Payoff: —";
              timeLine = "—";
            }

            return (
              <div key={debt.id} className="relative flex gap-4 sm:gap-5">
                <div className="relative z-[1] flex w-10 shrink-0 flex-col items-center pt-5 sm:w-11">
                  {isFocus ? (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow ring-4 ring-card">
                      <Flame className="h-5 w-5" aria-hidden />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary/40 bg-card font-display text-sm font-bold tabular-nums text-primary ring-4 ring-card">
                      {index + 1}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 rounded-2xl border border-border bg-secondary/35 p-4 shadow-soft sm:p-5 dark:bg-secondary/25">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="font-display text-base font-semibold sm:text-lg">
                        {debt.name}
                      </div>
                      <div className="text-xs text-muted-foreground sm:text-sm">
                        {debt.debtType} · {debt.interestRate}% APR · min{" "}
                        {formatMoney(debt.minPayment)}/mo
                      </div>
                      <div className="flex flex-col gap-1 pt-2 sm:flex-row sm:items-center sm:gap-6">
                        <div className="min-w-0 flex-1 space-y-1">
                          <ProgressBar value={pct} />
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-6 text-xs font-medium text-muted-foreground sm:justify-end sm:gap-8">
                          <span>{pct.toFixed(0)}% paid off</span>
                          <span className="tabular-nums sm:min-w-[6.5rem] sm:text-right">
                            {timeLine}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:w-52 sm:text-right">
                      <div className="font-display text-xl font-bold tabular-nums sm:text-2xl">
                        {formatMoney(debt.balance)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{payoffLine}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <DebtFreeMilestone redirectMonthly={redirectMonthly} allPaid={allPaid} />
        </div>
      </div>
    </section>
  );
}

function DebtFreeMilestone({
  redirectMonthly,
  allPaid,
}: {
  redirectMonthly: number;
  allPaid: boolean;
}) {
  return (
    <div className="relative flex gap-4 sm:gap-5">
      <div className="relative z-[1] flex w-10 shrink-0 flex-col items-center pt-5 sm:w-11">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success text-success-foreground shadow-soft ring-4 ring-card">
          <Check className="h-5 w-5 stroke-[3]" aria-hidden />
        </div>
      </div>

      <div className="min-w-0 flex-1 rounded-2xl border-2 border-success/55 bg-success-soft/50 p-4 shadow-soft dark:border-success/50 dark:bg-success/15 sm:p-5">
        <div className="font-display text-lg font-bold text-success sm:text-xl">Debt-free</div>
        {allPaid ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground dark:text-success-foreground/85">
            You’ve cleared everything on your plan. Aim your cash flow toward an emergency fund, retirement,
            or other goals.
          </p>
        ) : redirectMonthly > 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground dark:text-success-foreground/85">
            At that point, you could redirect <span className="font-semibold text-foreground">{formatMoney(redirectMonthly)}</span>
            /mo toward investments and savings.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground dark:text-success-foreground/85">
            When the last balance hits zero, you’ll free up the payments you’d been stacking toward debt.
          </p>
        )}
      </div>
    </div>
  );
}
