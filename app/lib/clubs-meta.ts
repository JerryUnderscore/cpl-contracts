// app/lib/clubs-meta.ts

export type ClubMeta = {
  clubSlug: string;
  displayName: string;
  joined?: number;
  location?: string;
  stadium?: string;
  capacity?: number;
  manager?: string;

  defunct: boolean;
  lastSeason?: number;

  successorSlug?: string;
  formerNames?: string[]; // split on ";" and trimmed
};

const SHEET_CSV_URL = process.env.CLUBS_META_CSV_URL;

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
      row.push(field);
      field = "";

      if (c === "\r" && csvText[i + 1] === "\n") i++;

      if (c === "\n" || c === "\r") {
        if (row.some((x) => x.trim() !== "")) rows.push(row);
        row = [];
      }
      continue;
    }

    field += c;
  }

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

function toNumberMaybe(v: string | undefined): number | undefined {
  const s = (v ?? "").replace(/,/g, "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Handles values coming out of Google Sheets checkboxes / booleans:
 * - TRUE / FALSE
 * - true / false
 * - 1 / 0
 * - yes / no
 * - y / n
 * - empty -> undefined
 */
function toBooleanMaybe(v: string | undefined): boolean | undefined {
  const s = (v ?? "").trim().toLowerCase();
  if (!s) return undefined;
  if (s === "true" || s === "1" || s === "yes" || s === "y") return true;
  if (s === "false" || s === "0" || s === "no" || s === "n") return false;
  return undefined;
}

function splitFormerNames(v: string | undefined): string[] | undefined {
  const s = (v ?? "").trim();
  if (!s) return undefined;
  const parts = s
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

export async function getClubsMeta(): Promise<ClubMeta[]> {
  if (!SHEET_CSV_URL) {
    throw new Error(
      "Missing CLUBS_META_CSV_URL. Set it in .env.local (and in Vercel env vars) to your clubs_meta Google Sheets CSV export URL."
    );
  }

  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch clubs_meta CSV: ${res.status} ${res.statusText}`);
  }

  const csv = await res.text();
  const rawRows = parseCSV(csv);

  const clubs: ClubMeta[] = rawRows
    .map((r) => {
      const clubSlug = (r.clubSlug ?? "").trim();
      const displayName = (r.displayName ?? "").trim();

      const defunct = toBooleanMaybe(r.defunct) ?? false;

      const club: ClubMeta = {
        clubSlug,
        displayName,

        joined: toNumberMaybe(r.joined),
        location: (r.location ?? "").trim() || undefined,
        stadium: (r.stadium ?? "").trim() || undefined,
        capacity: toNumberMaybe(r.capacity),
        manager: (r.manager ?? "").trim() || undefined,

        defunct,
        lastSeason: toNumberMaybe(r.lastSeason),

        successorSlug: (r.successorSlug ?? "").trim() || undefined,
        formerNames: splitFormerNames(r.formerNames),
      };

      return club;
    })
    .filter((c) => c.clubSlug && c.displayName);

  // Helpful: stable sort by displayName (you can override elsewhere)
  clubs.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));

  return clubs;
}

// Handy lookup map
export async function getClubMetaBySlug(): Promise<Record<string, ClubMeta>> {
  const clubs = await getClubsMeta();
  return Object.fromEntries(clubs.map((c) => [c.clubSlug, c] as const));
}