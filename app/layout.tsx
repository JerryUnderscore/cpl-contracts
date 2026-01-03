// app/layout.tsx
import * as React from "react";
import Footer from "./components/footer";
import Header from "./components/header";
import { CLUB_ORDER_WEST_EAST, CLUB_BY_SLUG } from "./lib/clubs";
import { Analytics } from "@vercel/analytics/react";

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
    <html lang="en" data-theme="light" style={{ colorScheme: "light" }}>
      <head>
        <style>{`
          :root {
            color-scheme: light;

            --bg: #ffffff;
            --text: #111111;
            --muted: #666666;
            --muted2: #777777;

            --border: #dddddd;
            --borderSoft: #eeeeee;

            --card: #ffffff;

            --okBg: #f4fff6;
            --okBorder: #cfe9d4;

            --badBg: #fff4f4;
            --badBorder: #f0c9c9;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: var(--bg);
            color: var(--text);
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          /* Header responsiveness */
          .clubNavDesktop { display: flex; }
          .clubNavMobile { display: none; }

          @media (max-width: 860px) {
            .clubNavDesktop { display: none !important; }
            .clubNavMobile { display: flex !important; }
          }
        `}</style>
      </head>

      <body
        style={{
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
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