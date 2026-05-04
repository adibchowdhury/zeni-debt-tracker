interface Props {
  value: number; // 0-100
  className?: string;
}

export function ProgressBar({ value, className = "" }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] via-[#FB923C] to-[#FACC15] transition-all duration-700 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
