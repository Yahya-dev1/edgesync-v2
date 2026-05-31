import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import StatsBar from "@/components/stats-bar";
import WhyChoose from "@/components/why-choose";
import TradingOptions from "@/components/trading-options";
import HowItWorks from "@/components/how-it-works";
import MarketsSection from "@/components/markets-section";
import PlatformsSection from "@/components/platforms-section";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <WhyChoose />
        <TradingOptions />
        <HowItWorks />
        <MarketsSection />
        <PlatformsSection />
      </main>
      <Footer />
    </>
  );
}
