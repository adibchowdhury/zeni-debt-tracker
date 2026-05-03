import { useState } from "react";
import { Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { MilestoneTier } from "@/lib/milestone-catalog";

interface WinsMilestoneCardProps {
  tier: MilestoneTier;
  milestoneId: string;
  achieved: boolean;
  justUnlocked?: boolean;
  index: number;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  lockedHint: string;
  heroStat?: string | null;
  heroStatCaption?: string;
}

function isFeaturedMajorStyle(tier: MilestoneTier, milestoneId: string) {
  if (tier === "major") return true;
  return milestoneId === "halfway" || milestoneId === "1k-paid";
}

export function WinsMilestoneCard({
  tier,
  milestoneId,
  achieved,
  justUnlocked,
  index,
  Icon,
  title,
  subtitle,
  lockedHint,
  heroStat,
  heroStatCaption,
}: WinsMilestoneCardProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const isMajorVisual = isFeaturedMajorStyle(tier, milestoneId);
  const padded = achieved
    ? isMajorVisual
      ? "p-6 sm:p-8"
      : tier === "big"
        ? "p-5 sm:p-6"
        : "p-4 sm:p-5"
    : isMajorVisual
      ? "p-5 sm:p-7"
      : tier === "big"
        ? "p-4 sm:p-5"
        : "p-4 sm:p-4";

  const completedBase =
    "bg-gradient-to-br from-[#FFF4C7] via-[#FFF7E6] to-[#FFE3D0] border-[#F97316]/35 shadow-[0_14px_35px_rgba(249,115,22,0.16)]";
  const completedMajor =
    "bg-gradient-to-br from-[#FFE7BA] via-[#FFF3D1] to-[#FFD8C2] border-[#EA580C]/45 shadow-[0_18px_45px_rgba(234,88,12,0.20)] before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.22),transparent_38%)] before:pointer-events-none lg:rounded-3xl";

  const lockedBase =
    "bg-[#FBFAF7] border-dashed border-[#D8D2C7] opacity-90 dark:border-zinc-600 dark:bg-zinc-900/60 dark:opacity-95";

  const cardClass = [
    "group/card relative overflow-hidden rounded-2xl border will-change-transform",
    achieved ? (isMajorVisual ? completedMajor : completedBase) : lockedBase,
    isMajorVisual && achieved ? "lg:col-span-2" : "",
    !achieved ? "cursor-not-allowed" : "cursor-default",
  ]
    .filter(Boolean)
    .join(" ");

  const hoverLift = reduce
    ? undefined
    : achieved
      ? isMajorVisual
        ? {
            y: -6,
            scale: 1.02,
            rotate: -0.35,
            transition: { type: "spring" as const, stiffness: 300, damping: 20 },
          }
        : {
            y: -4,
            scale: 1.015,
            transition: { type: "spring" as const, stiffness: 320, damping: 22 },
          }
      : { y: -2, transition: { duration: 0.2 } };

  const iconSize = isMajorVisual ? 72 : tier === "big" ? 64 : 56;
  const iconInnerClass = [
    "flex items-center justify-center rounded-2xl",
    achieved
      ? "bg-gradient-to-br from-[#F97316] to-[#DC2626] text-white shadow-[0_8px_18px_rgba(220,38,38,0.22)]"
      : "border border-[#E5E0D8] bg-white text-[#9CA3AF] dark:border-zinc-600 dark:bg-zinc-800",
  ].join(" ");

  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduce ? { duration: 0.2 } : { duration: 0.38, delay: index * 0.04, ease: "easeOut" }
      }
      whileHover={hoverLift}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={[
        cardClass,
        achieved && !reduce && !isMajorVisual
          ? "hover:shadow-[0_18px_42px_rgba(249,115,22,0.22)]"
          : "",
        achieved && !reduce && isMajorVisual
          ? "hover:shadow-[0_22px_50px_rgba(234,88,12,0.26)]"
          : "",
        justUnlocked && achieved && !reduce ? "animate-milestone-pop" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {achieved && !isMajorVisual && (
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#F97316]/10 blur-2xl"
          aria-hidden
        />
      )}

      <div className={`relative flex flex-col gap-4 sm:flex-row sm:gap-5 ${padded}`}>
        {achieved && isMajorVisual && !reduce ? (
          <motion.div
            className={`shrink-0 ${iconInnerClass}`}
            style={{ width: iconSize, height: iconSize }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="flex h-full w-full items-center justify-center"
              animate={{ rotate: hovered ? -6 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <Icon
                className={isMajorVisual ? "h-9 w-9" : "h-8 w-8"}
                strokeWidth={1.85}
                aria-hidden
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className={`shrink-0 ${iconInnerClass}`}
            style={{ width: iconSize, height: iconSize }}
            animate={
              reduce || !achieved ? {} : { rotate: hovered ? -6 : 0, scale: hovered ? 1.08 : 1 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <Icon
              className={isMajorVisual ? "h-9 w-9" : tier === "big" ? "h-8 w-8" : "h-7 w-7"}
              strokeWidth={1.85}
              aria-hidden
            />
          </motion.div>
        )}

        <div className="min-w-0 flex-1">
          {!achieved && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E5E0D8] bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#78716C] dark:border-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-400">
              <Lock className="h-3 w-3" aria-hidden />
              Locked
            </div>
          )}

          <div className="flex flex-wrap items-baseline gap-2">
            <h3
              className={`font-display font-bold tracking-tight ${
                isMajorVisual
                  ? "text-2xl sm:text-3xl"
                  : tier === "big"
                    ? "text-xl sm:text-2xl"
                    : "text-lg sm:text-xl"
              } ${achieved ? "text-foreground" : "text-[#57534E] dark:text-zinc-400"}`}
            >
              {title}
            </h3>
            {achieved && (
              <motion.span
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reduce
                    ? { duration: 0.1 }
                    : { delay: 0.12 + index * 0.04, duration: 0.35, ease: "easeOut" }
                }
                className="rounded-full border border-[#F97316]/30 bg-gradient-to-r from-[#F97316] to-[#EA580C] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
              >
                Unlocked
              </motion.span>
            )}
          </div>

          <p
            className={`mt-1.5 max-w-xl text-sm leading-relaxed ${
              achieved ? "text-[#57534E] dark:text-zinc-400" : "text-[#78716C] dark:text-zinc-500"
            }`}
          >
            {achieved ? subtitle : lockedHint}
          </p>

          {heroStat && achieved && (
            <div className="mt-4">
              {heroStatCaption && (
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#C2410C]/75">
                  {heroStatCaption}
                </div>
              )}
              <div className="font-display text-4xl font-black leading-none tracking-tight text-[#C2410C] md:text-5xl">
                {heroStat}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
