import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BetWFriends — Bet on life, with your mates",
    template: "%s · BetWFriends",
  },
  description:
    "BetWFriends is the friendly way to bet on everyday life with your friends. Create groups, make playful bets, and settle up — no casino required.",
  applicationName: "BetWFriends",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BetWFriends",
  },
  icons: {
    icon: [
      { url: "/brand/betwfriends-logo.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/brand/betwfriends-logo.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "BetWFriends — Bet on life, with your mates",
    description:
      "Friends-only social betting. Low stakes. Big banter. No bookies. No BS.",
    type: "website",
    siteName: "BetWFriends",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
