// app/lib/transfers.ts
export type TransferItem = {
  id: string; // from sheet "id" (or generated)
  season?: string;

  playerName: string;
  playerSlug?: string;

  fromClub?: string;
  fromClubSlug?: string;

  toClub?: string;
  toClubSlug?: string;

  transferType?: string; // e.g. "Permanent", "Loan", etc (as in your sheet)
  fee?: string;
  notes?: string;
  source?: string;
  link?: string;
  date?: string; // keep optional in case you omit it on some rows
};

function clean(s: unknown) {
  return String(s ?? "").trim();
}

function transfersCsvUrl() {
  const url = process.env.TRANSFERS_CSV_URL;
  if (!url) throw new Error("Missing TRANSFERS_CSV_URL env var");
  return url;
}

// Small CSV parser (handles commas + quotes)
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

export async function getTransfers(): Promise<TransferItem[]> {
  const url = transfersCsvUrl();

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch transfers CSV: ${res.status}`);

  const csv = await res.text();
  const rows = parseCsv(csv);
  if (!rows.length) return [];

  const header = rows[0].map((h) => clean(h).toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());

  const iId = idx("id");
  const iSeason = idx("season");
  const iPlayerName = idx("playername");
  const iPlayerSlug = idx("playerslug");
  const iFromClub = idx("fromclub");
  const iFromClubSlug = idx("fromclubslug");
  const iToClub = idx("toclub");
  const iToClubSlug = idx("toclubslug");
  const iTransferType = idx("transfertype");
  const iFee = idx("fee");
  const iNotes = idx("notes");
  const iSource = idx("source");
  const iLink = idx("link");
  const iDate = idx("date");

  // Minimum required to display something useful
  if (iPlayerName < 0) {
    throw new Error("Transfers CSV is missing required column: playerName");
  }

  const out: TransferItem[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];

    const playerName = clean(row[iPlayerName]);
    if (!playerName) continue;

    const date = iDate >= 0 ? clean(row[iDate]) : "";
    const fromSlug = iFromClubSlug >= 0 ? clean(row[iFromClubSlug]) : "";
    const toSlug = iToClubSlug >= 0 ? clean(row[iToClubSlug]) : "";

    const id =
      iId >= 0 && clean(row[iId])
        ? clean(row[iId])
        : `${date || "nodate"}__${playerName}__${fromSlug}__${toSlug}`;

    out.push({
      id,
      season: iSeason >= 0 ? clean(row[iSeason]) || undefined : undefined,

      playerName,
      playerSlug: iPlayerSlug >= 0 ? clean(row[iPlayerSlug]) || undefined : undefined,

      fromClub: iFromClub >= 0 ? clean(row[iFromClub]) || undefined : undefined,
      fromClubSlug: fromSlug || undefined,

      toClub: iToClub >= 0 ? clean(row[iToClub]) || undefined : undefined,
      toClubSlug: toSlug || undefined,

      transferType: iTransferType >= 0 ? clean(row[iTransferType]) || undefined : undefined,
      fee: iFee >= 0 ? clean(row[iFee]) || undefined : undefined,
      notes: iNotes >= 0 ? clean(row[iNotes]) || undefined : undefined,
      source: iSource >= 0 ? clean(row[iSource]) || undefined : undefined,
      link: iLink >= 0 ? clean(row[iLink]) || undefined : undefined,
      date: date || undefined,
    });
  }

  // Newest first if date exists; otherwise keep stable-ish order
  out.sort((a, b) => {
    const da = a.date ?? "";
    const db = b.date ?? "";
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da < db ? 1 : da > db ? -1 : 0;
  });

  return out;
}