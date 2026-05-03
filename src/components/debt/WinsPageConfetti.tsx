import { useEffect, useState } from "react";

/** Short celebratory overlay — reused pattern from MilestoneCelebration */
export function WinsPageConfetti({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [active]);

  if (!visible) return null;

  const dots = Array.from({ length: 18 });
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto flex h-48 max-w-lg justify-center px-6"
      aria-hidden
    >
      <div className="relative h-full w-full overflow-hidden rounded-b-[3rem]">
        {dots.map((_, i) => {
          const left = ((i * 51) % 100) / 100;
          const delay = (i % 6) * 0.08;
          const duration = 1.35 + ((i * 0.11) % 1);
          const colors = ["bg-primary", "bg-success", "bg-accent", "bg-teal"];
          const color = colors[i % colors.length];
          return (
            <span
              key={i}
              className={`absolute top-0 h-2 w-2 rounded-sm ${color} opacity-0`}
              style={{
                left: `${left * 100}%`,
                animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
