import { motion, useReducedMotion } from "framer-motion";

interface Props {
  value: number; // 0-100
  className?: string;
}

/**
 * Warmer progress track for Wins / personal-best UI.
 */
export function WinsWarmProgressBar({ value, className = "" }: Props) {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-[#F3E8DC]/80 ${className}`}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#FACC15] shadow-[0_0_12px_rgba(249,115,22,0.35)]"
        initial={reduce ? { width: `${v}%` } : { width: 0 }}
        animate={{ width: `${v}%` }}
        transition={reduce ? { duration: 0.2 } : { duration: 0.8, delay: 0.25, ease: "easeOut" }}
      />
    </div>
  );
}
