import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Plus, TrendingDown, Wallet, Sparkles, Flame, Trophy, Bell, Zap, Heart } from "lucide-react";
import { useDebtStore } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { useEngagement } from "@/lib/engagement";
import { formatMoney } from "@/lib/debt-math";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { LogPaymentDialog } from "@/components/debt/LogPaymentDialog";
import { ActivityFeed } from "@/components/debt/ActivityFeed";
import { ChallengeCard } from "@/components/debt/ChallengeCard";
import { CountdownHero } from "@/components/debt/CountdownHero";
import { InsightCard } from "@/components/debt/InsightCard";
import {
  MilestoneCelebration,
  getCelebrated,
  markCelebrated,
} from "@/components/debt/MilestoneCelebration";
import { buildInsights, useCountdown, bestWeekGap } from "@/lib/insights";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

const CELEBRATABLE: Record<string, { title: string; subtitle: string }> = {
  "first-payment": { title: "First payment logged 🎉", subtitle: "Momentum begins. You're on your way." },
  "10pct": { title: "10% paid off", subtitle: "Real progress is showing. Keep stacking." },
  "500-paid": { title: "$500 paid off", subtitle: "First big chunk down — huge win." },
  "1k-paid": { title: "$1,000 paid off 💪", subtitle: "Four-figure milestone. You're building real momentum." },
  halfway: { title: "Halfway there!", subtitle: "More behind you than ahead. Stay focused." },
  "first-clear": { title: "First debt cleared 🎊", subtitle: "One down — that feeling is freedom." },
  "all-clear": { title: "You're debt-free! 🏆", subtitle: "You actually did it. Truly." },
};

