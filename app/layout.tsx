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
  // Uses your west→east order, but still safe if something is missing
  return CLUB_ORDER_WEST_EAST.map((slug) => CLUB_BY_SLUG[slug]).filter(Boolean);
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clubs = orderedClubs();

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            background: "white",
            borderBottom: "1px solid #eee",
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
            {/* Left: site logo only */}
            <a href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <img
                src="/logo.png"
                alt="CanPL Contracts"
                style={{
                  height: 44,
                  width: "auto",
                  display: "block",
                }}
              />
            </a>

            {/* Right: club nav (west → east) */}
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
                    color: "#1d4ed8", // your current “link blue” vibe; easy to tweak later
                    whiteSpace: "nowrap",
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

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>
          {children}
        </main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}