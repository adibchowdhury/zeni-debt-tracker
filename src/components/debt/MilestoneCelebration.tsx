import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";

interface Props {
  milestoneKey: string | null;
  title: string;
  subtitle: string;
  onClose: () => void;
}

const STORAGE_KEY = "zeni:celebrated-milestones";

export function getCelebrated(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markCelebrated(key: string) {
  if (typeof window === "undefined") return;
  const set = getCelebrated();
  set.add(key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function MilestoneCelebration({ milestoneKey, title, subtitle, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (milestoneKey) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [milestoneKey, onClose]);

  if (!milestoneKey) return null;

  return (
    <div
      className={`fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md justify-center px-4 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
      }`}
    >
      <div className="relative w-full overflow-hidden rounded-3xl border-2 border-primary bg-card p-5 shadow-sm">
        {/* Confetti dots */}
        <ConfettiBurst />

        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-secondary"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm animate-bounce">
            <Trophy className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Milestone unlocked
            </div>
            <div className="font-display text-lg font-bold leading-tight">{title}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfettiBurst() {
  const dots = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => {
        const left = (i * 73) % 100;
        const delay = (i % 5) * 0.15;
        const duration = 1.4 + ((i * 0.17) % 1.2);
        const colors = ["bg-primary", "bg-success", "bg-teal", "bg-warning"];
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className={`absolute top-0 h-2 w-2 rounded-sm ${color} opacity-0`}
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
