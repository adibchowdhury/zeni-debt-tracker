import { useMemo } from "react";
import type { Payment } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { addWeeks, isoDate, startOfWeek } from "@/lib/week";
import { formatMoney } from "@/lib/debt-math";

const WEEKS = 12;

/** Last N weeks of payment totals (Mon-start), oldest → newest for left-to-right scan. */
function weeklyTotalsSeries(
  payments: Payment[],
  weeks: number,
): { label: string; total: number }[] {
  const now = new Date();
  const thisWeek = startOfWeek(now);
  const map = new Map<string, number>();
  for (const p of payments) {
    const ws = isoDate(startOfWeek(new Date(p.date)));
    map.set(ws, (map.get(ws) ?? 0) + p.amount);
  }
  const out: { label: string; total: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = addWeeks(thisWeek, -i);
    const key = isoDate(d);
    const short = `${d.getMonth() + 1}/${d.getDate()}`;
    out.push({ label: short, total: map.get(key) ?? 0 });
  }
  return out;
}

export function PaymentActivityStrip({
  payments,
  className,
}: {
  payments: Payment[];
  className?: string;
}) {
  const series = useMemo(() => weeklyTotalsSeries(payments, WEEKS), [payments]);
  const max = useMemo(() => Math.max(...series.map((s) => s.total), 1), [series]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Payment rhythm
          </div>
          <div className="font-display text-[0.9375rem] font-bold tracking-tight text-foreground sm:text-base">
            Last {WEEKS} weeks
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground/90">Peak week = full bar</span>
      </div>
      <div
        className="mt-5 flex items-end gap-1.5 sm:gap-2"
        role="img"
        aria-label={`Payment totals over the last ${WEEKS} weeks, scaled to your busiest week`}
      >
        {series.map((s, i) => {
          const h = Math.round((s.total / max) * 100);
          const intensity =
            s.total <= 0
              ? "bg-muted-foreground/30"
              : h < 38
                ? "bg-[#FFB380] shadow-[inset_0_-2px_0_rgb(234_88_12/0.12)] ring-1 ring-[#FF6A00]/20"
                : h < 72
                  ? "bg-[#FF7A28] shadow-[inset_0_-2px_0_rgb(180_52_12/0.18)] ring-1 ring-[#EA580C]/25"
                  : "bg-[#F56200] shadow-[inset_0_-2px_0_rgb(120_42_8/0.22)] ring-1 ring-[#C2410C]/30";
          return (
            <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className="relative flex h-[4.5rem] w-full items-end justify-center rounded-lg bg-muted/45 pb-1 pt-0.5 sm:h-[4.875rem]"
                title={`${s.label}: ${formatMoney(s.total)}`}
              >
                <div
                  className={cn("w-[93%] max-w-[42px] rounded-[6px] sm:max-w-[46px]", intensity)}
                  style={{ height: `${Math.max(s.total > 0 ? 16 : 6, h)}%` }}
                />
              </div>
              <span className="hidden truncate text-[10px] font-medium text-muted-foreground/90 sm:block">
                {i === series.length - 1 ? "Now" : s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
