import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { MilestoneTier, WinsSection } from "@/lib/milestone-catalog";

export type BadgeVisualSize = "normal" | "major" | "final";

const SPRING_HOVER = { type: "spring" as const, stiffness: 340, damping: 20 };

const CATEGORY_UNLOCKED: Record<WinsSection, { ring: string; face: string }> = {
  "getting-started": {
    ring: "bg-gradient-to-br from-[#FACC15] via-[#FF9F2E] to-[#FF6A00]",
    face: "bg-gradient-to-br from-[#FFB347] via-[#FF8A1F] to-[#FF6A00]",
  },
  "building-momentum": {
    ring: "bg-gradient-to-br from-[#FACC15] via-[#FF6A00] to-[#EA580C]",
    face: "bg-gradient-to-br from-[#FF7A00] via-[#FF6A00] to-[#EA580C]",
  },
  "major-milestones": {
    ring: "bg-gradient-to-br from-[#FACC15] via-[#FF6A00] to-[#DC2626]",
    face: "bg-gradient-to-br from-[#FF6A00] via-[#F4511E] to-[#DC2626]",
  },
  "debt-free": {
    ring: "bg-gradient-to-br from-[#FDE68A] via-[#FACC15] to-[#FF6A00]",
    face: "bg-gradient-to-br from-[#FACC15] via-[#FF9F2E] to-[#EA580C]",
  },
  "progress-milestones": {
    ring: "bg-gradient-to-br from-[#FACC15] via-[#FF8A1F] to-[#EA580C]",
    face: "bg-gradient-to-br from-[#FF9F2E] via-[#FF6A00] to-[#EA580C]",
  },
  "money-milestones": {
    ring: "bg-gradient-to-br from-[#FDE68A] via-[#FF6A00] to-[#C2410C]",
    face: "bg-gradient-to-br from-[#FF7A00] via-[#FF6A00] to-[#EA580C]",
  },
  "debt-knockout": {
    ring: "bg-gradient-to-br from-[#FACC15] via-[#FF6A00] to-[#DC2626]",
    face: "bg-gradient-to-br from-[#FF6A00] via-[#F4511E] to-[#DC2626]",
  },
  "smart-behavior": {
    ring: "bg-gradient-to-br from-[#FACC15] via-[#FF9F2E] to-[#FF6A00]",
    face: "bg-gradient-to-br from-[#FFB347] via-[#FF8A1F] to-[#FF6A00]",
  },
  "comeback": {
    ring: "bg-gradient-to-br from-[#E2E8F0] via-[#FDBA74] to-[#FF6A00]",
    face: "bg-gradient-to-br from-[#FFEDD5] via-[#FF6A00] to-[#EA580C]",
  },
};

/** Aspirational muted rings — not flat gray */
const CATEGORY_LOCKED: Record<WinsSection, { ring: string; face: string }> = {
  "getting-started": {
    ring: "bg-gradient-to-br from-[#FEF9C3] via-[#FDE68A] to-[#A8A29E]",
    face: "bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#E7E5E4]",
  },
  "building-momentum": {
    ring: "bg-gradient-to-br from-[#FDE68A] via-[#FDBA74] to-[#94A3B8]",
    face: "bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#E7E5E4]",
  },
  "major-milestones": {
    ring: "bg-gradient-to-br from-[#FECACA] via-[#FB923C]/85 to-[#B91C1C]/45",
    face: "bg-gradient-to-br from-[#FFF1F2] via-[#FFE4E6] to-[#F1F5F9]",
  },
  "debt-free": {
    ring: "bg-gradient-to-br from-[#FDE68A] via-[#FBBF24] to-[#FB923C]",
    face: "bg-gradient-to-br from-[#FFF7ED] via-[#FFF1E6] to-[#F8FAFC]",
  },
  "progress-milestones": {
    ring: "bg-gradient-to-br from-[#FDE68A] via-[#FDBA74] to-[#94A3B8]",
    face: "bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#E7E5E4]",
  },
  "money-milestones": {
    ring: "bg-gradient-to-br from-[#FDE68A] via-[#FB923C] to-[#94A3B8]",
    face: "bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#E7E5E4]",
  },
  "debt-knockout": {
    ring: "bg-gradient-to-br from-[#FECACA] via-[#FB923C]/85 to-[#B91C1C]/45",
    face: "bg-gradient-to-br from-[#FFF1F2] via-[#FFE4E6] to-[#F1F5F9]",
  },
  "smart-behavior": {
    ring: "bg-gradient-to-br from-[#FEF9C3] via-[#FDE68A] to-[#A8A29E]",
    face: "bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#E7E5E4]",
  },
  "comeback": {
    ring: "bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8]",
    face: "bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]",
  },
};

