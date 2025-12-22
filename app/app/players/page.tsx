type Player = {
  id: string;
  name: string;
  club: string;
  position?: string;
  contractEnd?: string; // e.g. "2026-12-31" or "2026"
  status?: string; // e.g. "Guaranteed", "Option", "Loan"
};

const players: Player[] = [
  { id: "hfx-1", name: "Example Player", club: "HFX Wanderers", position: "MF", contractEnd: "2026", status: "Guaranteed" },
  { id: "forge-1", name: "Another Player", club: "Forge FC", position: "DF", contractEnd: "2025", status: "Option" },
];

export default function PlayersPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Players</h1>
      <p>Early prototype list (hard-coded for now).</p>

      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            {["Name", "Club", "Pos", "Contract end", "Status"].map((h) => (
              <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #f0f0f0" }}>{p.name}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #f0f0f0" }}>{p.club}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #f0f0f0" }}>{p.position ?? "—"}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #f0f0f0" }}>{p.contractEnd ?? "—"}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #f0f0f0" }}>{p.status ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}