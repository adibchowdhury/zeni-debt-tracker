import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useDebtStore, type Payment } from "@/lib/storage";
import { startOfWeek, startOfMonth, isoDate } from "@/lib/week";

export interface PersonalBest {
  period: "week" | "month";
  amount: number;
  periodStart: string;
}

export interface WeeklyChallenge {
  id: string;
  weekStart: string;
  kind: "extra_payment" | "log_one";
  goalAmount: number;
  status: "active" | "completed" | "skipped";
  progress: number;
}

export interface ActivityItem {
  id: string;
  kind: string;
  amount: number | null;
  createdAt: string;
}

export interface Engagement {
  loading: boolean;
  weeklyStreak: number;
  thisWeekHasExtra: boolean;
  weekPaid: number;
  prevWeekPaid: number;
  monthPaid: number;
  bestWeek: PersonalBest | null;
  bestMonth: PersonalBest | null;
  beatLastWeek: boolean;
  newWeekBest: boolean;
  newMonthBest: boolean;
  challenge: WeeklyChallenge | null;
  unlockedMilestones: Set<string>;
  activity: ActivityItem[];
  acceptChallenge: (kind: WeeklyChallenge["kind"], goal: number) => Promise<void>;
  skipChallenge: () => Promise<void>;
}

const MILESTONE_DEFS = [
  { key: "first-debt", check: (s: { debts: number }) => s.debts >= 1 },
  { key: "first-payment", check: (s: { payments: number }) => s.payments >= 1 },
  { key: "10pct", check: (s: { pctPaid: number }) => s.pctPaid >= 10 },
  { key: "500-paid", check: (s: { totalPaid: number }) => s.totalPaid >= 500 },
  { key: "1k-paid", check: (s: { totalPaid: number }) => s.totalPaid >= 1000 },
  { key: "halfway", check: (s: { pctPaid: number }) => s.pctPaid >= 50 },
  { key: "first-clear", check: (s: { debtsCleared: number }) => s.debtsCleared >= 1 },
  { key: "all-clear", check: (s: { allClear: boolean }) => s.allClear },
];

