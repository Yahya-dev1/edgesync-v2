import Link from "next/link";
import { TrendingUp } from "lucide-react";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Risk Disclosure", href: "/risk-disclosure" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "About Us", href: "#about" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#080d1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#00C896]">
              <TrendingUp className="w-5 h-5 text-[#080d1a]" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              EdgeSync <span className="text-[#00C896]">Markets</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-slate-400 hover:text-[#00C896] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/6 mb-8" />

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-5 mb-8">
          <p className="text-xs text-amber-200/60 leading-relaxed">
            <strong className="text-amber-300/80">Risk Warning:</strong>{" "}
            EdgeSync Markets is incorporated in Seychelles (Company No.
            XXXXXXX) and is authorized and regulated by the Financial Services
            Authority of Seychelles (FSA). CFDs are complex instruments and
            come with a high risk of losing money rapidly due to leverage.{" "}
            <strong>
              74% of retail investor accounts lose money when trading CFDs.
            </strong>{" "}
            You should consider whether you understand how CFDs work and whether
            you can afford to take the high risk of losing your money.
          </p>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <p>
            © {new Date().getFullYear()} EdgeSync Markets Ltd. All rights
            reserved.
          </p>
          <p>Regulated by the Financial Services Authority of Seychelles</p>
        </div>
      </div>
    </footer>
  );
}
