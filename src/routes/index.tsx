import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles, TrendingDown, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Debtfree</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-16 text-center sm:pt-20 sm:pb-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
          Your personal debt coach
        </div>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          Pay off debt faster
          <br />
          <span className="bg-gradient-progress bg-clip-text text-transparent">
            without feeling overwhelmed
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          See exactly when you'll be debt-free, watch your progress every month, and discover how
          small extra payments save you years.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            Get started — free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground hover:bg-secondary sm:w-auto"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No bank connection. Your data stays on your device.</p>
      </section>

      {/* Visual progress preview */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">You're</div>
              <div className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                42% closer
              </div>
              <div className="text-sm text-muted-foreground">to being debt-free</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Free by</div>
              <div className="font-display text-xl font-semibold text-success">Mar 2027</div>
            </div>
          </div>
          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[42%] rounded-full bg-gradient-progress" />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>$8,400 paid</span>
            <span>$11,600 to go</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: TrendingDown,
              title: "Clear progress",
              body: "Watch every dollar move you closer. No spreadsheets, no clutter.",
            },
            {
              icon: Target,
              title: "A real payoff plan",
              body: "Pick snowball or avalanche. We do the math, you do the wins.",
            },
            {
              icon: Sparkles,
              title: "What-if magic",
              body: "Slide an extra $50 — see months and interest disappear.",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight">
          How it works
        </h2>
        <div className="mt-8 space-y-4">
          {[
            { n: "1", t: "Add your debts", b: "Name, balance, interest, minimum. Done in a minute." },
            { n: "2", t: "Pick a strategy", b: "Snowball for momentum, avalanche for math. Your call." },
            { n: "3", t: "Log payments & celebrate", b: "Every payment moves the bar. Every milestone matters." },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-soft font-display text-sm font-bold text-success">
                {s.n}
              </div>
              <div>
                <div className="font-display font-semibold">{s.t}</div>
                <div className="text-sm text-muted-foreground">{s.b}</div>
              </div>
              <Check className="ml-auto hidden h-5 w-5 shrink-0 text-success sm:block" />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
          >
            Start your debt-free plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Made with care · Your data stays on your device
      </footer>
    </div>
  );
}