const FINAL_IDS = new Set(["all-clear"]);

const MAJOR_DISPLAY_IDS = new Set([
  "first-clear",
  "halfway",
  "streak-30",
  "cleared-5",
  "largest-down",
  "highest-apr-gone",
  "paid-10000",
  "paid-15000",
  "paid-25000",
  "paid-50000",
  "pct-90",
  "pct-95",
  "consistent-60",
  "consistent-90",
  "debt-free-30",
  "debt-free-90",
  "almost-free",
]);

export function badgeVisualSize(milestoneId: string): BadgeVisualSize {
  if (FINAL_IDS.has(milestoneId)) return "final";
  if (MAJOR_DISPLAY_IDS.has(milestoneId)) return "major";
  return "normal";
}

function innerSizeClasses(milestoneId: string, size: BadgeVisualSize): string {
  if (milestoneId === "halfway") {
    return "h-[96px] w-[96px] sm:h-[112px] sm:w-[112px]";
  }
  switch (size) {
    case "final":
      return "h-[120px] w-[120px] sm:h-[148px] sm:w-[148px]";
    case "major":
      return "h-[104px] w-[104px] sm:h-[124px] sm:w-[124px]";
    default:
      return "h-[88px] w-[88px] sm:h-[104px] sm:w-[104px]";
  }
}

function iconSizeClasses(milestoneId: string, size: BadgeVisualSize): string {
  if (milestoneId === "halfway") {
    return "h-10 w-10 sm:h-11 sm:w-11";
  }
  switch (size) {
    case "final":
      return "h-11 w-11 sm:h-12 sm:w-12";
    case "major":
      return "h-10 w-10 sm:h-11 sm:w-11";
    default:
      return "h-9 w-9 sm:h-10 sm:w-10";
  }
}

function isEpicBadge(milestoneId: string): boolean {
  return milestoneId === "halfway" || milestoneId === "first-clear" || milestoneId === "all-clear";
}

export interface BadgeAchievementProps {
  milestoneId: string;
  section: WinsSection;
  tier: MilestoneTier;
  achieved: boolean;
  Icon: LucideIcon;
  displayName: string;
  supportingUnlocked: string;
  supportingLocked: string;
  index: number;
  justUnlocked?: boolean;
}

