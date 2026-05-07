import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Plus,
  TrendingDown,
  Wallet,
  Sparkles,
  Flame,
  Trophy,
  Zap,
  Heart,
  Target,
} from "lucide-react";
import { useDebtStore, type Debt, type Payment, type Strategy } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { useEngagement } from "@/lib/engagement";
import {
  debtPayoffPercent,
  formatDate,
  formatMoney,
  formatMonths,
  payoffDateAfterMonths,
  payoffRoadmapOrder,
  type PayoffResult,
} from "@/lib/debt-math";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { LogPaymentDialog } from "@/components/debt/LogPaymentDialog";
import { ChallengeCard } from "@/components/debt/ChallengeCard";
import { CountdownHero } from "@/components/debt/CountdownHero";
import { PaymentActivityStrip } from "@/components/debt/PaymentActivityStrip";
import { InsightCard } from "@/components/debt/InsightCard";
import {
  MilestoneCelebration,
  getCelebrated,
  markCelebrated,
} from "@/components/debt/MilestoneCelebration";
import { buildInsights, useCountdown, type Insight } from "@/lib/insights";
import { buildAchievementContext, type AchievementCtx } from "@/lib/achievements/context";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements/catalog";
import { readAchievementSignals, recordDashboardVisit } from "@/lib/achievements/signals";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function milestoneDollarGap(id: string, ctx: AchievementCtx): number | null {
  const paid = /^paid-(\d+)$/.exec(id);
  if (paid) return Number(paid[1]) - ctx.totalPaid;
  if (id === "500-paid") return 500 - ctx.totalPaid;
  if (id === "1k-paid") return 1000 - ctx.totalPaid;
  if (id === "10pct" && ctx.totalInitial > 0) return 0.1 * ctx.totalInitial - ctx.totalPaid;
  if (id === "halfway" && ctx.totalInitial > 0) return 0.5 * ctx.totalInitial - ctx.totalPaid;
  const pct = /^pct-(\d+)$/.exec(id);
  if (pct && ctx.totalInitial > 0) return (Number(pct[1]) / 100) * ctx.totalInitial - ctx.totalPaid;
  return null;
}

/** Next catalog milestone expressible as “$ more paid” (same order as achievements). */
function nextPaymentMilestoneGap(ctx: AchievementCtx): number | null {
  for (const a of ACHIEVEMENT_CATALOG) {
    if (a.check(ctx)) continue;
    const gap = milestoneDollarGap(a.id, ctx);
    if (gap !== null && gap > 0.5) return gap;
  }
  return null;
}

const CELEBRATABLE: Record<string, { title: string; subtitle: string }> = {
  "first-payment": {
    title: "First payment logged 🎉",
    subtitle: "Momentum begins. You're on your way.",
  },
  "10pct": { title: "10% paid off", subtitle: "Real progress is showing. Keep stacking." },
  "500-paid": { title: "$500 paid off", subtitle: "First big chunk down — huge win." },
  "1k-paid": {
    title: "$1,000 paid off 💪",
    subtitle: "Four-figure milestone. You're building real momentum.",
  },
  halfway: { title: "Halfway there!", subtitle: "More behind you than ahead. Stay focused." },
  "first-clear": {
    title: "First debt cleared 🎊",
    subtitle: "One down — that feeling is freedom.",
  },
  "all-clear": { title: "You're debt-free! 🏆", subtitle: "You actually did it. Truly." },
};

