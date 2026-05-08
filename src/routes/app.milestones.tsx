import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function useCarouselControls() {
  const ref = useRef<HTMLUListElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft < max - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollByCards = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    // Page by one viewport so we never land on partial badges.
    const delta = dir * el.clientWidth;
    const next = clamp(el.scrollLeft + delta, 0, el.scrollWidth - el.clientWidth);
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  return { ref, canLeft, canRight, scrollByCards };
}

function AchievementRow({
  reduce,
  section,
  sectionIndex,
  inSection,
  sectionUnlocks,
  staggerIndexById,
  popIds,
}: {
  reduce: boolean;
  section: WinsSection;
  sectionIndex: number;
  inSection: MilestoneRow[];
  sectionUnlocks: number;
  staggerIndexById: Map<string, number>;
  popIds: Set<string>;
}) {
  const carousel = useCarouselControls();

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
      className="py-7 sm:py-9"
    >
      <div className="mb-4 flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#FF6A00]" aria-hidden />
            <h2
              id={`achievement-section-${section}`}
              className="font-display text-xl font-bold tracking-tight text-heading"
            >
              {WINS_SECTION_TITLE[section]}
            </h2>
          </div>
          <p className="text-sm font-semibold text-[#64748B]">
            {sectionUnlocks} of {inSection.length} unlocked
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => carousel.scrollByCards(-1)}
          className={`absolute -left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 p-2 shadow-sm backdrop-blur transition-opacity sm:flex ${
            carousel.canLeft ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-label={`Scroll ${WINS_SECTION_TITLE[section]} left`}
        >
          <ChevronLeft className="h-4 w-4 text-heading" />
        </button>

        <button
          type="button"
          onClick={() => carousel.scrollByCards(1)}
          className={`absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 p-2 shadow-sm backdrop-blur transition-opacity sm:flex ${
            carousel.canRight ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-label={`Scroll ${WINS_SECTION_TITLE[section]} right`}
        >
          <ChevronRight className="h-4 w-4 text-heading" />
        </button>

        <ul
          ref={carousel.ref}
          className="grid grid-flow-col gap-6 overflow-x-auto overflow-y-visible px-2 pt-6 pb-10 pr-14 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [scroll-snap-stop:always] [scroll-snap-type:x_mandatory] auto-cols-[calc((100%-24px)/2)] sm:auto-cols-[calc((100%-48px)/3)] lg:auto-cols-[calc((100%-96px)/5)]"
        >
          {inSection.map((m) => (
            <li key={m.id} className="flex snap-start items-start justify-center">
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
      </div>
    </motion.section>
  );
}

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
  if (id.startsWith("pct-") || id === "10pct" || id === "halfway" || id === "almost-free") {
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
  const reduce = useReducedMotion() ?? false;
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
          <div className="h-8 max-w-xs animate-pulse rounded-lg bg-muted" />
          <div className="h-4 max-w-md animate-pulse rounded bg-muted" />
          <div className="h-2 max-w-lg animate-pulse rounded-full bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-[88px] w-[88px] animate-pulse rounded-full bg-muted sm:h-[104px] sm:w-[104px]" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-2 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl bg-background px-5 pb-8">
      <WinsPageConfetti active={!reduce && burst} />

      <motion.header
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: "easeOut" }}
        className="border-b border-border pb-7 sm:pb-7"
      >
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Achievements
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Celebrate every step toward debt freedom.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="font-display text-4xl font-black tabular-nums tracking-tight text-[#FF6A00] sm:text-5xl">
              {unlocked} / {total}
            </p>
            <p className="mt-0.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              unlocked
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
          {collectionMotivation}
        </p>
      </motion.header>

      <div className="mt-8 space-y-0">
        {WINS_SECTION_ORDER.map((section, sectionIndex) => {
          const inSection = rows.filter((r) => r.section === section);
          const sectionUnlocks = inSection.filter((r) => r.achieved).length;
          return (
            <AchievementRow
              reduce={reduce}
              section={section}
              sectionIndex={sectionIndex}
              inSection={inSection}
              sectionUnlocks={sectionUnlocks}
              staggerIndexById={staggerIndexById}
              popIds={popIds}
            />
          );
        })}
      </div>
    </div>
  );
}
