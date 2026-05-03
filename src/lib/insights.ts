import { useMemo } from "react";
import type { Debt, Payment, Strategy } from "@/lib/storage";
import { simulatePayoff, formatMoney } from "@/lib/debt-math";
import { startOfWeek, isoDate } from "@/lib/week";

/**
 * Months to pay off a single debt paying only the fixed monthly payment P.
 * n = ln(P / (P - r * B)) / ln(1 + r)
 * Returns Infinity if payment doesn't cover monthly interest.
 */
function monthsToPayoff(balance: number, apr: number, payment: number): number {
  if (balance <= 0) return 0;
  if (payment <= 0) return Infinity;
  const r = apr / 100 / 12;
  if (r === 0) return Math.ceil(balance / payment);
  const interest = r * balance;
  if (payment <= interest) return Infinity;
  const n = Math.log(payment / (payment - r * balance)) / Math.log(1 + r);
  return Math.ceil(n);
}

/** Months until ALL debts are paid off, paying only the minimum on each. */
export function minPaymentPayoffMonths(debts: Debt[]): number {
  let max = 0;
  for (const d of debts) {
    if (d.balance <= 0) continue;
    const n = monthsToPayoff(d.balance, d.interestRate, d.minPayment);
    if (n === Infinity) return Infinity;
    if (n > max) max = n;
  }
  return max;
}

export interface Insight {
  id: string;
  icon: "trend" | "calendar" | "zap" | "clock" | "target";
  title: string;
  body: string;
  tone: "primary" | "success" | "info";
}

export interface CountdownInfo {
  days: number;
  months: number;
  payoffDate: Date;
  totalRemaining: number;
  pct: number;
  totalInitial: number;
  totalPaid: number;
}

export function useCountdown(
  debts: Debt[],
  payments: Payment[],
  _strategy: Strategy,
  _extraMonthly: number,
): CountdownInfo {
  return useMemo(() => {
    const totalRemaining = debts.reduce((s, d) => s + d.balance, 0);
    const totalInitial = debts.reduce((s, d) => s + d.initialBalance, 0);
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const pct = totalInitial > 0 ? Math.min(100, (totalPaid / totalInitial) * 100) : 0;
    // Countdown reflects paying ONLY the minimum payment on each debt.
    const months = minPaymentPayoffMonths(debts);
    const payoffDate = new Date();
    let days: number;
    if (!isFinite(months)) {
      days = Infinity;
      payoffDate.setFullYear(payoffDate.getFullYear() + 100);
    } else {
      payoffDate.setMonth(payoffDate.getMonth() + months);
      days = Math.max(0, Math.round((payoffDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    }
    return {
      days,
      months,
      payoffDate,
      totalRemaining,
      pct,
      totalInitial,
      totalPaid,
    };
  }, [debts, payments]);
}

interface InsightsCtx {
  debts: Debt[];
  payments: Payment[];
  strategy: Strategy;
  extraMonthly: number;
  weekPaid: number;
  prevWeekPaid: number;
  countdown: CountdownInfo;
}

/** Up to 2 personalized insights derived from real user data. */
export function buildInsights(ctx: InsightsCtx): Insight[] {
  const out: Insight[] = [];
  const { debts, payments, strategy, extraMonthly, weekPaid, prevWeekPaid, countdown } = ctx;

  // 1. "What if +$50/mo" — projected savings
  if (debts.some((d) => d.balance > 0)) {
    const baseline = countdown.months;
    const boosted = simulatePayoff(debts, strategy, extraMonthly + 50).months;
    const saved = baseline - boosted;
    if (saved >= 1) {
      out.push({
        id: "boost-50",
        icon: "zap",
        tone: "primary",
        title: `Be debt-free ${saved} month${saved === 1 ? "" : "s"} sooner`,
        body: `Adding just $50/mo extra cuts your timeline by ${saved} month${saved === 1 ? "" : "s"}.`,
      });
    }
  }

  // 2. Consistency week-over-week
  if (prevWeekPaid > 0 && weekPaid > 0) {
    const delta = weekPaid - prevWeekPaid;
    const pctChange = (delta / prevWeekPaid) * 100;
    if (pctChange >= 10) {
      out.push({
        id: "consistency-up",
        icon: "trend",
        tone: "success",
        title: "Your consistency is improving",
        body: `You've paid ${pctChange.toFixed(0)}% more this week than last. That compounds.`,
      });
    }
  }

  // 3. Day-of-week pattern
  if (payments.length >= 4) {
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    for (const p of payments) buckets[new Date(p.date).getDay()] += 1;
    const max = Math.max(...buckets);
    const dayIdx = buckets.indexOf(max);
    const total = buckets.reduce((s, n) => s + n, 0);
    if (max / total >= 0.35) {
      const days = [
        "Sundays",
        "Mondays",
        "Tuesdays",
        "Wednesdays",
        "Thursdays",
        "Fridays",
        "Saturdays",
      ];
      out.push({
        id: "day-pattern",
        icon: "clock",
        tone: "info",
        title: `You usually log payments on ${days[dayIdx]}`,
        body: "Building a routine is the #1 predictor of paying off debt fast.",
      });
    }
  }

  // 4. Distance to payoff in human terms
  if (countdown.days > 0 && countdown.days <= 365) {
    out.push({
      id: "under-year",
      icon: "calendar",
      tone: "primary",
      title: `Less than a year to go`,
      body: `At your current pace, you'll be debt-free in ${countdown.days} days.`,
    });
  } else if (countdown.pct >= 75 && countdown.totalRemaining > 0) {
    out.push({
      id: "almost-there",
      icon: "target",
      tone: "success",
      title: "You're in the home stretch",
      body: `${countdown.pct.toFixed(0)}% paid off — start thinking about an emergency fund next.`,
    });
  }

  // 5. No payments yet this week
  if (weekPaid === 0 && payments.length > 0 && countdown.totalRemaining > 0) {
    const lastPayment = payments[0];
    const daysSince = Math.floor((Date.now() - lastPayment.date) / (24 * 60 * 60 * 1000));
    if (daysSince >= 5) {
      out.push({
        id: "back-on-track",
        icon: "target",
        tone: "primary",
        title: "Quick win: log a payment today",
        body: `It's been ${daysSince} days. Even a small one keeps your streak going.`,
      });
    }
  }

  return out.slice(0, 2);
}

/** Personal-best distance — how close are we to beating best week? */
export function bestWeekGap(weekPaid: number, bestWeek: number | null): number | null {
  if (!bestWeek || bestWeek <= 0) return null;
  if (weekPaid >= bestWeek) return 0;
  return bestWeek - weekPaid;
}

/** Stable key for current week, used for streak-risk gating. */
export function currentWeekKey(): string {
  return isoDate(startOfWeek(new Date()));
}

/** Format a friendly relative day count. */
export function formatDays(days: number): string {
  if (!isFinite(days)) return "Never (min payment too low)";
  if (days <= 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 60) return `${days} days`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${years} ${years === 1 ? "year" : "years"}`;
  return `${years}y ${m}m`;
}

export { formatMoney };
