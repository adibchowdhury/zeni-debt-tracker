import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Flame,
  History,
  MessageCircleHeart,
  PiggyBank,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_public/features")({
  head: () => ({
    meta: [
      { title: "Features — Zeni" },
      {
        name: "description",
        content:
          "Explore Zeni features built to help you track debt, stay motivated, build streaks, celebrate milestones, and see your path to becoming debt-free.",
      },
      { property: "og:title", content: "Features — Zeni" },
      {
        property: "og:description",
        content:
          "Debt payoff tracking, streaks, badges, milestones, payment history, and motivation tools to help you stay on track.",
      },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  {
    icon: BarChart3,
    title: "Debt payoff dashboard",
    desc: "See your total debt, remaining balance, payoff progress, and debt-free timeline in one simple place.",
  },
  {
    icon: CalendarDays,
    title: "Debt-free date tracking",
    desc: "Know when you are projected to become debt-free and see how each payment moves you closer.",
  },
  {
    icon: Flame,
    title: "Weekly payment streaks",
    desc: "Build momentum by keeping a streak when you make weekly debt payments.",
  },
  {
    icon: BadgeCheck,
    title: "Milestones and badges",
    desc: "Celebrate wins like adding your first debt, paying off $500, reaching 10%, or getting halfway there.",
  },
  {
    icon: PiggyBank,
    title: "What-if payment calculator",
    desc: "Test extra payments and instantly see how much faster you could reach zero.",
  },
  {
    icon: MessageCircleHeart,
    title: "Motivation feed",
    desc: "See recent progress from other users so paying off debt feels less lonely and more encouraging.",
  },
  {
    icon: History,
    title: "Payment history",
    desc: "Keep track of the payments you have logged and watch your progress build over time.",
  },
  {
    icon: Sparkles,
    title: "Progress celebrations",
    desc: "Get small encouraging moments when you make a payment, hit a milestone, or keep moving forward.",
  },
  {
    icon: CheckCircle2,
    title: "Simple debt management",
    desc: "Add, update, and manage your debts without feeling like you are stuck in a spreadsheet.",
  },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#fdf8f1]">
      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <section className="mx-auto max-w-3xl text-center">

          <h1 className="text-4xl font-semibold tracking-tight text-[#1f2933] sm:text-5xl md:text-6xl">
            Features that help debt payoff feel less overwhelming.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6b5f55] sm:text-lg">
            Zeni helps you track your debt, stay consistent, and turn the long
            road to zero into small wins you can actually feel.
          </p>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-[1.75rem] border border-orange-100 bg-white/80 p-7 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_24px_70px_rgba(120,72,24,0.10)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold text-[#1f2933]">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#7a6f66]">
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-16 max-w-4xl rounded-[2rem] border border-orange-100 bg-white/80 p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1f2933]">
            Not just another debt tracker.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#7a6f66] sm:text-base">
            Most apps only show numbers. Zeni is built to keep you emotionally
            motivated while you pay off debt, one payment at a time.
          </p>
        </section>
      </main>
    </div>
  );
}