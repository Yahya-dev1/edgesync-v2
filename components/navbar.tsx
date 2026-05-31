"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { label: "Copy Trading", href: "#trading-options" },
  { label: "Markets", href: "#markets" },
  { label: "Platforms", href: "#platforms" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <TrendingUp className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-foreground font-bold text-lg tracking-tight">
              EdgeSync <span className="text-primary">Markets</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-overlay rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:border-border/60 hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-overlay rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 text-sm text-center text-muted-foreground border border-border rounded-lg hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 text-sm text-center font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
