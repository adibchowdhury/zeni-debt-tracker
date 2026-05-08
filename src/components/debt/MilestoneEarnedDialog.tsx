import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements/catalog";
import { getCelebrated, markCelebrated } from "@/components/debt/MilestoneCelebration";

type EarnedEvent = CustomEvent<{ keys: string[] }>;

function nextUncelebrated(keys: string[]) {
  const celebrated = getCelebrated();
  return keys.find((k) => !celebrated.has(k)) ?? null;
}

export function MilestoneEarnedDialog() {
  const [queue, setQueue] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const activeKey = useMemo(() => nextUncelebrated(queue), [queue]);
  const entry = useMemo(
    () => (activeKey ? (ACHIEVEMENT_CATALOG.find((x) => x.id === activeKey) ?? null) : null),
    [activeKey],
  );

  useEffect(() => {
    if (!activeKey || !entry) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [activeKey, entry]);

  useEffect(() => {
    const handler = ((e: EarnedEvent) => {
      const keys = e.detail?.keys ?? [];
      if (keys.length === 0) return;
      setQueue((prev) => [...prev, ...keys]);
    }) as EventListener;
    window.addEventListener("debtfree:milestone-earned", handler);
    return () => window.removeEventListener("debtfree:milestone-earned", handler);
  }, []);

  const collect = () => {
    if (!activeKey) return;
    markCelebrated(activeKey);
    setQueue((prev) => prev.filter((k, i) => !(k === activeKey && i === prev.indexOf(activeKey))));
    setOpen(false);
  };

  if (!activeKey || !entry) return null;

  const Icon = entry.Icon;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
        <CelebrationConfetti />
        <AlertDialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-sm">
            <Icon className="h-8 w-8" aria-hidden />
          </div>
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            New badge earned
          </div>
          <AlertDialogTitle className="mt-3 font-display text-2xl font-extrabold tracking-tight text-foreground">
            {entry.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {entry.subtitle}
          </AlertDialogDescription>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium text-foreground">
            Keep going — your next win is closer than it feels.
          </p>
        </AlertDialogHeader>

        <div className="mt-5">
          <AlertDialogAction asChild>
            <Button variant="cta" className="w-full" onClick={collect}>
              Collect badge
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CelebrationConfetti() {
  const dots = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {dots.map((_, i) => {
        const left = (i * 67) % 100;
        const delay = (i % 6) * 0.12;
        const duration = 1.6 + ((i * 0.11) % 1.1);
        const colors = ["bg-primary", "bg-success", "bg-teal", "bg-warning"];
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className={`absolute -top-4 h-2 w-2 rounded-sm ${color} opacity-0`}
            style={{
              left: `${left}%`,
              animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
            }}
          />
        );
      })}
    </div>
  );
}
