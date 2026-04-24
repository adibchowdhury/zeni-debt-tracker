import { Link } from "@tanstack/react-router";

interface LogoProps {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
}

const SIZE_MAP = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

/**
 * Zeni wordmark — lowercase "zeni" in Switzer SemiBold with tightened tracking.
 * Renders as crisp text using the Switzer webfont (loaded in styles.css).
 */
export function Logo({ to = "/", className = "", size = "md", variant = "dark" }: LogoProps) {
  const colorClass = variant === "light" ? "text-white" : "text-foreground";
  const content = (
    <span
      className={`font-zeni ${SIZE_MAP[size]} ${colorClass} ${className}`}
      style={{ fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}
    >
      zeni
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex items-center" aria-label="zeni home">
      {content}
    </Link>
  );
}
