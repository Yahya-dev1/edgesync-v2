import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' needed for TradingView widget config (script.innerHTML)
      // 'unsafe-eval' needed for TradingView charting library internals
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com https://charting-library.tradingview-widget.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      // wss://*.tradingview.com covers the real-time price WebSocket
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tradingview.com wss://*.tradingview.com",
      // www.tradingview.com is the iframe origin for the advanced chart embed
      "frame-src https://s3.tradingview.com https://charting-library.tradingview-widget.com https://www.tradingview.com",
      "font-src 'self' data:",
    ].join("; "),
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
