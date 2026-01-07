// app/layout.tsx
import * as React from "react";
import "./globals.css";
import Footer from "./components/footer";
import Header from "./components/header";
import { CLUB_ORDER_WEST_EAST, CLUB_BY_SLUG } from "./lib/clubs";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

export const metadata = {
  title: "CPL Contracts",
  description: "A community-made CPL contract tracker",
};

function orderedClubs() {
  return CLUB_ORDER_WEST_EAST.map((slug) => CLUB_BY_SLUG[slug]).filter(Boolean);
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clubs = orderedClubs();

  return (
    <html lang="en">
      <head>
        {/* Prevent theme flash: runs before first paint */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`
(function () {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
    }
  } catch (e) {}
})();
        `}</Script>
      </head>

      <body>
        <Header clubs={clubs} />

        <main style={{ maxWidth: 1300, margin: "0 auto", padding: "1rem" }}>
          {children}
        </main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}