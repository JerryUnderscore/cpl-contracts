import { players } from "../data/players";

export default function PlayersPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Players</h1>

      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Name</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Club</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Pos</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Contract end</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Type</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: "0.5rem" }}>{p.name}</td>
              <td style={{ padding: "0.5rem" }}>{p.club}</td>
              <td style={{ padding: "0.5rem" }}>{p.position ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{p.contractEnd ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{p.contractType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}