"use client";

import { useEffect, useRef } from "react";

export default function TradingViewChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 500,
      symbol: "OANDA:XAUUSD",
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    /* full-width on mobile, 90% centered on md+ */
    <div className="w-full md:w-[90%] md:mx-auto" style={{ height: "500px", minHeight: "500px" }}>
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: "500px", width: "100%" }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: "500px", width: "100%" }}
        />
      </div>
    </div>
  );
}
