import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, X, Wallet, CalendarDays, Percent } from "lucide-react";
import { useDebtStore, type Debt, DEBT_TYPES, type DebtType } from "@/lib/storage";
import {
  debtPayoffPercent,
  formatDate,
  formatMoney,
  payoffDateAfterMonths,
  simulatePayoff,
} from "@/lib/debt-math";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_SIM_MONTHS = 12 * 80;

const TYPE_DOT: Record<DebtType, string> = {
  "Credit Card": "bg-emerald-500",
  "Personal Loan": "bg-red-500",
  "Auto Loan": "bg-sky-400",
  "Student Loan": "bg-orange-500",
  Mortgage: "bg-violet-500",
  "Medical Debt": "bg-rose-400",
  Collections: "bg-slate-500",
  Other: "bg-purple-500",
};

export const Route = createFileRoute("/app/debts")({
  component: DebtsPage,
});

function DebtsPage() {
  const store = useDebtStore();
  const [editing, setEditing] = useState<Debt | null>(null);
  const [open, setOpen] = useState(false);

  const sim = useMemo(
    () => simulatePayoff(store.debts, store.strategy, store.extraMonthly),
    [store.debts, store.strategy, store.extraMonthly],
  );

  const byType = useMemo(() => {
    const m = new Map<DebtType, Debt[]>();
    for (const t of DEBT_TYPES) m.set(t, []);
    for (const d of store.debts) {
      m.get(d.debtType)!.push(d);
    }
    for (const list of m.values()) {
      list.sort((a, b) => b.balance - a.balance || a.name.localeCompare(b.name));
    }
    return m;
  }, [store.debts]);

  const sectionTypes = useMemo(
    () => DEBT_TYPES.filter((t) => (byType.get(t) ?? []).length > 0),
    [byType],
  );

  const activeDebts = useMemo(() => store.debts.filter((d) => d.balance > 0), [store.debts]);

  const totalOwed = useMemo(() => store.debts.reduce((s, d) => s + d.balance, 0), [store.debts]);

  const monthlyPayments = useMemo(
    () => activeDebts.reduce((s, d) => s + d.minPayment, 0),
    [activeDebts],
  );

  const highestApr = useMemo(() => {
    if (activeDebts.length === 0) return null;
    return activeDebts.reduce((best, d) => {
      if (d.interestRate > best.interestRate) return d;
      if (d.interestRate < best.interestRate) return best;
      return d.name.localeCompare(best.name) < 0 ? d : best;
    }, activeDebts[0]);
  }, [activeDebts]);

  const remove = async (id: string) => {
    await store.removeDebt(id);
    toast.success("Debt removed");
  };

  function payoffLabelFor(debt: Debt): string {
    if (debt.balance <= 0) return "Paid off";
    const monthsUntil = sim.perDebtMonths[debt.id];
    const ok =
      typeof monthsUntil === "number" &&
      Number.isFinite(monthsUntil) &&
      monthsUntil >= 0 &&
      sim.months < MAX_SIM_MONTHS;
    if (ok) return formatDate(payoffDateAfterMonths(monthsUntil));
    return "Never at current pace";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Debts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Balances and payoff estimates use your current plan and extra monthly amount.
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="shrink-0 gap-2 self-start"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add debt
        </Button>
      </div>

      {store.debts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-muted-foreground">No debts yet. Add one to get started.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#FF6A00] dark:bg-muted/50">
                <Wallet className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total owed
                </div>
                <div className="mt-0.5 font-display text-xl font-bold tabular-nums tracking-tight">
                  {formatMoney(totalOwed)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeDebts.length} active {activeDebts.length === 1 ? "debt" : "debts"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 dark:bg-muted/40">
                <CalendarDays className="h-5 w-5 text-foreground/80" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Monthly payments
                </div>
                <div className="mt-0.5 font-display text-xl font-bold tabular-nums tracking-tight">
                  {formatMoney(monthlyPayments)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Minimums (active debts)</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 dark:bg-muted/40">
                <Percent className="h-5 w-5 text-foreground/80" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Highest APR
                </div>
                <div className="mt-0.5 font-display text-xl font-bold tabular-nums tracking-tight">
                  {highestApr ? `${highestApr.interestRate.toFixed(2)}%` : "—"}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {highestApr ? highestApr.name : "No active balance"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {sectionTypes.map((type) => {
              const debts = byType.get(type) ?? [];
              const categoryTotal = debts.reduce((s, d) => s + d.balance, 0);
              return (
                <section key={type} className="space-y-4">
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn("h-3 w-3 shrink-0 rounded-full", TYPE_DOT[type])}
                        aria-hidden
                      />
                      <h2 className="font-display text-lg font-bold tracking-tight text-heading">
                        {type}
                      </h2>
                    </div>
                    <div className="shrink-0 font-display text-base font-bold tabular-nums sm:text-lg">
                      {formatMoney(categoryTotal)}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {debts.map((d) => {
                      const pct = debtPayoffPercent(d, store.payments);
                      return (
                        <article
                          key={d.id}
                          className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-display text-base font-semibold leading-tight text-heading">
                                {d.name}
                              </h3>
                              <p className="mt-0.5 text-xs text-muted-foreground">{d.debtType}</p>
                            </div>
                            <div className="flex shrink-0 gap-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditing(d);
                                  setOpen(true);
                                }}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                aria-label={`Edit ${d.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(d.id)}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Remove ${d.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center sm:text-left">
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Balance
                              </div>
                              <div className="mt-1 font-display text-sm font-bold tabular-nums sm:text-base">
                                {formatMoney(d.balance)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Min/mo
                              </div>
                              <div className="mt-1 font-display text-sm font-bold tabular-nums sm:text-base">
                                {formatMoney(d.minPayment)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                APR
                              </div>
                              <div className="mt-1 font-display text-sm font-bold tabular-nums sm:text-base">
                                {d.interestRate}%
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <ProgressBar value={pct} />
                              <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                                {pct.toFixed(0)}% paid off
                              </p>
                            </div>
                            <p className="shrink-0 text-right text-xs font-medium text-muted-foreground sm:max-w-[11rem]">
                              Payoff: <span className="text-foreground">{payoffLabelFor(d)}</span>
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      {open && <DebtForm debt={editing} onClose={() => setOpen(false)} />}
    </div>
  );
}

function DebtForm({ debt, onClose }: { debt: Debt | null; onClose: () => void }) {
  const store = useDebtStore();
  const [name, setName] = useState(debt?.name ?? "");
  const [balance, setBalance] = useState(debt ? String(debt.balance) : "");
  const [rate, setRate] = useState(debt ? String(debt.interestRate) : "");
  const [minPay, setMinPay] = useState(debt ? String(debt.minPayment) : "");
  const [debtType, setDebtType] = useState<DebtType>(debt?.debtType ?? "Credit Card");
  const [dueDay, setDueDay] = useState(debt?.dueDay ? String(debt.dueDay) : "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const b = parseFloat(balance);
    const r = parseFloat(rate);
    const m = parseFloat(minPay);
    if (!name || isNaN(b) || isNaN(r) || isNaN(m)) {
      toast.error("Please fill in all fields");
      return;
    }
    let dd: number | null = null;
    if (dueDay.trim() !== "") {
      const parsed = parseInt(dueDay, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 31) {
        toast.error("Due day must be between 1 and 31");
        return;
      }
      dd = parsed;
    }
    if (debt) {
      await store.updateDebt(debt.id, {
        name,
        balance: b,
        interestRate: r,
        minPayment: m,
        debtType,
        dueDay: dd,
      });
      toast.success("Debt updated");
    } else {
      await store.addDebt({
        name,
        balance: b,
        interestRate: r,
        minPayment: m,
        debtType,
        dueDay: dd,
      });
      toast.success("Debt added!");
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-sm sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{debt ? "Edit debt" : "Add a debt"}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Name">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Credit Card"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
          </FormField>
          <FormField label="Type of debt">
            <select
              value={debtType}
              onChange={(e) => setDebtType(e.target.value as DebtType)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            >
              {DEBT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Current balance">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="2500"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Interest %">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="18.99"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
            <FormField label="Min payment">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={minPay}
                onChange={(e) => setMinPay(e.target.value)}
                placeholder="50"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
          </div>
          <FormField label="Payment due day (1–31)">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              step={1}
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="e.g. 15"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
          </FormField>
          <Button type="submit" variant="default" className="w-full">
            {debt ? "Save changes" : "Add debt"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
