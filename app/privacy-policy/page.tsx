import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Privacy Policy — EdgeSync Markets",
  description: "EdgeSync Markets Privacy Policy — how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-muted-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <TrendingUp className="w-5 h-5 text-[#080d1a]" strokeWidth={2.5} />
            </div>
            <span className="text-foreground font-bold text-lg tracking-tight">
              EdgeSync <span className="text-primary">Markets</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: 1 January 2025 &nbsp;·&nbsp; EdgeSync Markets Ltd
          </p>
        </div>

        <div className="prose max-w-none space-y-10 text-sm leading-7">
          {/* Intro */}
          <section>
            <p>
              EdgeSync Markets Ltd ("EdgeSync Markets", "we", "us", or "our")
              is committed to protecting your privacy. This Privacy Policy
              describes how we collect, use, store, disclose, and safeguard your
              personal information when you visit our website, open an account,
              or use any of our trading services. By accessing our services, you
              acknowledge you have read and understood this policy.
            </p>
            <p className="mt-4">
              EdgeSync Markets is incorporated in Seychelles and is authorized
              and regulated by the Financial Services Authority of Seychelles
              (FSA). We process personal data in accordance with applicable data
              protection laws and regulations.
            </p>
          </section>

          <PolicySection title="1. Information We Collect">
            <p>We collect the following categories of personal information:</p>
            <SubHeading>1.1 Information You Provide Directly</SubHeading>
            <ul>
              <li>Full legal name, date of birth, and nationality</li>
              <li>Email address, phone number, and mailing address</li>
              <li>Government-issued identification documents (passport, national ID, driver's licence)</li>
              <li>Proof of address (utility bill, bank statement)</li>
              <li>Financial information including employment status, annual income, and net worth</li>
              <li>Trading experience and investment objectives</li>
              <li>Payment information (bank account details, card information)</li>
            </ul>
            <SubHeading>1.2 Information Collected Automatically</SubHeading>
            <ul>
              <li>IP address and approximate geographic location</li>
              <li>Browser type, operating system, and device identifiers</li>
              <li>Pages visited, time spent on pages, and navigation paths</li>
              <li>Trading activity, order history, and account balances</li>
              <li>Login timestamps and session data</li>
            </ul>
            <SubHeading>1.3 Information from Third Parties</SubHeading>
            <ul>
              <li>Identity verification services and credit reference agencies</li>
              <li>Anti-money laundering (AML) and fraud detection providers</li>
              <li>Payment processors and banking partners</li>
              <li>Publicly available sources for due-diligence purposes</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. How We Use Your Information">
            <p>We use your personal information for the following purposes:</p>
            <ul>
              <li><strong className="text-foreground">Account Registration & Onboarding:</strong> To verify your identity, open your trading account, and fulfil our Know Your Customer (KYC) obligations.</li>
              <li><strong className="text-foreground">Service Delivery:</strong> To process deposits and withdrawals, execute trades, provide copy-trading functionality, and manage your account.</li>
              <li><strong className="text-foreground">Regulatory Compliance:</strong> To comply with applicable laws including AML/CFT regulations, financial reporting requirements, and requests from competent authorities.</li>
              <li><strong className="text-foreground">Risk Management:</strong> To assess suitability, detect fraud, prevent market abuse, and manage operational risk.</li>
              <li><strong className="text-foreground">Customer Support:</strong> To respond to your enquiries, resolve disputes, and provide technical assistance.</li>
              <li><strong className="text-foreground">Marketing & Communications:</strong> To send you updates, promotions, and educational content where you have consented or we have a legitimate interest to do so.</li>
              <li><strong className="text-foreground">Platform Improvement:</strong> To analyse usage patterns and improve our platform, products, and services.</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Legal Basis for Processing">
            <p>We process your personal data on the following legal bases:</p>
            <ul>
              <li><strong className="text-foreground">Contractual Necessity:</strong> Processing required to enter into or perform the client agreement with you.</li>
              <li><strong className="text-foreground">Legal Obligation:</strong> Processing required to comply with applicable laws, regulations, and regulatory obligations.</li>
              <li><strong className="text-foreground">Legitimate Interests:</strong> Processing for fraud prevention, network security, and service improvement where our interests are not overridden by your rights.</li>
              <li><strong className="text-foreground">Consent:</strong> Where you have given express consent to receive marketing communications or for the use of non-essential cookies.</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. Cookies and Tracking Technologies">
            <p>
              Our website uses cookies and similar tracking technologies to
              enhance your experience. Cookies are small data files stored on
              your device. We use:
            </p>
            <ul>
              <li><strong className="text-foreground">Strictly Necessary Cookies:</strong> Required for the operation of our website and cannot be disabled.</li>
              <li><strong className="text-foreground">Performance Cookies:</strong> Collect anonymised information about how visitors use our website (e.g., Google Analytics).</li>
              <li><strong className="text-foreground">Functional Cookies:</strong> Remember your preferences such as language and region settings.</li>
              <li><strong className="text-foreground">Marketing Cookies:</strong> Track your visits across websites to deliver relevant advertising, only where consent has been obtained.</li>
            </ul>
            <p className="mt-4">
              You can manage your cookie preferences through our cookie consent
              banner or by adjusting your browser settings. Disabling certain
              cookies may affect the functionality of our services.
            </p>
          </PolicySection>

          <PolicySection title="5. Disclosure of Your Information">
            <p>We may share your personal information with:</p>
            <ul>
              <li><strong className="text-foreground">Group Companies:</strong> Affiliated entities within the EdgeSync Markets corporate group for operational and regulatory purposes.</li>
              <li><strong className="text-foreground">Service Providers:</strong> Third-party processors who provide IT infrastructure, payment processing, KYC/AML verification, customer support, and data analytics services under binding data processing agreements.</li>
              <li><strong className="text-foreground">Regulatory Authorities:</strong> The FSA Seychelles, financial intelligence units, tax authorities, and law enforcement agencies where required by law or court order.</li>
              <li><strong className="text-foreground">Liquidity Providers & Counterparties:</strong> Financial institutions and brokers necessary to execute your transactions.</li>
              <li><strong className="text-foreground">Successors:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity, subject to equivalent privacy protections.</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information to third parties for
              their own marketing purposes.
            </p>
          </PolicySection>

          <PolicySection title="6. International Data Transfers">
            <p>
              Your information may be transferred to and processed in countries
              outside your country of residence, including countries that may
              not provide the same level of data protection. Where we transfer
              data internationally, we implement appropriate safeguards such as
              standard contractual clauses or rely on adequacy decisions to
              ensure your data receives adequate protection.
            </p>
          </PolicySection>

          <PolicySection title="7. Data Retention">
            <p>
              We retain your personal data for as long as necessary to fulfil
              the purposes for which it was collected, and in compliance with
              our legal and regulatory obligations. Client account records are
              typically retained for a minimum of five (5) years following the
              termination of the client relationship, or longer where required
              by applicable law.
            </p>
            <p className="mt-4">
              After the retention period, data is securely deleted or
              anonymised.
            </p>
          </PolicySection>

          <PolicySection title="8. Data Security">
            <p>
              We implement appropriate technical and organisational security
              measures to protect your personal information against unauthorised
              access, loss, destruction, or alteration. These measures include:
            </p>
            <ul>
              <li>Industry-standard TLS/SSL encryption for data in transit</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Role-based access controls and multi-factor authentication</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Employee training on data protection and information security</li>
            </ul>
            <p className="mt-4">
              Despite these measures, no method of transmission or storage is
              100% secure. If you believe your data has been compromised, please
              contact us immediately.
            </p>
          </PolicySection>

          <PolicySection title="9. Your Rights">
            <p>
              Subject to applicable law, you have the following rights regarding
              your personal data:
            </p>
            <ul>
              <li><strong className="text-foreground">Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your data where it is no longer necessary, subject to our legal retention obligations.</li>
              <li><strong className="text-foreground">Right to Restriction:</strong> Request that we restrict processing in certain circumstances.</li>
              <li><strong className="text-foreground">Right to Data Portability:</strong> Receive your data in a structured, machine-readable format where processing is based on consent or contract.</li>
              <li><strong className="text-foreground">Right to Object:</strong> Object to processing based on legitimate interests or for direct marketing purposes.</li>
              <li><strong className="text-foreground">Right to Withdraw Consent:</strong> Where processing is based on consent, withdraw it at any time without affecting prior processing.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact our Data
              Protection Officer at{" "}
              <a
                href="mailto:privacy@edgesyncmarkets.com"
                className="text-primary hover:underline"
              >
                privacy@edgesyncmarkets.com
              </a>
              . We will respond within 30 days of receipt of a verifiable
              request.
            </p>
          </PolicySection>

          <PolicySection title="10. Children's Privacy">
            <p>
              Our services are not directed at individuals under the age of 18.
              We do not knowingly collect personal information from minors. If
              you believe we have inadvertently collected data from a minor,
              please contact us immediately and we will take steps to delete
              such information.
            </p>
          </PolicySection>

          <PolicySection title="11. Third-Party Links">
            <p>
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices of those websites and
              encourage you to review their privacy policies before providing
              any personal information.
            </p>
          </PolicySection>

          <PolicySection title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, legal requirements, or for other
              operational reasons. The updated policy will be posted on this
              page with a revised "Last updated" date. We encourage you to
              review this policy periodically. Material changes will be
              communicated to registered clients by email.
            </p>
          </PolicySection>

          <PolicySection title="13. Contact Us">
            <p>
              If you have questions, concerns, or complaints regarding this
              Privacy Policy or our data processing practices, please contact:
            </p>
            <div className="mt-4 p-4 rounded-xl border border-border bg-card">
              <p className="text-foreground font-semibold">EdgeSync Markets Ltd</p>
              <p>Data Protection Officer</p>
              <p className="mt-1">
                Email:{" "}
                <a
                  href="mailto:privacy@edgesyncmarkets.com"
                  className="text-primary hover:underline"
                >
                  privacy@edgesyncmarkets.com
                </a>
              </p>
              <p>
                Support:{" "}
                <a
                  href="mailto:support@edgesyncmarkets.com"
                  className="text-primary hover:underline"
                >
                  support@edgesyncmarkets.com
                </a>
              </p>
              <p className="mt-1">Seychelles</p>
            </div>
          </PolicySection>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} EdgeSync Markets Ltd. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/risk-disclosure" className="hover:text-primary transition-colors">Risk Disclosure</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        </div>
      </footer>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-foreground mt-5 mb-2">
      {children}
    </h3>
  );
}
