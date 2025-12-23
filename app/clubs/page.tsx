import Link from "next/link";
import { getPlayers } from "../lib/players";
import { slugifyClub } from "../lib/slug";

export const revalidate = 300; // 5 minutes

export default async function ClubsPage() {
  const players = await getPlayers();

  const counts = new Map<string, number>();
  for (const p of players) {
    counts.set(p.club, (counts.get(p.club) ?? 0) + 1);
  }

  const clubs = Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: "base" }))
    .map(([club, count]) => ({ club, count, slug: slugifyClub(club) }));

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Clubs</h1>
      <p>Select a club to view its roster/contracts.</p>

      <ul style={{ marginTop: "1rem", lineHeight: 1.8 }}>
        {clubs.map(({ club, count, slug }) => (
          <li key={club}>
            <Link href={`/clubs/${slug}`}>{club}</Link> ({count})
          </li>
        ))}
      </ul>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/players">← Back to all players</Link>
      </p>
    </main>
  );
}