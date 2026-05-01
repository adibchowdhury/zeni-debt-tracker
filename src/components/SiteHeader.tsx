import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Security", href: "/security" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo to="/" size="md" />

        {/* Desktop menu */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground hover:bg-secondary/60"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex rounded-full p-2 text-foreground hover:bg-secondary md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/60 bg-background px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary/60"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-center text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-soft"
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}