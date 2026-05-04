/** Client-side achievement signals (extends Supabase milestones without schema changes). */

const LS = {
  planViewed: "zeni:ach:plan-viewed",
  simRuns: "zeni:ach:sim-runs",
  dashDays: "zeni:ach:dash-days",
  allClearTs: "zeni:ach:all-clear-ts",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export interface AchievementSignals {
  planViewed: boolean;
  simRuns: number;
  /** ISO dates (YYYY-MM-DD), most recent last, deduped, max 120 entries */
  dashboardVisitDays: string[];
  /** ms timestamp when user first hit all-debt-zero (set once) */
  allClearAtMs: number | null;
}

export function readAchievementSignals(): AchievementSignals {
  return {
    planViewed: readJson(LS.planViewed, false),
    simRuns: readJson(LS.simRuns, 0),
    dashboardVisitDays: readJson(LS.dashDays, []),
    allClearAtMs: readJson(LS.allClearTs, null),
  };
}

export function recordStrategyPlanView(): void {
  writeJson(LS.planViewed, true);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("debtfree:refresh"));
  }
}

export function recordSimulatorRun(): void {
  const n = readJson(LS.simRuns, 0);
  writeJson(LS.simRuns, n + 1);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("debtfree:refresh"));
  }
}

/** Call once per calendar day when user opens the dashboard. */
export function recordDashboardVisit(): void {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const prev: string[] = readJson(LS.dashDays, []);
  if (prev[prev.length - 1] === iso) return;
  const next = [...prev, iso].slice(-120);
  writeJson(LS.dashDays, next);
}

/** When all debts first reach zero, stamp once for long-horizon badges. */
export function stampAllClearIfNeeded(allClear: boolean): void {
  if (!allClear || typeof window === "undefined") return;
  if (readJson(LS.allClearTs, null) != null) return;
  writeJson(LS.allClearTs, Date.now());
  window.dispatchEvent(new CustomEvent("debtfree:refresh"));
}
