import type { LucideIcon } from "lucide-react";
import type { AchievementCtx } from "./context";

export type MilestoneTier = "small" | "big" | "major";

export type WinsSection =
  | "getting-started"
  | "building-momentum"
  | "progress-milestones"
  | "money-milestones"
  | "debt-knockout"
  | "smart-behavior"
  | "comeback"
  | "major-milestones"
  | "debt-free";

export type AchievementCheck = (ctx: AchievementCtx) => boolean;

export interface AchievementCatalogEntry {
  id: string;
  section: WinsSection;
  tier: MilestoneTier;
  title: string;
  subtitle: string;
  lockedHint: string;
  gridLockedLabel: string;
  Icon: LucideIcon;
  check: AchievementCheck;
}
