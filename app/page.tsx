// app/page.tsx
import * as React from "react";
import { getPlayers, type Player } from "./lib/players";
import { normalizeContractValue, hasContractValue } from "./lib/contracts";
import { getUpdates } from "./lib/updates";
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

function chipStyle(ok: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.18rem 0.55rem",
    borderRadius: 999,
    border: `1px solid ${ok ? "var(--okBorder)" : "var(--badBorder)"}`,
    background: ok ? "var(--okBg)" : "var(--badBg)",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
    lineHeight: 1.4,
  };
}

function statusChip(ok: boolean, labelOk: string, labelBad: string) {
  return <span style={chipStyle(ok)}>{ok ? labelOk : labelBad}</span>;
}

function headerCell(title: string, subtitle?: string): React.ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      {subtitle ? (
        <div style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.9rem" }}>{subtitle}</div>
      ) : null}
    </div>
  );
}

function clubLogoForSlug(slug: string) {
  const c = CLUB_BY_SLUG[slug];
  return c?.logoFile ? `/clubs/${c.logoFile}` : null;
}

function SourcePill({
  label,
  title,
  href,
}: {
  label: string;
  title?: string;
  href?: string;
}) {
  const style: React.CSSProperties = {
    display: "inline-block",
    marginLeft: "0.5rem",
    padding: "0.12rem 0.55rem",
    borderRadius: 999,
    border: "1px solid #dddddd",
    background: "#99999922", // 👈 light grey background (hex + alpha)
    fontSize: "0.85rem",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    textDecoration: "none",
    color: "inherit", // 👈 keep text normal (black in light mode)
  };

  if (!href) {
    return (
      <span style={style} title={title}>
        {label}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" style={style} title={title}>
      {label}
    </a>
  );
}

function updateRow(u: {
  id: string;
  player: string;
  club: string;
  summary?: string;
  link?: string;
  source?: string;
}) {
  const tag = smallClubTag(u.club);
  const pillLabel = u.source?.trim() ? u.source.trim() : "Source";
  const pillTitle = u.summary?.trim() ? u.summary.trim() : undefined;

  return (
    <li key={u.id} style={{ marginBottom: "0.4rem" }}>
      <span style={{ fontWeight: 650 }}>{u.player}</span>{" "}
      <span style={{ color: "var(--muted)" }}>({tag})</span>
      <SourcePill label={pillLabel} href={u.link} title={pillTitle} />
    </li>
  );
}

export default async function HomePage() {
  const players = await getPlayers();
  const updates = await getUpdates();

  // infer “primary season” as the earliest year column that exists in data
  const allYears = Array.from(
    new Set(players.flatMap((p) => Object.keys(p.seasons ?? {}).filter(isYearHeader)))
  ).sort();

  const season = allYears[0] ?? String(new Date().getFullYear());
  const seasonYearNum = Number(season);

  // --- Updates (from Updates tab) ---
  const signings = updates.filter((u) => u.type === "Signing").slice(0, 5);
  const departures = updates.filter((u) => u.type === "Departure").slice(0, 5);
  const extensions = updates.filter((u) => u.type === "Extension").slice(0, 5);

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

      // season cell value for each player
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

      // Rules
      const okSize = primary.length >= 20 && primary.length <= 23;
      const okIntl = internationals.length <= 7;
      const okU21 = domesticU21.length >= 3;

      const compliant = okSize && okIntl && okU21;

      return {
        clubSlug,
        club,
        logoSrc: clubLogoForSlug(clubSlug),

        primaryCount: primary.length,
        intlCount: internationals.length,
        domU21Count: domesticU21.length,
        devCount: developmental.length,

        okSize,
        okIntl,
        okU21,
        compliant,
      };
    })
    .sort((a, b) => a.club.localeCompare(b.club, undefined, { sensitivity: "base" }));

  // keep this referenced for now
  void hasContractValue;

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    borderBottom: `2px solid var(--border)`,
    padding: "0.75rem 0.6rem",
    whiteSpace: "nowrap",
  };

  const thCenter: React.CSSProperties = {
    ...thStyle,
    textAlign: "center",
  };

  const tdStyle: React.CSSProperties = {
    borderBottom: `1px solid var(--borderSoft)`,
    padding: "0.75rem 0.6rem",
    whiteSpace: "nowrap",
  };

  const tdCenter: React.CSSProperties = {
    ...tdStyle,
    textAlign: "center",
  };

  return (
    <div>
      {/* Hero logo */}
      <div style={{ display: "flex", justifyContent: "center", padding: "1rem 0 0.5rem" }}>
        <img
          src="/logo_nb.png"
          alt="CanPL Contracts"
          style={{ maxWidth: 720, width: "100%", height: "auto" }}
        />
      </div>

      {/* Recent developments (from updates tab) */}
      <div
        style={{
          margin: "1.25rem 0 2rem",
          padding: "1rem 1rem",
          border: `1px solid var(--borderSoft)`,
          borderRadius: 14,
          background: "var(--card)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "0.85rem", textAlign: "center" }}>
          Recent developments
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          <div>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Signings</h3>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {signings.length ? signings.map(updateRow) : <li>No signings yet.</li>}
            </ul>
          </div>

          <div>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Departures</h3>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {departures.length ? departures.map(updateRow) : <li>No departures yet.</li>}
            </ul>
          </div>

          <div>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Extensions</h3>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {extensions.length ? extensions.map(updateRow) : <li>No extensions yet.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Roster compliance */}
      <h2 style={{ textAlign: "center", marginTop: "2rem" }}>{season} Roster Compliance</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th style={thStyle}>Team</th>
              <th style={thCenter}>{headerCell("Primary roster", "20–23")}</th>
              <th style={thCenter}>{headerCell("Internationals", "Max 7")}</th>
              <th style={thCenter}>{headerCell("Domestic U-21", "Min 3")}</th>
              <th style={thCenter}>{headerCell("Developmental")}</th>
              <th style={thCenter}>{headerCell("Roster compliant")}</th>
            </tr>
          </thead>

          <tbody>
            {clubRows.map((r) => {
              const sizeChip = statusChip(r.okSize, "Size OK", "Size ⚠️");
              const intlChip = statusChip(r.okIntl, "Intl OK", "Intl ⚠️");
              const u21Chip = statusChip(r.okU21, "U-21 OK", "U-21 ⚠️");
              const rosterChip = statusChip(r.compliant, "Yes ✅", "No ⚠️");

              return (
                <tr key={r.clubSlug}>
                  <td style={tdStyle}>
                    <a
                      href={`/clubs/${r.clubSlug}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}
                    >
                      {r.logoSrc ? (
                        <img
                          src={r.logoSrc}
                          alt={`${r.club} logo`}
                          style={{ width: 20, height: 20, objectFit: "contain", display: "block" }}
                        />
                      ) : null}
                      <span>{r.club}</span>
                    </a>
                  </td>

                  <td style={tdCenter}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                        {fmtNumber(r.primaryCount)}
                      </span>
                      {sizeChip}
                    </div>
                  </td>

                  <td style={tdCenter}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                        {fmtNumber(r.intlCount)}
                      </span>
                      {intlChip}
                    </div>
                  </td>

                  <td style={tdCenter}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                        {fmtNumber(r.domU21Count)}
                      </span>
                      {u21Chip}
                    </div>
                  </td>

                  <td style={tdCenter}>
                    <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{fmtNumber(r.devCount)}</span>
                  </td>

                  <td style={tdCenter}>{rosterChip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: "0.75rem",
          color: "var(--muted)",
          fontSize: "0.95rem",
        }}
      >
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