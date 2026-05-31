"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, TrendingUp } from "lucide-react";

const navLinks = [
  { label: "Copy Trading", href: "#trading-options" },
  { label: "Markets", href: "#markets" },
  { label: "Platforms", href: "#platforms" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080d1a]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#00C896]">
              <TrendingUp className="w-5 h-5 text-[#080d1a]" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              EdgeSync <span className="text-[#00C896]">Markets</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm text-slate-300 border border-white/15 rounded-lg hover:border-white/30 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-sm font-semibold bg-[#00C896] text-[#080d1a] rounded-lg hover:bg-[#00b084] transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#080d1a]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 text-sm text-center text-slate-300 border border-white/15 rounded-lg hover:border-white/30 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 text-sm text-center font-semibold bg-[#00C896] text-[#080d1a] rounded-lg hover:bg-[#00b084] transition-colors"
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
