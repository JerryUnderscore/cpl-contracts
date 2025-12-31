// app/lib/updates.ts
export type UpdateType = "Signing" | "Departure" | "Extension";

export type UpdateItem = {
  id: string;
  date: string; // YYYY-MM-DD (or whatever your sheet returns)
  type: UpdateType;
  player: string;
  club: string;
  clubSlug?: string;
  summary?: string;
  link?: string;
  source?: string;
};

function clean(s: unknown) {
  return String(s ?? "").trim();
}

function toType(raw: string): UpdateType | null {
  const v = clean(raw);
  if (v === "Signing" || v === "Departure" || v === "Extension") return v;
  return null;
}

/**
 * Uses a dedicated CSV URL for the Updates tab.
 * Set this in .env.local (and in Vercel env vars):
 *   UPDATES_CSV_URL=...export?format=csv&gid=XXXX
 */
function updatesCsvUrl() {
  const url = process.env.UPDATES_CSV_URL;
  if (!url) throw new Error("Missing UPDATES_CSV_URL env var");
  return url;
}

// Very small CSV parser (handles commas + quotes)
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      const next = text[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cur);
      cur = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      continue;
    }

    cur += ch;
  }

  row.push(cur);
  if (row.length > 1 || row[0] !== "") rows.push(row);

  return rows;
}

export async function getUpdates(): Promise<UpdateItem[]> {
  const url = updatesCsvUrl();

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch updates CSV: ${res.status}`);

  const csv = await res.text();
  const rows = parseCsv(csv);
  if (!rows.length) return [];

  const header = rows[0].map((h) => clean(h).toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());

  const iDate = idx("date");
  const iType = idx("type");
  const iPlayer = idx("player");
  const iClub = idx("club");
  const iClubSlug = idx("clubslug");
  const iSummary = idx("summary");
  const iLink = idx("link");
  const iSource = idx("source");

  const out: UpdateItem[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const date = clean(row[iDate]);
    const type = toType(clean(row[iType]));
    const player = clean(row[iPlayer]);
    const club = clean(row[iClub]);

    if (!date || !type || !player || !club) continue;

    const clubSlug = iClubSlug >= 0 ? clean(row[iClubSlug]) : "";
    const summary = iSummary >= 0 ? clean(row[iSummary]) : "";
    const link = iLink >= 0 ? clean(row[iLink]) : "";
    const source = iSource >= 0 ? clean(row[iSource]) : "";

    out.push({
      id: `${date}__${type}__${player}__${club}`,
      date,
      type,
      player,
      club,
      clubSlug: clubSlug || undefined,
      summary: summary || undefined,
      link: link || undefined,
      source: source || undefined,
    });
  }

  // newest first
  out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return out;
}