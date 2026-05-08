import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Plus,
  TrendingDown,
  Wallet,
  Sparkles,
  Calendar,
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
import {
  shouldShowReentryState,
  getNextMeaningfulStep,
  getConsistencySummary,
  loadWeeklyFeeling,
  saveWeeklyFeeling,
  getSupportiveCheckInResponse,
  currentWeekStartIso,
  type WeeklyFeeling,
} from "@/lib/reengagement";

// TODO(analytics): `app_reopen_30d_after_7d_absence` when user returns after long gap
// TODO(analytics): `reentry_flow_interaction` (log_payment / plan / what_if / reset_week)
// TODO(analytics): `user_returned_after_missed_payment_window` (needs product definition + backend)

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
    subtitle: "That single step matters — it keeps the door open.",
  },
  "10pct": { title: "10% paid off", subtitle: "That's real movement, not a small thing." },
  "500-paid": { title: "$500 paid off", subtitle: "Meaningful distance from where you started." },
  "1k-paid": {
    title: "$1,000 paid off 💪",
    subtitle: "Proof you can keep going, at your pace.",
  },
  halfway: { title: "Halfway there", subtitle: "More path behind you than ahead — breathe." },
  "first-clear": {
    title: "First debt cleared 🎊",
    subtitle: "One full finish line — let that land.",
  },
  "all-clear": { title: "You're debt-free! 🏆", subtitle: "You did the hard thing. That's real." },
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

  const showReentry = useMemo(
    () => shouldShowReentryState(payments, undefined),
    [payments],
  );

  const nextStepCopy = useMemo(
    () =>
      getNextMeaningfulStep({
        debts,
        payments,
        strategy,
        extraMonthly,
        focusDebt,
        nextMilestoneGap: nextMilestoneDollars,
        eng: { weekPaid: eng.weekPaid, monthPaid: eng.monthPaid },
        totalRemaining: countdown.totalRemaining,
      }),
    [
      debts,
      payments,
      strategy,
      extraMonthly,
      focusDebt,
      nextMilestoneDollars,
      eng.weekPaid,
      eng.monthPaid,
      countdown.totalRemaining,
    ],
  );

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

          <WhatIfHopeCard />
          {showReentry ? (
            <WelcomeBackBanner totalPaid={countdown.totalPaid} />
          ) : null}

          <WeeklyDebtCheckIn />

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
            <RhythmAndNextCard
              focusDebt={focusDebt}
              nextDebt={nextDebt}
              payments={payments}
              className="ring-1 ring-border/80 bg-card"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
            <NextStepCard copy={nextStepCopy} totalRemaining={countdown.totalRemaining} />
            <PaymentActivityStrip
              payments={payments}
              className="ring-1 ring-primary/20 shadow-sm"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
            <CollectiveCalmCard />
            <SnapshotInsightsCard
              countdown={countdown}
              eng={eng}
              insights={insights}
              className="bg-muted/15"
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          <Target className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Current focus
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
        <div className="rounded-xl border border-border/80 bg-muted/25 px-2.5 py-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Min
          </div>
          <div className="mt-0.5 font-display text-base font-bold tabular-nums">
            {formatMoney(focusDebt.minPayment)}
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-muted/25 px-2.5 py-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            APR
          </div>
          <div className="mt-0.5 font-display text-base font-bold tabular-nums">
            {focusDebt.interestRate}%
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-muted/25 px-2.5 py-2.5">
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

