import { Calendar, Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { formatMoney, formatDate } from "@/lib/debt-math";
import { formatDays, type CountdownInfo } from "@/lib/insights";

export function CountdownHero({ countdown }: { countdown: CountdownInfo }) {
  const { days, payoffDate, totalRemaining, pct, totalPaid } = countdown;
  const done = totalRemaining <= 0.01;

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary-soft via-primary-soft/60 to-card p-6 shadow-soft sm:p-8">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {done ? "You did it" : "Debt-free countdown"}
        </div>

        {done ? (
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            🎉 You're debt-free!
          </h2>
        ) : (
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-primary">{formatDays(days)}</span>
            <span className="text-foreground"> until you're debt-free</span>
          </h2>
        )}

        {!done && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Target: <span className="font-semibold text-foreground">{formatDate(payoffDate)}</span>
            </span>
            <span>
              <span className="font-semibold text-foreground">{formatMoney(totalRemaining)}</span> to go
            </span>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="font-medium">{formatMoney(totalPaid)} paid off</span>
            <span className="font-display text-lg font-bold text-primary">{pct.toFixed(1)}%</span>
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
    <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-wider">
      {stops.map((s) => {
        const reached = pct >= s;
        return (
          <div key={s} className="flex flex-col items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
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
