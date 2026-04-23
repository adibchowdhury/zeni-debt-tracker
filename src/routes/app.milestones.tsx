import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Trophy, Sparkles, Flag, Star, Award, Medal } from "lucide-react";
import { useAppState } from "@/lib/storage";
import { formatMoney } from "@/lib/debt-math";

export const Route = createFileRoute("/app/milestones")({
  component: MilestonesPage,
});

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  achieved: boolean;
  detail?: string;
}

function MilestonesPage() {
  const { state } = useAppState();
  const { debts, payments } = state;

  const milestones = useMemo<Milestone[]>(() => {
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const totalInitial = debts.reduce((s, d) => s + d.initialBalance, 0);
    const pct = totalInitial > 0 ? (totalPaid / totalInitial) * 100 : 0;
    const debtsCleared = debts.filter((d) => d.balance <= 0.01).length;

    return [
      {
        id: "first-debt",
        title: "First debt added",
        description: "You started. That's huge.",
        icon: Flag,
        achieved: debts.length > 0,
      },
      {
        id: "first-payment",
        title: "First payment logged",
        description: "Momentum begins.",
        icon: Sparkles,
        achieved: payments.length > 0,
      },
      {
        id: "10pct",
        title: "10% paid off",
        description: "Real progress is showing.",
        icon: Star,
        achieved: pct >= 10,
        detail: `${pct.toFixed(1)}%`,
      },
      {
        id: "1k",
        title: "$1,000 paid",
        description: "Big number, big win.",
        icon: Medal,
        achieved: totalPaid >= 1000,
        detail: formatMoney(totalPaid),
      },
      {
        id: "halfway",
        title: "Halfway there",
        description: "More behind you than ahead.",
        icon: Trophy,
        achieved: pct >= 50,
      },
      {
        id: "first-clear",
        title: "First debt cleared",
        description: "One down — that's freedom.",
        icon: Award,
        achieved: debtsCleared >= 1,
      },
      {
        id: "all-clear",
        title: "Debt-free 🎉",
        description: "You did it. Truly.",
        icon: Trophy,
        achieved: debts.length > 0 && debtsCleared === debts.length,
      },
    ];
  }, [debts, payments]);

  const unlocked = milestones.filter((m) => m.achieved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Your wins</h1>
        <p className="text-sm text-muted-foreground">
          {unlocked} of {milestones.length} unlocked. Keep going.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {milestones.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-4 rounded-2xl border p-5 transition-all ${
              m.achieved
                ? "border-success bg-success-soft/40 shadow-soft"
                : "border-border bg-card opacity-60"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                m.achieved
                  ? "bg-success text-success-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <m.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold">{m.title}</div>
              <div className="text-sm text-muted-foreground">{m.description}</div>
              {m.detail && m.achieved && (
                <div className="mt-1 text-xs font-medium text-success">{m.detail}</div>
              )}
            </div>
            {m.achieved && (
              <div className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                Done
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
