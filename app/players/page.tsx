import PlayersTable from "./PlayersTable";
import { getPlayers } from "../lib/players";
import Link from "next/link";

export const revalidate = 300; // 5 minutes (keep your setting)

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
  <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
    <h1>All Players</h1>
   
    <PlayersTable players={players} />
  </main>
  );
}