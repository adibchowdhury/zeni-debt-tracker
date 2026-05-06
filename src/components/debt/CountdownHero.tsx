import { Calendar, Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { formatMoney, formatDate } from "@/lib/debt-math";
import { formatDays, type CountdownInfo } from "@/lib/insights";

export function CountdownHero({ countdown }: { countdown: CountdownInfo }) {
  const { days, payoffDate, totalRemaining, pct, totalPaid } = countdown;
  const done = totalRemaining <= 0.01;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#FF6A00]/20 bg-gradient-to-br from-[#FFF7ED] via-white to-white p-5 shadow-sm sm:p-6 md:p-7 dark:border-[#FF6A00]/18 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#FF6A00]/8 blur-2xl" />

      <div className="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] md:items-center md:gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3 shrink-0" />
            {done ? "You did it" : "Debt-free countdown"}
          </div>

          {done ? (
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-[1.65rem]">
              🎉 You're debt-free!
            </h2>
          ) : (
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-[1.65rem]">
              <span className="text-primary">{formatDays(days)}</span>
              <span className="text-foreground"> until you're debt-free</span>
            </h2>
          )}

          {!done && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                Target{" "}
                <span className="font-semibold text-foreground">{formatDate(payoffDate)}</span>
              </span>
              <span>
                <span className="font-semibold text-foreground">{formatMoney(totalRemaining)}</span>{" "}
                to go ·{" "}
                <span className="font-semibold text-foreground">{formatMoney(totalPaid)}</span> paid
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 md:justify-self-end md:text-right">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs md:flex-row-reverse md:justify-end md:gap-4">
            <span className="font-display text-base font-bold text-primary tabular-nums">
              {pct.toFixed(1)}%
            </span>
            <span className="font-medium text-muted-foreground">Overall progress</span>
          </div>
          <ProgressBar value={pct} />
          <Timeline pct={pct} />
        </div>
      </div>
    </section>
  );
}

function Timeline({ pct }: { pct: number }) {
  const stops = [0, 25, 50, 75, 100];
  return (
    <div className="mt-2 flex justify-between text-[9px] font-semibold uppercase tracking-wider">
      {stops.map((s) => {
        const reached = pct >= s;
        return (
          <div key={s} className="flex flex-col items-center gap-0.5">
            <div
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                reached ? "bg-primary" : "bg-border"
              }`}
            />
            <span className={reached ? "text-primary" : "text-muted-foreground"}>{s}%</span>
          </div>
        );
      })}
    </div>
  );
}