export function BadgeAchievement({
  milestoneId,
  section,
  tier,
  achieved,
  Icon,
  displayName,
  supportingUnlocked,
  supportingLocked,
  index,
  justUnlocked,
}: BadgeAchievementProps) {
  const reduce = useReducedMotion();
  const [hoverShine, setHoverShine] = useState(0);

  const size = badgeVisualSize(milestoneId);
  const isFinal = milestoneId === "all-clear";
  const isHalfway = milestoneId === "halfway";
  const epic = isEpicBadge(milestoneId);
  const majorMotion = tier === "major" || epic;
  const showMajorPill = isHalfway && achieved;
  const idleMedalPulse =
    achieved && (milestoneId === "halfway" || milestoneId === "all-clear");

  const cat = CATEGORY_UNLOCKED[section];
  const lockedPalette = CATEGORY_LOCKED[section];

  const unlockedRingClass = cat.ring;
  const unlockedFaceBase =
    isFinal && achieved
      ? "bg-gradient-to-br from-[#FACC15] via-[#FF9F2E] to-[#EA580C]"
      : cat.face;

  const isHalfwayUnlocked = isHalfway && achieved;
  const ringShadowUnlocked = (() => {
    if (isFinal && achieved) {
      return "shadow-[0_14px_38px_rgba(255,106,0,0.32)] hover:shadow-[0_20px_52px_rgba(253,224,71,0.38),0_0_48px_rgba(255,106,0,0.28)]";
    }
    if (isHalfwayUnlocked) {
      return "shadow-[0_12px_30px_rgba(255,106,0,0.25),0_0_40px_rgba(255,106,0,0.24)] hover:shadow-[0_18px_44px_rgba(255,106,0,0.4),0_0_52px_rgba(255,106,0,0.3)]";
    }
    if (majorMotion && achieved) {
      return "shadow-[0_12px_30px_rgba(255,106,0,0.26)] hover:shadow-[0_18px_46px_rgba(255,106,0,0.42),0_0_36px_rgba(220,38,38,0.12)]";
    }
    return "shadow-[0_12px_30px_rgba(255,106,0,0.25)] hover:shadow-[0_18px_44px_rgba(255,106,0,0.4),0_0_32px_rgba(255,106,0,0.18)]";
  })();

  const ringShadowLocked =
    isFinal && !achieved
      ? "shadow-[0_10px_28px_rgba(251,191,36,0.18),0_0_36px_rgba(251,191,36,0.26)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.22),0_0_42px_rgba(251,191,36,0.28)]"
      : "shadow-[0_8px_22px_rgba(15,23,42,0.07)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)]";

  const lockedRing = lockedPalette.ring;
  const lockedFace = lockedPalette.face;

  const label = achieved
    ? `${displayName}. ${supportingUnlocked}`
    : `${displayName}. Locked. ${supportingLocked}`;

  const hoverUnlocked =
    reduce || !achieved
      ? {}
      : majorMotion
        ? { y: -10, scale: 1.1, rotate: -0.5 }
        : { y: -8, scale: 1.08 };

  const hoverLocked = reduce || achieved ? {} : { y: -3, scale: 1.03 };

  const supportingClass = achieved ? "text-[#64748B]" : "text-[#94A3B8]";

  const pop = !!(justUnlocked && !reduce);
  const popReduce = !!(justUnlocked && reduce);

  const iconHoverClass =
    reduce || !achieved
      ? ""
      : majorMotion
        ? "transition-transform duration-300 ease-out group-hover:-rotate-[8deg] group-hover:scale-[1.12]"
        : "transition-transform duration-300 ease-out group-hover:-rotate-[6deg] group-hover:scale-[1.1]";

  const ringTiltClass =
    reduce || !achieved
      ? ""
      : majorMotion
        ? "origin-center transition-transform duration-300 ease-out group-hover:-rotate-[0.45deg]"
        : "origin-center transition-transform duration-300 ease-out group-hover:-rotate-[0.18deg]";

  return (
    <motion.div
      id={`milestone-badge-${milestoneId}`}
      role="group"
      aria-label={label}
      className="flex flex-col items-center text-center"
      initial={
        reduce
          ? { opacity: 1, y: 0, scale: 1 }
          : popReduce
            ? { opacity: 0.4, scale: 0.98 }
            : pop
              ? { scale: 0.8, opacity: 0, y: 10 }
              : { opacity: 0, y: 20, scale: 0.9 }
      }
      animate={
        reduce
          ? { opacity: 1, y: 0, scale: 1 }
          : popReduce
            ? { opacity: 1, scale: 1, y: 0 }
            : pop
              ? { scale: [0.8, 1.15, 1], opacity: 1, y: 0 }
              : { opacity: 1, y: 0, scale: 1 }
      }
      transition={
        reduce
          ? { duration: 0.2 }
          : pop || popReduce
            ? pop
              ? { duration: 0.5, ease: "easeOut", delay: index * 0.05 }
              : { duration: 0.35, ease: "easeOut", delay: index * 0.05 }
            : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
    >
      <motion.div
        className={`group relative ${!achieved ? "cursor-default" : ""} ${isFinal && !achieved ? "pt-2" : ""}`}
        whileHover={achieved ? hoverUnlocked : hoverLocked}
        transition={SPRING_HOVER}
        onPointerEnter={() => {
          if (achieved && !reduce) setHoverShine((n) => n + 1);
        }}
      >
        {pop && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#FACC15]/55 via-[#FF6A00]/40 to-[#FBBF24]/30 blur-2xl sm:h-36 sm:w-36"
            initial={{ scale: 0.55, opacity: 0.7 }}
            animate={{ scale: 2.15, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}

        {pop && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute z-[25] h-1 w-1 rounded-full bg-[#FEF9C3] shadow-sm ring-1 ring-[#FACC15]/50"
                style={{
                  top: `${18 + i * 14}%`,
                  left: `${62 + i * 10}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ duration: 0.55, delay: 0.08 + i * 0.07, ease: "easeOut" }}
              />
            ))}
          </>
        )}

        {showMajorPill && (
          <span className="absolute -right-1 -top-1 z-30 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#DC2626] px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide text-white shadow-sm ring-2 ring-white sm:text-[8px]">
            MAJOR
          </span>
        )}

        {isFinal && !achieved && (
          <span className="absolute -top-2 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-[#B45309] shadow-sm ring-1 ring-[#FDE68A]">
            Final badge
          </span>
        )}

        <div
          className={`relative z-10 rounded-full transition-shadow duration-300 ${
            achieved
              ? `${unlockedRingClass} p-[4px] ${ringShadowUnlocked} ${ringTiltClass} ${
                  idleMedalPulse && !reduce ? "animate-achievement-medal-idle" : ""
                }`
              : `${lockedRing} p-[4px] ${ringShadowLocked} origin-center`
          }`}
        >
          <div
            className={`relative ${innerSizeClasses(milestoneId, size)} overflow-hidden rounded-full ${
              achieved ? unlockedFaceBase : `${lockedFace} opacity-[0.9]`
            }`}
          >
            {achieved && (
              <>
                <div
                  className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.55), transparent 30%)",
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-full mix-blend-multiply"
                  style={{
                    background:
                      "radial-gradient(circle at 75% 85%, rgba(124,45,18,0.18), transparent 36%)",
                  }}
                  aria-hidden
                />
              </>
            )}

            {achieved && !reduce && (
              <motion.div
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
                aria-hidden
              >
                <motion.div
                  className="absolute -inset-y-6 -left-[55%] w-[70%] bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-0"
                  initial={{ x: "-20%", opacity: 0 }}
                  animate={{ x: ["-20%", "85%"], opacity: [0, 0.28, 0] }}
                  transition={{
                    duration: 1.05,
                    delay: 0.1 + index * 0.05,
                    ease: "easeOut",
                    times: [0, 0.5, 1],
                  }}
                  style={{ transform: "rotate(16deg)" }}
                />
              </motion.div>
            )}

            {achieved && isFinal && !reduce && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.18, 0] }}
                transition={{
                  duration: 2.2,
                  delay: 0.45 + index * 0.04,
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "radial-gradient(circle at 50% 48%, rgba(253,224,71,0.32), transparent 58%)",
                }}
                aria-hidden
              />
            )}

            {achieved && !reduce && hoverShine > 0 && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" key={hoverShine}>
                <motion.div
                  className="absolute -inset-y-8 -left-[60%] w-[55%] bg-gradient-to-r from-transparent via-white/28 to-transparent"
                  initial={{ x: "-30%", opacity: 0 }}
                  animate={{ x: "190%", opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{ transform: "rotate(18deg)" }}
                  aria-hidden
                />
              </div>
            )}

            <div className={`relative z-10 flex items-center justify-center ${iconHoverClass}`}>
              <Icon
                className={`${iconSizeClasses(milestoneId, size)} ${
                  achieved ? "text-white drop-shadow-sm" : "text-[#94A3B8]/85"
                }`}
                strokeWidth={2.5}
                aria-hidden
              />
            </div>
          </div>
        </div>

        {!achieved && (
          <div
            className="absolute -bottom-1 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#64748B] shadow-sm ring-1 ring-[#E5E7EB]"
            aria-hidden
          >
            <Lock className="h-2.5 w-2.5" />
            Locked
          </div>
        )}
      </motion.div>

      <h3 className="mt-5 max-w-[148px] text-balance text-sm font-bold leading-snug text-[#0F172A] dark:text-zinc-100">
        {displayName}
      </h3>
      <p className={`mt-1 max-w-[160px] text-balance text-xs leading-snug ${supportingClass}`}>
        {achieved ? supportingUnlocked : supportingLocked}
      </p>
    </motion.div>
  );
}
