import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingDown,
  Target,
  HeartHandshake,
  ListChecks,
  Trophy,
  Calendar,
  ShieldCheck,
  Quote,
  Flame,
  Zap,
  CheckCircle2,
  Coins,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import stressedWomanLottie from "@/assets/lottie/stressed-woman.lottie?url";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <PreviewSection />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo to="/" size="md" />

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero lg:min-h-[calc(100vh-73px)]">
      {/* Soft decorative orange blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[oklch(0.86_0.17_92/0.35)] blur-3xl" />

      <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-14 pb-20 sm:pt-20 sm:pb-28 lg:min-h-[calc(100vh-73px)] lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:py-16">
        {/* Left — copy */}
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft/70 px-3 py-1 text-xs font-semibold text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Your supportive debt-free coach
          </div>

          <h1 className="font-display text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            A clear path to becoming <span className="font-extrabold text-primary">debt-free</span> — without the stress
          </h1>

          <p className="mt-7 max-w-xl text-base text-muted-foreground sm:text-lg lg:text-xl">
            Track your debt, stay motivated, and see your progress every day.
            Zeni turns the long road to zero into small, encouraging wins.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 sm:w-auto lg:text-lg"
            >
              Start My Debt-Free Plan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-7 py-4 text-base font-medium text-foreground hover:bg-secondary sm:w-auto lg:text-lg"
            >
              See how it works
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              No bank connection
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Set up in under a minute
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HeartHandshake className="h-3.5 w-3.5 text-primary" />
              Built to motivate, not shame
            </span>
          </div>
        </div>

        {/* Right — visual */}
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      {/* Floating "debt-free date" badge */}
      <div className="absolute -top-4 -left-2 z-20 hidden rounded-2xl border border-border bg-card p-3 shadow-soft sm:flex sm:items-center sm:gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-soft text-success">
          <Calendar className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Debt-free by
          </div>
          <div className="font-display text-sm font-bold text-foreground">March 2027</div>
        </div>
      </div>

      {/* Floating streak chip */}
      <div className="absolute -bottom-3 -right-2 z-20 hidden rounded-2xl border border-border bg-card p-3 shadow-soft sm:flex sm:items-center sm:gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Flame className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Streak
          </div>
          <div className="font-display text-sm font-bold text-foreground">12 weeks 🔥</div>
        </div>
      </div>

      {/* Main card */}
      <div className="relative rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 lg:scale-[1.04] lg:p-9">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Your progress
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
            <TrendingDown className="h-3 w-3" />
            On track
          </div>
        </div>

        {/* Transformation: $X → $0 */}
        <div className="mt-3 flex items-end gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Started at
            </div>
            <div className="font-display text-2xl font-bold text-muted-foreground line-through decoration-2">
              $18,300
            </div>
          </div>
          <ArrowRight className="mb-1 h-4 w-4 text-primary" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Remaining
            </div>
            <div className="font-display text-2xl font-bold text-foreground">$12,430</div>
          </div>
          <div className="ml-auto">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Goal
            </div>
            <div className="font-display text-2xl font-bold text-success">$0</div>
          </div>
        </div>

        {/* Big % */}
        <div className="mt-6 flex items-baseline justify-between">
          <div>
            <div className="font-display text-4xl font-extrabold text-foreground sm:text-5xl">
              32%
            </div>
            <div className="text-sm text-muted-foreground">paid off — you're closer than you think</div>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              This month
            </div>
            <div className="font-display text-base font-semibold text-primary">+$420 paid</div>
          </div>
        </div>

        {/* Progress bar with milestone ticks */}
        <div className="mt-4">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[32%] rounded-full bg-gradient-progress" />
            {[25, 50, 75].map((m) => (
              <div
                key={m}
                className="absolute top-0 h-3 w-px bg-card/60"
                style={{ left: `${m}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {[0, 25, 50, 75, 100].map((m) => (
              <span key={m} className={m <= 32 ? "text-primary" : ""}>
                {m}%
              </span>
            ))}
          </div>
        </div>

        {/* Encouraging line */}
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary-soft/50 px-3 py-2.5 text-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-medium text-foreground">
            You're making progress — keep the streak alive.
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Problem                                                                    */
/* -------------------------------------------------------------------------- */

function ProblemSection() {
  const pains = [
    {
      title: "Multiple debts feel chaotic",
      body: "Different cards, dates, and minimums — it's hard to even know where you stand.",
    },
    {
      title: "No clear payoff plan",
      body: "Without a strategy, every payment feels like guessing. Progress is invisible.",
    },
    {
      title: "Progress feels slow",
      body: "When you can't see movement, motivation fades — and life gets in the way.",
    },
  ];

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Visual: lottie illustration — turning struggle into something tangible */}
         <div className="order-2 flex justify-center overflow-visible lg:order-1">
          <div className="w-full max-w-3xl scale-100 lg:scale-110">
            <DotLottieReact
              src={stressedWomanLottie}
              loop
              autoplay
              className="h-[300px] w-full lg:h-[440px]"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="mb-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            The struggle is real
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Paying off debt shouldn't feel impossible.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Most people don't lack discipline — they lack clarity and momentum.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-1">
            {pains.map((p) => (
              <div
                key={p.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                  <span className="font-display text-base font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">{p.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Solution                                                                   */
/* -------------------------------------------------------------------------- */

function SolutionSection() {
  const wins = [
    {
      icon: ListChecks,
      title: "All your debts in one place",
      body: "One simple list. One clear total. No more spreadsheets or sticky notes.",
    },
    {
      icon: Target,
      title: "A real payoff plan",
      body: "Pick snowball or avalanche. We do the math — you collect the wins.",
    },
    {
      icon: Trophy,
      title: "Visible progress, every day",
      body: "Watch your debt shrink with milestones, streaks, and a debt-free date.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-background to-primary-soft/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            How Zeni helps
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Clarity, momentum, and a date you can{" "}
            <span className="text-primary">circle on the calendar.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Zeni replaces overwhelm with a simple, motivating system that meets you where you are.
          </p>
        </div>

        {/* Lottie: filling progress bar — momentum visualised */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Watch progress fill
                </div>
                <div className="font-display text-base font-semibold text-foreground">
                  Every payment moves the bar.
                </div>
              </div>
              <div className="font-display text-2xl font-extrabold text-primary">+</div>
            </div>
            <div
              className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary"
              role="img"
              aria-label="Progress bar filling with orange gradient"
            >
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-primary-glow" />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>$0</span>
              <span className="text-primary">+$420 this month</span>
              <span>Goal</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {wins.map((w) => (
            <div
              key={w.title}
              className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition-transform hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <w.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{w.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How It Works                                                               */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Add your debts",
      body: "Name, balance, interest, minimum. Done in a minute.",
    },
    {
      n: "2",
      title: "Track your progress",
      body: "Log payments and watch the bar move. Every dollar counts.",
    },
    {
      n: "3",
      title: "Become debt-free",
      body: "Hit milestones, build streaks, and celebrate every win along the way.",
    },
  ];

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          How it works
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Three simple steps to your debt-free date.
        </h2>
      </div>

      <div className="relative mt-12 grid gap-5 sm:grid-cols-3">
        {steps.map((s, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div
              key={s.n}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground shadow-glow">
                  {s.n}
                </div>
                {isLast && (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-success-soft text-success ring-4 ring-success-soft/40"
                    role="img"
                    aria-label="Level completed checkmark"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              {!isLast && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary/60 sm:block" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Preview Section                                                            */
/* -------------------------------------------------------------------------- */

function PreviewSection() {
  return (
    <section className="bg-gradient-to-b from-primary-soft/40 to-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Inside the app
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Designed to feel like a win, not a chore.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* Dashboard preview */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Dashboard
            </div>
            <div className="mt-2 font-display text-xl font-bold">
              You're 32% closer to debt-free 🎉
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Total remaining" value="$12,430" tone="default" />
              <Stat label="Paid this month" value="+$420" tone="success" />
              <Stat label="Streak" value="12 wks 🔥" tone="primary" />
            </div>
            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[32%] rounded-full bg-gradient-progress" />
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="text-primary">0%</span>
              <span className="text-primary">25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Timeline preview */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payoff timeline
            </div>
            <div className="mt-2 font-display text-xl font-bold">Debt-free by Mar 2027</div>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { label: "First $1,000 paid", done: true },
                { label: "25% milestone", done: true },
                { label: "50% milestone", done: false },
                { label: "Final payment 🎉", done: false },
              ].map((m) => (
                <li key={m.label} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      m.done
                        ? "bg-success text-success-foreground"
                        : "border border-border bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className={m.done ? "text-foreground" : "text-muted-foreground"}>
                    {m.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "success" | "primary";
}) {
  const toneClass =
    tone === "success"
      ? "bg-success-soft text-success"
      : tone === "primary"
        ? "bg-primary-soft text-primary"
        : "bg-secondary text-foreground";
  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClass}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
        {label}
      </div>
      <div className="font-display text-lg font-bold">{value}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Social Proof                                                               */
/* -------------------------------------------------------------------------- */

function SocialProof() {
  const quotes = [
    {
      name: "Maya R.",
      role: "Paid off $8,200 in 14 months",
      body: "Seeing the bar move every week kept me going. I finally feel in control of my money.",
    },
    {
      name: "Jordan T.",
      role: "On a 22-week streak",
      body: "Zeni feels like a coach in my pocket. The little wins add up to something huge.",
    },
    {
      name: "Priya S.",
      role: "32% to debt-free",
      body: "It's the first money app I actually open daily. Simple, motivating, no shame.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Loved by people paying it down
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Real progress, real momentum.
        </h2>
      </div>

      {/* Quick stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { value: "$2.4M+", label: "Debt paid down" },
          { value: "94%", label: "Stick with it monthly" },
          { value: "4.9★", label: "Average rating" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft"
          >
            <div className="font-display text-3xl font-extrabold text-primary">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {quotes.map((q) => (
          <div
            key={q.name}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <Quote className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm leading-relaxed text-foreground">"{q.body}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary">
                {q.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold">{q.name}</div>
                <div className="text-xs text-muted-foreground">{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                  */
/* -------------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="px-5 pb-20 sm:pb-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary via-[oklch(0.75_0.19_55)] to-[oklch(0.82_0.17_75)] p-10 text-center shadow-glow sm:p-14">
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-white/15 blur-3xl" />

        <div className="relative">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            It starts with one small step
          </div>
          <h2 className="font-display text-3xl font-extrabold leading-tight text-primary-foreground sm:text-5xl">
            Start your debt-free journey today.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-primary-foreground/90 sm:text-lg">
            Free to try. No bank connection. Just a clear plan and a coach in your pocket.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-card px-7 py-3.5 text-base font-semibold text-foreground shadow-soft transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              Start My Debt-Free Plan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/40 px-6 py-3.5 text-base font-medium text-primary-foreground hover:bg-white/10 sm:w-auto"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-border py-8 text-center text-xs text-muted-foreground">
      <Logo to="/" size="sm" />
      <span>Made with care · your debt-free coach</span>
    </footer>
  );
}
