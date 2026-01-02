// app/page.tsx
import * as React from "react";
import { getPlayers, type Player } from "./lib/players";
import { normalizeContractValue, hasContractValue } from "./lib/contracts";
import { getUpdates } from "./lib/updates";
import { CLUB_BY_SLUG } from "./lib/clubs";
import RecentDevelopments from "./components/recent-developments";

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
  // Jan 1 counts as already had birthday; anything after Jan 1 => subtract 1
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

export default async function HomePage() {
  const [players, updates] = await Promise.all([getPlayers(), getUpdates()]);

  const allYears = Array.from(
    new Set(players.flatMap((p) => Object.keys(p.seasons ?? {}).filter(isYearHeader)))
  ).sort();

  const season = allYears[0] ?? String(new Date().getFullYear());
  const seasonYearNum = Number(season);

  // Map updates into the shape RecentDevelopments expects
  const toItem = (u: any) => ({
    id: u.id ?? `${u.date ?? ""}__${u.playerName ?? u.player ?? ""}__${u.club ?? ""}`,
    player: u.playerName ?? u.player ?? "",
    club: u.club ?? "",
    summary: u.notes ?? u.summary ?? "",
    link: u.link ?? "",
    source: u.source ?? "",
  });

  const signings = updates.filter((u: any) => u.type === "Signing").map(toItem);
  const departures = updates.filter((u: any) => u.type === "Departure").map(toItem);
  const extensions = updates.filter((u: any) => u.type === "Extension").map(toItem);

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

  // keep import "used" (you referenced this previously; leaving it harmless)
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

      {/* Recent developments */}
      <RecentDevelopments signings={signings} departures={departures} extensions={extensions} initial={5} step={5} />

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
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{fmtNumber(r.primaryCount)}</span>
                      {sizeChip}
                    </div>
                  </td>

                  <td style={tdCenter}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{fmtNumber(r.intlCount)}</span>
                      {intlChip}
                    </div>
                  </td>

                  <td style={tdCenter}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{fmtNumber(r.domU21Count)}</span>
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