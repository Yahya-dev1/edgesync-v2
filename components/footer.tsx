import Link from "next/link";
import { TrendingUp, AlertTriangle } from "lucide-react";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Risk Disclosure", href: "/risk-disclosure" },
  { label: "Terms & Conditions", href: "/terms" },
];

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.019 10.125 11.927V15.58H7.078v-3.507h3.047V9.413c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.507h-2.796v8.42C19.612 23.092 24 18.1 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socialLinks = [
  { Icon: XIcon, label: "X (Twitter)", href: "#" },
  { Icon: FacebookIcon, label: "Facebook", href: "#" },
  { Icon: InstagramIcon, label: "Instagram", href: "#" },
  { Icon: LinkedInIcon, label: "LinkedIn", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Top section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-5 max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm shadow-primary/30">
                <TrendingUp className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-foreground font-bold text-[15px] tracking-tight">
                EdgeSync <span className="text-primary">Markets</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Professional CFD trading with tight spreads, fast execution, and
              regulated security — built for serious traders.
            </p>
            <div className="flex items-center gap-1.5">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/25 transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-8" />

        {/* Risk warning */}
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-5 mb-8 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500/60 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-xs text-amber-700 dark:text-amber-200/60 leading-relaxed">
            <span className="font-semibold text-amber-800 dark:text-amber-300/80">Risk Warning: </span>
            EdgeSync Markets is incorporated in Seychelles (Company No. 8432917) and is
            authorized and regulated by the Financial Services Authority of Seychelles (FSA).
            CFDs are complex instruments and come with a high risk of losing money rapidly due
            to leverage.{" "}
            <strong className="text-amber-800 dark:text-amber-200/80">
              74% of retail investor accounts lose money when trading CFDs.
            </strong>{" "}
            You should consider whether you understand how CFDs work and whether you can afford
            to take the high risk of losing your money.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EdgeSync Markets Ltd. All rights reserved.</p>
          <p>Regulated by the Financial Services Authority of Seychelles</p>
        </div>
      </div>
    </footer>
  );
}
