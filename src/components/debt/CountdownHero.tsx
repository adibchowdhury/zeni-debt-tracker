import { useEffect, useRef, useState } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { formatMoney, formatDate } from "@/lib/debt-math";
import { formatDays, type CountdownInfo } from "@/lib/insights";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Smoothly approaches `target` so bar + label can stay in sync without fighting CSS width transitions. */
function useAnimatedProgress(target: number, durationMs = 850) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(100, target));
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      displayRef.current = clamped;
      setDisplay(clamped);
      return;
    }

    const from = displayRef.current;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const v = from + (clamped - from) * easeOutCubic(t);
      displayRef.current = v;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        displayRef.current = clamped;
        setDisplay(clamped);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return display;
}

export function CountdownHero({
  countdown,
  firstName,
  nextMilestoneDollars,
}: {
  countdown: CountdownInfo;
  firstName?: string;
  nextMilestoneDollars?: number | null;
}) {
  const { days, payoffDate, totalRemaining, pct, totalPaid } = countdown;
  const done = totalRemaining <= 0.01;

  const displayPct = useAnimatedProgress(done ? Math.min(100, pct) : pct);

  const summaryLine = !done
    ? `${Math.round(displayPct)}% complete${
        nextMilestoneDollars != null && nextMilestoneDollars > 0
          ? ` \u2014 ${formatMoney(nextMilestoneDollars)} to your next milestone`
          : ""
      }`
    : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-[#FF6A00]/25 bg-gradient-to-br from-[#FFF7ED] via-white to-white p-5 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#FF6A00]/10 blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/85">
          <Sparkles className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
          {done ? "You did it" : "Your debt-free horizon"}
        </div>

        {done ? (
          <h2 className="mt-1.5 font-display text-3xl font-bold leading-[1.15] tracking-tight text-heading sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            {firstName ? (
              <>
                <span className="font-semibold text-foreground">{firstName}</span>
                <span className="font-semibold text-foreground/90">, you&apos;re debt-free! </span>
                <span aria-hidden>🎉</span>
              </>
            ) : (
              <>
                <span aria-hidden>🎉</span> You&apos;re debt-free!
              </>
            )}
          </h2>
        ) : (
          <h2 className="mt-1.5 font-display text-3xl font-bold leading-[1.15] tracking-tight text-heading sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            {firstName ? (
              <>
                <span className="font-semibold text-foreground">{firstName}</span>
                <span className="font-semibold text-foreground/90">, you&apos;re </span>
                <span className="font-extrabold text-primary lg:text-[1.06em]">
                  {formatDays(days)}
                </span>
                <span className="font-semibold text-foreground/95"> from debt-free</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground/90">You&apos;re </span>
                <span className="font-extrabold text-primary lg:text-[1.06em]">
                  {formatDays(days)}
                </span>
                <span className="font-semibold text-foreground/95"> from debt-free</span>
              </>
            )}
          </h2>
        )}

        {!done && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Target <span className="font-semibold text-foreground">{formatDate(payoffDate)}</span>
            </span>
            <span>
              <span className="font-semibold text-foreground">{formatMoney(totalRemaining)}</span>{" "}
              to go ·{" "}
              <span className="font-semibold text-foreground">{formatMoney(totalPaid)}</span> paid
            </span>
          </div>
        )}

        {summaryLine ? (
          <p className="mt-2 max-w-3xl text-sm leading-snug text-muted-foreground">{summaryLine}</p>
        ) : null}

        <div className="mt-8 sm:mt-9">
          <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
            <span className="font-medium text-foreground">Overall progress</span>
            <span className="font-display text-lg font-bold tabular-nums text-primary sm:text-xl">
              {displayPct.toFixed(1)}%
            </span>
          </div>
          <ProgressBar
            value={displayPct}
            className="h-3 sm:h-3.5"
            fillClassName="transition-none duration-0"
          />
          <Timeline pct={displayPct} />
        </div>
      </div>
    </section>
  );
}

function Timeline({ pct }: { pct: number }) {
  const stops = [0, 25, 50, 75, 100];
  return (
    <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]">
      {stops.map((s) => {
        const reached = pct >= s;
        return (
          <div key={s} className="flex flex-col items-center gap-0.5">
            <div
              className={`h-2 w-2 rounded-full transition-colors sm:h-2.5 sm:w-2.5 ${
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
