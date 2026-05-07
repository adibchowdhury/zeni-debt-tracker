import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-100
  className?: string;
  /** Override fill classes (e.g. `transition-none` when width is driven every frame by JS). */
  fillClassName?: string;
}

export function ProgressBar({ value, className = "", fillClassName }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-[#FF6A00] via-[#FB923C] to-[#FACC15] transition-all duration-700 ease-out",
          fillClassName,
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
