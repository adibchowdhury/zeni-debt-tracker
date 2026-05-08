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

  // 1. Hopeful framing: small extras still matter
  if (debts.some((d) => d.balance > 0)) {
    const baseline = countdown.months;
    const boosted = simulatePayoff(debts, strategy, extraMonthly + 50).months;
    const saved = baseline - boosted;
    if (saved >= 1) {
      out.push({
        id: "boost-50",
        icon: "zap",
        tone: "primary",
        title: "A gentler timeline is possible",
        body: `If you ever add about $50/mo extra, you could be debt-free roughly ${saved} month${saved === 1 ? "" : "s"} sooner — explore it in What If when you're ready.`,
      });
    }
  }

  // 2. Week-over-week — no "performance" framing
  if (prevWeekPaid > 0 && weekPaid > 0) {
    const delta = weekPaid - prevWeekPaid;
    const pctChange = (delta / prevWeekPaid) * 100;
    if (pctChange >= 10) {
      out.push({
        id: "consistency-up",
        icon: "trend",
        tone: "success",
        title: "You're building momentum",
        body: `This week's payments were about ${pctChange.toFixed(0)}% more than last week — that's steady energy, not pressure to repeat it every week.`,
      });
    }
  }

  // 3. Day-of-week pattern — kindness over "optimization"
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
        title: `You tend to check in on ${days[dayIdx]}`,
        body: "That consistency matters more than perfection — one missed week doesn't erase it.",
      });
    }
  }

  // 4. Distance to payoff in human terms
  if (countdown.days > 0 && countdown.days <= 365) {
    out.push({
      id: "under-year",
      icon: "calendar",
      tone: "primary",
      title: "The horizon is getting closer",
      body: `On paper, minimum-only pacing is about ${countdown.days} days out — small payments still keep you tethered to that path.`,
    });
  } else if (countdown.pct >= 75 && countdown.totalRemaining > 0) {
    out.push({
      id: "almost-there",
      icon: "target",
      tone: "success",
      title: "Most of the weight is behind you",
      body: `${countdown.pct.toFixed(0)}% paid down — consider parking a next step like a starter emergency fund when it feels right.`,
    });
  }

  return out.slice(0, 2);
}

/** Personal-best distance — how close are we to your best week? */
export function bestWeekGap(weekPaid: number, bestWeek: number | null): number | null {
  if (!bestWeek || bestWeek <= 0) return null;
  if (weekPaid >= bestWeek) return 0;
  return bestWeek - weekPaid;
}

/** Stable key for current week (e.g. engagement / UI that keys off the calendar week). */
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
