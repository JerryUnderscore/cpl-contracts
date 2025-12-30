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

const THEME_CSS = `
  :root { color-scheme: light dark; }

  html {
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

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) {
      --bg: #0b0f14;
      --text: #e8eef6;
      --muted: #a7b0bb;
      --muted2: #95a1ae;

      --border: #233041;
      --borderSoft: #1a2533;

      --card: #0f1620;

      --okBg: rgba(46, 204, 113, 0.14);
      --okBorder: rgba(46, 204, 113, 0.35);

      --badBg: rgba(231, 76, 60, 0.16);
      --badBorder: rgba(231, 76, 60, 0.38);
    }
  }

  html[data-theme="dark"] {
    --bg: #0b0f14;
    --text: #e8eef6;
    --muted: #a7b0bb;
    --muted2: #95a1ae;

    --border: #233041;
    --borderSoft: #1a2533;

    --card: #0f1620;

    --okBg: rgba(46, 204, 113, 0.14);
    --okBorder: rgba(46, 204, 113, 0.35);

    --badBg: rgba(231, 76, 60, 0.16);
    --badBorder: rgba(231, 76, 60, 0.38);
  }

  html[data-theme="light"] {
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

  a { color: inherit; }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clubs = orderedClubs();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          background: "var(--bg)",
          color: "var(--text)",
        }}
      >
        {/* Theme tokens (avoid hydration mismatch by not escaping quotes) */}
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />

        <header
          style={{
            position: "sticky",
            top: 0,
            background: "var(--card)",
            borderBottom: "1px solid var(--borderSoft)",
            zIndex: 10,
          }}
        >
          <nav
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0.75rem 1rem",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <a href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <img
                src="/logo_nb.png"
                alt="CPL Contracts"
                style={{ height: 44, width: "auto", display: "block" }}
              />
            </a>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: "1.1rem",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-end",
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
                    textDecoration: "none",
                    fontWeight: 600,
                    color: "#1d4ed8",
                    whiteSpace: "nowrap",
                  }}
                >
                  <img
                    src={`/clubs/${c.logoFile}`}
                    alt={`${c.name} logo`}
                    style={{ height: 18, width: 18, objectFit: "contain", display: "block" }}
                  />
                  <span>{c.navLabel}</span>
                </a>
              ))}

            </div>
          </nav>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>{children}</main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}