function Dashboard() {
  const store = useDebtStore();
  const { user } = useAuth();
  const eng = useEngagement();

  useEffect(() => {
    recordDashboardVisit();
  }, []);
  const { debts, payments, strategy, extraMonthly } = store;
  const countdown = useCountdown(debts, payments, strategy, extraMonthly);

  const insights = useMemo(
    () =>
      buildInsights({
        debts,
        payments,
        strategy,
        extraMonthly,
        weekPaid: eng.weekPaid,
        prevWeekPaid: eng.prevWeekPaid,
        countdown,
      }),
    [debts, payments, strategy, extraMonthly, eng.weekPaid, eng.prevWeekPaid, countdown],
  );

  const achievementCtx = useMemo(
    () =>
      buildAchievementContext(debts, payments, strategy, extraMonthly, readAchievementSignals(), {
        newWeekBest: eng.newWeekBest,
        newMonthBest: eng.newMonthBest,
        weeklyStreak: eng.weeklyStreak,
        weekPaid: eng.weekPaid,
        monthPaid: eng.monthPaid,
      }),
    [
      debts,
      payments,
      strategy,
      extraMonthly,
      eng.newWeekBest,
      eng.newMonthBest,
      eng.weeklyStreak,
      eng.weekPaid,
      eng.monthPaid,
    ],
  );

  const nextMilestoneDollars = useMemo(
    () => nextPaymentMilestoneGap(achievementCtx),
    [achievementCtx],
  );

  const { ordered, sim: roadmapSim } = useMemo(
    () => payoffRoadmapOrder(debts, strategy, extraMonthly),
    [debts, strategy, extraMonthly],
  );
  const focusDebt = ordered[0] ?? null;
  const nextDebt = ordered[1] ?? null;

  // Detect newly unlocked milestones (compare against localStorage celebrated set)
  const [celebration, setCelebration] = useState<string | null>(null);
  useEffect(() => {
    if (eng.unlockedMilestones.size === 0) return;
    const already = getCelebrated();
    for (const key of eng.unlockedMilestones) {
      if (!already.has(key) && CELEBRATABLE[key]) {
        markCelebrated(key);
        setCelebration(key);
        break;
      } else if (!already.has(key)) {
        // mark non-celebratable as seen so we don't churn
        markCelebrated(key);
      }
    }
  }, [eng.unlockedMilestones]);

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email?.split("@")[0];
  const greeting = displayName ? `Hey ${displayName.split(" ")[0]}` : "Welcome back";
  const firstName = displayName ? displayName.split(" ")[0] : undefined;

  if (store.loading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }
  if (debts.length === 0) {
    return <EmptyState greeting={greeting} />;
  }

  const nearComplete = countdown.pct >= 80 && countdown.totalRemaining > 0;

  return (
    <div className="relative pb-24 md:pb-10">
      {celebration && CELEBRATABLE[celebration] && (
        <MilestoneCelebration
          milestoneKey={celebration}
          title={CELEBRATABLE[celebration].title}
          subtitle={CELEBRATABLE[celebration].subtitle}
          onClose={() => setCelebration(null)}
        />
      )}

      <div className="w-full">
        <div className="space-y-8 lg:space-y-10">
          <CountdownHero
            countdown={countdown}
            firstName={firstName}
            nextMilestoneDollars={nextMilestoneDollars}
          />

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
            {focusDebt ? (
              <CurrentTargetCard
                focusDebt={focusDebt}
                payments={payments}
                strategy={strategy}
                sim={roadmapSim}
              />
            ) : (
              <div className="flex min-h-[10rem] flex-col justify-center rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-center">
                <p className="text-sm text-muted-foreground">All balances at zero.</p>
                <Link
                  to="/app/strategy"
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Plan settings
                </Link>
              </div>
            )}
            <NextDebtStreakCard
              focusDebt={focusDebt}
              nextDebt={nextDebt}
              streak={eng.weeklyStreak}
              active={eng.thisWeekHasExtra}
              className="ring-1 ring-[#FF6A00]/10 bg-[#FFFCFA] dark:bg-zinc-950/40 dark:ring-primary/15"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
            <NextStepCard eng={eng} totalRemaining={countdown.totalRemaining} />
            <PaymentActivityStrip
              payments={payments}
              className="ring-1 ring-primary/25 shadow-sm dark:ring-primary/30"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
            <SimulatorTeaser />
            <SnapshotInsightsCard
              countdown={countdown}
              eng={eng}
              insights={insights}
              className="bg-muted/20 dark:bg-muted/10"
            />
          </div>

          <div className="[&_section]:rounded-2xl [&_section]:border-border [&_section]:p-6 [&_section]:shadow-sm">
            <ChallengeCard eng={eng} />
          </div>

          {nearComplete && <LifeAfterDebt pct={countdown.pct} />}
        </div>
      </div>

      <DesktopLogPaymentFab />
      <MobileStickyCTA />
    </div>
  );
}

const MAX_SIM_MONTHS = 12 * 80;

