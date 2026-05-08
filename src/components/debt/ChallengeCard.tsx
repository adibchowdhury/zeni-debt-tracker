import { useState } from "react";
import { Target, Check, X } from "lucide-react";
import type { Engagement } from "@/lib/engagement";
import { formatMoney } from "@/lib/debt-math";

export function ChallengeCard({ eng }: { eng: Engagement }) {
  const [picking, setPicking] = useState(false);

  if (eng.challenge?.status === "skipped" && !picking) return null;

  if (!eng.challenge) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-primary/10">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Target className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-display text-base font-bold text-foreground">
              One thing this week
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Optional — pick a small focus that fits real life, not a performance test.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => eng.acceptChallenge("log_one", 1)}
            className="rounded-2xl border-2 border-primary bg-primary-soft p-4 text-left shadow-sm ring-1 ring-primary/15 transition-all hover:-translate-y-0.5"
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-primary">
              Gentle default
            </div>
            <div className="mt-1 font-display text-sm font-bold text-foreground">
              Log at least 1 payment
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">Stay connected to your plan</div>
          </button>
          <button
            onClick={() => eng.acceptChallenge("extra_payment", 50)}
            className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-left transition-all hover:border-primary/40 hover:bg-card"
          >
            <div className="font-display text-sm font-bold text-foreground/90">
              Pay an extra $50
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">If the month allows</div>
          </button>
        </div>
        <button
          onClick={() => eng.skipChallenge()}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground"
        >
          Not this week
        </button>
      </section>
    );
  }

  const c = eng.challenge;
  const completed = c.status === "completed";
  const goalText =
    c.kind === "extra_payment"
      ? `Put an extra ${formatMoney(c.goalAmount)} toward debt when you can`
      : "Log at least 1 payment this week";
  const progressPct =
    c.kind === "log_one"
      ? Math.min(100, c.progress * 100)
      : Math.min(100, (c.progress / Math.max(1, c.goalAmount)) * 100);
  const progressLabel =
    c.kind === "log_one" ? (completed ? "Done" : "0 / 1") : `${formatMoney(c.progress)} / ${formatMoney(c.goalAmount)}`;

  return (
    <section
      className={`rounded-3xl border p-6 shadow-sm transition-colors ${completed ? "border-success/40 bg-success-soft/40" : "border-border bg-card"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${completed ? "bg-success text-success-foreground" : "bg-primary-soft text-primary"}`}
        >
          {completed ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Small step for this week
          </div>
          <div className="font-display text-base font-bold text-foreground">{goalText}</div>
        </div>
        {!completed && (
          <button
            onClick={() => setPicking(true)}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
            aria-label="Change focus"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-700 ${completed ? "bg-success" : "bg-gradient-progress"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="text-muted-foreground">{progressLabel}</span>
          {completed && <span className="font-semibold text-success">You showed up</span>}
        </div>
      </div>
      {picking && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => {
              eng.acceptChallenge("log_one", 1);
              setPicking(false);
            }}
            className="rounded-xl border-2 border-primary bg-primary-soft p-3 text-left text-sm font-semibold hover:bg-primary-soft/90"
          >
            Log 1 payment
          </button>
          <button
            onClick={() => {
              eng.acceptChallenge("extra_payment", 50);
              setPicking(false);
            }}
            className="rounded-xl border border-border bg-muted/20 p-3 text-left text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            Extra $50 focus
          </button>
        </div>
      )}
    </section>
  );
}
