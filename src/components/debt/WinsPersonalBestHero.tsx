import { useMemo, type ComponentType } from "react";
import { Zap, Flame, TrendingUp, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { formatMoney } from "@/lib/debt-math";
import { WinsWarmProgressBar } from "@/components/debt/WinsWarmProgressBar";
import type { Engagement } from "@/lib/engagement";

interface Props {
  eng: Engagement;
  /** Tighter layout for Achievements page so badges stay the hero */
  compact?: boolean;
}

export function WinsPersonalBestHero({ eng, compact }: Props) {
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

  const shell = compact
    ? "relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-700 dark:bg-zinc-900/40"
    : "relative overflow-hidden rounded-3xl border border-[#FF6A00]/20 bg-gradient-to-br from-[#FFF7ED] via-white to-[#FAFAFA] p-5 shadow-sm sm:p-8 dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900";

  return (
    <motion.section
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: "easeOut", delay: 0.1 }}
      className={shell}
    >
      {!compact && (
        <>
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#FF6A00]/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 left-0 h-36 w-36 rounded-full bg-[#FACC15]/15 blur-3xl" />
        </>
      )}

      <div className={`relative ${compact ? "mb-4" : "mb-8"}`}>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#EA580C] shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-orange-400 sm:px-3 sm:py-1 sm:text-[11px]">
          <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
          Personal challenge
        </div>
        <h2
          className={`mt-3 font-display font-bold tracking-tight text-[#0F172A] dark:text-zinc-100 ${
            compact ? "text-lg sm:text-xl" : "mt-4 text-2xl sm:text-3xl"
          }`}
        >
          Crush your averages
        </h2>
        <p
          className={`mt-1.5 max-w-xl text-[#475569] dark:text-zinc-400 ${
            compact ? "text-xs leading-relaxed sm:text-sm" : "mt-2 text-sm leading-relaxed"
          }`}
        >
          Your records are the boss battle. Beat them one week at a time.
        </p>
      </div>

      <div className={`relative grid lg:grid-cols-2 ${compact ? "gap-3" : "gap-5"}`}>
        <HeroStatBlock
          compact={compact}
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
          compact={compact}
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
        <div
          className={`relative flex flex-wrap items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-800/80 ${
            compact ? "mt-4 text-xs sm:text-sm" : "mt-6 rounded-2xl px-4 py-3"
          }`}
        >
          <TrendingUp className="h-4 w-4 shrink-0 text-[#FF6A00]" aria-hidden />
          <span className="font-medium text-[#0F172A]">
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
  compact,
  icon: Icon,
  label,
  amount,
  currentLabel,
  currentAmount,
  motivation,
  progress,
  hot,
}: {
  compact?: boolean;
  icon: ComponentType<{ className?: string }>;
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
      className={`relative rounded-xl border border-[#E5E7EB] bg-white dark:border-zinc-700 dark:bg-zinc-900/90 ${
        compact ? "p-3.5 sm:p-4" : "rounded-2xl p-5 sm:p-6"
      } ${hot ? "shadow-[0_14px_35px_rgba(255,106,0,0.14)] ring-2 ring-[#FF6A00]/20" : "shadow-sm"}`}
    >
      <div className={`flex items-start ${compact ? "gap-3" : "gap-4"}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#EA580C] text-white shadow-[0_8px_18px_rgba(255,106,0,0.28)] ${
            compact ? "h-9 w-9" : "h-12 w-12 rounded-2xl"
          }`}
        >
          <Icon className={compact ? "h-4 w-4" : "h-6 w-6"} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-zinc-500 ${
              compact ? "text-[10px]" : "text-[11px]"
            }`}
          >
            {label}
          </div>
          <div
            className={`mt-0.5 font-display font-black tabular-nums tracking-tight text-[#0F172A] dark:text-zinc-100 ${
              compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
            }`}
          >
            {amount}
          </div>
          <div
            className={`flex flex-wrap items-baseline justify-between gap-2 border-t border-[#E5E7EB] dark:border-zinc-700 ${
              compact ? "mt-2 pt-2" : "mt-3 pt-3"
            }`}
          >
            <div>
              <div
                className={`font-medium uppercase tracking-wider text-[#94A3B8] dark:text-zinc-500 ${
                  compact ? "text-[10px]" : "text-[11px]"
                }`}
              >
                {currentLabel}
              </div>
              <div
                className={`font-display font-bold tabular-nums text-[#FF6A00] ${
                  compact ? "text-base sm:text-lg" : "text-xl"
                }`}
              >
                {currentAmount}
              </div>
            </div>
            {hot && (
              <span className="shrink-0 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#EA580C] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:text-[10px]">
                New high
              </span>
            )}
          </div>
        </div>
      </div>
      <p
        className={`font-medium leading-snug text-[#475569] dark:text-zinc-300 ${
          compact ? "mt-2 text-xs sm:text-sm" : "mt-4 text-sm"
        }`}
      >
        {motivation}
      </p>
      {progress !== null && (
        <div className={compact ? "mt-2.5" : "mt-4"}>
          <div
            className={`mb-1.5 flex justify-between font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-zinc-500 ${
              compact ? "text-[10px]" : "text-[11px]"
            }`}
          >
            <span>Pace toward your record</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <WinsWarmProgressBar value={progress} />
        </div>
      )}
    </div>
  );
}
