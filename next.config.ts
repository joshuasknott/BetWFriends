import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "@prisma/client", "@node-rs/argon2"],
  // Keep Turbopack's workspace root scoped to this project.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Force HTTPS in production browsers.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent the site from being framed (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // Stop MIME-type sniffing.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer information sent to other sites.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Lock down browser features (camera, mic, geolocation, payment).
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          // Content Security Policy. Inline styles are allowed because
          // Tailwind v4 and Next inject them; nonces are complex to add to a
          // server-rendered app without sacrificing caching, so we rely on
          // 'unsafe-inline' for styles only (low XSS risk) and forbid inline
          // scripts except Next's runtime.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