export function useEngagement(): Engagement {
  const { user } = useAuth();
  const store = useDebtStore();
  const [loading, setLoading] = useState(true);
  const [bestWeek, setBestWeek] = useState<PersonalBest | null>(null);
  const [bestMonth, setBestMonth] = useState<PersonalBest | null>(null);
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  // Compute payment stats
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let weekPaid = 0;
    let prevWeekPaid = 0;
    let monthPaid = 0;
    const weeklyTotals: Record<string, number> = {};

    for (const p of store.payments) {
      const d = new Date(p.date);
      if (d >= weekStart) weekPaid += p.amount;
      else if (d >= lastWeekStart) prevWeekPaid += p.amount;
      if (d >= monthStart) monthPaid += p.amount;

      const ws = isoDate(startOfWeek(d));
      weeklyTotals[ws] = (weeklyTotals[ws] || 0) + p.amount;
    }

    // Compute streak: count consecutive weeks (going back from this week or last week)
    // where user made any "extra" payment. Define "extra" as any payment beyond a small floor.
    const minPaymentsSum = store.debts.reduce((s, d) => s + d.minPayment, 0);
    const weekThreshold = Math.max(1, minPaymentsSum / 4); // rough weekly min equivalent
    let streak = 0;
    const cursor = new Date(weekStart);
    // If this week not contributed yet, allow last week to count
    if ((weeklyTotals[isoDate(weekStart)] ?? 0) < weekThreshold) {
      cursor.setDate(cursor.getDate() - 7);
    }
    while (true) {
      const total = weeklyTotals[isoDate(cursor)] ?? 0;
      if (total >= weekThreshold) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 7);
      } else {
        break;
      }
    }

    const thisWeekHasExtra = (weeklyTotals[isoDate(weekStart)] ?? 0) >= weekThreshold;

    return {
      weekStart,
      monthStart,
      weekPaid,
      prevWeekPaid,
      monthPaid,
      streak,
      thisWeekHasExtra,
      weeklyTotals,
    };
  }, [store.payments, store.debts]);

  // Load engagement data
  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const [bestsRes, challengesRes, milestonesRes, activityRes] = await Promise.all([
      supabase.from("personal_bests").select("*").eq("user_id", user.id),
      supabase.from("challenges").select("*").eq("user_id", user.id).order("week_start", { ascending: false }).limit(1),
      supabase.from("milestones").select("milestone_key").eq("user_id", user.id),
      supabase.from("activity_feed").select("*").order("created_at", { ascending: false }).limit(8),
    ]);

    const bests = bestsRes.data ?? [];
    const week = bests.filter((b) => b.period === "week").sort((a, b) => Number(b.total_amount) - Number(a.total_amount))[0];
    const month = bests.filter((b) => b.period === "month").sort((a, b) => Number(b.total_amount) - Number(a.total_amount))[0];
    setBestWeek(week ? { period: "week", amount: Number(week.total_amount), periodStart: week.period_start } : null);
    setBestMonth(month ? { period: "month", amount: Number(month.total_amount), periodStart: month.period_start } : null);

    const c = challengesRes.data?.[0];
    if (c && c.week_start === isoDate(stats.weekStart)) {
      setChallenge({
        id: c.id,
        weekStart: c.week_start,
        kind: c.kind as WeeklyChallenge["kind"],
        goalAmount: Number(c.goal_amount),
        status: c.status as WeeklyChallenge["status"],
        progress: Number(c.progress),
      });
    } else {
      setChallenge(null);
    }

    setUnlocked(new Set((milestonesRes.data ?? []).map((m) => m.milestone_key)));
    setActivity((activityRes.data ?? []).map((a) => ({
      id: a.id,
      kind: a.kind,
      amount: a.amount !== null ? Number(a.amount) : null,
      createdAt: a.created_at,
    })));

    setLoading(false);
  }, [user, stats.weekStart]);

  useEffect(() => {
    load();
    const handler = () => {
      setRefreshTick((n) => n + 1);
      load();
    };
    window.addEventListener("debtfree:refresh", handler);
    return () => window.removeEventListener("debtfree:refresh", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  // Side-effects: persist personal bests + check milestones + update challenge progress
  useEffect(() => {
    if (!user || store.loading) return;

    const tasks: PromiseLike<unknown>[] = [];

    // Upsert this week / month best when current totals exceed them
    const thisWeekStart = isoDate(stats.weekStart);
    const thisMonthStart = isoDate(stats.monthStart);

    if (stats.weekPaid > 0) {
      tasks.push(
        supabase.from("personal_bests").upsert(
          { user_id: user.id, period: "week", period_start: thisWeekStart, total_amount: stats.weekPaid },
          { onConflict: "user_id,period,period_start" }
        )
      );
    }
    if (stats.monthPaid > 0) {
      tasks.push(
        supabase.from("personal_bests").upsert(
          { user_id: user.id, period: "month", period_start: thisMonthStart, total_amount: stats.monthPaid },
          { onConflict: "user_id,period,period_start" }
        )
      );
    }

    // Milestone checks
    const totalPaid = store.payments.reduce((s, p) => s + p.amount, 0);
    const totalInitial = store.debts.reduce((s, d) => s + d.initialBalance, 0);
    const pctPaid = totalInitial > 0 ? (totalPaid / totalInitial) * 100 : 0;
    const debtsCleared = store.debts.filter((d) => d.balance <= 0.01).length;
    const allClear = store.debts.length > 0 && debtsCleared === store.debts.length;
    const ctx = {
      debts: store.debts.length,
      payments: store.payments.length,
      totalPaid,
      pctPaid,
      debtsCleared,
      allClear,
    };

    const newlyUnlocked: string[] = [];
    for (const m of MILESTONE_DEFS) {
      if (unlocked.has(m.key)) continue;
      if (m.check(ctx as never)) newlyUnlocked.push(m.key);
    }
    if (newlyUnlocked.length > 0) {
      tasks.push(
        supabase.from("milestones").insert(
          newlyUnlocked.map((key) => ({ user_id: user.id, milestone_key: key }))
        )
      );
    }

    // Update active challenge progress
    if (challenge && challenge.status === "active") {
      let newProgress = challenge.progress;
      if (challenge.kind === "extra_payment") newProgress = stats.weekPaid;
      else if (challenge.kind === "log_one") {
        const paymentsThisWeek = store.payments.filter((p: Payment) => new Date(p.date) >= stats.weekStart).length;
        newProgress = paymentsThisWeek;
      }
      const completed = challenge.kind === "log_one" ? newProgress >= 1 : newProgress >= challenge.goalAmount;
      if (newProgress !== challenge.progress || (completed && challenge.status === "active")) {
        tasks.push(
          supabase.from("challenges").update({
            progress: newProgress,
            status: completed ? "completed" : "active",
          }).eq("id", challenge.id)
        );
      }
    }

    if (tasks.length > 0) {
      Promise.all(tasks).then(() => load());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.weekPaid, stats.monthPaid, store.debts, store.payments, store.loading, user, refreshTick]);

  const acceptChallenge = useCallback(
    async (kind: WeeklyChallenge["kind"], goal: number) => {
      if (!user) return;
      await supabase.from("challenges").upsert(
        {
          user_id: user.id,
          week_start: isoDate(stats.weekStart),
          kind,
          goal_amount: goal,
          status: "active",
          progress: 0,
        },
        { onConflict: "user_id,week_start" }
      );
      load();
    },
    [user, stats.weekStart, load]
  );

  const skipChallenge = useCallback(async () => {
    if (!user) return;
    await supabase.from("challenges").upsert(
      {
        user_id: user.id,
        week_start: isoDate(stats.weekStart),
        kind: "log_one",
        goal_amount: 0,
        status: "skipped",
        progress: 0,
      },
      { onConflict: "user_id,week_start" }
    );
    load();
  }, [user, stats.weekStart, load]);

  const beatLastWeek = stats.weekPaid > stats.prevWeekPaid && stats.prevWeekPaid > 0;
  const newWeekBest = !!bestWeek && stats.weekPaid >= bestWeek.amount && bestWeek.periodStart === isoDate(stats.weekStart) && stats.weekPaid > 0;
  const newMonthBest = !!bestMonth && stats.monthPaid >= bestMonth.amount && bestMonth.periodStart === isoDate(stats.monthStart) && stats.monthPaid > 0;

  return {
    loading,
    weeklyStreak: stats.streak,
    thisWeekHasExtra: stats.thisWeekHasExtra,
    weekPaid: stats.weekPaid,
    prevWeekPaid: stats.prevWeekPaid,
    monthPaid: stats.monthPaid,
    bestWeek,
    bestMonth,
    beatLastWeek,
    newWeekBest,
    newMonthBest,
    challenge,
    unlockedMilestones: unlocked,
    activity,
    acceptChallenge,
    skipChallenge,
  };
}