function Dashboard() {
  const store = useDebtStore();
  const { user } = useAuth();
  const eng = useEngagement();
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

  const displayName = (user?.user_metadata?.display_name as string | undefined) ?? user?.email?.split("@")[0];
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

      {/* 2. STREAK */}
      <StreakBanner streak={eng.weeklyStreak} active={eng.thisWeekHasExtra} />

      {/* 3. PRIMARY ACTION */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{greeting}</div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {motivational}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          You've paid off <span className="font-semibold text-foreground">{formatMoney(countdown.totalPaid)}</span> so far — keep going!
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="font-display font-semibold text-primary">{countdown.pct.toFixed(1)}%</span>
          </div>
          <ProgressBar value={countdown.pct} />
        </div>

        <LogPaymentDialog>
          <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:translate-y-0">
            <Plus className="h-5 w-5" /> Log Payment
          </button>
        </LogPaymentDialog>
      </section>

      {/* 4. SMARTER NUDGE */}
      <SmartNudge eng={eng} totalRemaining={countdown.totalRemaining} />

      {/* 5. PERSONALIZED INSIGHTS */}
      {insights.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2">
          {insights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </section>
      )}

      {/* 6. WEEKLY CHALLENGE */}
      <ChallengeCard eng={eng} />

      {/* 7. KEY STATS */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Stat icon={Wallet} label="Still to go" value={formatMoney(countdown.totalRemaining)} tone="default" />
        <Stat icon={TrendingDown} label="Paid off" value={formatMoney(countdown.totalPaid)} tone="success" />
      </section>

      {/* 8. WHAT-IF SIMULATOR */}
      <Link
        to="/app/simulator"
        className="flex items-center gap-4 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary-soft/60 to-card p-5 shadow-soft transition-transform hover:-translate-y-0.5 sm:p-6"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <Zap className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="font-display text-base font-bold sm:text-lg">See how much faster you can be debt-free</div>
          <div className="mt-0.5 text-sm text-muted-foreground">Add an extra $25/mo and watch your payoff date jump forward.</div>
        </div>
        <ArrowRight className="hidden h-5 w-5 text-primary sm:block" />
      </Link>

      {/* 9. PERSONAL BESTS */}
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
          subtitle={eng.beatLastWeek ? "Beat last week 🎉" : eng.weekPaid === 0 ? "No payments yet" : undefined}
        />
      </section>

      {/* 10. LIFE AFTER DEBT — gentle, only when near finish line */}
      {nearComplete && <LifeAfterDebt pct={countdown.pct} />}

      {/* 11. DEBTS */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Your debts</h2>
          <Link to="/app/debts" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
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

      {/* 12. ACTIVITY FEED */}
      <ActivityFeed activity={eng.activity} />

      <MobileStickyCTA />
    </div>
  );
}

function StreakBanner({ streak, active }: { streak: number; active: boolean }) {
  const hot = streak > 0;
  return (
    <div
      className={`flex items-center gap-4 rounded-3xl border-2 p-5 shadow-soft transition-all ${
        active
          ? "border-primary bg-primary-soft"
          : hot
          ? "border-primary/40 bg-primary-soft/60"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-soft ${
          hot ? "bg-primary text-primary-foreground animate-pulse-glow" : "bg-muted text-muted-foreground"
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
            ? `🔥 ${streak} week streak — keep it going!`
            : `🔥 ${streak} week streak — don't break it`}
        </div>
      </div>
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
      className={`rounded-2xl border p-4 shadow-soft transition-all ${
        highlight ? "border-success bg-success-soft/40 ring-2 ring-success/30" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2">
        <Trophy className={`h-4 w-4 ${highlight ? "text-success" : "text-muted-foreground"}`} />
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
      {subtitle && <div className="mt-0.5 text-xs font-medium text-success">{subtitle}</div>}
    </div>
  );
}

function SmartNudge({ eng, totalRemaining }: { eng: ReturnType<typeof useEngagement>; totalRemaining: number }) {
  let title = "";
  let body = "";
  let tone: "primary" | "success" = "primary";

  const bestGap = bestWeekGap(eng.weekPaid, eng.bestWeek?.amount ?? null);

  // Priority order: celebrations first, then risk, then opportunities.
  if (eng.newWeekBest && eng.weekPaid > 0) {
    title = "🎉 New personal best!";
    body = `You've paid ${formatMoney(eng.weekPaid)} this week. Big deal.`;
    tone = "success";
  } else if (bestGap !== null && bestGap > 0 && bestGap <= 50 && eng.weekPaid > 0) {
    // 1 payment away from beating personal best
    title = "You're so close to a new personal best";
    body = `Just ${formatMoney(bestGap)} more this week to beat your best ever.`;
  } else if (eng.beatLastWeek) {
    title = "👀 You beat last week";
    body = `${formatMoney(eng.weekPaid)} this week vs ${formatMoney(eng.prevWeekPaid)} last week. Keep it going.`;
    tone = "success";
  } else if (eng.weeklyStreak >= 2 && eng.weekPaid === 0 && totalRemaining > 0) {
    // Streak risk — supportive tone
    title = `Keep your ${eng.weeklyStreak}-week streak alive`;
    body = "Even a small payment this week keeps the momentum going.";
  } else if (eng.weekPaid === 0 && totalRemaining > 0) {
    title = "Next step: log a payment this week";
    body = "Even a small payment keeps your streak alive.";
  } else if (eng.prevWeekPaid > 0 && eng.weekPaid > 0 && eng.weekPaid < eng.prevWeekPaid) {
    const diff = eng.prevWeekPaid - eng.weekPaid;
    title = "You're close to last week's progress";
    body = `Just ${formatMoney(diff)} more to match last week.`;
  } else if (totalRemaining > 0) {
    title = "An extra $25 could move your payoff date forward";
    body = "Small, steady payments stack up faster than you think.";
  } else {
    return null;
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-soft ${
        tone === "success" ? "border-success/40 bg-success-soft/40" : "border-primary/30 bg-primary-soft/60"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          tone === "success" ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        <Bell className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Next step</div>
        <div className="font-display text-sm font-bold">{title}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function LifeAfterDebt({ pct }: { pct: number }) {
  return (
    <section className="rounded-3xl border border-teal/30 bg-gradient-to-br from-accent/40 to-card p-6 shadow-soft">
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
            When you're done, redirect those payments into a starter emergency fund. Aim for $1,000 first, then 3 months of expenses.
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
    default: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    teal: "bg-accent text-teal-foreground",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
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
        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow active:scale-[0.98] transition-transform">
          <Plus className="h-4 w-4" /> Log Payment
        </button>
      </LogPaymentDialog>
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
        Let's get started — add your first debt and we'll show you exactly when you'll be debt-free.
      </p>
      <Link
        to="/app/debts"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
      >
        <Plus className="h-4 w-4" /> Add your first debt
      </Link>
    </div>
  );
}