function CurrentTargetCard({
  focusDebt,
  payments,
  strategy,
  sim,
}: {
  focusDebt: Debt;
  payments: Payment[];
  strategy: Strategy;
  sim: PayoffResult;
}) {
  const pct = debtPayoffPercent(focusDebt, payments);
  const monthsUntil = sim.perDebtMonths[focusDebt.id];
  const payoffOk =
    typeof monthsUntil === "number" &&
    Number.isFinite(monthsUntil) &&
    monthsUntil >= 1 &&
    sim.months < MAX_SIM_MONTHS;

  const payoffLabel = payoffOk ? formatDate(payoffDateAfterMonths(monthsUntil)) : "—";
  const monthsLeftLabel = payoffOk ? formatMonths(monthsUntil) : "—";
  const blurb =
    strategy === "avalanche"
      ? "Tackling highest APR first saves the most interest."
      : "Snowball: smallest balance first for quick wins.";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6A00] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          <Flame className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Target
        </span>
        <Link
          to="/app/strategy"
          className="shrink-0 text-xs font-medium text-primary hover:underline sm:text-sm"
        >
          Plan settings
        </Link>
      </div>
      <h3 className="mt-3 font-display text-xl font-bold leading-snug tracking-tight text-heading sm:text-2xl">
        {focusDebt.name}
      </h3>
      <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:text-sm">{blurb}</p>
      <div className="mt-4 font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
        {formatMoney(focusDebt.balance)}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border/80 bg-muted/25 px-2.5 py-2.5 dark:bg-muted/15">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Min
          </div>
          <div className="mt-0.5 font-display text-base font-bold tabular-nums">
            {formatMoney(focusDebt.minPayment)}
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-muted/25 px-2.5 py-2.5 dark:bg-muted/15">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            APR
          </div>
          <div className="mt-0.5 font-display text-base font-bold tabular-nums">
            {focusDebt.interestRate}%
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-muted/25 px-2.5 py-2.5 dark:bg-muted/15">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Payoff
          </div>
          <div className="mt-0.5 font-display text-xs font-bold tabular-nums leading-snug sm:text-sm">
            {payoffLabel}
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>{pct.toFixed(0)}% paid</span>
          <span className="tabular-nums">
            {monthsLeftLabel === "—" ? "—" : `${monthsLeftLabel} left`}
          </span>
        </div>
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}

