// app/layout.tsx
import * as React from "react";
import { getPlayers } from "./lib/players";

export const metadata = {
  title: "CanPL Contracts",
  description: "A community-made CPL contract tracker",
};

function slugLabel(slug: string) {
  // quick readable defaults (tweak any time)
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

const WEST_TO_EAST_ORDER = [
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

  const clubs = Array.from(
    new Map(
      players
        .filter((p) => p.clubSlug && p.club)
        .map((p) => [p.clubSlug, p.club] as const)
    ).entries()
  )
    .map(([clubSlug, club]) => ({ clubSlug, club }))
    .sort((a, b) => {
      const ai = WEST_TO_EAST_ORDER.indexOf(a.clubSlug);
      const bi = WEST_TO_EAST_ORDER.indexOf(b.clubSlug);

      // both found → order by geography
      if (ai !== -1 && bi !== -1) return ai - bi;

      // one found → it comes first
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;

      // neither found → fallback alphabetical
      return a.club.localeCompare(b.club, undefined, { sensitivity: "base" });
    });

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
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
              <a href="/players" style={{ textDecoration: "none" }}>
                Players
              </a>
              <a href="/clubs" style={{ textDecoration: "none" }}>
                Clubs
              </a>

              {clubs.map((c) => (
                <a
                  key={c.clubSlug}
                  href={`/clubs/${c.clubSlug}`}
                  style={{ textDecoration: "none" }}
                  title={c.club}
                >
                  {slugLabel(c.clubSlug)}
                </a>
              ))}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
              {/* optional: keep your social links if you want */}
              {/* <a href="https://twitter.com/..." target="_blank" rel="noreferrer">X</a> */}
              {/* <a href="https://instagram.com/..." target="_blank" rel="noreferrer">IG</a> */}
            </div>
          </nav>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>{children}</main>
      </body>
    </html>
  );
}