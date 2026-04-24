import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/zeni-logo.svg";

interface LogoProps {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "h-7",
  md: "h-9",
  lg: "h-12",
} as const;

/**
 * Zeni brand lockup — gold coin mark + "zeni" wordmark from the official SVG.
 */
export function Logo({ to = "/", className = "", size = "md" }: LogoProps) {
  const img = (
    <img
      src={logoUrl}
      alt="zeni"
      className={`${SIZE_MAP[size]} w-auto ${className}`}
      draggable={false}
    />
  );

  if (!to) return img;
  return (
    <Link to={to} className="inline-flex items-center" aria-label="zeni home">
      {img}
    </Link>
  );
}
