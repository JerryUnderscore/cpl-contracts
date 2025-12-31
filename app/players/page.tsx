// app/players/page.tsx
import PlayersTable from "./PlayersTable";
import { getPlayers } from "../lib/players";

export const revalidate = 300; // 5 minutes

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <div
      style={{
        padding: "1.25rem 1rem",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: "0.5rem" }}>All Players</h1>
      <p style={{ marginTop: 0, color: "var(--muted)" }}>Click a column header to sort.</p>

      {/* On mobile, the table will scroll horizontally (handled inside PlayersTable or the page). */}
      <div style={{ overflowX: "auto" }}>
        <PlayersTable players={players} />
      </div>
    </div>
  );
}