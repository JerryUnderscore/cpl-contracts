// app/clubs/page.tsx
import Link from "next/link";
import { getPlayers } from "../lib/players";
import { slugifyClub } from "../lib/slug";

export const revalidate = 300;

export default async function ClubsIndexPage() {
  const players = await getPlayers();

  const clubs = new Map<string, { slug: string; name: string; count: number }>();

  for (const p of players) {
    const slug = (p.clubSlug ?? "").trim()
      ? (p.clubSlug ?? "").trim()
      : slugifyClub(p.club ?? "");
    const name = p.club ?? slug;

    const prev = clubs.get(slug);
    if (prev) {
      prev.count += 1;
    } else {
      clubs.set(slug, { slug, name, count: 1 });
    }
  }

  const list = Array.from(clubs.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Clubs</h1>
      <p>Select a club to view its roster.</p>

      <ul style={{ lineHeight: 1.8 }}>
        {list.map((c) => (
          <li key={c.slug}>
            <Link href={`/clubs/${c.slug}`}>{c.name}</Link> <span style={{ color: "#666" }}>({c.count})</span>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/players">← Back to all players</Link>
      </p>
    </main>
  );
}
