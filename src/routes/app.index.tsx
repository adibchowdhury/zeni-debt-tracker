import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
} from "@/lib/debt-math";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { LogPaymentDialog } from "@/components/debt/LogPaymentDialog";
import { ChallengeCard } from "@/components/debt/ChallengeCard";
import { CountdownHero } from "@/components/debt/CountdownHero";
import { InsightCard } from "@/components/debt/InsightCard";
import {
  MilestoneCelebration,
  getCelebrated,
  markCelebrated,
} from "@/components/debt/MilestoneCelebration";
import { buildInsights, useCountdown } from "@/lib/insights";
import { buildAchievementContext, type AchievementCtx } from "@/lib/achievements/context";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements/catalog";
import { readAchievementSignals, recordDashboardVisit } from "@/lib/achievements/signals";
import { Button } from "@/components/ui/button";

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

  if (store.loading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }
  if (debts.length === 0) {
    return <EmptyState greeting={greeting} />;
  }

  const motivational =
    countdown.pct < 5
      ? "You've started — that's the hardest part 💪"
      : countdown.pct < 33
        ? `You're ${countdown.pct.toFixed(0)}% closer to being debt-free 🎉`
        : countdown.pct < 66
          ? `You're ${countdown.pct.toFixed(0)}% closer to being debt-free 🎉`
          : countdown.pct < 95
            ? `${countdown.pct.toFixed(0)}% done — the finish line is in sight 🎯`
            : "You're almost there. Don't stop now!";

  const nearComplete = countdown.pct >= 80 && countdown.totalRemaining > 0;

  return (
    <div className="space-y-6">
      {celebration && CELEBRATABLE[celebration] && (
        <MilestoneCelebration
          milestoneKey={celebration}
          title={CELEBRATABLE[celebration].title}
          subtitle={CELEBRATABLE[celebration].subtitle}
          onClose={() => setCelebration(null)}
        />
      )}

      {/* 1. DEBT-FREE COUNTDOWN — hero of the dashboard */}
      <CountdownHero countdown={countdown} />

      {/* 2. FOCUS DEBT — avalanche/snowball target */}
      <FocusDebtSection
        debts={debts}
        payments={payments}
        strategy={strategy}
        extraMonthly={extraMonthly}
      />

      {/* 3. STREAK */}
      <StreakBanner streak={eng.weeklyStreak} active={eng.thisWeekHasExtra} />

      {/* 4. PRIMARY ACTION */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{greeting}</div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {motivational}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          You've paid off{" "}
          <span className="font-semibold text-foreground">{formatMoney(countdown.totalPaid)}</span>{" "}
          so far — keep going!
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="font-display font-semibold text-primary">
              {countdown.pct.toFixed(1)}%
            </span>
          </div>
          <ProgressBar value={countdown.pct} />
        </div>

        {nextMilestoneDollars != null && nextMilestoneDollars > 0 && (
          <p className="mt-5 text-center text-xs text-muted-foreground">
            You're {formatMoney(nextMilestoneDollars)} away from your next milestone.
          </p>
        )}

        <LogPaymentDialog>
          <Button type="button" variant="cta" className="mt-6 w-full gap-2">
            <Plus className="h-5 w-5" /> Log Payment
          </Button>
        </LogPaymentDialog>
      </section>

      {/* 5. YOUR NEXT MOVE */}
      <YourNextMoveSection eng={eng} totalRemaining={countdown.totalRemaining} />

      {/* 6. PERSONALIZED INSIGHTS */}
      {insights.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2">
          {insights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} subtle />
          ))}
        </section>
      )}

      {/* 7. WEEKLY CHALLENGE */}
      <ChallengeCard eng={eng} />

      {/* 8. KEY STATS */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Stat
          icon={Wallet}
          label="Still to go"
          value={formatMoney(countdown.totalRemaining)}
          tone="default"
        />
        <Stat
          icon={TrendingDown}
          label="Paid off"
          value={formatMoney(countdown.totalPaid)}
          tone="success"
        />
      </section>

      {/* 9. WHAT-IF SIMULATOR */}
      <Link
        to="/app/simulator"
        className="flex items-center gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-[#D1D5DB] sm:p-6"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_12px_rgba(255,106,0,0.22)]">
          <Zap className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="font-display text-base font-bold sm:text-lg">
            See how much faster you can be debt-free
          </div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            Add an extra $25/mo and watch your payoff date jump forward.
          </div>
        </div>
        <ArrowRight className="hidden h-5 w-5 text-primary sm:block" />
      </Link>

      {/* 10. WEEKLY STATS */}
      <section className="grid gap-3 sm:grid-cols-2">
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
            eng.beatLastWeek
              ? "Beat last week"
              : eng.weekPaid === 0
                ? "No payments yet"
                : undefined
          }
        />
      </section>

      {/* 11. LIFE AFTER DEBT — gentle, only when near finish line */}
      {nearComplete && <LifeAfterDebt pct={countdown.pct} />}

      <MobileStickyCTA />
    </div>
  );
}