function NextDebtStreakCard({
  focusDebt,
  nextDebt,
  streak,
  active,
  className,
}: {
  focusDebt: Debt | null;
  nextDebt: Debt | null;
  streak: number;
  active: boolean;
  className?: string;
}) {
  const hot = streak > 0;

  let body: ReactNode;
  if (!focusDebt) {
    body = (
      <p className="text-center text-sm text-muted-foreground">
        Next in line appears when you have an active balance.
      </p>
    );
  } else if (!nextDebt) {
    body = (
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Next
        </div>
        <p className="mt-2 font-display text-lg font-bold text-foreground">Last on your plan</p>
        <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
          Clear <span className="font-medium text-foreground">{focusDebt.name}</span> to finish.
        </p>
      </div>
    );
  } else {
    body = (
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Next debt
        </div>
        <h3 className="mt-2 font-display text-xl font-bold leading-snug tracking-tight text-heading sm:text-2xl">
          {nextDebt.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{nextDebt.debtType}</p>
        <div className="mt-3 font-display text-2xl font-bold tabular-nums sm:text-3xl">
          {formatMoney(nextDebt.balance)}
        </div>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {formatMoney(nextDebt.minPayment)}/mo · {nextDebt.interestRate}%
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
          After {focusDebt.name} is cleared.
        </p>
      </div>
    );
  }

  const streakTone = active
    ? "border-[#FF6A00]/35 bg-[#FFF7ED]/95 dark:bg-[#FFF7ED]/10"
    : hot
      ? "border-border bg-[#FFFCF9] dark:bg-muted/20"
      : "border-border bg-muted/15";

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex-1">{body}</div>
      <div className={cn("mt-5 rounded-xl border px-4 py-3", streakTone)}>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              hot
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Flame className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {hot ? "Streak" : "Momentum"}
            </div>
            <p className="mt-0.5 font-display text-sm font-bold leading-snug text-foreground sm:text-base">
              {streak === 0
                ? "Log a payment this week to start one."
                : active
                  ? `${streak} wk on track.`
                  : `${streak} wk — pay this week to keep it.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NextStepCard({
  eng,
  totalRemaining,
}: {
  eng: ReturnType<typeof useEngagement>;
  totalRemaining: number;
}) {
  if (totalRemaining <= 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Next step
        </div>
        <p className="mt-2 font-display text-lg font-bold text-foreground">
          You&apos;re debt-free here.
        </p>
      </div>
    );
  }

  const main = !eng.thisWeekHasExtra
    ? eng.weeklyStreak > 0
      ? "Log a payment this week to keep your streak."
      : "Log a payment this week to stay on your plan."
    : "Extra toward your target pulls your payoff date closer.";

  const support = eng.thisWeekHasExtra
    ? undefined
    : "When you can, +$25 toward the target still counts.";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Target className="h-4 w-4 shrink-0" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Next step
          </div>
          <p className="mt-1 font-display text-base font-bold leading-snug text-foreground sm:text-[17px]">
            {main}
          </p>
          {support ? (
            <p className="mt-2 text-xs leading-snug text-muted-foreground sm:text-sm">{support}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SnapshotInsightsCard({
  countdown,
  eng,
  insights,
  className,
}: {
  countdown: ReturnType<typeof useCountdown>;
  eng: ReturnType<typeof useEngagement>;
  insights: Insight[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5",
        className,
      )}
    >
      <h3 className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
        Snapshot
      </h3>
      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div className="flex gap-4 rounded-xl border border-border/80 bg-muted/15 p-4 dark:bg-muted/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#FF6A00] dark:bg-muted/60 dark:text-orange-400">
            <Wallet className="h-[1.0625rem] w-[1.0625rem]" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/75">
              To go
            </div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-[1.75rem]">
              {formatMoney(countdown.totalRemaining)}
            </div>
          </div>
        </div>
        <div className="flex gap-4 rounded-xl border border-border/80 bg-muted/15 p-4 dark:bg-muted/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-soft/55 text-success">
            <TrendingDown className="h-[1.0625rem] w-[1.0625rem]" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/75">
              Paid off
            </div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-[1.75rem]">
              {formatMoney(countdown.totalPaid)}
            </div>
          </div>
        </div>
        <BestChip
          label="Best week"
          value={eng.bestWeek ? formatMoney(eng.bestWeek.amount) : "—"}
          highlight={eng.newWeekBest}
        />
        <BestChip
          label="This week"
          value={formatMoney(eng.weekPaid)}
          highlight={eng.beatLastWeek || eng.newWeekBest}
          subtitle={
            eng.beatLastWeek ? "Beat last week" : eng.weekPaid === 0 ? "No payments yet" : undefined
          }
        />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        {insights.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Insights will show up as your payment pattern grows.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/75">
              Insights
            </div>
            {insights.slice(0, 2).map((ins) => (
              <InsightCard key={ins.id} insight={ins} subtle />
            ))}
            {insights.length > 2 && (
              <p className="text-[11px] text-muted-foreground">+{insights.length - 2} more</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SimulatorTeaser() {
  return (
    <Link
      to="/app/simulator"
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:bg-[#FFF7ED]/45 hover:shadow-md active:translate-y-0 dark:hover:bg-muted/35"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Zap className="h-[1.0625rem] w-[1.0625rem]" />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden py-0.5">
        <h3 className="font-display text-sm font-bold leading-tight tracking-tight text-heading">
          Faster payoff explorer
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground">
          See how extras move your payoff date.
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-0.5 pr-0.5 text-[11px] font-semibold text-primary transition-[gap] duration-200 ease-out group-hover:gap-1">
        Open
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
  );
}

function BestChip({
  label,
  value,
  highlight,
  subtitle,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 shadow-none transition-all ${
        highlight
          ? "border-success/35 bg-success-soft/30 ring-1 ring-success/20"
          : "border-border/60 bg-muted/15"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Trophy className={`h-3 w-3 ${highlight ? "text-success" : "text-muted-foreground/70"}`} />
        <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </div>
      </div>
      <div className="mt-1 font-display text-lg font-bold tabular-nums text-foreground">
        {value}
      </div>
      {subtitle && (
        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
}

function LifeAfterDebt({ pct }: { pct: number }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal text-teal-foreground">
          <Heart className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-teal">
            Life after debt
          </div>
          <div className="mt-0.5 font-display text-lg font-bold">
            You're {pct.toFixed(0)}% there — what's next?
          </div>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            When you&apos;re done, roll those dollars into a starter emergency fund (~$1k), then
            grow it.
          </p>
        </div>
      </div>
    </section>
  );
}

function DesktopLogPaymentFab() {
  return (
    <LogPaymentDialog>
      <Button
        type="button"
        variant="outline"
        className="fixed bottom-24 right-4 z-40 hidden h-[52px] gap-2.5 rounded-full border-primary/35 bg-card/95 px-6 text-[0.9375rem] font-semibold shadow-[0_8px_32px_-6px_rgb(15_23_42/0.12),0_4px_14px_-4px_rgb(255_106_0/0.14)] backdrop-blur-sm transition-colors hover:bg-[#FFF7ED]/95 hover:shadow-[0_12px_40px_-8px_rgb(15_23_42/0.16),0_6px_20px_-6px_rgb(255_106_0/0.18)] sm:inline-flex md:bottom-8 md:right-6"
        aria-label="Log payment"
      >
        <Plus className="h-5 w-5 shrink-0" />
        Log payment
      </Button>
    </LogPaymentDialog>
  );
}

function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-16 z-20 px-4 sm:hidden">
      <LogPaymentDialog>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-primary/40 text-sm text-foreground shadow-md backdrop-blur-sm"
        >
          <Plus className="h-4 w-4" /> Log payment
        </Button>
      </LogPaymentDialog>
    </div>
  );
}

function EmptyState({ greeting }: { greeting: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#FF6A00]">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {greeting} 👋
      </h1>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        Let's get started — add your first debt and we'll show you exactly when you'll be debt-free.
      </p>
      <Button asChild variant="default" className="mt-6 gap-2">
        <Link to="/app/debts">
          <Plus className="h-4 w-4" /> Add your first debt
        </Link>
      </Button>
    </div>
  );
}
