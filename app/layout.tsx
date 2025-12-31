// app/layout.tsx
import * as React from "react";
import Footer from "./components/footer";
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
        `}</style>
      </head>

      <body
        style={{
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#ffffff",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <nav
            style={{
              maxWidth: 1500,
              margin: "0 auto",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {/* Logo */}
            <a href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <img src="/logo.png" alt="CPL Contracts" style={{ height: 44, width: "auto" }} />
            </a>

            {/* Club navigation (single line + horizontal scroll, no wrapping) */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: "1.1rem",
                flexWrap: "nowrap",
                alignItems: "center",
                justifyContent: "flex-end",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {clubs.map((c) => (
                <a
                  key={c.slug}
                  href={`/clubs/${c.slug}`}
                  title={c.name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontWeight: 600,
                    color: "#1d4ed8",
                    whiteSpace: "nowrap",
                    flex: "0 0 auto",
                  }}
                >
                  <img
                    src={`/clubs/${c.logoFile}`}
                    alt={`${c.name} logo`}
                    style={{
                      height: 18,
                      width: 18,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                  <span>{c.navLabel}</span>
                </a>
              ))}
            </div>
          </nav>
        </header>

        {/* Main */}
        <main style={{ maxWidth: 1500, margin: "0 auto", padding: "1rem" }}>{children}</main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}