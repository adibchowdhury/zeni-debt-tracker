import type { Debt, Strategy } from "./storage";

export interface PayoffResult {
  months: number;
  totalInterest: number;
  payoffDate: Date;
  perDebtMonths: Record<string, number>;
}

/**
 * Simulate paying off all debts month-by-month.
 * Each month: pay min on each debt, then apply (extra + freed mins) to focus debt
 * based on strategy.
 */
export function simulatePayoff(
  debtsInput: Debt[],
  strategy: Strategy,
  extraMonthly: number
): PayoffResult {
  const debts = debtsInput
    .filter((d) => d.balance > 0)
    .map((d) => ({ ...d }));
  if (debts.length === 0) {
    return { months: 0, totalInterest: 0, payoffDate: new Date(), perDebtMonths: {} };
  }

  const perDebtMonths: Record<string, number> = {};
  let month = 0;
  let totalInterest = 0;
  const MAX_MONTHS = 12 * 80;

  while (debts.some((d) => d.balance > 0) && month < MAX_MONTHS) {
    month += 1;

    // 1. accrue interest
    for (const d of debts) {
      if (d.balance <= 0) continue;
      const monthlyRate = d.interestRate / 100 / 12;
      const interest = d.balance * monthlyRate;
      d.balance += interest;
      totalInterest += interest;
    }

    // 2. order debts: focus first
    const active = debts.filter((d) => d.balance > 0);
    active.sort((a, b) => {
      if (strategy === "snowball") return a.balance - b.balance;
      return b.interestRate - a.interestRate;
    });

    // 3. budget for this month: sum of mins of original active + extra + freed mins
    const totalMins = debts.reduce((s, d) => s + d.minPayment, 0);
    let budget = totalMins + extraMonthly;

    // 4. pay min on each non-focus active debt
    for (let i = 1; i < active.length; i++) {
      const d = active[i];
      const pay = Math.min(d.minPayment, d.balance, budget);
      d.balance -= pay;
      budget -= pay;
    }

    // 5. dump rest on focus
    if (active.length > 0) {
      const focus = active[0];
      const pay = Math.min(focus.balance, budget);
      focus.balance -= pay;
      budget -= pay;
    }

    // 6. record payoff month
    for (const d of debts) {
      if (d.balance <= 0.005 && perDebtMonths[d.id] === undefined) {
        perDebtMonths[d.id] = month;
        d.balance = 0;
      }
    }
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return { months: month, totalInterest, payoffDate, perDebtMonths };
}

export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 100 ? 0 : 2,
  }).format(Math.max(0, n));
}

export function formatMonths(months: number) {
  if (months <= 0) return "Today";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
