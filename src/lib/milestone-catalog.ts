import type { LucideIcon } from "lucide-react";
import {
  Footprints,
  Sparkles,
  TrendingUp,
  Coins,
  Gem,
  Mountain,
  PartyPopper,
  Crown,
} from "lucide-react";

export type MilestoneTier = "small" | "big" | "major";
export type WinsSection =
  | "getting-started"
  | "building-momentum"
  | "major-milestones"
  | "debt-free";

export const WINS_SECTION_ORDER: WinsSection[] = [
  "getting-started",
  "building-momentum",
  "major-milestones",
  "debt-free",
];

export const WINS_SECTION_TITLE: Record<WinsSection, string> = {
  "getting-started": "Getting started",
  "building-momentum": "Building momentum",
  "major-milestones": "Major milestones",
  "debt-free": "Debt-free",
};

/** Static copy + layout metadata — achievement checks remain in milestones page */
export interface MilestoneCatalogEntry {
  id: string;
  section: WinsSection;
  tier: MilestoneTier;
  title: string;
  subtitle: string;
  lockedHint: string;
  Icon: LucideIcon;
}

export const MILESTONE_CATALOG: MilestoneCatalogEntry[] = [
  {
    id: "first-debt",
    section: "getting-started",
    tier: "small",
    title: "First debt tracked",
    subtitle: "You showed up — that’s the hardest part.",
    lockedHint: "Add your first debt to unlock this badge.",
    Icon: Footprints,
  },
  {
    id: "first-payment",
    section: "getting-started",
    tier: "small",
    title: "First payment logged",
    subtitle: "Momentum beats perfection. You’re rolling.",
    lockedHint: "Log a payment to unlock — every dollar counts.",
    Icon: Sparkles,
  },
  {
    id: "10pct",
    section: "building-momentum",
    tier: "small",
    title: "10% cleared",
    subtitle: "The snowball needs a push — yours is spinning.",
    lockedHint: "Pay down 10% of your total balances to unlock.",
    Icon: TrendingUp,
  },
  {
    id: "500-paid",
    section: "building-momentum",
    tier: "big",
    title: "$500 demolished",
    subtitle: "A serious chunk carved off.",
    lockedHint: "Lifetime payments hit $500 to unlock.",
    Icon: Coins,
  },
  {
    id: "1k-paid",
    section: "building-momentum",
    tier: "big",
    title: "$1,000 conquered",
    subtitle: "Four figures of proof you’re winning.",
    lockedHint: "Reach $1,000 in total payments logged to unlock.",
    Icon: Gem,
  },
  {
    id: "halfway",
    section: "major-milestones",
    tier: "big",
    title: "Halfway there",
    subtitle: "More behind you than ahead — keep stacking.",
    lockedHint: "Pay down 50% of your balances to unlock this peak.",
    Icon: Mountain,
  },
  {
    id: "first-clear",
    section: "major-milestones",
    tier: "major",
    title: "First debt destroyed",
    subtitle: "One account at zero — that’s freedom you can feel.",
    lockedHint: "Pay off a debt completely to unlock this award.",
    Icon: PartyPopper,
  },
  {
    id: "all-clear",
    section: "debt-free",
    tier: "major",
    title: "Debt-free",
    subtitle: "You rewrote your financial story.",
    lockedHint: "Zero every balance to earn the crown.",
    Icon: Crown,
  },
];
