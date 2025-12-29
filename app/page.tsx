// app/page.tsx
import * as React from "react";
import { getPlayers, type Player } from "./lib/players";

function isYearHeader(h: string) {
  return /^\d{4}$/.test(h);
}

// CPL rule: age on Jan 1 of the season year
function ageOnJan1(birthDate: string | undefined, seasonYear: number) {
  if (!birthDate) return undefined;
  const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return undefined;

  let age = seasonYear - y;
  // Jan 1 counts as "already had birthday"; anything after Jan 1 => subtract 1
  if (!(mo === 1 && d === 1)) age -= 1;
  return age;
}

function isUnderContract(p: Player, season: string) {
  const v = (p.seasons?.[season] ?? "").trim();
  if (!v) return false;
  // treat explicit N/A as not under contract
  if (/^n\/a$/i.test(v)) return false;
  return true;
}

function isInternationalStatus(p: Player, season: string) {
  const v = (p.seasons?.[season] ?? "").toLowerCase();
  return v.includes("international");
}

function isEyt(p: Player, season: string) {
  // You can tighten this later if you formalize how you mark EYT
  const v = (p.seasons?.[season] ?? "").toLowerCase();
  return v.includes("eyt");
}

function badgeForSeasonAge(age: number | undefined) {
  // you already fixed this logic: U-18 is <18, U-21 is <21
  if (age == null) return null;
  if (age < 18) return { label: "U-18" };
  if (age < 21) return { label: "U-21" };
  return null;
}

// “Recent” is tricky without a date column.
// This is a heuristic: it looks for keywords in notes.
function looksLikeAddition(notes: string | undefined) {
  const s = (notes ?? "").toLowerCase();
  return (
    s.includes("signed") ||
    s.includes("new signing") ||
    s.includes("made permanent") ||
    s.includes("re-signed") ||
    s.includes("resigned") ||
    s.includes("guaranteed through") ||
    s.includes("contract retained") ||
    s.includes("option exercised") ||
    s.includes("option executed")
  );
}

function looksLikeDeparture(notes: string | undefined) {
  const s = (notes ?? "").toLowerCase();
  return (
    s.includes("contract expired") ||
    s.includes("option declined") ||
    s.includes("returned to parent club") ||
    s.includes("terminated") ||
    s.includes("mutual agreement") ||
    s.includes("free agent") ||
    s.includes("left") ||
    s.includes("released")
  );
}

function smallClubTag(club: string) {
  // short-ish tag for lists
  const map: Record<string, string> = {
    "HFX Wanderers FC": "HFX",
    "Atlético Ottawa": "ATO",
    "Cavalry FC": "CAV",
    "Forge FC": "FOR",
    "Pacific FC": "PAC",
    "Vancouver FC": "VFC",
    "Inter Toronto FC": "ITO",
    "FC Supra du Québec": "SUP",
    "Valour FC": "VAL",
    "York United FC": "YRK",
  };
  return map[club] ?? club.split(" ")[0];
}

export default async function HomePage() {
  const players = await getPlayers();

  // infer “primary season” as the earliest year column that exists in data
  const allYears = Array.from(
    new Set(
      players.flatMap((p) => Object.keys(p.seasons ?? {}).filter(isYearHeader))
    )
  ).sort();

  const season = allYears[0] ?? String(new Date().getFullYear());

  // group by club
  const byClub = new Map<string, Player[]>();
  for (const p of players) {
    if (!p.clubSlug || !p.club) continue;
    const key = `${p.clubSlug}|||${p.club}`;
    const arr = byClub.get(key) ?? [];
    arr.push(p);
    byClub.set(key, arr);
  }

  const clubRows = Array.from(byClub.entries())
    .map(([key, ps]) => {
      const [clubSlug, club] = key.split("|||");
      const under = ps.filter((p) => isUnderContract(p, season));
      const intl = under.filter((p) => isInternationalStatus(p, season));
      const u21 = under.filter((p) => badgeForSeasonAge(ageOnJan1(p.birthDate, Number(season)))?.label === "U-21");
      const u18 = under.filter((p) => badgeForSeasonAge(ageOnJan1(p.birthDate, Number(season)))?.label === "U-18");
      const eyt = under.filter((p) => isEyt(p, season));

      return {
        clubSlug,
        club,
        total: under.length,
        internationals: intl.length,
        u21: u21.length,
        u18: u18.length,
        eyt: eyt.length,
      };
    })
    .sort((a, b) => a.club.localeCompare(b.club, undefined, { sensitivity: "base" }));

  const additions = players
    .filter((p) => isUnderContract(p, season) && looksLikeAddition(p.notes))
    .slice(0, 8);

  const departures = players
    .filter((p) => looksLikeDeparture(p.notes))
    .slice(0, 8);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", padding: "1rem 0 0.5rem" }}>
        <img
          src="/logo.png"
          alt="CanPL Contracts"
          style={{ maxWidth: 720, width: "100%", height: "auto" }}
        />
      </div>

      <h1 style={{ textAlign: "center", margin: "0.5rem 0 1.5rem" }}>Contracts</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        <div>
          <h2 style={{ marginTop: 0 }}>Recent additions</h2>
          <ul>
            {additions.length ? (
              additions.map((p) => (
                <li key={p.id}>
                  {p.name} ({smallClubTag(p.club)})
                </li>
              ))
            ) : (
              <li>No recent additions found (yet).</li>
            )}
          </ul>
        </div>

        <div>
          <h2 style={{ marginTop: 0 }}>Recent departures</h2>
          <ul>
            {departures.length ? (
              departures.map((p) => (
                <li key={p.id}>
                  {p.name} ({smallClubTag(p.club)})
                </li>
              ))
            ) : (
              <li>No recent departures found (yet).</li>
            )}
          </ul>
        </div>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "2rem" }}>{season} Rosters</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th style={thStyle}>Team</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Internationals</th>
              <th style={thStyle}>U-21</th>
              <th style={thStyle}>U-18</th>
              <th style={thStyle}>EYT*</th>
            </tr>
          </thead>
          <tbody>
            {clubRows.map((r) => (
              <tr key={r.clubSlug}>
                <td style={tdStyle}>
                  <a href={`/clubs/${r.clubSlug}`}>{r.club}</a>
                </td>
                <td style={tdStyle}>{r.total}</td>
                <td style={tdStyle}>{r.internationals}</td>
                <td style={tdStyle}>{r.u21}</td>
                <td style={tdStyle}>{r.u18}</td>
                <td style={tdStyle}>{r.eyt ? r.eyt : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: "center", marginTop: "0.75rem", color: "#666", fontSize: "0.9rem" }}>
        *EYT logic is a placeholder until we standardize how it’s marked in the sheet.
      </p>

      <hr style={{ margin: "2rem 0" }} />

      <footer style={{ color: "#444", lineHeight: 1.5 }}>
        <p style={{ margin: 0 }}>
          CanPL Contracts is not affiliated with the Canadian Premier League (CPL) or any of its clubs.
          The CPL logo, team logos, team names, and other trademarks are the property of their respective owners.
          If you are a trademark owner and would like something removed, please contact us.
        </p>
      </footer>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "2px solid #ddd",
  padding: "0.6rem",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "0.6rem",
  whiteSpace: "nowrap",
};