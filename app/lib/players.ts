export type ContractType = "Guaranteed" | "Option" | "Loan" | "Unknown";

export type Player = {
  id: string;
  name: string;
  club: string;
  position?: string;
  contractEnd?: string;
  contractType?: ContractType;
  source?: string;
  notes?: string;
};

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

function normalizeContractType(value: string): ContractType {
  const v = value.trim();
  if (v === "Guaranteed" || v === "Option" || v === "Loan" || v === "Unknown") return v;
  return "Unknown";
}

export async function getPlayers(): Promise<Player[]> {
  const url = process.env.PLAYERS_SHEET_CSV_URL;
  if (!url) throw new Error("Missing PLAYERS_SHEET_CSV_URL env var");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`);

  const csv = await res.text();
  const rows = parseCSV(csv);

  return rows
    .filter((r) => r.id && r.name)
    .map((r) => ({
      id: r.id,
      name: r.name,
      club: r.club,
      position: r.position || undefined,
      contractEnd: r.contractEnd || undefined,
      contractType: r.contractType ? normalizeContractType(r.contractType) : undefined,
      source: r.source || undefined,
      notes: r.notes || undefined,
    }));
}