import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { useDebtStore, type Debt, DEBT_TYPES, type DebtType } from "@/lib/storage";
import { debtPayoffPercent, formatMoney, paidTowardDebt } from "@/lib/debt-math";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/debts")({
  component: DebtsPage,
});

function DebtsPage() {
  const store = useDebtStore();
  const [editing, setEditing] = useState<Debt | null>(null);
  const [open, setOpen] = useState(false);

  const remove = async (id: string) => {
    await store.removeDebt(id);
    toast.success("Debt removed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Your debts</h1>
          <p className="text-sm text-muted-foreground">Add, edit, or remove debts.</p>
        </div>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="gap-2"
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
        <div className="space-y-3">
          {store.debts.map((d) => {
            const paid = paidTowardDebt(d, store.payments);
            const pct = debtPayoffPercent(d, store.payments);
            return (
              <div key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-base font-semibold">{d.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {d.debtType} · {d.interestRate}% APR · min {formatMoney(d.minPayment)}/mo
                      {d.dueDay ? ` · due day ${d.dueDay}` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold">{formatMoney(d.balance)}</div>
                    <div className="text-xs text-muted-foreground">
                      of {formatMoney(d.initialBalance)}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={pct} />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(d);
                      setOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => remove(d.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
