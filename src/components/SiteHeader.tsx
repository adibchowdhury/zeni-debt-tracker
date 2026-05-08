import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
        <Logo to="/" size="md" />

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Desktop buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#EA580C]"
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
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[#EA580C]"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
