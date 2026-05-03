import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Star } from "lucide-react";
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
import { WinsMilestoneCard } from "@/components/debt/WinsMilestoneCard";
import { WinsPersonalBestHero } from "@/components/debt/WinsPersonalBestHero";
import { WinsPageConfetti } from "@/components/debt/WinsPageConfetti";
const ANIM_STORE_KEY = "zeni:wins-milestone-first-seen-v1";

export const Route = createFileRoute("/app/milestones")({
  component: MilestonesPage,
});

interface MilestoneRow {
  section: WinsSection;
  tier: MilestoneTier;
  id: string;
  Icon: (typeof MILESTONE_CATALOG)[number]["Icon"];
  title: string;
  subtitle: string;
  lockedHint: string;
  achieved: boolean;
  heroStat?: string | null;
  heroStatCaption?: string;
}

function MilestonesPage() {
  const reduce = useReducedMotion();
  const store = useDebtStore();
  const eng = useEngagement();
  const { debts, payments } = store;

  const rows = useMemo<MilestoneRow[]>(() => {
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const totalInitial = debts.reduce((s, d) => s + d.initialBalance, 0);
    const pct = totalInitial > 0 ? (totalPaid / totalInitial) * 100 : 0;
    const debtsCleared = debts.filter((d) => d.balance <= 0.01).length;
    const u = eng.unlockedMilestones;

    return MILESTONE_CATALOG.map((entry): MilestoneRow => {
      let achieved = false;
      switch (entry.id) {
        case "first-debt":
          achieved = u.has("first-debt") || debts.length > 0;
          break;
        case "first-payment":
          achieved = u.has("first-payment") || payments.length > 0;
          break;
        case "10pct":
          achieved = u.has("10pct") || pct >= 10;
          break;
        case "500-paid":
          achieved = u.has("500-paid") || totalPaid >= 500;
          break;
        case "1k-paid":
          achieved = u.has("1k-paid") || totalPaid >= 1000;
          break;
        case "halfway":
          achieved = u.has("halfway") || pct >= 50;
          break;
        case "first-clear":
          achieved = u.has("first-clear") || debtsCleared >= 1;
          break;
        case "all-clear":
          achieved = u.has("all-clear") || (debts.length > 0 && debtsCleared === debts.length);
          break;
        default:
          break;
      }

      let heroStat: string | null = null;
      let heroStatCaption: string | undefined;

      switch (entry.id) {
        case "10pct":
          if (achieved) {
            heroStat = `${pct.toFixed(1)}%`;
            heroStatCaption = "Paid off total";
          }
          break;
        case "halfway":
          if (achieved) {
            heroStat = `${pct.toFixed(0)}%`;
            heroStatCaption = "Debt crushed";
          }
          break;
        case "500-paid":
        case "1k-paid":
          if (achieved) {
            heroStat = formatMoney(totalPaid);
            heroStatCaption = "Lifetime payments";
          }
          break;
        default:
          break;
      }

      return {
        section: entry.section,
        tier: entry.tier,
        id: entry.id,
        Icon: entry.Icon,
        title: entry.title,
        subtitle: entry.subtitle,
        lockedHint: entry.lockedHint,
        achieved,
        heroStat,
        heroStatCaption,
      };
    });
  }, [debts, payments, eng.unlockedMilestones]);

  const orderedCards = useMemo(
    () => WINS_SECTION_ORDER.flatMap((section) => rows.filter((r) => r.section === section)),
    [rows],
  );

  const unlocked = rows.filter((m) => m.achieved).length;
  const journeyPct = rows.length ? Math.round((unlocked / rows.length) * 100) : 0;

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
      <div className="space-y-4">
        <div className="h-10 max-w-xs animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-3xl bg-muted/80" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-40 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-10 pb-6">
      <WinsPageConfetti active={!reduce && burst} />

      <motion.header
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: "easeOut" }}
        className="space-y-3"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#EA580C]">
              <Sparkles className="h-5 w-5" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-widest">Your journey</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Wins & milestones
            </h1>
          </div>
          <div className="rounded-2xl border border-[#F97316]/35 bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] px-4 py-2 text-right shadow-soft dark:border-[#F97316]/25 dark:from-zinc-900 dark:to-zinc-900">
            <div className="font-display text-3xl font-black tabular-nums text-[#C2410C]">
              {unlocked}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#78716C] dark:text-zinc-500">
              of {rows.length} unlocked
            </div>
          </div>
        </div>
        <p className="max-w-xl text-sm text-[#57534E] dark:text-zinc-400">
          Every badge is leverage on your habits. Locked ones aren’t skipped — they’re waiting for
          you.
        </p>
        <div className="max-w-md">
          <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-zinc-500">
            <span>Journey progress</span>
            <span className="tabular-nums">{journeyPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F3E8DC]/90 dark:bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#FACC15] shadow-[0_0_12px_rgba(249,115,22,0.35)]"
              initial={reduce ? { width: `${journeyPct}%` } : { width: 0 }}
              animate={{ width: `${journeyPct}%` }}
              transition={
                reduce ? { duration: 0.15 } : { duration: 0.8, delay: 0.25, ease: "easeOut" }
              }
            />
          </div>
        </div>
      </motion.header>

      <WinsPersonalBestHero eng={eng} />

      <div className="mt-12 space-y-12">
        {WINS_SECTION_ORDER.map((section, sectionIndex) => {
          const inSection = rows.filter((r) => r.section === section);
          const sectionUnlocks = inSection.filter((r) => r.achieved).length;

          return (
            <motion.section
              key={section}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0.15 }
                  : {
                      duration: 0.45,
                      ease: "easeOut",
                      delay: 0.15 + sectionIndex * 0.06,
                    }
              }
            >
              <div className="mb-5 flex flex-wrap items-center justify-center gap-2 px-1 text-center sm:gap-3">
                <span className="hidden h-px min-w-[2rem] flex-1 bg-gradient-to-r from-transparent via-[#D6D3D1] to-[#D6D3D1] sm:block dark:via-zinc-600" />
                <Star className="h-3.5 w-3.5 shrink-0 text-[#F97316]" aria-hidden />
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#78716C] dark:text-zinc-400">
                  {WINS_SECTION_TITLE[section]}
                </span>
                <span className="rounded-full bg-[#FFF4E6] px-2.5 py-0.5 text-[10px] font-black tabular-nums text-[#C2410C] dark:bg-zinc-800 dark:text-orange-400">
                  {sectionUnlocks}/{inSection.length}
                </span>
                <span className="hidden h-px min-w-[2rem] flex-1 bg-gradient-to-l from-transparent via-[#D6D3D1] to-[#D6D3D1] sm:block dark:via-zinc-600" />
              </div>

              <div
                className={
                  section === "debt-free" ? "grid gap-4" : "grid gap-4 sm:gap-5 lg:grid-cols-2"
                }
              >
                {inSection.map((m) => (
                  <WinsMilestoneCard
                    key={m.id}
                    milestoneId={m.id}
                    tier={m.tier}
                    achieved={m.achieved}
                    justUnlocked={popIds.has(m.id)}
                    index={Math.max(
                      0,
                      orderedCards.findIndex((r) => r.id === m.id),
                    )}
                    Icon={m.Icon}
                    title={m.title}
                    subtitle={m.subtitle}
                    lockedHint={m.lockedHint}
                    heroStat={m.heroStat ?? null}
                    heroStatCaption={m.heroStatCaption}
                  />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
