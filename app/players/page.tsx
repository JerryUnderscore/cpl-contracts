import PlayersTable from "./PlayersTable";
import { getPlayers } from "../lib/players";
import Link from "next/link";

export const revalidate = 300; // 5 minutes (keep your setting)

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
  <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
    <h1>Players</h1>
    <p>Loaded from Google Sheets. Click a column header to sort.</p>

    <p>
      <Link href="/clubs">Browse by club →</Link>
    </p>

    <PlayersTable players={players} />
  </main>
  );
}