// app/page.tsx
import * as React from "react";
import { getPlayers, type Player } from "./lib/players";
import { normalizeContractValue, hasContractValue } from "./lib/contracts";
import { CLUB_BY_SLUG } from "./lib/clubs";

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
  if (!(mo === 1 && d === 1)) age -= 1;
  return age;
}

function isPrimaryRosterValue(v: string) {
  return v === "Domestic" || v === "International" || v === "Club Option";
}

function isDevelopmentalValue(v: string) {
  return v === "EYT" || v === "U SPORTS" || v === "Development";
}

function isInternationalValue(v: string) {
  return v === "International";
}

function isDomesticValue(v: string) {
  return v === "Domestic";
}

// “Recent” heuristic: still based on notes
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
  const map: Record<string, string> = {
    "HFX Wanderers FC": "HFX",
    "Atlético Ottawa": "ATO",
    "Cavalry FC": "CAV",
    "Forge FC": "FOR",
    "Pacific FC": "PAC",
    "Vancouver FC": "VFC",
    "Inter Toronto FC": "ITO",
    "FC Supra du Québec": "SUP",
  };
  return map[club] ?? club.split(" ")[0];
}

function fmtNumber(n: number) {
  return new Intl.NumberFormat("en-CA").format(n);
}

function miniRule(label: string) {
  return (
    <div style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, marginTop: "0.15rem" }}>
      {label}
    </div>
  );
}

function statusChip(ok: boolean, labelOk: string, labelBad: string) {
  const txt = ok ? labelOk : labelBad;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.12rem 0.55rem",
        borderRadius: 999,
        border: `1px solid ${ok ? "var(--okBorder)" : "var(--badBorder)"}`,
        background: ok ? "var(--okBg)" : "var(--badBg)",
        fontSize: "0.85rem",
        whiteSpace: "nowrap",
        lineHeight: 1.2,
      }}
    >
      {txt}
    </span>
  );
}

export default async function HomePage() {
  const players = await getPlayers();

  // infer “primary season” as the earliest year column that exists in data
  const allYears = Array.from(
    new Set(players.flatMap((p) => Object.keys(p.seasons ?? {}).filter(isYearHeader)))
  ).sort();

  const season = allYears[0] ?? String(new Date().getFullYear());
  const seasonYearNum = Number(season);

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

      const seasonVals = ps.map((p) => ({
        p,
        v: normalizeContractValue(p.seasons?.[season]),
      }));

      const primary = seasonVals.filter(({ v }) => isPrimaryRosterValue(v));
      const internationals = seasonVals.filter(({ v }) => isInternationalValue(v));
      const developmental = seasonVals.filter(({ v }) => isDevelopmentalValue(v));

      const domesticU21 = seasonVals.filter(({ p, v }) => {
        if (!isDomesticValue(v)) return false;
        const age = ageOnJan1(p.birthDate, seasonYearNum);
        return age != null && age < 21;
      });

      const okSize = primary.length >= 20 && primary.length <= 23;
      const okIntl = internationals.length <= 7;
      const okU21 = domesticU21.length >= 3;

      const logoFile = CLUB_BY_SLUG[clubSlug]?.logoFile;

      return {
        clubSlug,
        club,
        logoFile,

        primaryCount: primary.length,
        intlCount: internationals.length,
        domU21Count: domesticU21.length,
        devCount: developmental.length,

        okSize,
        okIntl,
        okU21,
      };
    })
    .sort((a, b) => a.club.localeCompare(b.club, undefined, { sensitivity: "base" }));

  const additions = players
    .filter(
      (p) => hasContractValue(normalizeContractValue(p.seasons?.[season])) && looksLikeAddition(p.notes)
    )
    .slice(0, 8);

  const departures = players.filter((p) => looksLikeDeparture(p.notes)).slice(0, 8);

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    borderBottom: "2px solid var(--border)",
    padding: "0.75rem 0.6rem",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    borderBottom: "1px solid var(--borderSoft)",
    padding: "0.75rem 0.6rem",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  };

  const tdCenter: React.CSSProperties = {
    ...tdStyle,
    textAlign: "center",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", padding: "1rem 0 0.5rem" }}>
        <img
          src="/logo_nb.png"
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

      <h2 style={{ textAlign: "center", marginTop: "2rem" }}>{season} Roster Compliance</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th style={thStyle}>Team</th>

              <th style={{ ...thStyle, textAlign: "center" }}>
                <div>Primary roster</div>
                {miniRule("20–23")}
              </th>

              <th style={{ ...thStyle, textAlign: "center" }}>
                <div>Internationals</div>
                {miniRule("Max 7")}
              </th>

              <th style={{ ...thStyle, textAlign: "center" }}>
                <div>Domestic U-21</div>
                {miniRule("Min 3")}
              </th>

              <th style={{ ...thStyle, textAlign: "center" }}>Developmental</th>

              <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {clubRows.map((r) => {
              const allOk = r.okSize && r.okIntl && r.okU21;

              return (
                <tr key={r.clubSlug}>
                  <td style={tdStyle}>
                    <a
                      href={`/clubs/${r.clubSlug}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}
                    >
                      {r.logoFile ? (
                        <img
                          src={`/clubs/${r.logoFile}`}
                          alt=""
                          aria-hidden="true"
                          style={{ width: 22, height: 22, objectFit: "contain", display: "block" }}
                        />
                      ) : null}
                      <span>{r.club}</span>
                    </a>
                  </td>

                  <td style={tdCenter}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700 }}>{fmtNumber(r.primaryCount)}</span>
                      {statusChip(r.okSize, "Size OK", "Size ⚠️")}
                    </div>
                  </td>

                  <td style={tdCenter}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700 }}>{fmtNumber(r.intlCount)}</span>
                      {statusChip(r.okIntl, "Intl OK", "Intl ⚠️")}
                    </div>
                  </td>

                  <td style={tdCenter}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700 }}>{fmtNumber(r.domU21Count)}</span>
                      {statusChip(r.okU21, "U-21 OK", "U-21 ⚠️")}
                    </div>
                  </td>

                  <td style={tdCenter}>
                    <span style={{ fontWeight: 700 }}>{fmtNumber(r.devCount)}</span>
                  </td>

                  <td style={tdCenter}>
  {allOk
    ? statusChip(true, "Compliant ✅", "Not Compliant ❌")
    : statusChip(false, "Compliant ✅", "Not Compliant ❌")}
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: "center", marginTop: "0.75rem", color: "var(--muted)", fontSize: "0.95rem" }}>
        Primary roster counts <b>Domestic</b>, <b>International</b>, and <b>Club Option</b>. Developmental counts{" "}
        <b>EYT</b>, <b>U SPORTS</b>, and <b>Development</b>.
        <br />
        <span style={{ color: "var(--muted2)" }}>
          “Option (pending)”, “In Discussion”, and “N/A” are ignored for roster compliance.
        </span>
      </p>
    </div>
  );
}