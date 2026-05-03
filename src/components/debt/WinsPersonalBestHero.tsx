import { useMemo } from "react";
import { Zap, Flame, TrendingUp, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { formatMoney } from "@/lib/debt-math";
import { WinsWarmProgressBar } from "@/components/debt/WinsWarmProgressBar";
import type { Engagement } from "@/lib/engagement";

interface Props {
  eng: Engagement;
}

export function WinsPersonalBestHero({ eng }: Props) {
  const reduce = useReducedMotion();
  const bestWeekAmt = eng.bestWeek?.amount ?? 0;
  const bestMonthAmt = eng.bestMonth?.amount ?? 0;
  const weekPaid = eng.weekPaid;
  const monthPaid = eng.monthPaid;

  const weekTarget = Math.max(bestWeekAmt, weekPaid > 0 ? weekPaid : 0, 1);
  const monthTarget = Math.max(bestMonthAmt, monthPaid > 0 ? monthPaid : 0, 1);

  const weekProgress = Math.round(Math.min(100, (weekPaid / weekTarget) * 100));
  const monthProgress = Math.round(Math.min(100, (monthPaid / monthTarget) * 100));

  const weekMotivation = useMemo(() => {
    if (bestWeekAmt <= 0 && weekPaid <= 0) {
      return "Log payments this week to open this challenge.";
    }
    if (bestWeekAmt <= 0 && weekPaid > 0) {
      return "You're setting your first weekly bar.";
    }
    if (bestWeekAmt > 0 && weekPaid >= bestWeekAmt) {
      return "Record matched. Now raise the bar.";
    }
    if (bestWeekAmt > 0 && weekPaid < bestWeekAmt) {
      return `${formatMoney(bestWeekAmt - weekPaid)} away from a new record.`;
    }
    return "Consistency compounds — stack another payment.";
  }, [bestWeekAmt, weekPaid]);

  const monthMotivation = useMemo(() => {
    if (bestMonthAmt <= 0 && monthPaid <= 0) {
      return "This month is yours to define.";
    }
    if (bestMonthAmt <= 0 && monthPaid > 0) {
      return "You're drafting your first monthly high.";
    }
    if (bestMonthAmt > 0 && monthPaid >= bestMonthAmt) {
      return "Record matched. Now raise the bar.";
    }
    if (bestMonthAmt > 0 && monthPaid < bestMonthAmt) {
      return `${formatMoney(bestMonthAmt - monthPaid)} away from a new record.`;
    }
    return "Small deposits — huge payoff.";
  }, [bestMonthAmt, monthPaid]);

  return (
    <motion.section
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: "easeOut", delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl border-2 border-[#F97316]/35 bg-gradient-to-br from-[#FFF8E8] via-[#FFF4E6] to-[#FFE8D8] p-5 shadow-[0_22px_55px_rgba(249,115,22,0.22)] sm:p-8 dark:border-[#F97316]/25 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 dark:shadow-[0_18px_45px_rgba(249,115,22,0.12)]"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#F97316]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-0 h-36 w-36 rounded-full bg-[#FACC15]/20 blur-3xl" />

      <div className="relative mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F97316]/35 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#C2410C] backdrop-blur-sm dark:border-[#F97316]/30 dark:bg-zinc-900/80 dark:text-orange-400">
          <Trophy className="h-3.5 w-3.5" aria-hidden />
          Personal challenge
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Crush your averages
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#57534E] dark:text-zinc-400">
          Your records are the boss battle. Beat them one week at a time.
        </p>
      </div>

      <div className="relative grid gap-5 lg:grid-cols-2">
        <HeroStatBlock
          icon={Zap}
          label="Best week record"
          amount={bestWeekAmt > 0 ? formatMoney(bestWeekAmt) : "—"}
          currentLabel="This week"
          currentAmount={weekPaid > 0 ? formatMoney(weekPaid) : "Still open"}
          motivation={weekMotivation}
          progress={bestWeekAmt > 0 || weekPaid > 0 ? weekProgress : null}
          hot={eng.newWeekBest}
        />
        <HeroStatBlock
          icon={Flame}
          label="Best month record"
          amount={bestMonthAmt > 0 ? formatMoney(bestMonthAmt) : "—"}
          currentLabel="This month"
          currentAmount={monthPaid > 0 ? formatMoney(monthPaid) : "Building"}
          motivation={monthMotivation}
          progress={bestMonthAmt > 0 || monthPaid > 0 ? monthProgress : null}
          hot={eng.newMonthBest}
        />
      </div>

      {eng.weekPaid > eng.prevWeekPaid && eng.prevWeekPaid > 0 && (
        <div className="relative mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#F97316]/25 bg-white/70 px-4 py-3 text-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-800/80">
          <TrendingUp className="h-4 w-4 shrink-0 text-[#EA580C]" aria-hidden />
          <span className="font-medium text-foreground">
            Ahead of last week by{" "}
            <span className="font-display text-lg font-bold text-[#C2410C]">
              {formatMoney(Math.max(0, eng.weekPaid - eng.prevWeekPaid))}
            </span>
          </span>
        </div>
      )}
    </motion.section>
  );
}

function HeroStatBlock({
  icon: Icon,
  label,
  amount,
  currentLabel,
  currentAmount,
  motivation,
  progress,
  hot,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  amount: string;
  currentLabel: string;
  currentAmount: string;
  motivation: string;
  progress: number | null;
  hot: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-[#F97316]/25 bg-white/90 p-5 backdrop-blur-sm sm:p-6 dark:border-zinc-700 dark:bg-zinc-900/85 ${
        hot ? "shadow-[0_14px_36px_rgba(249,115,22,0.20)] ring-2 ring-[#F97316]/25" : "shadow-soft"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#DC2626] text-white shadow-[0_8px_18px_rgba(220,38,38,0.22)]">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] dark:text-zinc-500">
            {label}
          </div>
          <div className="mt-1 font-display text-3xl font-black tabular-nums tracking-tight text-[#C2410C] sm:text-4xl">
            {amount}
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-[#F3E8DC] pt-3 dark:border-zinc-700">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#78716C] dark:text-zinc-500">
                {currentLabel}
              </div>
              <div className="font-display text-xl font-bold tabular-nums text-[#EA580C]">
                {currentAmount}
              </div>
            </div>
            {hot && (
              <span className="shrink-0 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                New high
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium leading-snug text-[#44403C] dark:text-zinc-300">
        {motivation}
      </p>
      {progress !== null && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-[#78716C] dark:text-zinc-500">
            <span>Pace toward your record</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <WinsWarmProgressBar value={progress} />
        </div>
      )}
    </div>
  );
}
