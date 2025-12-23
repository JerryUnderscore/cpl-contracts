import Link from "next/link";
import { getPlayers } from "../../lib/players";
import { slugifyClub } from "../../lib/slug";
import PlayersTable from "../../players/PlayersTable";

export const revalidate = 300; // 5 minutes

export default async function ClubPage({ params }: { params: { club: string } }) {
  const players = await getPlayers();

  const clubSlug = params.club;
  const clubPlayers = players.filter((p) => slugifyClub(p.club) === clubSlug);

  // Figure out the display name (from the first match)
  const clubName = clubPlayers[0]?.club ?? "Unknown club";

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{clubName}</h1>
      <p>
        Showing {clubPlayers.length} player{clubPlayers.length === 1 ? "" : "s"}.
      </p>

      <PlayersTable players={clubPlayers} />

      <p style={{ marginTop: "2rem" }}>
        <Link href="/clubs">← All clubs</Link> &nbsp;|&nbsp;{" "}
        <Link href="/players">All players</Link>
      </p>
    </main>
  );
}