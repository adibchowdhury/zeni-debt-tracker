import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Gift, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_public/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Zeni" },
      {
        name: "description",
        content:
          "Simple pricing for Zeni. Start free, then choose monthly or yearly access to stay motivated while paying off debt.",
      },
      { property: "og:title", content: "Pricing — Zeni" },
      {
        property: "og:description",
        content:
          "Start free with Zeni, then keep building momentum with simple monthly or yearly pricing.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const features = [
    "Debt payoff dashboard",
    "Debt-free date tracking",
    "Progress milestones and badges",
    "Weekly payment streaks",
    "What-if extra payment calculator",
    "Debt payoff motivation feed",
    "Payment history",
    "Secure account access",
    "Cancel anytime",
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f1]">
      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <section className="mx-auto max-w-3xl text-center">

          <h1 className="text-4xl font-semibold tracking-tight text-[#1f2933] sm:text-5xl md:text-6xl">
            Simple pricing for staying motivated with debt.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6b5f55] sm:text-lg">
            Start free, build your payoff plan, and keep turning debt progress
            into small wins. No confusing tiers. No pressure.
          </p>
        </section>

        <section className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {/* Monthly Card */}
          <div className="relative rounded-[2rem] border border-orange-100 bg-white p-8 shadow-[0_24px_80px_rgba(120,72,24,0.08)] sm:p-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#1f2933]">Monthly</h2>
              <p className="mt-1 text-sm text-[#7a6f66]">
                Flexible access after your free month.
              </p>
            </div>

            <div className="rounded-2xl bg-[#fdf8f1] p-5">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-semibold tracking-tight text-[#1f2933]">
                  $5
                </span>
                <span className="pb-1 text-sm text-[#7a6f66]">/month</span>
              </div>

              <p className="mt-2 text-sm text-[#7a6f66]">
                Billed monthly. Cancel anytime.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-[#3f3a35]"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3.5 text-sm font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Yearly Card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-orange-200 bg-white p-8 shadow-[0_24px_80px_rgba(120,72,24,0.12)] sm:p-10">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-100 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-orange-50 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#1f2933]">
                    Yearly
                  </h2>
                  <p className="mt-1 text-sm text-[#7a6f66]">
                    Best for staying committed longer.
                  </p>
                </div>

                <div className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                  Save $24
                </div>
              </div>

              <div className="rounded-2xl bg-[#fdf8f1] p-5">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight text-[#1f2933]">
                    $3
                  </span>
                  <span className="pb-1 text-sm text-[#7a6f66]">/month</span>
                </div>

                <p className="mt-2 text-sm text-[#7a6f66]">
                  Billed as{" "}
                  <span className="font-semibold text-[#1f2933]">
                    $36/year
                  </span>{" "}
                  instead of <span className="line-through">$60/year</span>.
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[#3f3a35]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Start free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#7a6f66]">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                No credit card required. Cancel anytime.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-4xl gap-4 md:grid-cols-3">
          {[
            {
              q: "Is the first month really free?",
              a: "Yes. You can try Zeni before deciding if you want to keep using it.",
            },
            {
              q: "What happens after the free month?",
              a: "You can choose monthly billing or save with yearly billing.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. You are never locked in, and there are no confusing contracts.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-3xl border border-orange-100 bg-white/75 p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-[#1f2933]">
                {item.q}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#7a6f66]">
                {item.a}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}