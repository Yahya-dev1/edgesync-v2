import Link from "next/link";
import { TrendingUp, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Risk Disclosure — EdgeSync Markets",
  description:
    "EdgeSync Markets Risk Disclosure Statement — understand the risks of trading forex and CFDs before you invest.",
};

export default function RiskDisclosurePage() {
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
            Risk Disclosure Statement
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: 1 January 2025 &nbsp;·&nbsp; EdgeSync Markets Ltd
          </p>
        </div>

        {/* High-visibility warning */}
        <div className="flex items-start gap-4 p-5 rounded-2xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/8 mb-10">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Important Risk Warning
            </p>
            <p className="text-sm text-amber-900/80 dark:text-amber-200/70 leading-relaxed">
              CFDs are complex financial instruments and come with a high risk of
              losing money rapidly due to leverage.{" "}
              <strong>
                74% of retail investor accounts lose money when trading CFDs
                with EdgeSync Markets.
              </strong>{" "}
              You should consider whether you understand how CFDs work and
              whether you can afford to take the high risk of losing your money.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-sm leading-7">
          {/* Intro */}
          <section>
            <p>
              This Risk Disclosure Statement ("Statement") is provided by
              EdgeSync Markets Ltd ("EdgeSync Markets", "we", "us", or "our"),
              incorporated in Seychelles and regulated by the Financial Services
              Authority of Seychelles (FSA). This Statement is provided to
              assist you in understanding the nature and risks associated with
              trading foreign exchange (forex), contracts for difference (CFDs),
              and other financial instruments offered through our platform.
            </p>
            <p className="mt-4">
              This Statement does not purport to disclose all of the risks
              associated with forex and CFD trading. You should not trade in
              these products unless you fully understand the nature of the
              contracts and the extent of your exposure to risk. You should also
              be satisfied that these products are suitable for you in light of
              your financial circumstances, investment objectives, and risk
              tolerance.
            </p>
            <p className="mt-4">
              <strong className="text-foreground">
                If you are in any doubt, you should seek independent financial
                advice before proceeding.
              </strong>
            </p>
          </section>

          <RiskSection title="1. Leverage and Margin Risk">
            <p>
              Trading on margin means you can control a large position with a
              relatively small amount of capital. EdgeSync Markets offers
              leverage of up to 1:500, meaning a movement of as little as 0.2%
              in the underlying market can result in the complete loss of your
              deposited margin.
            </p>
            <p className="mt-3">
              Key risks associated with leverage include:
            </p>
            <ul>
              <li>
                Profits and losses are amplified proportionally to the leverage
                applied. A 1% adverse move on a 1:100 leveraged position results
                in a 100% loss of the deposited margin.
              </li>
              <li>
                Margin calls may require you to deposit additional funds at
                short notice. Failure to do so may result in the automatic
                closure of your positions at a loss.
              </li>
              <li>
                Negative balance protection is provided in accordance with
                regulatory requirements; however, you should not rely on this as
                a primary risk management tool.
              </li>
              <li>
                Higher leverage increases both potential reward and potential
                loss. Clients are strongly advised to use conservative leverage
                levels.
              </li>
            </ul>
          </RiskSection>

          <RiskSection title="2. Market Risk">
            <p>
              The value of financial instruments can fluctuate significantly and
              without warning due to various factors beyond your or our control,
              including but not limited to:
            </p>
            <ul>
              <li>
                <strong className="text-foreground">Economic events:</strong>{" "}
                Interest rate decisions, employment data, GDP releases,
                inflation figures, and central bank announcements can cause
                sharp and sudden price movements.
              </li>
              <li>
                <strong className="text-foreground">Political events:</strong>{" "}
                Elections, geopolitical tensions, sanctions, trade disputes, and
                political instability can cause significant volatility in
                currency and commodity markets.
              </li>
              <li>
                <strong className="text-foreground">Market sentiment:</strong>{" "}
                Speculative activity, changes in investor sentiment, and
                rumours can drive price movements that are disconnected from
                fundamental value.
              </li>
              <li>
                <strong className="text-foreground">Correlation risk:</strong>{" "}
                Assets that historically moved independently may become
                correlated during periods of market stress, limiting the
                effectiveness of diversification.
              </li>
            </ul>
            <p className="mt-3">
              Past performance of any instrument, strategy, or signal provider
              is not indicative of future results. Markets can move against
              your position at any time, and you may lose all of your invested
              capital.
            </p>
          </RiskSection>

          <RiskSection title="3. Liquidity Risk">
            <p>
              Liquidity refers to the ease with which a financial instrument can
              be bought or sold without causing a significant price movement.
              Liquidity risks include:
            </p>
            <ul>
              <li>
                During periods of high volatility or low market activity (such
                as market opens, major news events, or public holidays), spreads
                may widen significantly and the ability to execute orders at
                desired prices may be impaired.
              </li>
              <li>
                Stop-loss orders are not guaranteed and may be executed at a
                price worse than specified (known as "slippage"), particularly
                in fast-moving or illiquid markets.
              </li>
              <li>
                Exotic currency pairs, minor indices, and some commodity
                instruments may have lower liquidity than major instruments,
                resulting in wider spreads and greater price impact on
                execution.
              </li>
              <li>
                In extreme market conditions, it may not be possible to execute
                orders at all, or orders may be partially filled.
              </li>
            </ul>
          </RiskSection>

          <RiskSection title="4. Counterparty Risk">
            <p>
              When trading CFDs, you are entering into a contract with
              EdgeSync Markets as the counterparty to your trade. While we
              maintain segregated client funds in accordance with regulatory
              requirements, you are exposed to the financial health of
              EdgeSync Markets. In the event of our insolvency, recovery of
              funds may be limited.
            </p>
            <p className="mt-3">
              We mitigate counterparty risk by:
            </p>
            <ul>
              <li>Holding client funds in segregated accounts with reputable banking institutions</li>
              <li>Maintaining adequate regulatory capital in accordance with FSA requirements</li>
              <li>Hedging a proportion of client positions with institutional liquidity providers</li>
            </ul>
          </RiskSection>

          <RiskSection title="5. Copy Trading Risk">
            <p>
              EdgeSync Markets offers a copy trading service that allows you to
              automatically replicate the trades of selected signal providers
              ("Master Traders"). Specific risks associated with copy trading
              include:
            </p>
            <ul>
              <li>
                The past performance of a Master Trader is not indicative of
                future results. A trader with an excellent historical record may
                experience significant losses in the future.
              </li>
              <li>
                You do not have direct control over individual trades. Copying
                another trader's strategy means accepting all of their trading
                decisions, including potentially high-risk positions.
              </li>
              <li>
                There may be a time delay between a Master Trader's order and
                the replication of that order in your account, resulting in
                different execution prices and outcomes.
              </li>
              <li>
                Differences in account size between you and the Master Trader
                may result in proportional differences in risk and return.
              </li>
              <li>
                You remain fully responsible for managing your own account and
                monitoring copied trades. You should set appropriate stop-loss
                limits and maximum drawdown parameters.
              </li>
              <li>
                Master Traders are not licensed financial advisers and their
                trading activity does not constitute personalised investment
                advice.
              </li>
            </ul>
          </RiskSection>

          <RiskSection title="6. Technology and Operational Risk">
            <p>
              Electronic trading systems are subject to technological failures,
              including but not limited to:
            </p>
            <ul>
              <li>
                <strong className="text-foreground">Connectivity failures:</strong>{" "}
                Internet outages or disruptions to communication networks may
                prevent you from placing, modifying, or closing orders.
              </li>
              <li>
                <strong className="text-foreground">Platform downtime:</strong>{" "}
                Scheduled or unscheduled maintenance may result in temporary
                unavailability of the trading platform.
              </li>
              <li>
                <strong className="text-foreground">System errors:</strong>{" "}
                Software bugs, hardware failures, or cyberattacks may disrupt
                trading operations or result in erroneous order execution.
              </li>
              <li>
                <strong className="text-foreground">Data errors:</strong>{" "}
                Incorrect price feeds or data disruptions may temporarily
                present incorrect market information.
              </li>
            </ul>
            <p className="mt-3">
              EdgeSync Markets implements redundant systems and business
              continuity measures to minimise operational disruptions; however,
              we cannot guarantee uninterrupted service. You should always have
              alternative means of contacting us to manage open positions.
            </p>
          </RiskSection>

          <RiskSection title="7. Currency Risk">
            <p>
              If your account base currency differs from the currency of a
              financial instrument you are trading or the currency in which your
              profit or loss is denominated, you will be exposed to currency
              risk. Exchange rate fluctuations may increase or decrease the
              value of your profits or losses when converted to your base
              currency. This risk is in addition to any market risk associated
              with the underlying instrument.
            </p>
          </RiskSection>

          <RiskSection title="8. Cryptocurrency Risk">
            <p>
              Cryptocurrency CFDs are particularly high-risk instruments due to
              the inherent volatility of digital assets. Additional risks
              include:
            </p>
            <ul>
              <li>Extreme price volatility — cryptocurrencies can lose 50% or more of their value in a matter of days</li>
              <li>Regulatory uncertainty in many jurisdictions which may affect the value or legality of crypto assets</li>
              <li>No central bank backing or government guarantee of value</li>
              <li>Liquidity may be significantly lower than for traditional forex instruments</li>
              <li>Gaps in weekend and overnight price action may result in significant slippage</li>
            </ul>
          </RiskSection>

          <RiskSection title="9. Suitability">
            <p>
              Trading in leveraged financial instruments is not suitable for all
              investors. You should carefully consider your financial situation,
              investment objectives, experience, and risk tolerance before
              trading. You should only invest money that you can afford to lose
              entirely without affecting your standard of living or financial
              security.
            </p>
            <p className="mt-3">
              We conduct a suitability and appropriateness assessment during the
              account opening process. If you do not meet the suitability
              criteria, we may advise you of the risks and, in some cases,
              decline to open an account.
            </p>
          </RiskSection>

          <RiskSection title="10. Risk Management Recommendations">
            <p>
              While we cannot eliminate risk, we recommend the following
              practices to manage your exposure:
            </p>
            <ul>
              <li>Never risk more than you can afford to lose</li>
              <li>Use stop-loss orders on all open positions to limit potential losses</li>
              <li>Avoid using maximum available leverage — lower leverage reduces both risk and reward</li>
              <li>Diversify your portfolio and do not concentrate risk in a single asset or position</li>
              <li>Monitor your positions and account balance regularly</li>
              <li>Stay informed about economic events and news that may affect your positions</li>
              <li>When using copy trading, set maximum drawdown limits and review Master Trader performance regularly</li>
              <li>Seek independent financial advice if you are uncertain about any aspect of your trading activity</li>
            </ul>
          </RiskSection>

          <RiskSection title="11. Regulatory Information">
            <p>
              EdgeSync Markets Ltd is incorporated in Seychelles (Company No.
              8432917) and is authorized and regulated by the Financial Services
              Authority of Seychelles (FSA) under licence number SD-0291. Our
              regulatory status imposes obligations on us with respect to the
              fair treatment of clients, maintenance of adequate capital, and
              segregation of client funds.
            </p>
            <p className="mt-3">
              This disclosure is provided for general information purposes and
              does not constitute investment advice, a solicitation, or an offer
              to buy or sell any financial instrument. The availability of
              certain products and services may be restricted in certain
              jurisdictions.
            </p>
          </RiskSection>

          <section className="pt-4">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Acknowledgement:</strong> By
                opening an account with EdgeSync Markets and/or by continuing to
                use our services, you acknowledge that you have read, understood,
                and accepted this Risk Disclosure Statement. You acknowledge that
                you are aware of the risks involved in trading leveraged financial
                instruments and that your financial circumstances, investment
                objectives, and risk tolerance are consistent with such trading
                activity.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                For questions about this Risk Disclosure, contact us at{" "}
                <a
                  href="mailto:support@edgesyncmarkets.com"
                  className="text-primary hover:underline"
                >
                  support@edgesyncmarkets.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} EdgeSync Markets Ltd. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        </div>
      </footer>
    </div>
  );
}

function RiskSection({ title, children }: { title: string; children: React.ReactNode }) {
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
