import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/zeni-logo.png";

interface LogoProps {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "h-6",
  md: "h-7 sm:h-8",
  lg: "h-10 sm:h-12",
} as const;

/**
 * Zeni brand lockup — gold coin + "zeni" wordmark.
 * Renders the original SVG inside a tightened viewBox so the artwork
 * fills the rendered box (no extra whitespace from the source asset).
 */
export function Logo({ to = "/", className = "", size = "md" }: LogoProps) {
  const content = (
    <img src={logoUrl} alt="zeni" className={`${SIZE_MAP[size]} w-auto block ${className}`} />
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex items-center" aria-label="zeni home">
      {content}
    </Link>
  );
}
