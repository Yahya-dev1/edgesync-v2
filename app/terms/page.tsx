import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Terms & Conditions — EdgeSync Markets",
  description:
    "EdgeSync Markets Terms and Conditions — the agreement governing your use of our trading services.",
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Terms & Conditions
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: 1 January 2025 &nbsp;·&nbsp; EdgeSync Markets Ltd
          </p>
        </div>

        <div className="space-y-10 text-sm leading-7">
          {/* Intro */}
          <section>
            <p>
              These Terms and Conditions ("Agreement") constitute a legally
              binding agreement between you ("Client", "you", "your") and
              EdgeSync Markets Ltd ("EdgeSync Markets", "we", "us", "our"),
              incorporated in Seychelles (Company No. 8432917) and authorized
              and regulated by the Financial Services Authority of Seychelles
              (FSA) under licence number SD-0291.
            </p>
            <p className="mt-4">
              By registering an account with EdgeSync Markets, accessing our
              trading platform, or using any of our services, you acknowledge
              that you have read, understood, and agree to be bound by this
              Agreement in its entirety, together with our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              ,{" "}
              <Link href="/risk-disclosure" className="text-primary hover:underline">
                Risk Disclosure Statement
              </Link>
              , and any other policies published on our website.
            </p>
            <p className="mt-4">
              <strong className="text-foreground">
                If you do not agree to these Terms, you must not use our
                services.
              </strong>
            </p>
          </section>

          <TC title="1. Definitions">
            <p>In this Agreement, the following terms have the meanings set out below:</p>
            <ul>
              <li><strong className="text-foreground">"Account"</strong> means a trading account opened in your name on our platform.</li>
              <li><strong className="text-foreground">"CFD"</strong> means a Contract for Difference, a financial derivative that allows you to speculate on price movements without owning the underlying asset.</li>
              <li><strong className="text-foreground">"Copy Trading"</strong> means the service by which you automatically replicate the trading activity of a Master Trader in your Account.</li>
              <li><strong className="text-foreground">"Master Trader"</strong> means a verified signal provider whose trades may be copied by other clients.</li>
              <li><strong className="text-foreground">"Financial Instrument"</strong> means any forex pair, index, commodity, cryptocurrency, or other asset available for trading on our platform.</li>
              <li><strong className="text-foreground">"Margin"</strong> means the funds required to open and maintain a leveraged position.</li>
              <li><strong className="text-foreground">"Platform"</strong> means the trading software and systems made available to you by EdgeSync Markets.</li>
              <li><strong className="text-foreground">"Services"</strong> means the trading, copy trading, account management, and related services provided by EdgeSync Markets.</li>
            </ul>
          </TC>

          <TC title="2. Eligibility and Account Opening">
            <Sub>2.1 Eligibility Requirements</Sub>
            <p>To open an Account and use our Services, you must:</p>
            <ul>
              <li>Be at least 18 years of age (or the legal age of majority in your jurisdiction, if higher);</li>
              <li>Have the legal capacity to enter into binding contracts;</li>
              <li>Not be a resident or citizen of a jurisdiction in which use of our Services is prohibited or restricted by applicable law;</li>
              <li>Not be a politically exposed person (PEP) or subject to any financial sanctions;</li>
              <li>Confirm that trading leveraged instruments is appropriate for you given your financial situation, investment experience, and risk tolerance.</li>
            </ul>
            <Sub>2.2 Account Registration</Sub>
            <p>
              To open an Account, you must complete our registration process and
              provide accurate, current, and complete information, including
              identity verification documents as required under applicable
              anti-money laundering (AML) and know-your-customer (KYC)
              regulations. We reserve the right to decline any application
              without providing reasons.
            </p>
            <Sub>2.3 Account Security</Sub>
            <p>
              You are solely responsible for maintaining the confidentiality of
              your login credentials. You must notify us immediately if you
              suspect any unauthorised use of your Account. We shall not be
              liable for any loss arising from your failure to safeguard your
              account credentials.
            </p>
            <Sub>2.4 One Account per Client</Sub>
            <p>
              Each client is permitted to hold one Account unless we expressly
              agree otherwise in writing. Opening multiple accounts to
              circumvent trading limits, bonus conditions, or for any other
              unauthorised purpose is prohibited and may result in immediate
              account termination.
            </p>
          </TC>

          <TC title="3. Trading Rules and Order Execution">
            <Sub>3.1 Order Types</Sub>
            <p>
              We offer market orders, limit orders, stop orders, and other order
              types as may be made available on the Platform from time to time.
              You are responsible for understanding each order type before
              placing an order.
            </p>
            <Sub>3.2 Order Execution</Sub>
            <p>
              We act as principal (market maker) in the execution of your
              orders, meaning we are the counterparty to your trades. We aim to
              execute all orders at the best available price; however, execution
              is subject to market conditions and liquidity. We do not guarantee
              execution at the requested price.
            </p>
            <Sub>3.3 Slippage</Sub>
            <p>
              In fast-moving markets, including around major economic
              announcements, your orders may be executed at a price different
              from the requested price (positive or negative slippage). We
              cannot be held liable for slippage resulting from normal market
              conditions.
            </p>
            <Sub>3.4 Prohibited Trading Practices</Sub>
            <p>The following trading practices are strictly prohibited:</p>
            <ul>
              <li>Arbitrage of pricing errors or latency on our platform;</li>
              <li>Scalping strategies that exploit artificial price discrepancies;</li>
              <li>Use of automated trading robots (EAs) without prior written approval;</li>
              <li>Coordinated trading activity between multiple accounts to manipulate prices or exploit promotions;</li>
              <li>Any form of market manipulation, wash trading, or abusive trading behaviour;</li>
              <li>Trading using inside information or in breach of any applicable laws.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to void, reverse, or cancel any trades that
              we determine, in our reasonable discretion, to have resulted from
              prohibited practices, and to close your Account without notice.
            </p>
            <Sub>3.5 Market Hours</Sub>
            <p>
              Different financial instruments are available to trade during
              specific hours. Forex is available 24 hours a day, 5 days a week.
              Indices and commodities follow the trading hours of the relevant
              underlying exchanges. Crypto instruments are available 24/7,
              subject to liquidity and platform availability. We are not liable
              for any loss arising from your inability to trade outside market
              hours.
            </p>
          </TC>

          <TC title="4. Deposits and Withdrawals">
            <Sub>4.1 Deposits</Sub>
            <p>
              The minimum initial deposit is $300 (or equivalent). Deposits
              must be made using supported payment methods as published on our
              website from time to time, including USDT (TRC20) and other
              accepted cryptocurrencies. All deposits must originate from
              accounts or wallets held in your own name. We do not accept
              deposits from third parties.
            </p>
            <p className="mt-3">
              Cryptocurrency deposits are subject to network confirmation times
              and may not be credited to your Account instantly. EdgeSync
              Markets is not responsible for delays caused by blockchain network
              congestion or other factors outside our control.
            </p>
            <Sub>4.2 Withdrawals</Sub>
            <p>
              You may request a withdrawal of funds from your Account at any
              time, subject to the following conditions:
            </p>
            <ul>
              <li>Your Account must have passed all required KYC/AML verification checks;</li>
              <li>There must be no pending investigations or disputes relating to your Account;</li>
              <li>Withdrawals will be processed to the same payment method used for the deposit where possible;</li>
              <li>We reserve the right to request additional documentation before processing any withdrawal;</li>
              <li>Withdrawal processing times vary by payment method and may take 1–5 business days.</li>
            </ul>
            <Sub>4.3 Fees</Sub>
            <p>
              We do not currently charge deposit fees. Withdrawal fees, if any,
              will be disclosed on our website or in your Account portal prior
              to processing. Network fees for cryptocurrency withdrawals are
              borne by the Client. We reserve the right to introduce or amend
              fees upon reasonable written notice.
            </p>
            <Sub>4.4 Currency Conversion</Sub>
            <p>
              If a deposit or withdrawal involves currency conversion, the
              applicable exchange rate will be applied at the time of
              processing. We are not responsible for exchange rate fluctuations.
            </p>
            <Sub>4.5 Anti-Money Laundering</Sub>
            <p>
              All deposits and withdrawals are subject to our AML/CFT policies.
              We are required by law to report suspicious transactions to the
              relevant financial intelligence unit. We may delay or refuse a
              deposit or withdrawal where we have reason to believe it may be
              connected to money laundering, fraud, or other financial crime.
            </p>
          </TC>

          <TC title="5. Leverage and Margin">
            <Sub>5.1 Leverage</Sub>
            <p>
              We offer leverage of up to 1:500, subject to the instrument
              traded, your account type, and applicable regulatory restrictions.
              Leverage magnifies both profits and losses. You acknowledge that
              trading with high leverage entails a substantial risk of loss that
              may exceed your initial deposit.
            </p>
            <Sub>5.2 Margin Requirements</Sub>
            <p>
              You must maintain sufficient margin in your Account to support
              open positions. If your free margin falls below the required
              margin level, a margin call may be triggered. If your Account
              equity falls to or below the stop-out level (as specified on our
              website), your positions may be automatically closed without
              further notice.
            </p>
            <Sub>5.3 Negative Balance Protection</Sub>
            <p>
              We provide negative balance protection for retail clients,
              ensuring your losses cannot exceed your Account balance. This
              protection does not apply to professional clients or in
              exceptional market circumstances where our systems are unable to
              execute stop-outs in a timely manner.
            </p>
          </TC>

          <TC title="6. Copy Trading Terms">
            <Sub>6.1 Nature of the Service</Sub>
            <p>
              The Copy Trading service allows you to follow and automatically
              replicate the trades of one or more Master Traders. This is a
              discretionary service — you may start, pause, or stop copying a
              Master Trader at any time. However, positions opened while
              copying will remain open until you close them or the Master Trader
              closes them.
            </p>
            <Sub>6.2 No Investment Advice</Sub>
            <p>
              EdgeSync Markets does not recommend or endorse any Master Trader.
              The selection of a Master Trader is your sole responsibility. The
              past performance of a Master Trader does not guarantee future
              results. Master Traders are not regulated financial advisers, and
              their trading activity does not constitute personalised investment
              advice.
            </p>
            <Sub>6.3 Risks of Copy Trading</Sub>
            <p>
              You acknowledge that: (i) the strategies employed by Master
              Traders may not be suitable for your risk profile; (ii) replication
              delays may result in different execution prices; (iii) performance
              may differ between your Account and the Master Trader's Account
              due to differences in account size, timing, and available
              liquidity; (iv) you may lose the entirety of the funds allocated
              to copy trading.
            </p>
            <Sub>6.4 Fees</Sub>
            <p>
              Master Traders may charge a performance fee as a percentage of
              profits generated in your Account. All applicable fees will be
              disclosed to you before you begin copying a Master Trader. We may
              also charge a platform fee for the copy trading service, details
              of which will be published on our website.
            </p>
          </TC>

          <TC title="7. Bonuses and Promotions">
            <p>
              From time to time, we may offer bonuses, promotions, or rewards
              to clients. All bonuses are subject to specific terms and
              conditions that will be communicated at the time of the offer.
              Unless stated otherwise:
            </p>
            <ul>
              <li>Bonuses are non-withdrawable until the applicable trading volume requirement is met;</li>
              <li>Bonuses may be forfeited if the Account is found to have engaged in prohibited trading practices;</li>
              <li>We reserve the right to modify, suspend, or cancel any bonus or promotion at any time;</li>
              <li>Bonuses cannot be combined unless explicitly stated.</li>
            </ul>
          </TC>

          <TC title="8. Intellectual Property">
            <p>
              All content, software, data, trademarks, and intellectual property
              available on our Platform and website (collectively, "Content") are
              owned by or licensed to EdgeSync Markets. You are granted a limited,
              non-exclusive, non-transferable licence to access and use the
              Content solely for the purpose of using our Services.
            </p>
            <p className="mt-3">
              You must not: copy, reproduce, distribute, or create derivative
              works from any Content without our express written consent; use our
              brand, trademarks, or trading data for commercial purposes; or
              reverse engineer any part of our Platform or systems.
            </p>
          </TC>

          <TC title="9. Limitation of Liability">
            <Sub>9.1 No Guarantee of Profit</Sub>
            <p>
              We make no representation, warranty, or guarantee that you will
              profit from trading on our Platform. Trading in leveraged financial
              instruments carries substantial risk and may not be suitable for all
              investors.
            </p>
            <Sub>9.2 Exclusion of Liability</Sub>
            <p>
              To the maximum extent permitted by applicable law, EdgeSync Markets
              shall not be liable for any direct, indirect, incidental, special,
              consequential, or punitive losses arising from:
            </p>
            <ul>
              <li>Trading losses, including losses resulting from platform downtime, connectivity issues, or force majeure events;</li>
              <li>Any delay, error, or interruption in order execution;</li>
              <li>Actions taken by third-party service providers, including payment processors and liquidity providers;</li>
              <li>Your reliance on any information, content, or signal published on our Platform;</li>
              <li>Unauthorised access to your Account arising from your failure to maintain account security.</li>
            </ul>
            <Sub>9.3 Force Majeure</Sub>
            <p>
              We shall not be liable for any failure or delay in performing our
              obligations where such failure results from events outside our
              reasonable control, including but not limited to natural disasters,
              war, cyber-attacks, regulatory actions, exchange or market closures,
              or extreme market volatility.
            </p>
          </TC>

          <TC title="10. Termination and Suspension">
            <Sub>10.1 Termination by You</Sub>
            <p>
              You may close your Account at any time by contacting our support
              team, provided all open positions have been closed, all pending
              withdrawals have been processed, and your Account balance is zero.
            </p>
            <Sub>10.2 Termination by EdgeSync Markets</Sub>
            <p>
              We reserve the right to suspend or terminate your Account, without
              prior notice, in any of the following circumstances:
            </p>
            <ul>
              <li>Breach of any provision of this Agreement;</li>
              <li>Engagement in prohibited trading practices;</li>
              <li>Failure to pass or maintain KYC/AML verification;</li>
              <li>Suspicion of fraud, money laundering, or other financial crime;</li>
              <li>Regulatory requirement or instruction from a competent authority;</li>
              <li>Inactivity for a period exceeding 12 consecutive months.</li>
            </ul>
            <p className="mt-3">
              Upon termination, all open positions will be closed at prevailing
              market prices. Any remaining funds will be returned to you via your
              registered payment method following completion of any required
              investigation.
            </p>
            <Sub>10.3 Dormant Account Fee</Sub>
            <p>
              If your Account is inactive for more than 12 consecutive months
              and maintains a positive balance, we may apply a monthly dormancy
              fee as published on our website. You will be notified before any
              dormancy fee is charged.
            </p>
          </TC>

          <TC title="11. Complaints and Dispute Resolution">
            <Sub>11.1 Complaints Procedure</Sub>
            <p>
              If you have a complaint, please contact our customer support team
              in the first instance at{" "}
              <a href="mailto:support@edgesyncmarkets.com" className="text-primary hover:underline">
                support@edgesyncmarkets.com
              </a>
              . We aim to acknowledge all complaints within 2 business days and
              provide a final response within 15 business days of receipt.
            </p>
            <Sub>11.2 Escalation</Sub>
            <p>
              If you are not satisfied with our response, you may escalate your
              complaint to the Financial Services Authority of Seychelles (FSA)
              or seek independent legal advice. All escalation procedures will
              be communicated to you in our final response letter.
            </p>
          </TC>

          <TC title="12. Governing Law and Jurisdiction">
            <p>
              This Agreement shall be governed by and construed in accordance
              with the laws of the Republic of Seychelles. Any dispute arising
              out of or in connection with this Agreement, including any question
              regarding its existence, validity, or termination, shall be subject
              to the exclusive jurisdiction of the courts of Seychelles.
            </p>
            <p className="mt-3">
              Nothing in this clause shall limit our right to take proceedings
              against you in any other court of competent jurisdiction, nor shall
              the taking of proceedings in any one or more jurisdictions preclude
              us from taking proceedings in any other jurisdiction.
            </p>
          </TC>

          <TC title="13. Amendments">
            <p>
              We reserve the right to amend this Agreement at any time. Material
              changes will be communicated to you by email at least 10 business
              days before they take effect. Your continued use of our Services
              after the effective date of any amendment constitutes your
              acceptance of the revised terms.
            </p>
            <p className="mt-3">
              We recommend that you review this Agreement periodically. The
              current version is always available on our website.
            </p>
          </TC>

          <TC title="14. Miscellaneous">
            <Sub>14.1 Entire Agreement</Sub>
            <p>
              This Agreement, together with our Privacy Policy, Risk Disclosure
              Statement, and any other policies or schedules referenced herein,
              constitutes the entire agreement between you and EdgeSync Markets
              with respect to the subject matter hereof and supersedes all prior
              agreements, representations, and understandings.
            </p>
            <Sub>14.2 Severability</Sub>
            <p>
              If any provision of this Agreement is held to be invalid,
              unenforceable, or illegal, the remaining provisions shall continue
              in full force and effect.
            </p>
            <Sub>14.3 Waiver</Sub>
            <p>
              Our failure to enforce any right or provision of this Agreement
              shall not constitute a waiver of such right or provision unless
              acknowledged and agreed in writing by EdgeSync Markets.
            </p>
            <Sub>14.4 Assignment</Sub>
            <p>
              You may not assign or transfer any of your rights or obligations
              under this Agreement without our prior written consent. We may
              assign our rights and obligations to any affiliate or successor
              entity without your consent, provided this does not materially
              prejudice your rights.
            </p>
          </TC>

          <TC title="15. Contact Information">
            <p>For any questions regarding these Terms and Conditions, please contact us at:</p>
            <div className="mt-4 p-4 rounded-xl border border-border bg-card">
              <p className="text-foreground font-semibold">EdgeSync Markets Ltd</p>
              <p className="mt-1">
                Email:{" "}
                <a href="mailto:legal@edgesyncmarkets.com" className="text-primary hover:underline">
                  legal@edgesyncmarkets.com
                </a>
              </p>
              <p>
                Support:{" "}
                <a href="mailto:support@edgesyncmarkets.com" className="text-primary hover:underline">
                  support@edgesyncmarkets.com
                </a>
              </p>
              <p className="mt-1">Seychelles</p>
            </div>
          </TC>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} EdgeSync Markets Ltd. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/risk-disclosure" className="hover:text-primary transition-colors">Risk Disclosure</Link>
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        </div>
      </footer>
    </div>
  );
}

function TC({ title, children }: { title: string; children: React.ReactNode }) {
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

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-foreground mt-5 mb-2">
      {children}
    </h3>
  );
}
