import { useRef, useEffect, useState, type ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right";
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animationMap: Record<string, { from: string; to: string }> = {
    "fade-up": {
      from: "opacity-0 translate-y-8",
      to: "opacity-100 translate-y-0",
    },
    "fade-in": {
      from: "opacity-0",
      to: "opacity-100",
    },
    "scale-in": {
      from: "opacity-0 scale-95",
      to: "opacity-100 scale-100",
    },
    "slide-left": {
      from: "opacity-0 -translate-x-8",
      to: "opacity-100 translate-x-0",
    },
    "slide-right": {
      from: "opacity-0 translate-x-8",
      to: "opacity-100 translate-x-0",
    },
  };

  const anim = animationMap[animation];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? anim.to : anim.from} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
