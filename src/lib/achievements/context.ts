import type { Debt, Payment, Strategy } from "@/lib/storage";
import { isoDate, startOfWeek } from "@/lib/week";
import type { AchievementSignals } from "./signals";

export interface AchievementEngFlags {
  newWeekBest: boolean;
  newMonthBest: boolean;
  weeklyStreak: number;
  weekPaid: number;
  monthPaid: number;
}

export interface AchievementCtx {
  debts: Debt[];
  payments: Payment[];
  strategy: Strategy;
  extraMonthly: number;
  debtCount: number;
  paymentCount: number;
  totalPaid: number;
  totalInitial: number;
  pctPaid: number;
  debtsCleared: number;
  allClear: boolean;
  signals: AchievementSignals;
  eng: AchievementEngFlags;
  /** Sorted ISO dates (YYYY-MM-DD) with at least one payment */
  paymentDaysSorted: string[];
  /** Longest run of consecutive calendar days with ≥1 payment */
  maxPaymentDayStreak: number;
  /** Consecutive ISO weeks (Mon start) with ≥1 payment, counting back from current week */
  consecutiveWeeksWithPayment: number;
  /** Distinct ISO weeks that have ≥1 payment */
  distinctPaymentWeeks: number;
  returnedAfter7: boolean;
  returnedAfter30: boolean;
  loggedAfterGap14: boolean;
  paymentsStrictlyOverMin: number;
  /** Days since first all-clear (from signals), if all clear */
  daysDebtFree: number | null;
  /** Consecutive calendar days user opened dashboard (from signals) */
  dashboardDayStreakMax: number;
}

function uniqueSortedPaymentDays(payments: Payment[]): string[] {
  const set = new Set<string>();
  for (const p of payments) {
    const d = new Date(p.date);
    set.add(isoDate(d));
  }
  return [...set].sort();
}

function maxConsecutiveCalendarDayStreak(sortedIsoDays: string[]): number {
  if (sortedIsoDays.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedIsoDays.length; i++) {
    const a = new Date(sortedIsoDays[i - 1] + "T12:00:00");
    const b = new Date(sortedIsoDays[i] + "T12:00:00");
    const diff = Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function consecutiveWeeksWithAnyPayment(payments: Payment[], now = new Date()): number {
  const weekKeys = new Set<string>();
  for (const p of payments) {
    weekKeys.add(isoDate(startOfWeek(new Date(p.date))));
  }
  let n = 0;
  const cur = startOfWeek(now);
  while (true) {
    const k = isoDate(cur);
    if (weekKeys.has(k)) {
      n += 1;
      cur.setDate(cur.getDate() - 7);
    } else {
      break;
    }
  }
  return n;
}

function distinctWeeksCount(payments: Payment[]): number {
  const weekKeys = new Set<string>();
  for (const p of payments) {
    weekKeys.add(isoDate(startOfWeek(new Date(p.date))));
  }
  return weekKeys.size;
}

function countPaymentsStrictlyOverMinimum(debts: Debt[], payments: Payment[]): number {
  const debtById = new Map(debts.map((d) => [d.id, d]));
  let c = 0;
  for (const p of payments) {
    const d = debtById.get(p.debtId);
    if (d && p.amount > d.minPayment + 0.009) c += 1;
  }
  return c;
}

function comebackFlags(sortedDays: string[]): {
  returnedAfter7: boolean;
  returnedAfter30: boolean;
  loggedAfterGap14: boolean;
} {
  if (sortedDays.length < 2) {
    return { returnedAfter7: false, returnedAfter30: false, loggedAfterGap14: false };
  }
  let returnedAfter7 = false;
  let returnedAfter30 = false;
  let loggedAfterGap14 = false;
  for (let i = 1; i < sortedDays.length; i++) {
    const a = new Date(sortedDays[i - 1] + "T12:00:00");
    const b = new Date(sortedDays[i] + "T12:00:00");
    const g = Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
    if (g >= 7) returnedAfter7 = true;
    if (g >= 30) returnedAfter30 = true;
    if (g >= 14) loggedAfterGap14 = true;
  }
  return { returnedAfter7, returnedAfter30, loggedAfterGap14 };
}

function longestDashboardVisitStreak(sortedIsoDays: string[]): number {
  if (sortedIsoDays.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedIsoDays.length; i++) {
    const a = new Date(sortedIsoDays[i - 1] + "T12:00:00");
    const b = new Date(sortedIsoDays[i] + "T12:00:00");
    const diff = Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function buildAchievementContext(
  debts: Debt[],
  payments: Payment[],
  strategy: Strategy,
  extraMonthly: number,
  signals: AchievementSignals,
  eng: AchievementEngFlags,
): AchievementCtx {
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const totalInitial = debts.reduce((s, d) => s + d.initialBalance, 0);
  const pctPaid = totalInitial > 0 ? (totalPaid / totalInitial) * 100 : 0;
  const debtsCleared = debts.filter((d) => d.balance <= 0.01).length;
  const allClear = debts.length > 0 && debtsCleared === debts.length;
  const paymentDaysSorted = uniqueSortedPaymentDays(payments);
  const gapFlags = comebackFlags(paymentDaysSorted);

  let daysDebtFree: number | null = null;
  if (allClear && signals.allClearAtMs) {
    daysDebtFree = Math.floor((Date.now() - signals.allClearAtMs) / (24 * 60 * 60 * 1000));
  }

  const dashboardDayStreakMax = longestDashboardVisitStreak(signals.dashboardVisitDays);

  return {
    debts,
    payments,
    strategy,
    extraMonthly,
    debtCount: debts.length,
    paymentCount: payments.length,
    totalPaid,
    totalInitial,
    pctPaid,
    debtsCleared,
    allClear,
    signals,
    eng,
    paymentDaysSorted,
    maxPaymentDayStreak: maxConsecutiveCalendarDayStreak(paymentDaysSorted),
    consecutiveWeeksWithPayment: consecutiveWeeksWithAnyPayment(payments),
    distinctPaymentWeeks: distinctWeeksCount(payments),
    returnedAfter7: gapFlags.returnedAfter7,
    returnedAfter30: gapFlags.returnedAfter30,
    loggedAfterGap14: gapFlags.loggedAfterGap14,
    paymentsStrictlyOverMin: countPaymentsStrictlyOverMinimum(debts, payments),
    daysDebtFree,
    dashboardDayStreakMax,
  };
}
