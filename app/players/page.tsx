// app/players/page.tsx
import PlayersTable from "./PlayersTable";
import { getPlayers, type Player } from "../lib/players";

export const revalidate = 300; // 5 minutes

function isActivePlayer(p: Player) {
  return (p.status ?? "active").trim().toLowerCase() === "active";
}

export default async function PlayersPage() {
  const players = await getPlayers();
  const activePlayers = players.filter(isActivePlayer);

  return (
    <div
      style={{
        padding: "1.25rem 1rem",
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
        Players
      </h1>
      <p style={{ marginTop: 0, color: "var(--muted)" }}>
        Showing active players only. Click a column header to sort.
      </p>

      <div style={{ overflowX: "auto" }}>
        <PlayersTable players={activePlayers} />
      </div>
    </div>
  );
}