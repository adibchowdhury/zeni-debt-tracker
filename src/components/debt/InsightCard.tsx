import { TrendingUp, Calendar, Zap, Clock, Target } from "lucide-react";
import type { Insight } from "@/lib/insights";

const ICONS = {
  trend: TrendingUp,
  calendar: Calendar,
  zap: Zap,
  clock: Clock,
  target: Target,
};

export function InsightCard({ insight, subtle }: { insight: Insight; subtle?: boolean }) {
  const Icon = ICONS[insight.icon];
  const toneClasses = subtle
    ? {
        primary: "border-0 bg-muted/30 text-[#0F172A]",
        success: "border-0 bg-success-soft/25 text-success",
        info: "border-0 bg-muted/30 text-[#0F172A]",
      }[insight.tone]
    : {
        primary: "border-[#E5E7EB] bg-white text-[#0F172A]",
        success: "border-success/40 bg-success-soft/40 text-success",
        info: "border-[#E5E7EB] bg-white text-[#0F172A]",
      }[insight.tone];

  const iconBg = {
    primary: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    info: "bg-teal text-teal-foreground",
  }[insight.tone];

  const shell = subtle ? "shadow-none" : "shadow-sm";

  return (
    <div className={`flex items-start gap-3 rounded-2xl p-4 ${shell} ${toneClasses}`}>
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl ${subtle ? "h-9 w-9" : "h-10 w-10"} ${iconBg}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Insight</div>
        <div className="font-display text-sm font-bold text-foreground">{insight.title}</div>
        <div className={`mt-0.5 text-muted-foreground ${subtle ? "text-xs leading-snug" : "text-sm"}`}>
          {insight.body}
        </div>
      </div>
    </div>
  );
}
