// app/clubs/[club]/page.tsx
import Link from "next/link";
import PlayersTable from "../../players/PlayersTable";
import { getPlayers } from "../../lib/players";

export const revalidate = 300;

export default async function ClubPage({ params }: { params: { club: string } }) {
  const players = await getPlayers();
  const clubSlug = params.club;

  const filtered = players.filter((p) => (p.clubSlug ?? "").trim() === clubSlug);

  // Derive club name for heading (fallback to slug)
  const clubName = filtered[0]?.club ?? clubSlug;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{clubName}</h1>

      <p>
        <Link href="/clubs">← All clubs</Link>
        {" · "}
        <Link href="/players">All players</Link>
      </p>

      {filtered.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>
          No players found for <code>{clubSlug}</code>. Check that your Google Sheet has a <b>clubSlug</b> column
          matching this URL slug.
        </p>
      ) : (
        <PlayersTable players={filtered} />
      )}
    </main>
  );
}