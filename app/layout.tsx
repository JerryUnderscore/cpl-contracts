// app/layout.tsx
import * as React from "react";
import { getPlayers } from "./lib/players";
import Footer from "./components/footer";

export const metadata = {
  title: "CanPL Contracts",
  description: "A community-made CPL contract tracker",
};

type ClubNavItem = {
  clubSlug: string;
  club: string;
  label: string;
  logoSrc?: string;
};

// West → East order (your requested order)
const CLUB_ORDER: string[] = [
  "pacific",
  "vancouver",
  "cavalry",
  "forge",
  "inter-toronto",
  "atletico-ottawa",
  "supra",
  "hfx-wanderers",
];

function slugLabel(slug: string) {
  const map: Record<string, string> = {
    pacific: "Pacific",
    vancouver: "Vancouver FC",
    cavalry: "Cavalry",
    forge: "Forge",
    "inter-toronto": "Inter Toronto",
    "atletico-ottawa": "Atlético",
    supra: "Supra",
    "hfx-wanderers": "Wanderers",
  };
  return map[slug] ?? slug.replace(/-/g, " ");
}

function slugLogo(slug: string): string | undefined {
  // Must match filenames in /public/clubs
  const map: Record<string, string> = {
    pacific: "/clubs/pacific.svg",
    vancouver: "/clubs/vancouver.png",
    cavalry: "/clubs/cavalry.svg",
    forge: "/clubs/forge.svg",
    "inter-toronto": "/clubs/toronto.png",
    "atletico-ottawa": "/clubs/ottawa.svg",
    supra: "/clubs/supra.png",
    "hfx-wanderers": "/clubs/wanderers.svg",
  };
  return map[slug];
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const players = await getPlayers();

  // Grab unique clubs from data
  const clubsFromData = Array.from(
    new Map(
      players
        .filter((p) => p.clubSlug && p.club)
        .map((p) => [p.clubSlug, p.club] as const)
    ).entries()
  ).map(([clubSlug, club]) => ({
    clubSlug,
    club,
  }));

  // Build nav items in west→east order, but only include clubs that exist in data
  const clubMap = new Map(clubsFromData.map((c) => [c.clubSlug, c.club]));
  const orderedNav: ClubNavItem[] = CLUB_ORDER
    .filter((slug) => clubMap.has(slug))
    .map((slug) => ({
      clubSlug: slug,
      club: clubMap.get(slug) ?? slug,
      label: slugLabel(slug),
      logoSrc: slugLogo(slug),
    }));

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          background: "white",
          color: "#111",
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
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            {/* Left: site brand */}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
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

            {/* Right: club nav */}
            <div
              style={{
                display: "flex",
                gap: "0.9rem",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {orderedNav.map((c) => (
                <a
                  key={c.clubSlug}
                  href={`/clubs/${c.clubSlug}`}
                  title={c.club}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    textDecoration: "none",
                    color: "#1d4ed8",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.logoSrc ? (
                    <img
                      src={c.logoSrc}
                      alt=""
                      aria-hidden="true"
                      style={{
                        width: 18,
                        height: 18,
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  ) : null}
                  <span>{c.label}</span>
                </a>
              ))}
            </div>
          </nav>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>{children}</main>

        <Footer />
      </body>
    </html>
  );
}