function RhythmAndNextCard({
  focusDebt,
  nextDebt,
  payments,
  className,
}: {
  focusDebt: Debt | null;
  nextDebt: Debt | null;
  payments: Payment[];
  className?: string;
}) {
  const rhythm = useMemo(() => getConsistencySummary(payments), [payments]);

  let body: ReactNode;
  if (!focusDebt) {
    body = (
      <p className="text-center text-sm text-muted-foreground">
        Your roadmap appears here when you have an active balance.
      </p>
    );
  } else if (!nextDebt) {
    body = (
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          After this one
        </div>
        <p className="mt-2 font-display text-lg font-bold text-foreground">Last on your plan</p>
        <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
          When <span className="font-medium text-foreground">{focusDebt.name}</span> is fully paid,
          you&apos;ll be at the finish line.
        </p>
      </div>
    );
  } else {
    body = (
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Next in your plan
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
          Comes after {focusDebt.name}.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex-1">{body}</div>
      <div className="mt-5 rounded-xl border border-border/80 bg-muted/20 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Your rhythm
            </div>
            <p className="mt-0.5 font-display text-sm font-bold leading-snug text-foreground sm:text-base">
              {rhythm.headline}
            </p>
            {rhythm.subline ? (
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{rhythm.subline}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function NextStepCard({
  copy,
  totalRemaining,
}: {
  copy: ReturnType<typeof getNextMeaningfulStep>;
  totalRemaining: number;
}) {
  if (totalRemaining <= 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Next step
        </div>
        <p className="mt-2 font-display text-lg font-bold text-foreground">
          You&apos;re debt-free here in Zeni.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/90 text-primary-foreground shadow-sm">
          <Target className="h-4 w-4 shrink-0" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.title}
          </div>
          <p className="mt-1 font-display text-base font-bold leading-snug text-foreground sm:text-[17px]">
            {copy.body}
          </p>
          {copy.support ? (
            <p className="mt-2 text-xs leading-snug text-muted-foreground sm:text-sm">
              {copy.support}
            </p>
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
        Money snapshot
      </h3>
      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div className="flex gap-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#FF6A00]">
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
        <div className="flex gap-4 rounded-xl border border-border/80 bg-muted/15 p-4">
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
          label="Strongest week so far"
          value={eng.bestWeek ? formatMoney(eng.bestWeek.amount) : "—"}
          highlight={eng.newWeekBest}
        />
        <BestChip
          label="This week"
          value={formatMoney(eng.weekPaid)}
          highlight={eng.beatLastWeek || eng.newWeekBest}
          subtitle={
            eng.beatLastWeek
              ? "A bit more than last week"
              : eng.weekPaid === 0
                ? "Quiet so far — that's okay"
                : undefined
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

function WhatIfHopeCard() {
  return (
    <Link
      to="/app/simulator"
      onClick={() => {
        // TODO(analytics): `what_if_opened_from_dashboard`
      }}
      className="group flex flex-col gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-[#FFF9F4] via-card to-card p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md active:translate-y-0 sm:flex-row sm:items-center"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Zap className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-heading">
          Explore a more hopeful path
        </h3>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">
          See how one small extra payment changes your timeline — try adding about $25/month and
          notice what shifts.
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-primary transition-[gap] duration-200 ease-out group-hover:gap-2 sm:self-center">
        Open What If
        <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}

function WelcomeBackBanner({ totalPaid }: { totalPaid: number }) {
  const [resetStarted, setResetStarted] = useState(false);

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-[#FFF9F4] to-muted/30 p-6 shadow-sm">
      <p className="font-display text-xl font-bold text-heading sm:text-2xl">Welcome back.</p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Life happens. You&apos;ve already paid {formatMoney(totalPaid)} down — that progress still
        counts. You don&apos;t have to fix everything right now.
      </p>
      <p className="mt-3 text-sm font-medium text-foreground">
        Let&apos;s take one small step today — no shame, no scoreboard.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <LogPaymentDialog>
          <Button type="button" className="gap-2" variant="default">
            <Plus className="h-4 w-4" />
            Log a payment
          </Button>
        </LogPaymentDialog>
        <Button type="button" variant="outline" asChild className="gap-2">
          <Link
            to="/app/strategy"
            onClick={() => {
              // TODO(analytics): reentry_flow_interaction — adjust_plan
            }}
          >
            Adjust this month&apos;s plan
          </Link>
        </Button>
        <Button type="button" variant="outline" asChild className="gap-2 border-primary/30">
          <Link
            to="/app/simulator"
            onClick={() => {
              // TODO(analytics): reentry_flow_interaction — what_if
            }}
          >
            Open What If
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => {
            setResetStarted(true);
            // TODO(analytics): `reset_week_started`
          }}
        >
          {resetStarted ? "This week is a soft start — no pressure" : "Start a reset week"}
        </Button>
      </div>
    </section>
  );
}

const FEELINGS: { id: WeeklyFeeling; label: string }[] = [
  { id: "hopeful", label: "Hopeful" },
  { id: "stressed", label: "Stressed" },
  { id: "overwhelmed", label: "Overwhelmed" },
  { id: "motivated", label: "Motivated" },
  { id: "discouraged", label: "Discouraged" },
];

function WeeklyDebtCheckIn() {
  const week = currentWeekStartIso();
  const [picked, setPicked] = useState<WeeklyFeeling | null>(() => {
    const saved = loadWeeklyFeeling();
    if (!saved || saved.week !== week) return null;
    return saved.feeling;
  });

  const onPick = (f: WeeklyFeeling) => {
    saveWeeklyFeeling(f);
    setPicked(f);
    // TODO(analytics): `weekly_checkin_selected` with feeling
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="font-display text-base font-semibold text-foreground">
        How has your debt journey felt this week?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Optional — helps us keep the tone human.{" "}
        <span className="opacity-80">(Saved on this device for now.)</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {FEELINGS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              picked === id
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-muted/30 text-foreground hover:border-primary/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {picked ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {getSupportiveCheckInResponse(picked)}
        </p>
      ) : null}
    </section>
  );
}

function CollectiveCalmCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          You&apos;re not doing this alone
        </div>
        <p className="mt-2 font-display text-base font-bold leading-snug text-foreground">
          Progress is personal.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          People move at different paces — there&apos;s no leaderboard for healing your finances.
        </p>
      </div>
      <Link
        to="/app/milestones"
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        See progress you&apos;ve already earned
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
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
        <Sparkles className={`h-3 w-3 ${highlight ? "text-success" : "text-muted-foreground/70"}`} />
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
