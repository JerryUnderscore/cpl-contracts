import { getPlayers } from "../lib/players";

export const revalidate = 300; // seconds (5 minutes)
export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Players</h1>

      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            {["Name", "Club", "Pos", "Contract end", "Type"].map((h) => (
              <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: "0.5rem" }}>{p.name}</td>
              <td style={{ padding: "0.5rem" }}>{p.club}</td>
              <td style={{ padding: "0.5rem" }}>{p.position ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{p.contractEnd ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{p.contractType ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}