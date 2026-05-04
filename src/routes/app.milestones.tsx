import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useDebtStore } from "@/lib/storage";
import { useEngagement } from "@/lib/engagement";
import { formatMoney } from "@/lib/debt-math";
import {
  MILESTONE_CATALOG,
  WINS_SECTION_ORDER,
  WINS_SECTION_TITLE,
  type MilestoneTier,
  type WinsSection,
} from "@/lib/milestone-catalog";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements/catalog";
import { buildAchievementContext } from "@/lib/achievements/context";
import { readAchievementSignals } from "@/lib/achievements/signals";
import type { AchievementCatalogEntry } from "@/lib/achievements/types";
import type { AchievementCtx } from "@/lib/achievements/context";
import { BadgeAchievement } from "@/components/debt/BadgeAchievement";
import { WinsPersonalBestHero } from "@/components/debt/WinsPersonalBestHero";
import { WinsPageConfetti } from "@/components/debt/WinsPageConfetti";

const ANIM_STORE_KEY = "zeni:wins-milestone-first-seen-v1";

const BADGE_DISPLAY_NAME: Record<string, string> = {
  "first-debt": "First debt tracked",
  "first-payment": "First payment",
  "10pct": "10% cleared",
  "500-paid": "$500 paid",
  "1k-paid": "$1k conquered",
  halfway: "Halfway",
  "first-clear": "Debt destroyed",
  "all-clear": "Debt-free",
};

const SECTION_MOTIVATION: Record<WinsSection, string> = {
  "getting-started": "Every legend starts at zero.",
  "building-momentum": "Stack proof. Numbers don’t lie.",
  "progress-milestones": "Watch the percentage climb — it adds up.",
  "money-milestones": "Every dollar logged is leverage.",
  "debt-knockout": "Zero balances are the real trophies.",
  "smart-behavior": "Small smarter moves compound fast.",
  "comeback": "Breaks happen. Returning is the win.",
  "major-milestones": "The inflection points that change everything.",
  "debt-free": "The crown jewel of your collection.",
};

export const Route = createFileRoute("/app/milestones")({
  component: MilestonesPage,
});

interface MilestoneRow {
  section: WinsSection;
  tier: MilestoneTier;
  id: string;
  Icon: (typeof MILESTONE_CATALOG)[number]["Icon"];
  title: string;
  gridLockedLabel: string;
  achieved: boolean;
  unlockSupporting: string;
}

function unlockSupportingFor(
  entry: AchievementCatalogEntry,
  ctx: AchievementCtx,
  achieved: boolean,
): string {
  if (!achieved) return "";
  const id = entry.id;
  if ((id === "debt-free-30" || id === "debt-free-90") && ctx.daysDebtFree != null) {
    return `${ctx.daysDebtFree} days clear`;
  }
  if (
    id.startsWith("pct-") ||
    id === "10pct" ||
    id === "halfway" ||
    id === "almost-free"
  ) {
    const decimals = id === "halfway" ? 0 : 1;
    return `${ctx.pctPaid.toFixed(decimals)}% cleared`;
  }
  if (entry.section === "money-milestones" || id === "500-paid" || id === "1k-paid") {
    return `${formatMoney(ctx.totalPaid)} paid`;
  }
  if (id === "pay-3" || id === "pay-5" || id === "pay-10") {
    return `${ctx.paymentCount} payments`;
  }
  if (id === "cleared-2" || id === "cleared-3" || id === "cleared-5") {
    return `${ctx.debtsCleared} cleared`;
  }
  return "Unlocked";
}

