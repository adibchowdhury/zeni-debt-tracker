import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [
      { title: "About zeni — Pay off debt faster, without the stress" },
      {
        name: "description",
        content:
          "zeni is a simple, motivating debt payoff coach. Learn why we built it, who it's for, and how we keep your data private.",
      },
      { property: "og:title", content: "About zeni — Pay off debt faster, without the stress" },
      {
        property: "og:description",
        content:
          "zeni is a simple, motivating debt payoff coach. Learn why we built it, who it's for, and how we keep your data private.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://zenidebtfree.com/about",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Hero */}
      <section>
        <p className="text-sm font-medium uppercase tracking-wider text-primary">About zeni</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-display">
          Debt payoff, without the stress.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          zeni is a simple, motivating coach that helps you pay off debt faster — by showing your
          debt-free date, celebrating every win, and keeping the process calm instead of scary.
        </p>
      </section>

      {/* Why we built it */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-foreground font-display">Why we built it</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Most debt apps either feel like spreadsheets or like guilt machines. They show you what
          you owe — but not how close you are to being free. We wanted something that makes paying
          down debt feel like progress, not punishment.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          So we built zeni around three ideas: a clear countdown to your debt-free date, small
          weekly wins that build momentum, and a design that's calm enough to open every day.
        </p>
      </section>

      {/* Who it's for */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-foreground font-display">Who it's for</h2>
        <ul className="mt-4 space-y-3 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>
            <strong className="text-foreground">
              People with credit card, student loan, or personal loan debt
            </strong>{" "}
            who want a clear plan instead of vague anxiety.
          </li>
          <li>
            <strong className="text-foreground">Anyone juggling multiple debts</strong> and
            wondering which one to tackle first (avalanche vs. snowball — we'll show you both).
          </li>
          <li>
            <strong className="text-foreground">
              People who've tried budgeting apps and bounced off
            </strong>{" "}
            because they felt overwhelming or judgmental.
          </li>
        </ul>
      </section>

      {/* How we're different */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-foreground font-display">How we're different</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-foreground">No bank linking</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              You enter your debts manually. We never see your account numbers, transactions, or
              credit score.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-foreground">No ads, no upsells</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We don't sell loan referrals or push credit products. Our only job is helping you get
              to zero.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-foreground">Built for momentum</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Weekly challenges, milestones, and a real countdown — so every payment feels like
              progress.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-foreground">Your data, your control</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Export or delete everything any time. We'll never share your debt info with
              advertisers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-3xl bg-primary/10 p-8 text-center">
        <h2 className="text-2xl font-semibold text-foreground font-display">
          Ready to see your debt-free date?
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Sign up in under a minute. No bank linking, no credit check.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}
