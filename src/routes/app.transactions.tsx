import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Receipt, ArrowLeft } from "lucide-react";
import { useDebtStore } from "@/lib/storage";
import { formatMoney } from "@/lib/debt-math";

export const Route = createFileRoute("/app/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const { payments, debts, loading } = useDebtStore();

  const debtNameById = useMemo(() => {
    const map = new Map<string, string>();
    debts.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [debts]);

  // newest first
  const sorted = useMemo(
    () => [...payments].sort((a, b) => b.date - a.date),
    [payments],
  );

  const total = useMemo(
    () => sorted.reduce((sum, p) => sum + p.amount, 0),
    [sorted],
  );

  // Group by month label
  const groups = useMemo(() => {
    const g: Record<string, typeof sorted> = {};
    sorted.forEach((p) => {
      const key = new Date(p.date).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
      (g[key] ||= []).push(p);
    });
    return Object.entries(g);
  }, [sorted]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Every payment you've logged.
          </p>
        </div>
        <div className="rounded-2xl bg-card px-4 py-3 text-right shadow-soft">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Total paid
          </div>
          <div className="font-display text-xl font-bold text-primary">
            {formatMoney(total)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          Loading…
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-soft">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No transactions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Log your first payment from the home screen.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([month, items]) => {
            const monthTotal = items.reduce((s, p) => s + p.amount, 0);
            return (
              <section key={month}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {month}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {formatMoney(monthTotal)}
                  </span>
                </div>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-soft">
                  {items.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {debtNameById.get(p.debtId) ?? "Unknown debt"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(p.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="font-display text-base font-semibold text-primary">
                        +{formatMoney(p.amount)}
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
