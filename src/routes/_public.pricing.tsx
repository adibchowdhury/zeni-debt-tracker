import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl md:text-6xl">
            Simple pricing for staying motivated with debt.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#475569] sm:text-lg">
            Start free, build your payoff plan, and keep turning debt progress into small wins. No
            confusing tiers. No pressure.
          </p>
        </section>

        <section className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {/* Monthly Card */}
          <div className="relative rounded-[2rem] border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#0F172A]">Monthly</h2>
              <p className="mt-1 text-sm text-[#475569]">Flexible access after your free month.</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-semibold tracking-tight text-[#0F172A]">$5</span>
                <span className="pb-1 text-sm text-[#475569]">/month</span>
              </div>

              <p className="mt-2 text-sm text-[#475569]">Billed monthly. Cancel anytime.</p>
            </div>

            <ul className="mt-8 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-[#475569]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6A00]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-6 py-3.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-[#FAFAFA]"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Yearly Card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-[#FF6A00]/25 bg-gradient-to-br from-[#FFF7ED] via-white to-[#FFEAD5] p-8 shadow-[0_14px_35px_rgba(255,106,0,0.14)] sm:p-10">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#FF6A00]/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#FACC15]/15 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#0F172A]">Yearly</h2>
                  <p className="mt-1 text-sm text-[#475569]">Best for staying committed longer.</p>
                </div>

                <div className="rounded-full bg-[#FF6A00] px-3 py-1 text-xs font-semibold text-white">
                  Save $24
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-white/90 p-5 backdrop-blur-sm">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight text-[#0F172A]">$3</span>
                  <span className="pb-1 text-sm text-[#475569]">/month</span>
                </div>

                <p className="mt-2 text-sm text-[#475569]">
                  Billed as <span className="font-semibold text-[#0F172A]">$36/year</span> instead of{" "}
                  <span className="line-through">$60/year</span>.
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[#475569]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6A00]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6A00] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#EA580C]"
              >
                Start free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
                <ShieldCheck className="h-4 w-4 text-[#FF6A00]" />
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
            <div key={item.q} className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#0F172A]">{item.q}</h3>
              <p className="mt-2 text-sm leading-6 text-[#475569]">{item.a}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
