/**
 * Emotional re-entry & behavioral support helpers for the authenticated app.
 * Keep copy shame-free and non-binary (no "failed streak" framing).
 */

import type { Debt, Payment, Strategy } from "@/lib/storage";
import { simulatePayoff, formatMoney, formatMonths } from "@/lib/debt-math";
import { isoDate, startOfWeek } from "@/lib/week";

/** TODO(analytics): track last app open / session for accurate 7+ day absence (30-day reopen cohort). */
const INACTIVE_DAYS_THRESHOLD = 7;

export function getLastPaymentDate(payments: Payment[]): Date | null {
  if (payments.length === 0) return null;
  let max = 0;
  for (const p of payments) {
    const t = new Date(p.date).getTime();
    if (t > max) max = t;
  }
  return new Date(max);
}

export function daysSinceLastPayment(payments: Payment[]): number | null {
  const d = getLastPaymentDate(payments);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Show gentle "welcome back" when user has gone quiet.
 * TODO(analytics): merge with `last_seen_at` from backend when available.
 */
export function shouldShowReentryState(
  payments: Payment[],
  _lastSeenAt: string | null | undefined,
): boolean {
  if (payments.length === 0) return false;
  const days = daysSinceLastPayment(payments);
  if (days === null) return false;
  return days >= INACTIVE_DAYS_THRESHOLD;
}

export interface ConsistencySummary {
  headline: string;
  subline?: string;
}

/** Non-streak framing: rhythm, check-ins, patterns — never "don't break streak". */
export function getConsistencySummary(payments: Payment[]): ConsistencySummary {
  if (payments.length === 0) {
    return {
      headline: "When you're ready, one payment reconnects you to your plan.",
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let thisMonth = 0;
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  for (const p of payments) {
    const d = new Date(p.date);
    if (d >= startOfMonth) thisMonth += 1;
    buckets[d.getDay()] += 1;
  }
  const max = Math.max(...buckets);
  const dayIdx = buckets.indexOf(max);
  const total = buckets.reduce((s, n) => s + n, 0);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (thisMonth >= 1) {
    return {
      headline: `You've checked in ${thisMonth} time${thisMonth === 1 ? "" : "s"} this month.`,
      subline:
        total >= 4 && max / total >= 0.3
          ? `You often show up on ${dayNames[dayIdx]}s — that consistency matters more than perfection.`
          : "Your rhythm is forming. Missed weeks don't erase what you've already done.",
    };
  }

  return {
    headline: "Small payments still count.",
    subline: "They keep you connected to the journey — even when life is loud.",
  };
}

export interface NextStepCopy {
  title: string;
  body: string;
  support?: string;
}

export function getNextMeaningfulStep(input: {
  debts: Debt[];
  payments: Payment[];
  strategy: Strategy;
  extraMonthly: number;
  focusDebt: Debt | null;
  nextMilestoneGap: number | null;
  eng: { weekPaid: number; monthPaid: number };
  totalRemaining: number;
}): NextStepCopy {
  const { debts, payments, strategy, extraMonthly, focusDebt, nextMilestoneGap, eng, totalRemaining } =
    input;

  if (totalRemaining <= 0.01) {
    return { title: "You're at zero here.", body: "Take a breath — that's real progress." };
  }

  if (nextMilestoneGap != null && nextMilestoneGap > 0.5 && nextMilestoneGap < 1e9) {
    return {
      title: "Next meaningful step",
      body: `You're about ${formatMoney(nextMilestoneGap)} from your next milestone — small steps still move the needle.`,
      support: "You don't have to close the gap today. One intentional payment keeps the door open.",
    };
  }

  if (focusDebt) {
    const strat =
      strategy === "avalanche"
        ? `With avalanche, your plan is focusing on ${focusDebt.name} (high interest).`
        : `With snowball, your plan is focusing on ${focusDebt.name} (building momentum).`;
    return {
      title: "One focused action",
      body: `${strat} When you're ready, even a minimum payment counts as showing up.`,
    };
  }

  const simPlus25 = simulatePayoff(debts, strategy, extraMonthly + 25);
  const baseline = simulatePayoff(debts, strategy, extraMonthly);
  const monthsSaved = Math.max(0, baseline.months - simPlus25.months);
  if (monthsSaved >= 1) {
    return {
      title: "A hopeful next step",
      body: `One extra $25/month could move your debt-free timeline about ${formatMonths(monthsSaved)} sooner — explore it in What If when you feel up to it.`,
    };
  }

  if (eng.weekPaid === 0 && payments.length > 0) {
    return {
      title: "Gentle check-in",
      body: "You don't have to fix everything right now. Logging one payment keeps you tethered to your plan without judgment.",
    };
  }

  return {
    title: "Keep the door open",
    body:
      eng.monthPaid > 0
        ? `You've put ${formatMoney(eng.monthPaid)} toward debt this month. That's real — one small action today keeps momentum kind.`
        : "Showing up matters more than a perfect month. What's one tiny step you could take today?",
  };
}

export type WeeklyFeeling =
  | "hopeful"
  | "stressed"
  | "overwhelmed"
  | "motivated"
  | "discouraged";

export function getSupportiveCheckInResponse(feeling: WeeklyFeeling): string {
  switch (feeling) {
    case "hopeful":
      return "That's worth noticing. Let's protect that momentum.";
    case "stressed":
      return "That makes sense. Let's keep today's step small.";
    case "overwhelmed":
      return "You don't have to solve the whole journey today.";
    case "motivated":
      return "Great. Use that energy on one focused action.";
    case "discouraged":
      return "A hard week does not erase your progress.";
    default:
      return "Thanks for checking in. We'll keep things gentle.";
  }
}

const CHECKIN_STORAGE = "zeni:weekly-checkin-feeling:v1";

export function currentWeekStartIso(): string {
  return isoDate(startOfWeek(new Date()));
}

export function loadWeeklyFeeling(): { week: string; feeling: WeeklyFeeling } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKIN_STORAGE);
    if (!raw) return null;
    return JSON.parse(raw) as { week: string; feeling: WeeklyFeeling };
  } catch {
    return null;
  }
}

export function saveWeeklyFeeling(feeling: WeeklyFeeling): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CHECKIN_STORAGE,
      JSON.stringify({ week: currentWeekStartIso(), feeling }),
    );
    // TODO(analytics): `weekly_checkin_selected` with feeling + week (Supabase table later).
  } catch {
    /* ignore */
  }
}
