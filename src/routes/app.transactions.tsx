import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Receipt } from "lucide-react";
import { useDebtStore, type Payment } from "@/lib/storage";
import { formatMoney } from "@/lib/debt-math";

export const Route = createFileRoute("/app/transactions")({
  component: TransactionsPage,
});

function safePaymentTime(p: Payment): number {
  const raw = p.date;
  const n = typeof raw === "number" && !Number.isNaN(raw) ? raw : Number(raw);
  if (Number.isFinite(n) && n > 0) return n;
  return 0;
}

function formatMonthGroupLabel(ms: number): string {
  const d = new Date(ms);
  if (!Number.isFinite(d.getTime()) || ms <= 0) return "Unknown month";
  try {
    return d.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Unknown month";
  }
}

function formatPaymentDetail(ms: number): string {
  const d = new Date(ms);
  if (!Number.isFinite(d.getTime()) || ms <= 0) return "Date unavailable";
  try {
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Date unavailable";
  }
}

function TransactionsPage() {
  const { payments, debts, loading } = useDebtStore();

  const debtNameById = useMemo(() => {
    const map = new Map<string, string>();
    debts.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [debts]);

  const sorted = useMemo(() => {
    const list = payments.map((p) => ({ ...p, _ts: safePaymentTime(p) }));
    list.sort((a, b) => b._ts - a._ts);
    return list;
  }, [payments]);

  const total = useMemo(
    () =>
      sorted.reduce((sum, p) => {
        const amt = Number(p.amount);
        return sum + (Number.isFinite(amt) ? amt : 0);
      }, 0),
    [sorted],
  );

  const groups = useMemo(() => {
    const g: Record<string, typeof sorted> = {};
    sorted.forEach((p) => {
      const key = formatMonthGroupLabel(p._ts);
      (g[key] ||= []).push(p);
    });
    return Object.entries(g);
  }, [sorted]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Transactions</h1>
          <p className="text-sm text-muted-foreground">Every payment you've logged.</p>
        </div>
        <div className="rounded-2xl bg-card px-4 py-3 text-right shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Total paid
          </div>
          <div className="font-display text-xl font-bold text-primary">{formatMoney(total)}</div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
          Loading…
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-sm">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No transactions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Log your first payment from the home screen.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([month, items]) => {
            const monthTotal = items.reduce((s, p) => {
              const amt = Number(p.amount);
              return s + (Number.isFinite(amt) ? amt : 0);
            }, 0);
            return (
              <section key={month}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h2 className="text-sm font-semibold text-muted-foreground">{month}</h2>
                  <span className="text-xs text-muted-foreground">{formatMoney(monthTotal)}</span>
                </div>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-sm">
                  {items.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {debtNameById.get(p.debtId) ?? "Unknown debt"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPaymentDetail(p._ts)}
                        </div>
                      </div>
                      <div className="font-display text-base font-semibold text-primary">
                        +{formatMoney(Number.isFinite(Number(p.amount)) ? Number(p.amount) : 0)}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
