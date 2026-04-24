import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/zeni-logo.svg";

interface LogoProps {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Bounding box of artwork inside the original 1500x1500 SVG canvas.
// Computed from the trimmed raster (1492x482 of 2000x2000 → scaled to 1500 units).
const BBOX = { x: 208, y: 572, w: 1119, h: 362 };

const SIZE_MAP = {
  sm: "h-8",
  md: "h-10 sm:h-12",
  lg: "h-14 sm:h-16",
} as const;

/**
 * Zeni brand lockup — gold coin + "zeni" wordmark.
 * Renders the original SVG inside a tightened viewBox so the artwork
 * fills the rendered box (no extra whitespace from the source asset).
 */
export function Logo({ to = "/", className = "", size = "md" }: LogoProps) {
  const aspect = BBOX.w / BBOX.h;
  const content = (
    <svg
      viewBox={`${BBOX.x} ${BBOX.y} ${BBOX.w} ${BBOX.h}`}
      preserveAspectRatio="xMidYMid meet"
      className={`${SIZE_MAP[size]} w-auto block ${className}`}
      style={{ aspectRatio: aspect }}
      role="img"
      aria-label="zeni"
    >
      <image href={logoUrl} x="0" y="0" width="1500" height="1500" />
    </svg>
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex items-center" aria-label="zeni home">
      {content}
    </Link>
  );
}
