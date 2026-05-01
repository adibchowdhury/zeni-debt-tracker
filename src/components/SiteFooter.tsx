import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingDown,
  Target,
  HeartHandshake,
  ListChecks,
  Trophy,
  Calendar,
  ShieldCheck,
  Quote,
  Flame,
  Zap,
  CheckCircle2,
  Coins,
  TrendingUp,
  ChevronUp,
  Twitter,
  Linkedin,
  Instagram,
  Facebook
} from "lucide-react";
import { Logo } from "@/components/Logo";


export function SiteFooter() {
   const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const siteMap: Array<
    { label: string; to: "/signup" | "/contact" | "/about" | "/security" } | { label: string; href: string }
  > = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Get started", to: "/signup" },
    { label: "About", to: "/about"},
    { label: "Contact/Support", to: "/contact"},
  ];

  const legal = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "How We Protect Your Data", href: "/security"},
  ];

  return (
    <footer className="bg-[#1A1D23] text-[#FFFFFF]">
      <div className="bg-[#F5F1EB] text-[#2A2F36]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:py-16 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Logo to="/" size="md" className="[&_image]:brightness-0 [&_image]:invert" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#2A2F36]">
              Your supportive debt-free coach. Track every payment, stay motivated,
              and turn the long road to zero into small, encouraging wins.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-4 text-[#2A2F36]">
              <Link to="/privacy" aria-label="Twitter" className="transition hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="/privacy" href="#" aria-label="LinkedIn" className="transition hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link to="/privacy" aria-label="Instagram" className="transition hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link to="/privacy" aria-label="Facebook" className="transition hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>

            {/* Back to top */}
            <button
              type="button"
              onClick={scrollToTop}
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-[#2A2F36] text-[#2A2F36] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:border-primary hover:text-primary"
            >
              <ChevronUp className="h-4 w-4" />
              Back to top
            </button>
          </div>

          {/* Site Map */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#2A2F36]">
              Site Map
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {siteMap.map((item) =>
                "to" in item ? (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-[#2A2F36] transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ) : (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-[#2A2F36] transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#2A2F36]">
              Legal and Privacy
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {legal.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[#2A2F36] transition hover:text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Thin orange copyright bar */}
      <div className="bg-primary py-3 text-center text-xs font-medium text-primary-foreground">
        Copyright © {new Date().getFullYear()} zeni. All rights reserved.
      </div>
    </footer>
  );
}
