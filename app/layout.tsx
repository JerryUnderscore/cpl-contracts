// app/layout.tsx
import * as React from "react";
import { getPlayers } from "./lib/players";
import Footer from "./components/footer";

export const metadata = {
  title: "CanPL Contracts",
  description: "A community-made CPL contract tracker",
};

function slugLabel(slug: string) {
  // Keep these labels short for the header
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

// Desired west → east order
const WEST_TO_EAST: string[] = [
  "pacific",
  "vancouver",
  "cavalry",
  "forge",
  "inter-toronto",
  "atletico-ottawa",
  "supra",
  "hfx-wanderers",
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const players = await getPlayers();

  // Collect clubs present in the data
  const clubMap = new Map<string, string>();
  for (const p of players) {
    if (!p.clubSlug || !p.club) continue;
    if (!clubMap.has(p.clubSlug)) clubMap.set(p.clubSlug, p.club);
  }

  // Order clubs west→east, then append any unexpected slugs at the end (alphabetical)
  const known = WEST_TO_EAST.filter((slug) => clubMap.has(slug)).map((slug) => ({
    clubSlug: slug,
    club: clubMap.get(slug)!,
  }));

  const extras = Array.from(clubMap.entries())
    .filter(([slug]) => !WEST_TO_EAST.includes(slug))
    .map(([clubSlug, club]) => ({ clubSlug, club }))
    .sort((a, b) => a.club.localeCompare(b.club, undefined, { sensitivity: "base" }));

  const clubs = [...known, ...extras];

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
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <a href="/" style={{ fontWeight: 700, textDecoration: "none", color: "black" }}>
              CanPL Contracts
            </a>

            <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
              <a href="/players" style={{ textDecoration: "none", color: "black" }}>
                Players
              </a>
              <a href="/clubs" style={{ textDecoration: "none", color: "black" }}>
                Clubs
              </a>

              {clubs.map((c) => (
                <a
                  key={c.clubSlug}
                  href={`/clubs/${c.clubSlug}`}
                  style={{ textDecoration: "none", color: "black" }}
                  title={c.club}
                >
                  {slugLabel(c.clubSlug)}
                </a>
              ))}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
              {/* optional social links */}
            </div>
          </nav>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>{children}</main>

        <Footer />
      </body>
    </html>
  );
}