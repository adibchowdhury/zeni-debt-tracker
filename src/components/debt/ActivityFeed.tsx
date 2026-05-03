import { Users } from "lucide-react";
import type { ActivityItem } from "@/lib/engagement";
import { formatMoney } from "@/lib/debt-math";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function describe(item: ActivityItem): string {
  if (item.kind === "debt_cleared") return `Someone became debt-free 🎉`;
  if (item.kind === "payment" && item.amount)
    return `Someone paid off ${formatMoney(item.amount)} 💪`;
  return "Someone made progress";
}

export function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) {
    return null;
  }
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-teal-foreground">
          <Users className="h-4 w-4" />
        </div>
        <h2 className="font-display text-lg font-semibold">You're not alone</h2>
      </div>
      <div className="space-y-2">
        {activity.slice(0, 5).map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2.5 text-sm"
          >
            <span className="text-foreground">{describe(a)}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
