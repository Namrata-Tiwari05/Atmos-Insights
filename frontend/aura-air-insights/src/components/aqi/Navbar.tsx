import { useEffect, useState } from "react";
import { Moon, Sun, Wind, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#home", label: "Home" },
  { href: "#current", label: "Current AQI" },
  { href: "#hourly", label: "24 Hour" },
  { href: "#weekly", label: "7 Day" },
  { href: "#analytics", label: "Analytics" },
  { href: "#about", label: "About" },
];

export function Navbar() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-card/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#home" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-teal text-white shadow-lg shadow-brand/25">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M4 10h12a4 4 0 0 1 0 8h-2" />
              <path d="M2 14h14a3 3 0 0 0 0-6H8" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            Atmos <span className="text-brand">Insight</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-card lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-card/95 px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}