function MilestonesPage() {
  const reduce = useReducedMotion();
  const store = useDebtStore();
  const eng = useEngagement();
  const { debts, payments, strategy, extraMonthly } = store;

  const achCtx = useMemo(
    () =>
      buildAchievementContext(debts, payments, strategy, extraMonthly, readAchievementSignals(), {
        newWeekBest: eng.newWeekBest,
        newMonthBest: eng.newMonthBest,
        weeklyStreak: eng.weeklyStreak,
        weekPaid: eng.weekPaid,
        monthPaid: eng.monthPaid,
      }),
    [
      debts,
      payments,
      strategy,
      extraMonthly,
      eng.newWeekBest,
      eng.newMonthBest,
      eng.weeklyStreak,
      eng.weekPaid,
      eng.monthPaid,
    ],
  );

  const rows = useMemo<MilestoneRow[]>(() => {
    const u = eng.unlockedMilestones;
    return ACHIEVEMENT_CATALOG.map((entry): MilestoneRow => {
      const achieved = u.has(entry.id) || entry.check(achCtx);
      return {
        section: entry.section,
        tier: entry.tier,
        id: entry.id,
        Icon: entry.Icon,
        title: entry.title,
        gridLockedLabel: entry.gridLockedLabel,
        achieved,
        unlockSupporting: unlockSupportingFor(entry, achCtx, achieved),
      };
    });
  }, [eng.unlockedMilestones, achCtx]);

  const staggerIndexById = useMemo(() => {
    const m = new Map<string, number>();
    let i = 0;
    for (const section of WINS_SECTION_ORDER) {
      for (const r of rows.filter((x) => x.section === section)) {
        m.set(r.id, i++);
      }
    }
    return m;
  }, [rows]);

  const unlocked = rows.filter((m) => m.achieved).length;
  const total = rows.length;
  const remaining = total - unlocked;
  const journeyPct = total ? Math.round((unlocked / total) * 100) : 0;

  const collectionMotivation =
    unlocked === total
      ? "Collection complete. You crushed it."
      : remaining === 1
        ? "You're close. Unlock 1 more to complete your next collection."
        : `You're close. Unlock ${remaining} more to complete your next collection.`;

  const [popIds, setPopIds] = useState<Set<string>>(new Set());
  const [burst, setBurst] = useState(false);

  const rowsKey = rows.map((r) => `${r.id}:${r.achieved}`).join("|");

  useEffect(() => {
    if (typeof window === "undefined" || store.loading || eng.loading) return;
    const achievedNow = new Set(
      rowsKey
        .split("|")
        .filter(Boolean)
        .map((chunk) => {
          const colon = chunk.indexOf(":");
          if (colon < 0) return null as string | null;
          const id = chunk.slice(0, colon);
          const ok = chunk.slice(colon + 1) === "true";
          return ok ? id : null;
        })
        .filter((id): id is string => !!id),
    );
    let prevRaw: string[] = [];
    try {
      prevRaw = JSON.parse(localStorage.getItem(ANIM_STORE_KEY) ?? "[]") as string[];
    } catch {
      prevRaw = [];
    }
    const seen = new Set(prevRaw);
    const newcomers = [...achievedNow].filter((id) => !seen.has(id));
    if (newcomers.length === 0) return;
    newcomers.forEach((id) => seen.add(id));
    localStorage.setItem(ANIM_STORE_KEY, JSON.stringify([...seen]));
    setPopIds(new Set(newcomers));
    setBurst(true);
    const clearPop = window.setTimeout(() => setPopIds(new Set()), 1400);
    const clearBurst = window.setTimeout(() => setBurst(false), 2800);
    return () => {
      window.clearTimeout(clearPop);
      window.clearTimeout(clearBurst);
    };
  }, [rowsKey, store.loading, eng.loading]);

  if (store.loading || eng.loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 pb-8">
        <div className="space-y-3">
          <div className="h-8 max-w-xs animate-pulse rounded-lg bg-[#E5E7EB]" />
          <div className="h-4 max-w-md animate-pulse rounded bg-[#E5E7EB]" />
          <div className="h-2 max-w-lg animate-pulse rounded-full bg-[#E5E7EB]" />
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-[88px] w-[88px] animate-pulse rounded-full bg-[#E5E7EB] sm:h-[104px] sm:w-[104px]" />
              <div className="h-3 w-20 animate-pulse rounded bg-[#E5E7EB]" />
              <div className="h-2 w-16 animate-pulse rounded bg-[#E5E7EB]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl bg-white pb-8">
      <WinsPageConfetti active={!reduce && burst} />

      <motion.header
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: "easeOut" }}
        className="border-b border-[#E5E7EB] pb-7 dark:border-zinc-800 sm:pb-7"
      >
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl dark:text-zinc-100">
            Achievements
          </h1>
          <p className="max-w-xl text-base text-[#475569] dark:text-zinc-400">
            Celebrate every step toward debt freedom.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="font-display text-4xl font-black tabular-nums tracking-tight text-[#FF6A00] sm:text-5xl">
              {unlocked} / {total}
            </p>
            <p className="mt-0.5 text-sm font-semibold uppercase tracking-wide text-[#64748B] dark:text-zinc-500">
              unlocked
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-[#475569] dark:text-zinc-400">
          {collectionMotivation}
        </p>

        <div className="mt-6 max-w-2xl">
          <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-zinc-500">
            <span>Collection progress</span>
            <span className="tabular-nums">{journeyPct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#E5E7EB] dark:bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] via-[#FB923C] to-[#FACC15] shadow-[0_0_16px_rgba(255,106,0,0.35)]"
              initial={reduce ? { width: `${journeyPct}%` } : { width: 0 }}
              animate={{ width: `${journeyPct}%` }}
              transition={
                reduce ? { duration: 0.15 } : { duration: 0.8, delay: 0.2, ease: "easeOut" }
              }
            />
          </div>
        </div>
      </motion.header>

      <motion.div
        className="mt-7"
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: "easeOut", delay: 0.06 }}
      >
        <WinsPersonalBestHero eng={eng} compact />
      </motion.div>

      <div className="mt-8 space-y-0">
        {WINS_SECTION_ORDER.map((section, sectionIndex) => {
          const inSection = rows.filter((r) => r.section === section);
          const sectionUnlocks = inSection.filter((r) => r.achieved).length;

          return (
            <motion.section
              key={section}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0.15 }
                  : {
                      duration: 0.45,
                      ease: "easeOut",
                      delay: 0.05 + sectionIndex * 0.05,
                    }
              }
              aria-labelledby={`achievement-section-${section}`}
              className="border-b border-[#E5E7EB] py-6 last:border-b-0 dark:border-zinc-800 sm:py-8"
            >
              <div className="mb-5 flex flex-col gap-1 sm:mb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#FF6A00]" aria-hidden />
                  <h2
                    id={`achievement-section-${section}`}
                    className="text-xl font-black tracking-tight text-[#0F172A] dark:text-zinc-100"
                  >
                    {WINS_SECTION_TITLE[section]}
                  </h2>
                </div>
                <p className="text-sm font-semibold text-[#64748B] dark:text-zinc-500">
                  {sectionUnlocks} of {inSection.length} unlocked
                </p>
                <p className="max-w-2xl text-xs leading-relaxed text-[#94A3B8] dark:text-zinc-500">
                  {SECTION_MOTIVATION[section]}
                </p>
              </div>

              <ul className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-7 md:grid-cols-3 md:gap-y-8 lg:grid-cols-4 xl:grid-cols-5">
                {inSection.map((m) => (
                  <li key={m.id} className="w-full max-w-[180px]">
                    <BadgeAchievement
                      milestoneId={m.id}
                      section={m.section}
                      tier={m.tier}
                      achieved={m.achieved}
                      Icon={m.Icon}
                      displayName={BADGE_DISPLAY_NAME[m.id] ?? m.title}
                      supportingUnlocked={m.unlockSupporting}
                      supportingLocked={m.gridLockedLabel}
                      index={staggerIndexById.get(m.id) ?? 0}
                      justUnlocked={popIds.has(m.id)}
                    />
                  </li>
                ))}
              </ul>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
