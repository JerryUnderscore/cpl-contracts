// app/free-agents/page.tsx
import * as React from "react";
import { getPlayers } from "../lib/players";
import PlayersTable from "../players/PlayersTable";

export const revalidate = 300;

export default async function FreeAgentsPage() {
  const players = await getPlayers();

  const freeAgents = players.filter((p) => (p.status ?? "active") === "free agent");

  return (
    <div
      style={{
        padding: "1.25rem 1rem",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Free Agents</h1>
      <p style={{ marginTop: 0, color: "var(--muted)" }}>
        CPL players currently listed as free agents in the database.
      </p>

      <div style={{ overflowX: "auto" }}>
        <PlayersTable
          players={freeAgents}
          entityLabel="free agents"
          hideContracts
          searchPlaceholder="Search player, club, position, nationality…"
        />
      </div>
    </div>
  );
}