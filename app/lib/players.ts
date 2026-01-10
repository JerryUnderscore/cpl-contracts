// app/lib/players.ts

export type Player = {
  id: string;
  clubSlug: string;
  club: string;
  name: string;

  // Basic + detailed positions
  position?: string;
  positionDetail?: string;

  // Full birth date (YYYY-MM-DD)
  birthDate?: string;

  nationality?: string; // ISO-2 codes like "CA" or "CA;JM"
  number?: number;

  source?: string;
  notes?: string;

  // roster status (e.g., "active", "free agent", "loaned out", "retired")
  status?: string;

 captain?: boolean;

  // Dynamic contract columns (e.g., "2026", "2027", "2028", ...)
  seasons: Record<string, string>;
};

const SHEET_CSV_URL = process.env.PLAYERS_CSV_URL;

function parseCSV(csvText: string): Record<string, string>[] {
  // Small, safe CSV parser that supports quoted fields + commas/newlines inside quotes.
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];

    if (c === '"') {
      // Handle escaped quote ""
      if (inQuotes && csvText[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (c === "," || c === "\n" || c === "\r")) {
      // End of field
      row.push(field);
      field = "";

      // Handle CRLF or standalone CR
      if (c === "\r" && csvText[i + 1] === "\n") i++;

      // End of row
      if (c === "\n" || c === "\r") {
        // Ignore completely empty trailing row
        if (row.some((x) => x.trim() !== "")) rows.push(row);
        row = [];
      }
      continue;
    }

    field += c;
  }

  // Flush last field/row
  row.push(field);
  if (row.some((x) => x.trim() !== "")) rows.push(row);

  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

function isYearHeader(h: string) {
  return /^\d{4}$/.test(h);
}

function toNumberMaybe(v: string): number | undefined {
  const s = (v ?? "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function toBirthDateMaybe(v: string): string | undefined {
  const s = (v ?? "").trim();
  if (!s) return undefined;

  // Expecting YYYY-MM-DD. Keep as string; validate lightly.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  return s;
}

function normalizeStatus(v: string | undefined): string {
  const s = (v ?? "").trim().toLowerCase();
  if (!s) return "active"; // default for legacy rows
  return s;
}

function toBooleanMaybe(v: string | undefined): boolean | undefined {
  const s = (v ?? "").trim().toLowerCase();
  if (!s) return undefined;
  if (s === "true") return true;
  if (s === "false") return false;
  return undefined;
}

export async function getPlayers(): Promise<Player[]> {
  if (!SHEET_CSV_URL) {
    throw new Error(
      "Missing PLAYERS_CSV_URL. Set it in .env.local (and in Vercel env vars) to your Google Sheets CSV export URL."
    );
  }

  const res = await fetch(SHEET_CSV_URL);

  if (!res.ok) {
    throw new Error(`Failed to fetch players CSV: ${res.status} ${res.statusText}`);
  }

  const csv = await res.text();
  const rawRows = parseCSV(csv);

  // Discover year columns from the sheet headers dynamically
  const yearColumns = rawRows.length ? Object.keys(rawRows[0]).filter(isYearHeader).sort() : [];

  const players: Player[] = rawRows
    .map((r) => {
      const seasons: Record<string, string> = {};
      for (const y of yearColumns) {
        const val = (r[y] ?? "").trim();
        if (val) seasons[y] = val;
      }

      const status = normalizeStatus(r.status);

      const player: Player = {
        id: r.id ?? "",
        clubSlug: r.clubSlug ?? "",
        club: r.club ?? "",
        name: r.name ?? "",

        position: r.position || undefined,
        positionDetail: r.positionDetail || undefined,

        birthDate: toBirthDateMaybe(r.birthDate),

        nationality: r.nationality || undefined,
        number: toNumberMaybe(r.number),

        source: r.source || undefined,
        notes: r.notes || undefined,

        status,
        captain: toBooleanMaybe(r.captain) ?? false,
        seasons,
      };

      return player;
    })
    .filter((p) => {
      if (!p.id || !p.name) return false;

      // Only "active" players must have a clubSlug (so club pages remain stable)
      if ((p.status ?? "active") === "active") return Boolean(p.clubSlug);

      // Everyone else can have blank clubSlug
      return true;
    });

  return players;
}