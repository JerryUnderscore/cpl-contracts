// app/lib/clubs-honours.ts

export type ClubHonoursRow = {
  clubSlug: string;
  season: number;

  northStarCup: boolean;
  cplShield: boolean;

  // You said you'll fill this in manually afterwards,
  // but we parse it now so the code doesn't need to change later.
  playoffs?: boolean;
};

export type ClubHonoursSummary = {
  clubSlug: string;

  northStarCupTitles: number;
  northStarCupYears: number[];

  cplShieldTitles: number;
  cplShieldYears: number[];

  playoffSeasons: number[]; // seasons where playoffs === true (if present)
};

const SHEET_CSV_URL = process.env.CLUBS_HONOURS_CSV_URL;

function parseCSV(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];

    if (c === '"') {
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

function toBooleanMaybe(v: string | undefined): boolean | undefined {
  const s = (v ?? "").trim().toLowerCase();
  if (!s) return undefined;
  if (s === "true" || s === "1" || s === "yes" || s === "y") return true;
  if (s === "false" || s === "0" || s === "no" || s === "n") return false;
  return undefined;
}

export async function getClubsHonoursRows(): Promise<ClubHonoursRow[]> {
  if (!SHEET_CSV_URL) {
    throw new Error(
      "Missing CLUBS_HONOURS_CSV_URL. Set it in .env.local (and in Vercel env vars) to your clubs_honours Google Sheets CSV export URL."
    );
  }

  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch clubs_honours CSV: ${res.status} ${res.statusText}`);
  }

  const csv = await res.text();
  const rawRows = parseCSV(csv);

  const rows: ClubHonoursRow[] = rawRows
    .map((r) => {
      const clubSlug = (r.clubSlug ?? "").trim();
      const season = toNumberMaybe(r.season);

      if (!clubSlug || !season) return null;

      const row: ClubHonoursRow = {
        clubSlug,
        season,

        northStarCup: toBooleanMaybe(r.northStarCup) ?? false,
        cplShield: toBooleanMaybe(r.cplShield) ?? false,
        playoffs: toBooleanMaybe(r.playoffs),
      };

      return row;
    })
    .filter((x): x is ClubHonoursRow => Boolean(x));

  // Stable sort for sanity: clubSlug, then season asc
  rows.sort((a, b) => {
    const c = a.clubSlug.localeCompare(b.clubSlug, undefined, { sensitivity: "base" });
    if (c !== 0) return c;
    return a.season - b.season;
  });

  return rows;
}

/**
 * Aggregate per-club totals + years lists.
 * This is what you'll probably render on the Clubs page.
 */
export async function getClubsHonoursSummary(): Promise<Record<string, ClubHonoursSummary>> {
  const rows = await getClubsHonoursRows();

  const out: Record<string, ClubHonoursSummary> = {};

  for (const r of rows) {
    if (!out[r.clubSlug]) {
      out[r.clubSlug] = {
        clubSlug: r.clubSlug,

        northStarCupTitles: 0,
        northStarCupYears: [],

        cplShieldTitles: 0,
        cplShieldYears: [],

        playoffSeasons: [],
      };
    }

    const s = out[r.clubSlug];

    if (r.northStarCup) {
      s.northStarCupTitles += 1;
      s.northStarCupYears.push(r.season);
    }

    if (r.cplShield) {
      s.cplShieldTitles += 1;
      s.cplShieldYears.push(r.season);
    }

    if (r.playoffs) {
      s.playoffSeasons.push(r.season);
    }
  }

  // Keep year lists sorted
  for (const k of Object.keys(out)) {
    out[k].northStarCupYears.sort((a, b) => a - b);
    out[k].cplShieldYears.sort((a, b) => a - b);
    out[k].playoffSeasons.sort((a, b) => a - b);
  }

  return out;
}