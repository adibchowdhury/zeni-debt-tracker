import { lazy, Suspense, useEffect, useRef, useState } from "react";

const Lottie = lazy(() => import("lottie-react"));

type Props = {
  animationData: object;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  ariaLabel?: string;
};

/**
 * Renders a Lottie animation only after the element scrolls into view,
 * keeping initial page weight low and avoiding off-screen CPU work.
 */
export function LazyLottie({
  animationData,
  className,
  loop = true,
  autoplay = true,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={className} role="img" aria-label={ariaLabel}>
      {visible && (
        <Suspense fallback={null}>
          <Lottie
            animationData={animationData}
            loop={loop}
            autoplay={autoplay}
            rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
          />
        </Suspense>
      )}
    </div>
  );
}