const MAX_SIM_MONTHS = 12 * 80;

function FocusDebtSection({
  debts,
  payments,
  strategy,
  extraMonthly,
}: {
  debts: Debt[];
  payments: Payment[];
  strategy: Strategy;
  extraMonthly: number;
}) {
  const { ordered, sim } = useMemo(
    () => payoffRoadmapOrder(debts, strategy, extraMonthly),
    [debts, strategy, extraMonthly],
  );

  const focusDebt = ordered[0] ?? null;
  const nextDebt = ordered[1] ?? null;

  const description =
    strategy === "avalanche"
      ? "This is your highest-rate balance among what's left. Paying it down first saves the most interest, then roll that payment into the next debt."
      : "This is your smallest balance. Clearing it first builds momentum, then roll that payment into the next debt.";

  if (!focusDebt) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-center text-sm text-muted-foreground">
          No active focus — all your debts are at zero balance. Nice work.
        </p>
        <div className="mt-4 text-center">
          <Link to="/app/strategy" className="text-sm font-medium text-primary hover:underline">
            Plan settings
          </Link>
        </div>
      </section>
    );
  }

  const pct = debtPayoffPercent(focusDebt, payments);
  const monthsUntil = sim.perDebtMonths[focusDebt.id];
  const payoffOk =
    typeof monthsUntil === "number" &&
    Number.isFinite(monthsUntil) &&
    monthsUntil >= 1 &&
    sim.months < MAX_SIM_MONTHS;

  const payoffLabel = payoffOk ? formatDate(payoffDateAfterMonths(monthsUntil)) : "—";
  const monthsLeftLabel = payoffOk ? formatMonths(monthsUntil) : "—";

  return (
    <section>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6A00] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              <Flame className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Current target
            </div>
            <Link
              to="/app/strategy"
              className="shrink-0 pt-0.5 text-xs font-medium text-primary hover:underline"
            >
              Plan settings
            </Link>
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {focusDebt.name}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Balance
            </div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {formatMoney(focusDebt.balance)}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl border border-border/80 bg-muted/40 px-3 py-3 dark:bg-muted/25">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly
              </div>
              <div className="mt-1 font-display text-base font-bold tabular-nums sm:text-lg">
                {formatMoney(focusDebt.minPayment)}
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/40 px-3 py-3 dark:bg-muted/25">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                APR
              </div>
              <div className="mt-1 font-display text-base font-bold tabular-nums sm:text-lg">
                {focusDebt.interestRate}%
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/40 px-3 py-3 dark:bg-muted/25">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Payoff
              </div>
              <div className="mt-1 font-display text-base font-bold tabular-nums sm:text-lg">
                {payoffLabel}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{pct.toFixed(0)}% paid</span>
              <span className="tabular-nums">
                {monthsLeftLabel === "—" ? "—" : `${monthsLeftLabel} left`}
              </span>
            </div>
            <ProgressBar value={pct} />
          </div>
        </div>

        {nextDebt ? (
          <div className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:col-span-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Up next
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-foreground">{nextDebt.name}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{nextDebt.debtType}</p>
            <div className="mt-4 font-display text-2xl font-bold tabular-nums">
              {formatMoney(nextDebt.balance)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatMoney(nextDebt.minPayment)}/mo · {nextDebt.interestRate}% APR
            </p>
            <div className="mt-auto flex items-start gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <ArrowRight
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span>Starts after {focusDebt.name} is cleared</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center rounded-3xl border border-dashed border-border bg-muted/20 p-5 text-center sm:p-6 lg:col-span-1">
            <p className="text-sm font-medium text-foreground">Last debt on your plan</p>
            <p className="mt-1 text-xs text-muted-foreground">Once it’s gone, you’re debt-free.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function StreakBanner({ streak, active }: { streak: number; active: boolean }) {
  const hot = streak > 0;
  return (
    <div
      className={`flex items-center gap-4 rounded-3xl border-2 p-5 shadow-sm transition-all ${
        active
          ? "border-[#FF6A00]/35 bg-[#FFF7ED]"
          : hot
            ? "border-[#FF6A00]/25 bg-[#FFF7ED]/80"
            : "border-[#E5E7EB] bg-white"
      }`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm ${
          hot
            ? "bg-primary text-primary-foreground animate-pulse-glow"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Flame className="h-7 w-7" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {hot ? "Streak" : "Start a streak"}
        </div>
        <div className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          {streak === 0
            ? "Log a payment to start your streak"
            : active
              ? `${streak} week streak — you're on track this week`
              : `${streak} week streak — log a payment tomorrow to keep it alive`}
        </div>
      </div>
    </div>
  );
}

function YourNextMoveSection({
  eng,
  totalRemaining,
}: {
  eng: ReturnType<typeof useEngagement>;
  totalRemaining: number;
}) {
  if (totalRemaining <= 0) return null;

  const lines: string[] = [];
  if (!eng.thisWeekHasExtra) {
    lines.push(
      eng.weeklyStreak > 0
        ? "Log a payment this week to keep your streak alive."
        : "Log a payment this week to stay on track.",
    );
  }
  lines.push("Add an extra $25 to move your payoff date forward.");

  const display = lines.slice(0, 3);

  return (
    <section className="rounded-3xl border border-primary/30 bg-gradient-to-br from-[#FFF7ED] via-white to-white p-5 shadow-md ring-1 ring-primary/15 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Target className="h-5 w-5 shrink-0" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Your next move
          </h2>
          <ul className="mt-3 space-y-2.5">
            {display.map((text) => (
              <li
                key={text}
                className="flex gap-2.5 text-sm font-semibold leading-snug text-foreground sm:text-[15px]"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
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
      className={`rounded-xl border px-3 py-3 shadow-none transition-all ${
        highlight
          ? "border-success/35 bg-success-soft/30 ring-1 ring-success/20"
          : "border-border/60 bg-muted/15"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Trophy className={`h-3.5 w-3.5 ${highlight ? "text-success" : "text-muted-foreground"}`} />
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className="mt-0.5 font-display text-base font-bold tabular-nums text-foreground">{value}</div>
      {subtitle && (
        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
}

function LifeAfterDebt({ pct }: { pct: number }) {
  return (
    <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal text-teal-foreground">
          <Heart className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Life after debt
          </div>
          <div className="font-display text-base font-bold">
            You're {pct.toFixed(0)}% there — what's next?
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            When you're done, redirect those payments into a starter emergency fund. Aim for $1,000
            first, then 3 months of expenses.
          </p>
        </div>
      </div>
    </section>
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
    default: "bg-[#FFF7ED] text-[#FF6A00]",
    success: "bg-success-soft text-success",
    teal: "bg-accent text-teal-foreground",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-16 z-20 px-4 sm:hidden">
      <LogPaymentDialog>
        <Button type="button" variant="cta" className="w-full gap-2 text-sm">
          <Plus className="h-4 w-4" /> Log Payment
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
